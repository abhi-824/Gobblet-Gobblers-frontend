import { Game } from "../models/Game";
import { PieceSize } from "../types/PieceSize";

export function toPublicGameDTO(gameId: string, game: Game) {
  return {
    gameId,
    status: game.status,
    currentPlayer: game.currentPlayer.id,
    winner: game.winner ? {
      id: game.winner.id,
      type: game.winner.type,
      name: game.winner.name
    } : null,
    players: game.players.map((p) => ({
      id: p.id,
      type: p.type,
      pieces: p.getAvailablePieces().map((gp) => ({
        id: gp.id,
        size: PieceSize[gp.size],
      })),
    })),
    board: game.board.grid.map((row) =>
      row.map((cell) => {
        const top = cell.top();
        if (!top) return null;
        return {
          ownerId: top.owner.id,
          pieceId: cell.top()?.id,
          size: PieceSize[top.size]
        };
      })
    ),
  };
}

// Minimal stable ID derivation for demo (in real DB each piece should have an id)
function idOf(obj: object): string {
  // @ts-ignore weak identity for demo purposes
  if (!obj.__id) obj.__id = Math.random().toString(36).slice(2);
  // @ts-ignore
  return obj.__id;
}
