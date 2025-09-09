import { Player } from "../core/models/Player";
import { Game } from "../core/models/Game";
import { Board } from "../core/models/Board";
import { Move } from "../core/models/Move";
import { GamePiece } from "../core/models/GamePiece";
import type {
  GameMeta,
  IBoardRepository,
  IGameRepository,
  IMoveRepository,
  IPieceRepository,
  IPlayerRepository,
} from "./ports";

// --- Helpers ---
function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

// ✅ Hydration helpers (rebuild classes from plain JSON)
function hydrateGame(obj: any, gameId: string): Game {
  const players: Player[] = obj.players.map((p: any) => new Player(p.id, p.type, p.name));

  // Build a canonical piece index from localStorage: pieces:<gameId>
  const pieceArray = loadFromStorage<any[]>(`pieces:${gameId}`) ?? [];
  const pieceIndex = new Map<string, { id: string; size: any; ownerId: string }>();
  pieceArray.forEach((p) => {
    // supports either {id,size,owner:{id}} or {id,size,ownerId}
    const ownerId = p.ownerId ?? p.owner?.id;
    if (p.id && ownerId != null) {
      pieceIndex.set(p.id, { id: p.id, size: p.size, ownerId });
    }
  });

  const board = new Board(obj.board.size);

  // Rebuild players' reserve pieces using either their saved list OR fallback to the canonical index
  obj.players.forEach((persistedPlayer: any) => {
    const player = players.find((pl) => pl.id === persistedPlayer.id)!;
    const persistedReserve: any[] = persistedPlayer.pieces ?? [];

    if (persistedReserve.length > 0) {
      persistedReserve.forEach((persistedPiece) => {
        const meta = pieceIndex.get(persistedPiece.id);
        if (!meta) return;
        const owner = players.find((pl) => pl.id === meta.ownerId) ?? player;
        player.addPiece(new GamePiece(meta.size, owner, meta.id));
      });
    } else {
      // Fallback: reconstruct two of each size per owner minus what is on board (handled below)
      // Here we simply pull from the canonical index for this owner and will NOT duplicate board pieces
      for (const meta of pieceIndex.values()) {
        if (meta.ownerId === player.id) {
          player.addPiece(new GamePiece(meta.size, player, meta.id));
        }
      }
    }
  });

  // Rebuild board stacks from ids using the canonical index
  obj.board.grid.forEach((row: any[], r: number) => {
    row.forEach((cell: any, c: number) => {
      const stack: string[] = cell.stack ?? [];
      stack.forEach((pieceId: string) => {
        const meta = pieceIndex.get(pieceId);
        if (!meta) return; // piece meta must exist in index
        const owner = players.find((pl) => pl.id === meta.ownerId)!;
        board.placePieceAt(new GamePiece(meta.size, owner, meta.id), [r, c]);
      });
    });
  });

  const currentPlayer = players.find((p) => p.id === obj.currentPlayerId)!;
  const game = new Game(board, players as [Player, Player], currentPlayer);
  // restore status and winner
  if (obj.status) game.status = obj.status;
  if (obj.winnerId) {
    const w = players.find(p => p.id === obj.winnerId) || null;
    game.winner = w;
  }
  return game;
}
  
function hydrateBoard(obj: any): Board {
  const b = new Board(obj.size);
  // Rehydrate board cells/pieces
  if (obj.grid) {
    obj.grid.forEach((row: any[], y: number) =>
      row.forEach((cell: any, x: number) => {
        if (cell && cell.pieces) {
          cell.pieces.forEach((p: any) => {
            b.placePieceAt(hydratePiece(p), [x, y]); // ensure Board has a placePieceAt
          });
        }
      })
    );
  }
  return b;
}

function hydratePlayer(obj: any): Player {
  const p = new Player(obj.id, obj.type, obj.name);
  if (obj.pieces) {
    obj.pieces.forEach((gp: any) => {
      p.addPiece(hydratePiece(gp, p));
    });
  }
  return p;
}

