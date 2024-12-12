(function() {
  'use strict';

  const COLUMNS = 'abcdefgh'.split('');
  const ROWS = '12345678'.split('');

  // Utility function for validating strings with regex patterns
  const isValid = (str, regex) => typeof str === 'string' && regex.test(str);

  // Validate a move (e.g., "e2-e4")
  const validMove = move => isValid(move, /^[a-h][1-8]-[a-h][1-8]$/);

  // Validate a square (e.g., "e2")
  const validSquare = square => isValid(square, /^[a-h][1-8]$/);

  // Convert piece to standard code (e.g., 'bK' for black King)
  const fenToPieceCode = piece => piece === piece.toLowerCase() ? `b${piece.toUpperCase()}` : `w${piece.toUpperCase()}`;

  // Convert piece code to standard FEN notation (e.g., 'bK' to 'k')
  const pieceCodeToFen = code => code[0] === 'w' ? code[1].toUpperCase() : code[1].toLowerCase();

  // Convert FEN string to a position object
  const fenToObj = fen => {
    const rows = fen.split('/');
    let position = {};

    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      [...row].forEach(cell => {
        if (/\d/.test(cell)) {
          colIndex += parseInt(cell, 10); // Skip empty squares
        } else {
          position[`${COLUMNS[colIndex]}${8 - rowIndex}`] = fenToPieceCode(cell);
          colIndex++;
        }
      });
    });

    return position;
  };

  // Convert position object to FEN string
  const objToFen = position => {
    let fen = '';
    for (let row = 8; row >= 1; row--) {
      let rowStr = '';
      for (let col = 0; col < 8; col++) {
        const square = `${COLUMNS[col]}${row}`;
        rowStr += position[square] ? pieceCodeToFen(position[square]) : '1';
      }
      fen += rowStr.replace(/11111111/g, '8').replace(/1111111/g, '7').replace(/111111/g, '6')
        .replace(/11111/g, '5').replace(/1111/g, '4').replace(/111/g, '3').replace(/11/g, '2') + (row > 1 ? '/' : '');
    }
    return fen;
  };

  // Chessboard class definition
  class ChessBoard {
    constructor(containerElOrId, cfg = {}) {
      this.container = document.querySelector(containerElOrId);
      this.boardEl = this.container.querySelector('.board');
      this.currentPosition = fenToObj(cfg.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
      this.createBoard();
      this.updateBoard(this.currentPosition);
    }

    // Create the chessboard (8x8 grid)
    createBoard() {
      const fragment = document.createDocumentFragment();
      let square;

      for (let row = 8; row >= 1; row--) {
        for (let col = 0; col < 8; col++) {
          square = document.createElement('div');
          square.classList.add('square', (row + col) % 2 === 0 ? 'white' : 'black');
          square.dataset.square = `${COLUMNS[col]}${row}`;
          square.style.width = square.style.height = '60px';
          fragment.appendChild(square);
        }
      }

      this.boardEl.appendChild(fragment);
    }

    // Update the board with the current position
    updateBoard(position) {
      for (let square in position) {
        const squareEl = this.boardEl.querySelector(`[data-square="${square}"]`);
        if (squareEl) {
          squareEl.textContent = position[square][1].toUpperCase();
          squareEl.classList.add('piece');
        }
      }
    }

    // Move a piece from one square to another (e.g., "e2-e4")
    movePiece(move) {
      if (!validMove(move)) {
        console.error("Invalid move format.");
        return;
      }

      const [from, to] = move.split('-');
      const piece = this.currentPosition[from];

      if (!piece) {
        console.error("No piece on the starting square.");
        return;
      }

      // Remove piece from starting square and place it on the destination
      this.currentPosition[to] = this.currentPosition[from];
      delete this.currentPosition[from];

      // Update the board
      this.updateBoard(this.currentPosition);
    }

    // Get the current position as a FEN string
    getPosition() {
      return objToFen(this.currentPosition);
    }
  }

  // Expose ChessBoard globally
  window.ChessBoard = ChessBoard;

})();
