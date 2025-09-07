// src/api/hooks.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./client";
import type { GameState } from "./types";
import { controller } from "../core/routes/gameRoutes";

// Create Game
async function createGame({ mode, difficulty }: { mode: string; difficulty: string }) {
  const res = await controller.createGame({ mode, difficulty });
  if (res.error) {
    console.error("CreateGame error:", res.error);
    throw new Error(res.error);
  }
  return res.data as GameState;

  const { data } = await api.post<GameState>("/games", { mode, difficulty });
  return data;
}
export function useCreateGame() {
  return useMutation({ mutationFn: createGame });
}

// Start Game
async function startGame(gameId: string) {
  const res = await controller.startGame({ id: gameId });
  if (res.error) {
    console.error("StartGame error:", res.error);
    throw new Error(res.error);
  }
  return res.data as GameState;

  const { data } = await api.post<GameState>(`/games/${gameId}/start`);
  return data;
}
export function useStartGame() {
  return useMutation({ mutationFn: startGame });
}

// Get Game State
async function getGameState(gameId: string) {
  const res = await controller.getGameState({ id: gameId });
  if (res.error) {
    console.error("GetGameState error:", res.error);
    throw new Error(res.error);
  }
  return res.data as GameState;

  const { data } = await api.get<GameState>(`/games/${gameId}`);
  return data;
}
export function useGameState(gameId: string, p0: { refetchInterval: number; }) {
  return useQuery({ queryKey: ["game", gameId], queryFn: () => getGameState(gameId), enabled: !!gameId });
}

// Make Move
async function makeMove(gameId: string, move: { playerId: string; pieceId: string; to: [number, number] }) {
  const res = await controller.makeMove({ id: gameId }, move);
  if (res.error) {
    console.error("MakeMove error:", res.error);
    throw new Error(res.error);
  }
  return res.data as GameState;

  const { data } = await api.post<GameState>(`/games/${gameId}/moves`, move);
  return data;
}
export function useMakeMove() {
  return useMutation({ mutationFn: ({ gameId, move }: { gameId: string; move: { playerId: string; pieceId: string; to: [number, number] } }) => makeMove(gameId, move) });
}

// Get Pieces
async function getPieces(gameId: string) {
  const res = await controller.getPieces({ id: gameId });
  if (res.error) {
    console.error("GetPieces error:", res.error);
    throw new Error(res.error);
  }

  return res.data;

  const { data } = await api.get(`/games/${gameId}/pieces`);
  return data;
}
export function usePieces(gameId: string) {
  return useQuery({ queryKey: ["pieces", gameId], queryFn: () => getPieces(gameId), enabled: !!gameId });
}
