var startBoard = [
  [0, 2, 0, 3, 0, 2, 0, 3],
  [3, 0, 2, 0, 3, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 1, 0, 4, 0, 1],
  [1, 0, 4, 0, 1, 0, 4, 0],
];
var board = [...Array(boardHeight).keys()].map(i => Array(boardWidth));

var player = 0;
var moveList = [];


function initGame()
{
	player = 0;
    player1Score = 12;
    player2Score = 12;

	for (var i = 0; i < boardHeight; i++) {
        for (var j = 0; j < boardWidth; j++) {
          board[i][j] = startBoard[i][j];
        }
	}

    if (piecesLoaded) {
        placePieces();
    }

    displayHeader();
}

var moveList = [];
var moveTypes = [];
var moveTypeEnum = {
    SLIDE: 0,
    DOUBLE_SLIDE: 1,
    TRANSPOSE: 2,
    CROWN_START: 3,
    CROWN_FINISH: 4,
    BEAR_OFF: 5,
    IMPASSE_START: 6
};
function getLegalMoves(square)
{
	moveList = [];
	moveTypes = [];

	if (square < 0 || square > boardHeight * boardWidth - 1) {
        return;
    }

    var row = Math.floor(square / 8);
    var col = square % 8;
    var value = board[row][col];

    switch (value) {
        case modelEnum.SINGLE_WHITE:
            getLegalMovesSingleWhite(row, col);
            break;
        case modelEnum.DOUBLE_WHITE:
            getLegalMovesDoubleWhite(row, col);
            break;
        case modelEnum.SINGLE_BLACK:
            getLegalMovesSingleBlack(row, col);
            break;
        case modelEnum.DOUBLE_BLACK:
            getLegalMovesDoubleBlack(row, col);
            break;
    }
}

function getLegalMovesSingleWhite(startRow, startCol)
{
    if (player == 1) {
        return;
    }

    if (crownee != -1) {
        var crownRow = Math.floor(crownee / 8);
        var crownCol = crownee % 8;
        if (!(startRow == crownRow && startCol == crownCol)) {
            addMoveIfLegal(crownRow, crownCol, 'white', moveTypeEnum.CROWN_FINISH);
        }
        return;
    }

    var row = startRow;
    var col = startCol;
    var success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row -= 1;
        col -= 1;
        success &= addMoveIfLegal(row, col, 'white', moveTypeEnum.SLIDE);
    }

    row = startRow;
    col = startCol;
    success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row -= 1;
        col += 1;
        success &= addMoveIfLegal(row, col, 'white', moveTypeEnum.SLIDE);
    }
}

function getLegalMovesDoubleWhite(startRow, startCol)
{
    if (player == 1) {
        return;
    }

    var row = startRow;
    var col = startCol;
    var success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row += 1;
        col -= 1;
        success &= addMoveIfLegal(row, col, 'white', moveTypeEnum.DOUBLE_SLIDE);
    }

    row = startRow;
    col = startCol;
    success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row += 1;
        col += 1;
        success &= addMoveIfLegal(row, col, 'white', moveTypeEnum.DOUBLE_SLIDE);
    }

    addMoveIfLegal(startRow + 1, startCol - 1, 'white', moveTypeEnum.TRANSPOSE);
    addMoveIfLegal(startRow + 1, startCol + 1, 'white', moveTypeEnum.TRANSPOSE);
}

function getLegalMovesSingleBlack(startRow, startCol)
{
    if (player == 0) {
        return;
    }

    if (crownee != -1) {
        var crownRow = Math.floor(crownee / 8);
        var crownCol = crownee % 8;
        if (!(startRow == crownRow && startCol == crownCol)) {
            addMoveIfLegal(crownRow, crownCol, 'black', moveTypeEnum.CROWN_FINISH);
        }
        return;
    }

    var row = startRow;
    var col = startCol;
    var success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row += 1;
        col -= 1;
        success &= addMoveIfLegal(row, col, 'black', moveTypeEnum.SLIDE);
    }

    row = startRow;
    col = startCol;
    success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row += 1;
        col += 1;
        success &= addMoveIfLegal(row, col, 'black', moveTypeEnum.SLIDE);
    }
}

