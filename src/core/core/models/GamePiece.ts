import type { PieceSize } from "../types/PieceSize";
import { Player } from "./Player";
import { v4 as uuidv4 } from 'uuid';

export class GamePiece {
    public readonly size: PieceSize;
    public readonly owner: Player;
    public id: string = "";
    constructor(size: PieceSize, owner: Player);
    constructor(size: PieceSize, owner: Player, id: string);

    constructor(size: PieceSize, owner: Player, id?: string) {
        this.id = id ? id: uuidv4();
        this.size = size;
        this.owner = owner;
    }
    clone(newOwner: Player): GamePiece {
        return new GamePiece(this.size, newOwner, this.id);
    }    
}
