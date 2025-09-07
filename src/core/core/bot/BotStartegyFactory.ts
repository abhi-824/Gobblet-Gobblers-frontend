import { BotDifficulty } from "../types/BotDifficulty";
import type { BotStrategy } from "./BotStrategy";
import { EasyBotStrategy } from "./EasyBotStrategy";
// import { MediumBotStrategy } from "./MediumBotStrategy";
import { HardBotStrategy } from "./HardBotStrategy";

export class BotStrategyFactory {
  static create(difficulty: BotDifficulty): BotStrategy {
    switch (difficulty) {
      case BotDifficulty.EASY:
        return new EasyBotStrategy();
      // case BotDifficulty.MEDIUM:
      //   return new MediumBotStrategy();
      case BotDifficulty.HARD:
        return new HardBotStrategy();
      default:
        throw new Error(`Unsupported bot difficulty: ${difficulty}`);
    }
  }
}
