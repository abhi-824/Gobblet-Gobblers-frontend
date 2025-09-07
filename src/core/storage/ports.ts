import { Player } from "../core/models/Player";
import { Game } from "../core/models/Game";
import { Move } from "../core/models/Move";
import { Board } from "../core/models/Board";
import { GamePiece } from "../core/models/GamePiece";
import { BotDifficulty } from "../core/types/BotDifficulty";

export interface GameMeta {
  mode: "pvp" | "pvc";
  difficulty?: BotDifficulty;
  createdAt: number;
  startedAt?: number;
}

export interface IGameRepository {
  saveGame(id: string, game: Game, meta: GameMeta): Promise<void>;
  getGameById(id: string): Promise<{ game: Game | null; meta?: GameMeta }>;
  updateGame(id: string, game: Game, meta?: GameMeta): Promise<void>;
}

export interface IPlayerRepository {
  savePlayer(player: Player): Promise<void>;
  updatePlayer(player: Partial<Player> & { id: string }): Promise<void>;
  getPlayerById(id: string): Promise<Player | null>;
}

export interface IPieceRepository {
  saveInitialPieces(gameId: string, players: Player[]): Promise<void>;
  getByGame(gameId: string): Promise<GamePiece[]>;
  getPieceById(id: string): Promise<GamePiece | null>;
}

export interface IBoardRepository {
  saveBoard(gameId: string, board: Board): Promise<void>;
  getBoardByGameId(gameId: string): Promise<Board | null>;
  updateBoard(gameId: string, board: Board): Promise<void>;
}

export interface IMoveRepository {
  append(gameId: string, move: Move): Promise<void>;
  getAll(gameId: string): Promise<Move[]>;
}
