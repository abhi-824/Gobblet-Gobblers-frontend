import { GamePiece } from "./GamePiece";
import { Player } from "./Player";

export class BoardCell {
  private stack: GamePiece[] = [];

  top(): GamePiece | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  canPlace(piece: GamePiece): boolean {
    const top = this.top();
    return !top || piece.size > top.size;
  }

  place(piece: GamePiece): boolean {
    if (!this.canPlace(piece)) return false;
    this.stack.push(piece);
    return true;
  }

  removeTop(): GamePiece | null {
    return this.stack.pop() ?? null;
  }

  getStack(): GamePiece[] {
    return [...this.stack];
  }

  contains(piece: GamePiece): boolean {
    return this.stack.some(p => p.id === piece.id);
  }
  clone(players: Player[]): BoardCell {
    const clonedCell = new BoardCell();
    this.stack.forEach(piece => {
      const clonedOwner = players.find(p => p.id === piece.owner.id)!;
      // Recreate the exact piece on board using its id, independent of owner's reserve pieces
      const recreated = new GamePiece(piece.size as any, clonedOwner, piece.id);
      clonedCell.place(recreated);
    });
    return clonedCell;
  }

}
