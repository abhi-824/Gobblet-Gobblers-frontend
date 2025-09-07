import { GamePiece } from "./GamePiece";
import { Player } from "./Player";

export class Move {
  constructor(
    public readonly player: Player,
    public readonly from: [number, number] | null,
    public readonly to: [number, number],
    public readonly piece: GamePiece
  ) {}

  clone(players: Player[]): Move {
    const clonedPlayer = players.find(p => p.id === this.player.id)!;
    // Try to find the piece in player's reserves; if not present, reconstruct by id
    const reservePiece = clonedPlayer.getAvailablePieces().find(pc => pc.id === this.piece.id);
    const clonedPiece = reservePiece ?? new GamePiece(this.piece.size as any, clonedPlayer, this.piece.id);
    return new Move(clonedPlayer, this.from ? [...this.from] as [number, number] : null, [...this.to] as [number, number], clonedPiece);
  }
}