function getLegalMovesDoubleBlack(startRow, startCol)
{
    if (player == 0) {
        return;
    }

    var row = startRow;
    var col = startCol;
    var success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row -= 1;
        col -= 1;
        success &= addMoveIfLegal(row, col, 'black', moveTypeEnum.DOUBLE_SLIDE);
    }

    row = startRow;
    col = startCol;
    success = true;
    while (success && row >= 0 && row < boardHeight && col >= 0 && col < boardWidth) {
        row -= 1;
        col += 1;
        success &= addMoveIfLegal(row, col, 'black', moveTypeEnum.DOUBLE_SLIDE);
    }

    addMoveIfLegal(startRow - 1, startCol - 1, 'black', moveTypeEnum.TRANSPOSE);
    addMoveIfLegal(startRow - 1, startCol + 1, 'black', moveTypeEnum.TRANSPOSE);
}

function addMoveIfLegal(row, col, color, type)
{
    if (row < 0 || row >= boardHeight || col < 0 || col >= boardWidth) {
        return false;
    }

    switch (type) {
        case moveTypeEnum.SLIDE:
            if (board[row][col] != modelEnum.NULL) {
                return false;
            }
            if ((color == 'white' && row == 0) || (color == 'black' && row == boardHeight - 1)) {
                type = moveTypeEnum.CROWN_START;
            }
            break;
        case moveTypeEnum.DOUBLE_SLIDE:
            if (board[row][col] != modelEnum.NULL) {
                return false;
            }
            if ((color == 'white' && row == boardHeight - 1) || (color == 'black' && row == 0)) {
                type = moveTypeEnum.BEAR_OFF;
            }
            break;
        case moveTypeEnum.TRANSPOSE:
            if ((color == 'white' && board[row][col] != modelEnum.SINGLE_WHITE) || (color == 'black' && board[row][col] != modelEnum.SINGLE_BLACK)) {
                return false;
            }
            break;
        case moveTypeEnum.CROWN_FINISH:
            if ((color == 'white' && (board[row][col] != modelEnum.SINGLE_WHITE || row != 0)) || (color == 'black' && (board[row][col] != modelEnum.SINGLE_BLACK || row != boardHeight - 1))) {
                return false;
            }
            break;
    }
    var square = row * 8 + col;
    moveList.push(square);
    moveTypes.push(type);
    return true;
}

var resumeList = [];
function getLegalResumes(type, mark)
{
    switch (type) {
        case moveTypeEnum.CROWN_START:
            var markRow = Math.floor(mark / 8);
            var markCol = mark % 8;

            for (var i = 0; i < boardHeight; i++) {
                for (var j = 0; j < boardWidth; j++) {
                    if ((player == 0 && board[i][j] == modelEnum.SINGLE_WHITE) || (player == 1 && board[i][j] == modelEnum.SINGLE_BLACK)) {
                        var square = i * 8 + j;
                        if (square != mark) {
                            resumeList.push(square);
                        }
                    }
                }
            }
            if (resumeList.length == 0) {
                if (crownWaits.indexOf(mark) == -1) {
                    crownWaits.push(mark);
                }
            }
            break;
        case moveTypeEnum.IMPASSE_START:
            for (var i = 0; i < boardHeight; i++) {
                for (var j = 0; j < boardWidth; j++) {
                    if ((player == 0 && (board[i][j] == modelEnum.SINGLE_WHITE || board[i][j] == modelEnum.DOUBLE_WHITE)) || (player == 1 && (board[i][j] == modelEnum.SINGLE_BLACK || board[i][j] == modelEnum.DOUBLE_BLACK))) {
                        var square = i * 8 + j;
                        resumeList.push(square);
                    }
                }
            }
            break;
    }
}

var won = false;
var player1Score = 12;
var player2Score = 12;

var whiteSingles = 0;
var whiteDoubles = 0;
var blackSingles = 0;
var blackDoubles = 0;
var whitePieces = [];
var blackPieces = [];
function runBoardStatistics()
{
    player1Score = 0;
    player2Score = 0;

    whiteSingles = 0;
    whiteDoubles = 0;
    blackSingles = 0;
    blackDoubles = 0;
    whitePieces = [];
    blackPieces = [];

    for (var i = 0; i < boardHeight; i++) {
        for (var j = 0; j < boardWidth; j++) {
            var index = i * 8 + j;
            if (board[i][j] == modelEnum.SINGLE_WHITE) {
                whitePieces.push(index);
                whiteSingles++;
                player1Score += 1;
            } else if (board[i][j] == modelEnum.DOUBLE_WHITE) {
                whitePieces.push(index);
                whiteDoubles++;
                player1Score += 2;
            } else if (board[i][j] == modelEnum.SINGLE_BLACK) {
                blackPieces.push(index);
                blackSingles++;
                player2Score += 1;
            } else if (board[i][j] == modelEnum.DOUBLE_BLACK) {
                blackPieces.push(index);
                blackDoubles++;
                player2Score += 2;
            }
        }
    }
}

