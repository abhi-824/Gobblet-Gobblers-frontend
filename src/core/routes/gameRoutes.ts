import { BotStrategyFactory } from "../core/bot/BotStartegyFactory";
import { GameService } from "../services/GameService";
import { GameController } from "../controllers/GameController";
import { InMemoryBoardRepository, InMemoryGameRepository, InMemoryMoveRepository, InMemoryPieceRepository, InMemoryPlayerRepository } from "../storage/inmemory";

const gameRepo = new InMemoryGameRepository();
const playerRepo = new InMemoryPlayerRepository();
const pieceRepo = new InMemoryPieceRepository();
const boardRepo = new InMemoryBoardRepository();
const moveRepo = new InMemoryMoveRepository();
const botFactory = BotStrategyFactory;

const service = new GameService(
  gameRepo,
  playerRepo,
  pieceRepo,
  boardRepo,
  moveRepo,
  botFactory
);
export const controller = new GameController(service);