function hydratePiece(obj: any, owner?: Player): GamePiece {
  // Accept either {id,size,ownerId} or {id,size,owner:{id}}
  const ownerId = obj.ownerId ?? obj.owner?.id;
  const resolvedOwner = owner ?? (ownerId ? new Player(ownerId, "human") : undefined);
  return new GamePiece(obj.size, resolvedOwner as Player, obj.id);
}

function hydrateMove(obj: any): Move {
  const player = hydratePlayer(obj.player);
  // piece may be serialized with ownerId only
  const piece = hydratePiece(obj.piece, player);
  return new Move(player, obj.from, obj.to, piece);
}

// --- In-memory + LocalStorage backed repositories ---
export class InMemoryGameRepository implements IGameRepository {
  async saveGame(id: string, game: Game, meta: GameMeta): Promise<void> {
    const data = { game, meta };
    saveToStorage(`game:${id}`, data);
  }

  async getGameById(id: string): Promise<{ game: Game | null; meta?: GameMeta }> {
    const data = await loadFromStorage<any>(`game:${id}`);
    if (!data) return { game: null };
    const game= hydrateGame(data.game, id);
    return { game, meta: data.meta };
  }

  async updateGame(id: string, game: Game, meta?: GameMeta): Promise<void> {
    console.log("game",game)
    const existing = await loadFromStorage<any>(`game:${id}`);
    if (!existing) throw new Error("Game not found");
    await saveToStorage(`game:${id}`, { game, meta: meta ?? existing.meta });
  }
}

export class InMemoryPlayerRepository implements IPlayerRepository {
  async savePlayer(player: Player): Promise<void> {
    saveToStorage(`player:${player.id}`, player);
  }
  async updatePlayer(partial: Partial<Player> & { id: string }): Promise<void> {
    const prev = await loadFromStorage<any>(`player:${partial.id}`);
    if (!prev) throw new Error("Player not found");
    const updated = { ...prev, ...partial };
    saveToStorage(`player:${partial.id}`, updated);
  }
  async getPlayerById(id: string): Promise<Player | null> {
    const obj = await loadFromStorage<any>(`player:${id}`);
    return obj ? hydratePlayer(obj) : null;
  }
}

export class InMemoryBoardRepository implements IBoardRepository {
  async saveBoard(gameId: string, board: Board): Promise<void> {
    saveToStorage(`board:${gameId}`, board);
  }
  async getBoardByGameId(gameId: string): Promise<Board | null> {
    const obj = await loadFromStorage<any>(`board:${gameId}`);
    return obj ? hydrateBoard(obj) : null;
  }
  async updateBoard(gameId: string, board: Board): Promise<void> {
    const existing = await loadFromStorage<any>(`board:${gameId}`);
    if (!existing) throw new Error("Board not found");
    saveToStorage(`board:${gameId}`, board);
  }
}

export class InMemoryPieceRepository implements IPieceRepository {
  async saveInitialPieces(gameId: string, ps: Player[]): Promise<void> {
    const allPieces = ps.flatMap((p) => p.getAvailablePieces());
    saveToStorage(`pieces:${gameId}`, allPieces);
  }

  async getByGame(gameId: string): Promise<GamePiece[]> {
    const arr = await loadFromStorage<any[]>(`pieces:${gameId}`);
    return arr ? arr.map((p) => hydratePiece(p)) : [];
  }

  async getPieceById(id: string): Promise<GamePiece | null> {
    // brute-force search all games
    for (let key in localStorage) {
      if (key.startsWith("pieces:")) {
        const arr = await loadFromStorage<any[]>(key);
        if (arr) {
          const found = arr.find((p) => p.id === id);
          if (found) return hydratePiece(found);
        }
      }
    }
    return null;
  }
}

export class InMemoryMoveRepository implements IMoveRepository {
  async append(gameId: string, move: Move): Promise<void> {
    const existing = await loadFromStorage<any[]>(`moves:${gameId}`) ?? [];
    existing.push(move);
    saveToStorage(`moves:${gameId}`, existing);
  }
  async getAll(gameId: string): Promise<Move[]> {
    const arr = await loadFromStorage<any[]>(`moves:${gameId}`);
    return arr ? arr.map((m) => hydrateMove(m)) : [];
  }
}
