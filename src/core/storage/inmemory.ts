import { Player } from "../core/models/Player";
import { Game } from "../core/models/Game";
import type { GameMeta, IBoardRepository, IGameRepository, IMoveRepository, IPieceRepository, IPlayerRepository } from "./ports";
import { Board } from "../core/models/Board";
import { Move } from "../core/models/Move";
import { GamePiece } from "../core/models/GamePiece";



type GameRow = { game: Game; meta: GameMeta };

const games = new Map<string, GameRow>();
const players = new Map<string, Player>();
const boards = new Map<string, Board>();
const moves = new Map<string, Move[]>();
const pieces = new Map<string, { gameId: string; piece: GamePiece }>();


export class InMemoryGameRepository implements IGameRepository {
    async saveGame(id: string, game: Game, meta: GameMeta): Promise<void> {
        games.set(id, { game, meta });
    }
    async getGameById(id: string): Promise<{ game: Game | null; meta?: GameMeta }> {
        const row = games.get(id);
        return { game: row?.game ?? null, meta: row?.meta };
    }
    async updateGame(id: string, game: Game, meta?: GameMeta): Promise<void> {
        const existing = games.get(id);
        if (!existing) throw new Error("Game not found");
        games.set(id, { game, meta: meta ?? existing.meta });
    }
}

export class InMemoryPlayerRepository implements IPlayerRepository {
    async savePlayer(player: Player): Promise<void> {
        players.set(player.id, player);
    }
    async updatePlayer(partial: Partial<Player> & { id: string }): Promise<void> {
        const prev = players.get(partial.id);
        if (!prev) throw new Error("Player not found");
        // @ts-ignore: we only expose type/name/id
        Object.assign(prev, partial);
    }
    async getPlayerById(id: string): Promise<Player | null> {
        return players.get(id) ?? null;
    }
}

export class InMemoryBoardRepository implements IBoardRepository {
    async saveBoard(gameId: string, board: Board): Promise<void> {
        boards.set(gameId, board);
    }
    async getBoardByGameId(gameId: string): Promise<Board | null> {
        return boards.get(gameId) ?? null;
    }
    async updateBoard(gameId: string, board: Board): Promise<void> {
        if (!boards.has(gameId)) throw new Error("Board not found");
        boards.set(gameId, board);
    }
}

export class InMemoryPieceRepository implements IPieceRepository {
    async saveInitialPieces(gameId: string, ps: Player[]): Promise<void> {
        ps.forEach((pl) =>
            pl.getAvailablePieces().forEach((gp) => {
                pieces.set(gp.id, { gameId, piece: gp }); // use real gp.id
            })
        );
    }

    async getByGame(gameId: string): Promise<GamePiece[]> {
        return [...pieces.values()].filter((r) => r.gameId === gameId).map((r) => r.piece);
    }
    async getPieceById(id: string): Promise<GamePiece | null> {
        return pieces.get(id)?.piece ?? null;
    }
}

export class InMemoryMoveRepository implements IMoveRepository {
    async append(gameId: string, move: Move): Promise<void> {
        const arr = moves.get(gameId) ?? [];
        arr.push(move);
        moves.set(gameId, arr);
    }
    async getAll(gameId: string): Promise<Move[]> {
        return moves.get(gameId) ?? [];
    }
}
