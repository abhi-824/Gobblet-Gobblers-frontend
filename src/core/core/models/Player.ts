import { PieceSize } from "../types/PieceSize";
import { GamePiece } from "./GamePiece";

export class Player {
  constructor(
    public readonly id: string,
    public readonly type: "human" | "computer",
    public readonly name?: string,
    private pieces: GamePiece[] = []
  ) {}

  hasPiece(size: PieceSize): boolean {
    return this.pieces.some(p => p.size === size);
  }

  getAvailablePieces(): GamePiece[] {
    return this.pieces;
  }

  removePiece(piece: GamePiece) {
    this.pieces = this.pieces.filter(p => p !== piece);
  }

  addPiece(piece: GamePiece) {
    this.pieces.push(piece);
  }
  clone(): Player {
    const cloned = new Player(this.id, this.type, this.name);
    this.pieces.forEach(p => {
      cloned.addPiece(p.clone(cloned)); // relies on GamePiece.clone()
    });
    return cloned;
  }
}
