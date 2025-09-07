import type { BotStrategy } from "./BotStrategy";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import { Move } from "../models/Move";

export class EasyBotStrategy implements BotStrategy {
  decideMove(game: Game, player: Player): Move {
    // very dumb strategy: pick random piece, random valid cell
    const availablePieces = player.getAvailablePieces();
    const piece = availablePieces[Math.floor(Math.random() * availablePieces.length)];

    const options = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = game.board.getCell(r, c);
        if (cell.canPlace(piece!)) {
          options.push([r, c]);
        }
      }
    }

    const to = options[Math.floor(Math.random() * options.length)]!;
    return new Move(player, null, [to[0]!, to[1]!], piece!);
  }
}
