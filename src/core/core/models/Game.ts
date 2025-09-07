import { Board } from "./Board";
import { Player } from "./Player";
import { Move } from "./Move";

export type GameStatus = "in_progress" | "win" | "draw" | "lose";

export class Game {
  private moves: Move[] = [];
  public status: GameStatus = "in_progress";
  public id: String = "";
  public winner: Player | null = null;

  constructor(
    public readonly board: Board,
    public readonly players: [Player, Player],
    public currentPlayer: Player
  ) {}

  getOpponent(): Player {
    return this.players.find(p => p !== this.currentPlayer)!;
  }

  makeMove(move: Move): boolean {
    if (move.player !== this.currentPlayer) throw new Error("Not your turn.");
    const success = this.board.applyMove(move);
    move.player.removePiece(move.piece);
    if (!success) return false;

    this.moves.push(move);

    if (this.board.checkWin(this.currentPlayer)) {
      this.status = "win";
      this.winner = this.currentPlayer;
    }else {
      this.currentPlayer = this.getOpponent();
    }

    return true;
  }
  clone(): Game {
    // Clone players first (assumes Player has a .clone())
    const clonedPlayers = this.players.map(p => p.clone()) as [Player, Player];

    // Clone board, remapping references to cloned players
    const clonedBoard = this.board.clone(clonedPlayers);

    // Get the cloned current player
    const clonedCurrent = clonedPlayers.find(p => p.id === this.currentPlayer.id)!;

    // Create new game
    const cloned = new Game(clonedBoard, clonedPlayers, clonedCurrent);
    cloned.id = this.id;
    cloned.status = this.status;
    cloned.winner = this.winner ? clonedPlayers.find(p => p.id === this.winner!.id) || null : null;

    // Clone moves with proper references
    cloned.moves = this.moves.map(m => m.clone(clonedPlayers));

    return cloned;
  }

}
