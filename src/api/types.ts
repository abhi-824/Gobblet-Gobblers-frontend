// src/api/types.ts
export type PieceSize = "SM" | "MD" | "LG";

export interface Piece {
  id: string;
  size: PieceSize;
}

export interface Player {
  id: string;
  type: "human" | "computer";
  pieces: Piece[];
}

export interface GameState {
  gameId: string;
  status: "in_progress" | "win" | "draw" | "lose";
  currentPlayer: string;
  players: Player[];
  board: (null | { ownerId?: string; size: PieceSize })[][];
}