var impasse = false;
function upkeep()
{
    if (won) {
        return;
    }

    runBoardStatistics();

    if (resumeList.length == 0) {
        var waitedCrown = -1;
        for (var i = 0; i < crownWaits.length; i++) {
            var crownRow = Math.floor(crownWaits[i] / 8);
            var crownCol = crownWaits[i] % 8;
            if ((player == 0 && board[crownRow][crownCol] == modelEnum.SINGLE_WHITE && whiteSingles > 1) || ((player == 1) && board[crownRow][crownCol] == modelEnum.SINGLE_BLACK && blackSingles > 1)) {
                getLegalResumes(moveTypeEnum.CROWN_START, crownWaits[i]);
                if (resumeList.length > 0) {
                    waitedCrown = crownWaits[i];
                    crownWaits.splice(i, 1);
                    crownee = waitedCrown;
                }
            }
        }
    }

    if (resumeList.length == 0) {
        impasse = true;
        var playerPieces = (player == 0) ? whitePieces : blackPieces;
        for (var i = 0; i < playerPieces.length; i++) {
            getLegalMoves(playerPieces[i]);
            if (moveList.length > 0) {
                impasse = false;
                break;
            }
        }
        if (impasse) {
            getLegalResumes(moveTypeEnum.IMPASSE_START, -1);
        }
    }

    if (resumeList.length > 0) {
        for (var i = 0; i < resumeList.length; i++) {
            squaretiles[resumeList[i]].material.color.set(0x00ff00);
        }
    }
}

var crownWaits = [];
function downkeep()
{
    runBoardStatistics();
    if (player1Score == 0 || player2Score == 0) {
        won = true;
        return false;
    }

    var bearOff = false;
    for (var j = 0; j < boardWidth; j++) {
        if (player == 0) {
            if (board[boardHeight - 1][j] == modelEnum.DOUBLE_WHITE) {
                board[boardHeight - 1][j] = modelEnum.SINGLE_WHITE;
                bearOff = true;
            }
        } else {
            if (board[0][j] == modelEnum.DOUBLE_BLACK) {
                board[0][j] = modelEnum.SINGLE_BLACK;
                bearOff = true;
            }
        }
    }
    if (bearOff) {
        placePieces(board);
    }

    var waitedCrown = -1;
    for (var i = 0; i < crownWaits.length; i++) {
        var crownRow = Math.floor(crownWaits[i] / 8);
        var crownCol = crownWaits[i] % 8;
        if ((player == 0 && board[crownRow][crownCol] == modelEnum.SINGLE_WHITE && whiteSingles > 1) || ((player == 1) && board[crownRow][crownCol] == modelEnum.SINGLE_BLACK && blackSingles > 1)) {
            getLegalResumes(moveTypeEnum.CROWN_START, crownWaits[i]);
            if (resumeList.length > 0) {
                waitedCrown = crownWaits[i];
                crownWaits.splice(i, 1);
                crownee = waitedCrown;
                return false;
            }
        }
    }

    for (var j = 0; j < boardWidth; j++) {
        if (player == 0) {
            if (board[0][j] == modelEnum.SINGLE_WHITE) {
                var crownSquare = j;
                getLegalResumes(moveTypeEnum.CROWN_START, crownSquare);
                if (resumeList.length == 0) {
                    if (crownWaits.indexOf(crownSquare) == -1) {
                        crownWaits.push(crownSquare);
                    }
                } else {
                    crownee = crownSquare;
                    return false;
                }
            }
        } else {
            if (board[boardHeight - 1][j] == modelEnum.SINGLE_BLACK) {
                var crownSquare = (boardHeight - 1) * 8 + j;
                getLegalResumes(moveTypeEnum.CROWN_START, crownSquare);
                if (resumeList.length == 0) {
                    if (crownWaits.indexOf(crownSquare) == -1) {
                        crownWaits.push(crownSquare);
                    }
                } else {
                    crownee = crownSquare;
                    return false;
                }
            }
        }
    }

    runBoardStatistics();
    if (player1Score == 0 || player2Score == 0) {
        won = true;
        return false;
    }

    return true;
}
