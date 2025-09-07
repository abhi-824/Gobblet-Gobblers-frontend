import { Game } from "../models/Game";
import { Player } from "../models/Player";
import { Move } from "../models/Move";

export interface BotStrategy {
  decideMove(game: Game, player: Player): Move;
}
