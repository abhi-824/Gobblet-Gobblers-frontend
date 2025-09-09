import { BotStrategyFactory } from "../core/bot/BotStartegyFactory";
import { Player } from "../core/models/Player";
import { BotDifficulty } from "../core/types/BotDifficulty";
import type { IBoardRepository, IMoveRepository, IPieceRepository, IPlayerRepository } from "../storage/ports";
import type { IGameRepository } from "../storage/ports";


import { Board } from "../core/models/Board";
import { GamePiece } from "../core/models/GamePiece";
import { PieceSize } from "../core/types/PieceSize";
import { Game } from "../core/models/Game";
import { toPublicGameDTO } from "../core/utils/mappers";
import { Move } from "../core/models/Move";
const uid = () => Math.random().toString(36).slice(2);

export class GameService {
  constructor(
    private games: IGameRepository,
    private players: IPlayerRepository,
    private pieces: IPieceRepository,
    private boards: IBoardRepository,
    private moves: IMoveRepository,
    private botFactory: typeof BotStrategyFactory
  ) {}

  async createGame(mode: "pvp" | "pvc", difficulty: BotDifficulty = BotDifficulty.EASY) {
    const id = uid();
    const board = new Board(3);
    const p1 = new Player(uid(), "human");
    const p2 =
      mode === "pvc" ? new Player(uid(), "computer") : new Player(uid(), "human");

    // 2 pieces of each size per player (like your CLI)
    ([PieceSize.SM, PieceSize.MD, PieceSize.LG] as const).forEach((s) => {
      p1.addPiece(new GamePiece(s, p1));
      p1.addPiece(new GamePiece(s, p1));
      p2.addPiece(new GamePiece(s, p2));
      p2.addPiece(new GamePiece(s, p2));
    });

    const game = new Game(board, [p1, p2], p1);
    // Persist initial canonical piece registry for reliable hydration
    await this.pieces.saveInitialPieces(id, [p1, p2]);
    await this.games.saveGame(id, game, { mode, difficulty, createdAt: Date.now() });
    console.log(`[GameService:createGame] id=${id} mode=${mode} difficulty=${difficulty}`);
    return toPublicGameDTO(id, game);
  }

  async joinGame(gameId: string, playerName: string) {
    const { game } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");
    // For PvP: attach a human name to the second player if unnamed
    const second = game.players[1];
    if (second.type !== "human") throw new Error("Game is not PvP");
    await this.players.updatePlayer({ id: second.id, name: playerName });
    console.log(`[GameService:joinGame] gameId=${gameId} playerName=${playerName}`);
    return toPublicGameDTO(gameId, game);
  }

  async startGame(gameId: string) {
    const { game, meta } = await this.games.getGameById(gameId);
    if (!game || !meta) throw new Error("Game not found");
    await this.games.updateGame(gameId, game, { ...meta, startedAt: Date.now() });
    console.log(`[GameService:startGame] gameId=${gameId}`);
    return toPublicGameDTO(gameId, game);
  }

  async getGameState(gameId: string) {
    const { game } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");
    console.log(`[GameService:getGameState] gameId=${gameId}`);
    return toPublicGameDTO(gameId, game);
  }

  async makeMove(
    gameId: string,
    playerId: string,
    pieceId: string,
    to: [number, number]
  ) {
    const { game, meta } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");
    
    // Resolve player & piece from in-memory piece store
    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error("Player not found");
    console.log(player)
    
    // Try resolve from player's reserve first
    let piece = game.players
    .flatMap(p => p.getAvailablePieces())
    .find(p => p.id === pieceId);
    
    // If not in reserves, try resolve from board stacks
    if (!piece) {
      const onBoard = game.board.findPieceById(pieceId);
      if (onBoard) {
        piece = onBoard;
      }
    }
    
    if (!piece) {
      const err = new Error("Piece not found");
      (err as any).statusCode = 404;
      throw err;
    }
    
    if (piece.owner.id != playerId) {
      const err = new Error("Not your piece");
      (err as any).statusCode = 403;
      throw err;
    }
    
    const from = game.board.findPiecePosition(piece);
    
    const move = new Move(player, from, to, piece);
    console.log(`[GameService:makeMove] gameId=${gameId} playerId=${playerId} pieceId=${pieceId} from=${from ?? null} to=${to}`);
    const ok = game.makeMove(move);
    console.log("ok: ",ok)
    if (!ok) {

      const err = new Error("Invalid move");
      (err as any).statusCode = 400;
      throw err;
    }
    
    await this.moves.append(gameId, move);
    await this.games.updateGame(gameId, game);
    

    // If next is bot (PVC), auto-move bot
    const next = game.currentPlayer;

    if (next.type === "computer") {
      const strat = this.botFactory.create(
        (meta?.difficulty as BotDifficulty) ?? BotDifficulty.EASY
      );
      const botMove = strat.decideMove(game, next);
      console.log(`[GameService:botMove] gameId=${gameId} playerId=${next.id} to=${botMove.to}`);
      const ok2 = game.makeMove(botMove);
      if (ok2) {
        await this.moves.append(gameId, botMove);
        // await this.boards.updateBoard(gameId, game.board);
        await this.games.updateGame(gameId, game);
      } else {
        console.warn(`[GameService:botMove] invalid bot move`, botMove);
      }
    }

    return toPublicGameDTO(gameId, game);
  }

  async getMoveHistory(gameId: string) {
    return this.moves.getAll(gameId).then((ms) =>
      ms.map((m) => ({
        playerId: m.player.id,
        pieceSize: PieceSize[m.piece.size],
        to: m.to,
      }))
    );
  }

  async getPieces(gameId: string) {
    return this.pieces.getByGame(gameId).then((ps) =>
      ps.map((p) => ({
        id: p.id,
        ownerId: p.owner.id,
        size: PieceSize[p.size],
      }))
    );
  }
}
