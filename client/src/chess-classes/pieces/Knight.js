import Piece from './Piece';
import sources from './sources';
import { canMoveKnight } from '../helpers/movement-heplers';


// Knight
// this class represents a chess knight
class Knight extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackKnight : sources.whiteKnight), board);
    }

    // determines whether the knight can be moved to the specified location
    canMove(start, destination, board) {
        return canMoveKnight(start, destination, board);
    }
}

export default Knight;