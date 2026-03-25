// sudoku.js - Sudoku Generator and Solver Engine

/**
 * Validates if placing a number at a position is safe.
 */
export function isSafe(board, row, col, num) {
  // Check row & col
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}

/**
 * Solves the board in-place using backtracking.
 */
export function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Generates a full solved valid Sudoku board.
 */
function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  
  // Fill diagonal 3x3 boxes first to optimize
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i, i);
  }
  
  // Solve the rest
  solveSudoku(board);
  return board;
}

function fillBox(board, rowStart, colStart) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeBox(board, rowStart, colStart, num));
      board[rowStart + i][colStart + j] = num;
    }
  }
}

function isSafeBox(board, rowStart, colStart, num) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

/**
 * Removes numbers from the full board based on difficulty.
 */
export function generatePuzzle(difficulty = 'easy') {
  const fullBoard = generateFullBoard();
  const puzzle = fullBoard.map(row => [...row]);
  
  // Number of cells to remove
  let holes = 35; // default easy
  if (difficulty === 'medium') holes = 45;
  if (difficulty === 'hard') holes = 52;

  while (holes > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      holes--;
    }
  }
  
  return {
    puzzle, // initial state with missing numbers (0)
    solution: fullBoard
  };
}

/**
 * Calculate valid candidates for all empty cells in a board.
 * Returns a 9x9 grid where each cell is an array of candidates (or empty).
 */
export function calculateCandidates(board) {
  const candidates = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let validNums = [];
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, r, c, num)) {
            validNums.push(num);
          }
        }
        candidates[r][c] = validNums;
      }
    }
  }
  return candidates;
}
