import type { BotStrategy } from "./BotStrategy";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import { Move } from "../models/Move";

export class HardBotStrategy implements BotStrategy {
    decideMove(game: Game, player: Player): Move {
        // Depth can be tuned; 4 is a good starting point for 3x3 Gobblet
        const searchDepth = 4;
        const { move } = this.minimax(game, player, searchDepth, -Infinity, Infinity);
        // Fallback to any legal move if minimax finds none (should not happen unless no moves)
        if (move) return move;
        const legal = this.getLegalMoves(game, player);
        return legal[0]!;
    }

    private minimax(game: Game, maximizingPlayer: Player, depth: number, alpha: number, beta: number): { score: number; move: Move | null } {
        // Terminal checks
        const winnerNow = game.board.checkWin(maximizingPlayer);
        const opponent = game.players.find(p => p.id !== maximizingPlayer.id)!;
        const opponentWinNow = game.board.checkWin(opponent);
        if (winnerNow) return { score: Number.POSITIVE_INFINITY, move: null };
        if (opponentWinNow) return { score: Number.NEGATIVE_INFINITY, move: null };
        if (game.status === "draw") return { score: 0, move: null };
        if (depth === 0) return { score: this.evaluate(game, maximizingPlayer), move: null };

        const current = game.currentPlayer;
        const legalMoves = this.getLegalMoves(game, current);
        if (legalMoves.length === 0) return { score: this.evaluate(game, maximizingPlayer), move: null };

        // Move ordering: prefer center, then corners
        const prioritized = this.orderMoves(legalMoves);

        let bestMove: Move | null = null;

        if (current.id === maximizingPlayer.id) {
            let value = Number.NEGATIVE_INFINITY;
            for (const move of prioritized) {
                const nextGame = game.clone();
                nextGame.makeMove(move.clone(nextGame.players));
                const { score } = this.minimax(nextGame, maximizingPlayer, depth - 1, alpha, beta);
                if (score > value) {
                    value = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break; // beta cutoff
            }
            return { score: value, move: bestMove };
        } else {
            let value = Number.POSITIVE_INFINITY;
            for (const move of prioritized) {
                const nextGame = game.clone();
                nextGame.makeMove(move.clone(nextGame.players));
                const { score } = this.minimax(nextGame, maximizingPlayer, depth - 1, alpha, beta);
                if (score < value) {
                    value = score;
                    bestMove = move;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break; // alpha cutoff
            }
            return { score: value, move: bestMove };
        }
    }

    private getLegalMoves(game: Game, player: Player): Move[] {
        const moves: Move[] = [];
        const boardSize = game.board.grid.length;
        // Reserve placements only (moving stacked pieces on-board would require different game rules handling)
        for (const piece of player.getAvailablePieces()) {
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    const cell = game.board.getCell(r, c);
                    if (cell.canPlace(piece)) {
                        moves.push(new Move(player, null, [r, c], piece));
                    }
                }
            }
        }
        return moves;
    }

    private orderMoves(moves: Move[]): Move[] {
        // Prefer center (1,1) on 3x3, then corners, then edges
        return moves.slice().sort((a, b) => this.movePriority(b) - this.movePriority(a));
    }

    private movePriority(move: Move): number {
        const [r, c] = move.to;
        if (r === 1 && c === 1) return 3; // center
        if ((r === 0 || r === 2) && (c === 0 || c === 2)) return 2; // corners
        return 1; // edges
    }

    private evaluate(game: Game, player: Player): number {
        const board = game.board;
        const opponent = game.players.find(p => p.id !== player.id)!;

        if (board.checkWin(player)) return 1_000_000;
        if (board.checkWin(opponent)) return -1_000_000;
        if (game.status === "draw") return 0;

        const lines = this.getAllLines(board.grid.length);
        const myMax = this.maxAvailableSize(player);
        const oppMax = this.maxAvailableSize(opponent);

        let score = 0;
        for (const line of lines) {
            const { myReachable, oppReachable } = this.lineReachability(game, line, player, opponent, myMax, oppMax);
            // Reward increasing control; cubic accentuates near-complete lines
            score += this.lineValue(myReachable) - this.lineValue(oppReachable);
        }
        return score;
    }

    private getAllLines(size: number): [number, number][][] {
        const lines: [number, number][][] = [];
        // rows
        for (let r = 0; r < size; r++) {
            lines.push(Array.from({ length: size }, (_, c) => [r, c]));
        }
        // cols
        for (let c = 0; c < size; c++) {
            lines.push(Array.from({ length: size }, (_, r) => [r, c]));
        }
        // diagonals
        lines.push(Array.from({ length: size }, (_, i) => [i, i]));
        lines.push(Array.from({ length: size }, (_, i) => [i, size - 1 - i]));
        return lines;
    }

    private maxAvailableSize(player: Player): number {
        return player.getAvailablePieces().reduce((m, p) => Math.max(m, p.size as unknown as number), 0);
    }

    private lineReachability(game: Game, line: [number, number][], me: Player, opp: Player, myMax: number, oppMax: number): { myReachable: number; oppReachable: number } {
        let myBlocked = false;
        let oppBlocked = false;
        let myReachable = 0;
        let oppReachable = 0;

        for (const [r, c] of line) {
            const top = game.board.getCell(r, c).top();
            if (!top) {
                myReachable++;
                oppReachable++;
                continue;
            }
            // If my line: my piece already there counts as reachable
            if (top.owner.id === me.id) {
                myReachable++;
                // Opp can only contest if they can cover it
                if ((top.size as unknown as number) >= oppMax) {
                    oppBlocked = true;
                } else {
                    oppReachable++;
                }
            } else {
                // Opponent owns top
                oppReachable++;
                if ((top.size as unknown as number) >= myMax) {
                    myBlocked = true;
                } else {
                    myReachable++;
                }
            }
        }

        if (myBlocked) myReachable = 0;
        if (oppBlocked) oppReachable = 0;
        return { myReachable, oppReachable };
    }

    private lineValue(reachable: number): number {
        // On 3x3, 3 reachable is strongest; use exponential curve
        if (reachable <= 0) return 0;
        if (reachable === 1) return 1;
        if (reachable === 2) return 16; // strong two-in-line potential
        return 256; // nearly winning/covered line
    }
}
