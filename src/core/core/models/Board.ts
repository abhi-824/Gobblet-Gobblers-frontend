import { BoardCell } from "./BoardCell";
import type { GamePiece } from "./GamePiece";
import type { Move } from "./Move";
import type { Player } from "./Player";

export class Board {
    grid: BoardCell[][];

    constructor(public size = 3) {
        this.grid = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null).map(() => new BoardCell()));
    }

    getCell(row: number, col: number): BoardCell {
        return this.grid[row]![col]!;
    }

    isValidMove(row: number, col: number, piece: GamePiece): boolean {
        return this.getCell(row, col).canPlace(piece);
    }

    applyMove(move: Move): boolean {
        const { from, to, piece } = move;
        if (!this.isValidMove(to[0], to[1], piece)) return false;
        if (from) this.getCell(from[0], from[1]).removeTop();
        this.getCell(to[0], to[1]).place(piece);
        return true;
    }

    checkWin(player: Player): boolean {
        const ownsCell = (row: number, col: number): boolean => {
            const topPiece = this.getCell(row, col).top();
            return topPiece?.owner === player;
        };

        // Check rows
        for (let r = 0; r < this.size; r++) {
            if (Array.from({ length: this.size }, (_, c) => ownsCell(r, c)).every(Boolean)) {
                return true;
            }
        }

        // Check columns
        for (let c = 0; c < this.size; c++) {
            if (Array.from({ length: this.size }, (_, r) => ownsCell(r, c)).every(Boolean)) {
                return true;
            }
        }

        // Check main diagonal
        if (Array.from({ length: this.size }, (_, i) => ownsCell(i, i)).every(Boolean)) {
            return true;
        }

        // Check anti-diagonal
        if (Array.from({ length: this.size }, (_, i) => ownsCell(i, this.size - 1 - i)).every(Boolean)) {
            return true;
        }

        return false;
    }
    /**
     * Find the position of a specific piece on the board
     * @param piece The GamePiece to search for
     * @returns [row, col] if found, or null if not found
     */
    findPiecePosition(piece: GamePiece): [number, number] | null {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = this.getCell(r, c);
                if (cell.contains(piece)) {
                    return [r, c];
                }
            }
        }
        return null;
    }
    /**
     * Find and return the actual GamePiece reference on the board by its id.
     */
    findPieceById(pieceId: string): GamePiece | null {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const stack = this.getCell(r, c).getStack();
                const found = stack.find(p => p.id === pieceId);
                if (found) return found;
            }
        }
        return null;
    }
    clone(players: Player[]): Board {
        const clonedBoard = new Board(this.size);
      
        for (let r = 0; r < this.size; r++) {
          for (let c = 0; c < this.size; c++) {
            clonedBoard.grid[r][c] = this.grid[r][c].clone(players);
          }
        }
      
        return clonedBoard;
      }
          
}
