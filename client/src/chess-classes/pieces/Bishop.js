import sources from "./sources";
import { canMoveBishop } from "../helpers/movement-heplers";
import { bishopWillAttack } from "../helpers/danger-helpers";

export default class Bishop {
    constructor(friendly, color) {
        this.friendly = friendly;
        this.color = color;
        this.src = ((color === "black" && friendly) || (color === "white" && !friendly)) ? 
            sources.blackBishop : sources.whiteBishop;
    }

    // determines whether the bishop can move to the specified location
    canMove(start, destination, board, kingPosition) {
        return canMoveBishop(start, destination, board, kingPosition);
    }

    // determines whether the bishop will be able to attack the king after this move has occurred
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}
