import { BotDifficulty } from "../core/types/BotDifficulty";
import { GameService } from "../services/GameService";
import { z } from "zod";

// Validation schemas
const CreateGameSchema = z.object({
  mode: z.enum(["pvp", "pvc"]),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});
const JoinGameSchema = z.object({ playerName: z.string().min(1) });
const MakeMoveSchema = z.object({
  playerId: z.string().min(1),
  pieceId: z.string().min(1),
  to: z.tuple([z.number().int().min(0).max(2), z.number().int().min(0).max(2)]),
});

export class GameController {
  constructor(private svc: GameService) {}

  // Create a new game
  createGame = async (body: unknown) => {
    try {
      const parsed = CreateGameSchema.parse(body);
      const difficulty: BotDifficulty = parsed.difficulty
        ? BotDifficulty[parsed.difficulty.toUpperCase() as keyof typeof BotDifficulty]
        : BotDifficulty.EASY;

      const game = await this.svc.createGame(parsed.mode, difficulty);
      return { status: 201, data: game };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to create game" };
    }
  };

  // Join an existing game
  joinGame = async (params: { id: string }, body: unknown) => {
    try {
      const parsed = JoinGameSchema.parse(body);
      const game = await this.svc.joinGame(params.id, parsed.playerName);
      return { status: 200, data: game };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to join game" };
    }
  };

  // Start game
  startGame = async (params: { id: string }) => {
    try {
      const game = await this.svc.startGame(params.id);
      return { status: 200, data: game };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to start game" };
    }
  };

  // Get game state
  getGameState = async (params: { id: string }) => {
    try {
      const game = await this.svc.getGameState(params.id);
      return { status: 200, data: game };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to get game state" };
    }
  };

  // Make move
  makeMove = async (params: { id: string }, body: unknown) => {
    try {
      const parsed = MakeMoveSchema.parse(body);
      const updated = await this.svc.makeMove(
        params.id,
        parsed.playerId,
        parsed.pieceId,
        parsed.to
      );
      return { status: 200, data: updated };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to make move" };
    }
  };

  // Get move history
  getMoveHistory = async (params: { id: string }) => {
    try {
      const moves = await this.svc.getMoveHistory(params.id);
      return { status: 200, data: moves };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to get move history" };
    }
  };

  // Get all pieces
  getPieces = async (params: { id: string }) => {
    try {
      const pieces = await this.svc.getPieces(params.id);
      return { status: 200, data: pieces };
    } catch (err: any) {
      return { status: 400, error: err.message ?? "Failed to get pieces" };
    }
  };
}
