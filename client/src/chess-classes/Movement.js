import Spot from './Spot';

// this class will contain static methods for dealing with gameplay logic
export default class Movement {
    // returns whether the piece at start can be moved to destination
    static canMove(start, destination, board, kingPosition, attackingFriendlyKing) {
        if (start.piece === null) return false;
        switch (start.piece.pieceType) {
            case 'Pawn':
                return this.canMovePawn(start, destination, board, kingPosition, attackingFriendlyKing);
            case 'Rook':
                return this.canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing);
            case 'Bishop':
                return this.canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing);
            case 'Knight':
                return this.canMoveKnight(start, destination, board, kingPosition, attackingFriendlyKing);
            case 'Queen':
                return (this.canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing) ||
                    this.canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing));
            default:
                // if the kingPosition is -1 this method was called from this.dangerous
                return (kingPosition === -1 ? this.canMoveKing(start, destination, board, true) :
                    this.canMoveKing(start, destination, board, false));
        }
    }

    // returns whether a pawn can be moved from the start to the destination
    static canMovePawn(start, destination, board, kingPosition, attackingFriendlyKing) {
        if (start.piece === null) return false;
        console.log('pawn start', start);
        let shift = start.piece.friendly ? -1 : 1;
        // convert the positions to rows and columns
        let startRow = Math.floor(start.position / 8);
        let startColumn = start.position % 8;
        let destinationRow = Math.floor(destination.position / 8);
        let destinationColumn = destination.position % 8;
        // if this piece is on the home row and there are no pieces in the two spots directly infront of it, 
        // moving two spots ahead is legal
        if (start.piece.friendly && startRow === 6 && destinationRow === 4 && startColumn === destinationColumn
            && destination.piece === null && board[40 + startColumn].piece === null) {
            if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
                kingPosition, attackingFriendlyKing);
            return !this.cantMove(start, destination, board, kingPosition);
        }
        if (!start.piece.friendly && startRow === 1 && destinationRow === 3 && startColumn === destinationColumn
            && destination.piece === null && board[16 + startColumn].piece === null) {
            if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
                kingPosition, attackingFriendlyKing);
            return !this.cantMove(start, destination, board, kingPosition);
        }
        // if the destination is occupied, the move must be diagonal and forward and the piece must not be friendly
        if (destination.piece !== null) {
            // if the piece is on the same team, this pawn cannot move there
            if (this.teammates(start, destination)) return false;
            // this piece can move to one of the two spots diagonally in front of it
            if (startRow + shift !== destinationRow || (destinationColumn !== startColumn - 1
                && destinationColumn !== startColumn + 1)) return false;
            if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
                kingPosition, attackingFriendlyKing);
            return !this.cantMove(start, destination, board, kingPosition);
        }
        // if the destination is not occupied, diagonal moves are not legal
        else {
            // this piece can only move to the spot directly in front of it
            if (startRow + shift !== destinationRow || startColumn !== destinationColumn) return false;
            if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
                kingPosition, attackingFriendlyKing);
            return !this.cantMove(start, destination, board, kingPosition);
        }
    }


    // returns whether a rook can be moved from the start to the destination
    static canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing) {
        if (start.piece === null) return false;
        // if the destination contains a piece on the same team, the rook cannot move there
        if (destination.piece !== null && this.teammates(start, destination)) return false;
        // convert the positions to rows and columns
        let startRow = Math.floor(start.position / 8);
        let startColumn = start.position % 8;
        let destinationRow = Math.floor(destination.position / 8);
        let destinationColumn = destination.position % 8;
        // if the destination is not in either the same row or same column, the rook cannot move there
        if (startRow !== destinationRow && startColumn !== destinationColumn) return false;
        // if there is a piece between the rook and the destination, the rook cannot move there
        if (startRow === destinationRow) {
            if (startColumn < destinationColumn) {
                for (let i = startColumn + 1; i < destinationColumn; i++) {
                    if (board[startRow * 8 + i].piece !== null) return false;
                }
            }
            else if (startColumn > destinationColumn) {
                for (let i = startColumn - 1; i > destinationColumn; i--) {
                    if (board[startRow * 8 + i].piece !== null) return false;
                }
            }
            else return false;
        }
        else {
            if (startRow < destinationRow) {
                for (let i = startRow + 1; i < destinationRow; i++) {
                    if (board[i * 8 + startColumn].piece !== null) return false;
                }
            }
            else if (startRow > destinationRow) {
                for (let i = startRow - 1; i > destinationRow; i--) {
                    if (board[i * 8 + startColumn].piece !== null) return false;
                }
            }
            else return false;
        }
        // if the king is in check, the rook can move to the destination 
        // if this move brings the king out of check
        if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
            kingPosition, attackingFriendlyKing);
        // if none of the above conditions were met, the rook can move 
        // to the destination if it doesn't place the king in jeopardy
        return !this.cantMove(start, destination, board, kingPosition);
    }

    // returns whether a bishop can be moved from the start to the destination
    static canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing) {
        if (start.piece === null) return false;
        // if the destination contains a piece on the same team, the bishop cannot be moved there
        if (destination.piece !== null && this.teammates(start, destination)) return false;
        // convert the positions to rows and columns
        let startRow = Math.floor(start.position / 8);
        let startColumn = start.position % 8;
        let destinationRow = Math.floor(destination.position / 8);
        let destinationColumn = destination.position % 8;
        // if the destination is not on a diagonal from the start the bishop cannot move there
        if (Math.abs(destinationRow - startRow) !== Math.abs(destinationColumn - startColumn)) return false;
        // make sure that there are no pieces between the destination and start
        if (startColumn < destinationColumn) {
            if (startRow < destinationRow) {
                for (let i = startRow + 1, j = startColumn + 1; i < destinationRow; i++) {
                    if (board[i * 8 + j++].piece !== null) return false;
                }
            }
            else if (startRow > destinationRow) {
                for (let i = startRow - 1, j = startColumn + 1; i > destinationRow; i--) {
                    if (board[i * 8 + j++].piece !== null) return false;
                }
            }
            else return false;
        }
        else {
            if (startRow < destinationRow) {
                for (let i = startRow + 1, j = startColumn - 1; i < destinationRow; i++) {
                    if (board[i * 8 + j--].piece !== null) return false;
                }
            }
            else if (startRow > destinationRow) {
                for (let i = startRow - 1, j = startColumn - 1; i > destinationRow; i--) {
                    if (board[i * 8 + j--].piece != null) return false;
                }
            }
            else return false;
        }
        // if the king is in check, the rook can move to the destination 
        // if this move brings the king out of check
        if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
            kingPosition, attackingFriendlyKing);
        // if none of the above conditions were met 
        // the bishop can be moved to the destination
        // if this move doesn't place the king in jeopardy
        return !this.cantMove(start, destination, board, kingPosition);
    }

    // returns whether a knight can be moved from the start to the destination
    static canMoveKnight(start, destination, board, kingPosition, attackingFriendlyKing) {
        if (start.piece === null) return false;
        // if the destination contains a piece on the same team, the knight cannot be moved there
        if (destination.piece !== null && this.teammates(start, destination)) return false;
        // convert the positions to rows and columns
        let startRow = Math.floor(start.position / 8);
        let startColumn = start.position % 8;
        let destinationRow = Math.floor(destination.position / 8);
        let destinationColumn = destination.position % 8;
        // if the destination is not one of the eight valid moves, the knight cannot be moved
        if (!((destinationRow === startRow - 2 && destinationColumn === startColumn + 1) ||
            (destinationRow === startRow - 1 && destinationColumn === startColumn + 2) ||
            (destinationRow === startRow + 1 && destinationColumn === startColumn + 2) ||
            (destinationRow === startRow + 2 && destinationColumn === startColumn + 1) ||
            (destinationRow === startRow + 2 && destinationColumn === startColumn - 1) ||
            (destinationRow === startRow + 1 && destinationColumn === startColumn - 2) ||
            (destinationRow === startRow - 1 && destinationColumn === startColumn - 2) ||
            (destinationRow === startRow - 2 && destinationColumn === startColumn - 1)))
            return false;
        // if the king is in check, the rook can move to the destination 
        // if this move brings the king out of check
        if (attackingFriendlyKing.size > 0) return this.willRemoveCheck(start, destination, board,
            kingPosition, attackingFriendlyKing);
        // the knight can be moved if this move doesn't place the king in jeopardy
        return !this.cantMove(start, destination, board, kingPosition);
    }

    // returns whether a king can be moved from the start to the destination
    static canMoveKing(start, destination, board, calledFromDangerous) {
        if (start.piece === null) return false;
        // if the destination is occupied by a piece on the same team, the king cannot move there
        if (destination.piece !== null && this.teammates(start, destination)) return false;
        // convert the positions to rows and columns
        let startRow = Math.floor(start.position / 8);
        let startColumn = start.position % 8;
        let destinationRow = Math.floor(destination.position / 8);
        let destinationColumn = destination.position % 8;
        // if the destination is not adjacent to the king, it cannot move there
        if (destinationRow < startRow - 1 || destinationRow > startRow + 1 || destinationColumn < startColumn - 1
            || destinationColumn > startColumn + 1) return false;
        // if the piece that will be at the destination is the enemy king, return true
        // this is because if that is the case this method was called from this.dangerous
        // in this situation it is not possible for the enemy king to move to the destination because
        // this piece would be able to move there.
        // in this case we cannot call this.dangerous because it could lead to infinite recursion
        if (calledFromDangerous) return true;
        // if the king will be attacked at the destination, it cannot move there
        // if there are no threatening pieces at the destination, it can move there
        return !this.dangerous(start, destination, board, start.piece.friendly);
    }

    // determines whether two pieces are on the same team
    static teammates(start, destination) {
        return ((start.piece.friendly && destination.piece.friendly) ||
            (!start.piece.friendly && !destination.piece.friendly));
    }

    // determines if making this move will remove the king from check
    static willRemoveCheck(start, destination, board, kingPosition, attackerPositions) {
        // if there is only one attacker and this piece is about to kill the attacker, 
        // this move will remove the king from check
        if (attackerPositions.size === 1 && attackerPositions.has(destination.position)) return true;
        // if there is more than one attacker and this piece is about to kill one of them,
        // this move will not remove the king from check
        if (attackerPositions.size > 1 && attackerPositions.has(destination.position)) return false;
        // now that we know that none of the attackers are being killed,
        // if the piece is an instanceof knight or pawn then this move will not remove the king from check
        // because it is not killing them 
        // this is because it is not possible to stop a knight or pawn from
        // attacking the king without moving the king or killing them - in this situation we know that 
        // neither of these conditions are true so we must return false
        // if the piece is an instanceof Rook, Bishop, or Queen we check to see if it will be able to attack
        // we will ignore the start location because there will not be a piece there after this move, 
        // we know that the destination will be occupied, so it is blocking any king attack attempts
        // thus, we will ignore the start location and hypothetically fill the destination position
        // if the piece will be able to attack the king after this move, then this move does not remove 
        // the king from check, return false
        for (let pos of attackerPositions) {
            if (board[pos].piece === null) {
                switch (board[pos].piece.pieceType) {
                    case 'Pawn':
                    case 'Knight':
                    case 'King':
                        return false;
                    case 'Rook':
                        if (this.rookWillAttack(board[pos], kingPosition, board, start, destination)) return false;
                        break;
                    case 'Bishop':
                        if (this.bishopWillAttack(board[pos], kingPosition, board, start, destination)) return false;
                        break;
                    default:
                        if (this.rookWillAttack(board[pos], kingPosition, board, start, destination) ||
                            this.bishopWillAttack(board[pos], kingPosition, board, start, destination))
                            return false;
                }
            }
        }
        // if execution made it this far, then the attackers can no longer attack the king
        return true;
    }

    // if this function executes we know that the king is not currently in check
    // this function returns whether the king would be in check if this move took place
    static cantMove(start, destination, board, kingPosition) {
        console.log('cant start', start.piece);
        // loop over every spot on the board.
        // at any given spot, if there is a piece and it is on the opposite team as the piece that is moving
        // if it is not in the distination spot (i.e. is not about to be killed) and will be able to attack the king 
        // once this move is made, then this move cannot be made, return true
        // it is important to note that if a given piece is a pawn, knight, or king a move by the other team
        // will not enable them to attack the king because kings and pawns must be directly adjacent to a piece in order
        // to attack it, thus if they are able to attack the king they must have alread been able to attack it before this move.
        // In the case of the knight it is not possible to block it by placing a piece between it and the king because knights
        // can jump over other pieces, thus if a knight is not able to attack the king it is not possible for this player to 
        // make a move that will suddenly enable an enemy knight to put their king in check
        // if this piece is a rook, bishop, or queen we must check to see if it will be able to move to the location of the king 
        // after this move takes place. If this is true, then this move is not legal because it would place the friendly king 
        // in check. It is important to note that there are some situations where a piece has the enemy king in check but is simultaneously
        // protecting its own king from check. Even though that piece would not be able to move to attack the enemy king, it is still 
        // considered to have the enemy king in check. For this reason, when we are seeing if an enemy piece will be able to attack the 
        // friendly king after this move takes place we will not take into account whether the enemy piece is protecting its own king
        // all that matters is that it could conceivably attack the friendly king
        for (let i = 0; i < board.length; i++) {
            console.log('board i', board[i].piece);
            if (board[i].piece !== null && !this.teammates(start, board[i]) && board[i].position !== destination.position
                && !(board[i].piece.pieceType === 'Pawn') && !(board[i].piece.pieceType === 'Knight') && !(board[i].piece.pieceType === 'King')
                && ((board[i].piece.pieceType === 'Rook' && this.rookWillAttack(board[i], kingPosition, board, start, destination)) ||
                    (board[i].piece.pieceType === 'Bishop' && this.bishopWillAttack(board[i], kingPosition, board, start, destination)) ||
                    (board[i].piece.pieceType === 'Queen' && (this.rookWillAttack(board[i], kingPosition, board, start, destination) ||
                        this.bishopWillAttack(board[i], kingPosition, board, start, destination))))) return true;
        }
        return false;
    }

    // whether a given spot on the board is being attacked by the enemy
    static dangerous(startLocation, location, board, friendly) {
        // check every piece on the board and see if it can attack the specified location
        // when we perform these checks we do not need to take into account whether the enemy
        // piece is protecting the enemy king. All that matters is that the enemy piece could 
        // conceivably move to the location of the friendly king. If that is true, then the location 
        // is dangerous and the king cannot move there if the piece is a rook, bishop or queen we 
        // need to check if it will be able to attack the king after this move takes place
        // for these we will pass in a blocked spot off of the grid because the king is the piece 
        // that is being moved and there will be no blocked spot after this move
        for (let i = 0; i < board.length; i++) {
            if (board[i].piece !== null && friendly !== board[i].piece.friendly) {
                switch (board[i].piece.pieceType) {
                    case 'Rook':
                        if (this.rookWillAttack(board[i], location, board, startLocation, new Spot(-1))) return true;
                        break;
                    case 'Bishop':
                        if (this.bishopWillAttack(board[i], location, board, startLocation, new Spot(-1))) return true;
                        break;
                    case 'Queen':
                        if (this.rookWillAttack(board[i], location, board, startLocation, new Spot(-1)) ||
                            this.bishopWillAttack(board[i], location, board, startLocation, new Spot(-1)))
                            return true;
                        break;
                    default:
                        if (this.canMove(board[i], location, board, -1, new Set())) return true;
                }
            }
        }
        return false;
    }

    // returns whether a rook will be able to attack the king after 
    // the piece at ignore moves to blocked
    static rookWillAttack(position, kingPosition, board, ignore, blocked) {
        // convert the positions to rows and columns
        // thisRow and thisColumn represent the location of the enemy piece that 
        // may be able to attack the friendly king
        let thisRow = Math.floor(position.position / 8);
        let thisColumn = position.position % 8;
        // kingRow and kingColumn represent the location of the friendly king
        let kingRow = Math.floor(kingPosition / 8);
        let kingColumn = kingPosition % 8;
        // ignoreRow and ignoreColumn represent the location that the friendly
        // piece that is being moved was before the current move took place
        // thus, after the current move there will be no piece at that spot 
        // and it should be ignored as if there is not piece there
        let ignoreRow = Math.floor(ignore.position / 8);
        let ignoreColumn = ignore.position % 8;
        // blockedRow and blockedColumn represent the location where the 
        // friendly piece that is being moved will be after this move takes place
        // this position will be blocked on the following turn and should be 
        // treated as such
        // if the position of the blocked spot is -1 we know that there is not spot blocked
        // so we must make the blocked row and column -1
        let blockedRow = blocked.position === -1 ? -1 : Math.floor(blocked.position / 8);
        let blockedColumn = blocked.position === -1 ? -1 : blocked.position % 8;
        // if the king is not in either the same row or column, the rook cannot attack
        if (thisRow !== kingRow && thisColumn !== kingColumn) return false;

        // if there is a piece between this rook and the king, then it cannot attack
        // proceed through the various cases:

        // the cases where the friendly king and enemy piece are in the same row
        if (thisRow === kingRow) {
            // the case where the enemy piece is to the left of the king
            if (thisColumn < kingColumn) {
                // loop over every position in this column between the row of the 
                // enemy piece and the row of the king
                for (let i = thisColumn + 1; i < kingColumn; i++) {
                    // if this position is not the position that is being ignored
                    // and it has a piece in it, or this is the position that 
                    // if being blocked: 
                    // the enemy piece can not attack the friendly king
                    if (((thisRow !== ignoreRow || i !== ignoreColumn) && board[thisRow * 8 + i].piece !== null)
                        || (thisRow === blockedRow && i === blockedColumn)) return false;
                }
            }
            // the case where the enemy piece is to the right of the king
            else if (thisColumn > kingColumn) {
                // loop over every position in this column between the row of the 
                // enemy piece and the row of the king
                for (let i = thisColumn - 1; i > kingColumn; i--) {
                    // if this position is not the position that is being ignored
                    // and it has a piece in it, or this is the position that 
                    // if being blocked: 
                    // the enemy piece can not attack the friendly king
                    if (((thisRow !== ignoreRow || i !== ignoreColumn) && board[thisRow * 8 + i].piece !== null)
                        || (thisRow === blockedRow && i === blockedColumn)) return false;
                }
            }
            // this will never execute because the enemy piece and friendly king
            // will never be in the same position. Howver, in order to practice 
            // a defensive coding style, return false if this executes
            else return false;
        }
        // the cases where the friendly king and enemy piece are in the same column
        else {
            // the case where the enemy piece is above the king
            if (thisRow < kingRow) {
                // loop over every position in this column between the row of the 
                // enemy piece and the row of the king
                for (let i = thisRow + 1; i < kingRow; i++) {
                    // if this position is not the position that is being ignored
                    // and it has a piece in it, or this is the position that 
                    // if being blocked: 
                    // the enemy piece can not attack the friendly king
                    if (((i !== ignoreRow || thisColumn !== ignoreColumn) && board[i * 8 + thisColumn].piece !== null)
                        || (i === blockedRow && thisColumn === blockedColumn)) return false;
                }
            }
            // the case where the enemy piece is below the king
            else if (thisRow > kingRow) {
                // loop over every position in this column between the row of the 
                // enemy piece and the row of the king
                for (let i = thisRow - 1; i > kingRow; i--) {
                    // if this position is not the position that is being ignored
                    // and it has a piece in it, or this is the position that 
                    // if being blocked: 
                    // the enemy piece can not attack the friendly king
                    if (((i !== ignoreRow || thisColumn !== ignoreColumn) && board[i * 8 + thisColumn].piece !== null)
                        || (i === blockedRow && thisColumn === blockedColumn)) return false;
                }
            }
            // this will never execute because the enemy piece and friendly king
            // will never be in the same position. Howver, in order to practice 
            // a defensive coding style, return false if this executes
            else return false;
        }
        // if none of the above conditions were met 
        // this enemy rook will be able to attack the friendly king
        return true;
    }

    // returns whether a bishop will be able to attack the king after 
    // the piece at ignore moves to blocked
    static bishopWillAttack(position, kingPosition, board, ignore, blocked) {
        // convert the positions to rows and columns
        // thisRow and thisColumn represent the location of the enemy piece that 
        // may be able to attack the friendly king
        let thisRow = Math.floor(position.position / 8);
        let thisColumn = position.position % 8;
        // kingRow and kingColumn represent the location of the friendly king
        let kingRow = Math.floor(kingPosition / 8);
        let kingColumn = kingPosition % 8;
        // ignoreRow and ignoreColumn represent the location that the friendly
        // piece that is being moved was before the current move took place
        // thus, after the current move there will be no piece at that spot 
        // and it should be ignored as if there is not piece there
        let ignoreRow = Math.floor(ignore.position / 8);
        let ignoreColumn = ignore.position % 8;
        // blockedRow and blockedColumn represent the location where the 
        // friendly piece that is being moved will be after this move takes place
        // this position will be blocked on the following turn and should be 
        // treated as such
        // if the position of the blocked spot is -1 we know that there is not spot blocked
        // so we must make the blocked row and column -1
        let blockedRow = blocked.position === -1 ? -1 : Math.floor(blocked.position / 8);
        let blockedColumn = blocked.position === -1 ? -1 : blocked.position % 8;
        // if the king is not on a diagonal from this bishop, this bishop cannot attack
        if (Math.abs(kingRow - thisRow) !== Math.abs(kingColumn - thisColumn)) return false;

        // if there is a piece between this bishop and the king, this bishop cannot attack
        // proceed through the various cases:

        // the cases where the enemy piece is to the left of the friendly king
        if (thisColumn < kingColumn) {
            // the case where the enemy piece is to the top-left of the friendly king
            if (thisRow < kingRow) {
                // loop over every position between the enemy piece and the friendly king
                for (let i = thisRow + 1, j = thisColumn + 1; i < kingRow; i++) {
                    // if this position is not the position that is being ignored
                    // and there is a piece in this position, or 
                    // this position is the position that is being blocked:
                    // the enemy piece cannot attack the friendly king
                    if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                        || (i === blockedRow && j++ === blockedColumn)) return false;
                }
            }
            // the case where the enemy piece is to the bottom left of the 
            else if (thisRow > kingRow) {
                // loop over every position between the enemy piece and the friendly king
                for (let i = thisRow - 1, j = thisColumn + 1; i > kingRow; i--) {
                    // if this position is not the position that is being ignored
                    // and there is a piece in this position, or 
                    // this position is the position that is being blocked:
                    // the enemy piece cannot attack the friendly king
                    if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                        || (i === blockedRow && j++ === blockedColumn)) return false;
                }
            }
            // this case will never execute because if execution made it this far,
            // the enemy piece cannot be in the same row as the friendly king.
            // However, in order to maintain a defensive coding style, in the event
            // that this case actually executes, return false.
            else return false;
        }
        else {
            if (thisRow < kingRow) {
                // loop over every position between the enemy piece and the friendly king
                for (let i = thisRow + 1, j = thisColumn - 1; i < kingRow; i++) {
                    // if this position is not the position that is being ignored
                    // and there is a piece in this position, or 
                    // this position is the position that is being blocked:
                    // the enemy piece cannot attack the friendly king
                    if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                        || (i === blockedRow && j-- === blockedColumn)) return false;

                }
            }
            else if (thisRow > kingRow) {
                // loop over every position between the enemy piece and the friendly king
                for (let i = thisRow - 1, j = thisColumn - 1; i > kingRow; i--) {
                    // if this position is not the position that is being ignored
                    // and there is a piece in this position, or 
                    // this position is the position that is being blocked:
                    // the enemy piece cannot attack the friendly king
                    if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                        || (i === blockedRow && j-- === blockedColumn)) return false;
                }
            }
            // this case will never execute because if execution made it this far,
            // the enemy piece cannot be in the same row as the friendly king.
            // However, in order to maintain a defensive coding style, in the event
            // that this case actually executes, return false.
            else return false;
        }
        // if none of the above conditions were met
        // this enemy bishop will be able to attack the friendly king
        return true;
    }

    // determines whether this move just put the enemy king in check
    putKingInCheck(startSpot, piece, enemyKingSpot, board, kingPosition) {
        // add this piece to the startSpot
        startSpot.piece = piece;
        // this player's king will not be in check because even if it was in check before this move, 
        // the only moves are allowed when a player is in check are moves that bring them out of check
        // therefore, if this player is able to make a move, they will not be in check after this turn
        // for this reason we can use an empty set to represent the pieces that are attacking the friendly king
        return this.canMove(startSpot, enemyKingSpot, board, kingPosition, new Set());
    }
}