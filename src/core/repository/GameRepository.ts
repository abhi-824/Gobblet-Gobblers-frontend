import { Game } from "../core/models/Game";

export class GameRepository {
  constructor(private db: any) {}

  async saveGame(game: Game): Promise<Game> {
    return this.db.games.insert(game);
  }

  async getGameById(gameId: string): Promise<Game | null> {
    return this.db.games.findOne({ id: gameId });
  }

  async updateGame(game: Game): Promise<Game> {
    return this.db.games.update({ id: game.id }, game);
  }
}
