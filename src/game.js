// game.js - Manages Sudoku game state
import { generatePuzzle, isSafe, calculateCandidates } from './sudoku.js';

export class SudokuGame {
  constructor(renderer) {
    this.renderer = renderer;
    this.resetState();
  }

  resetState() {
    this.puzzle = null;         // Initial fixed numbers
    this.board = null;          // Current player board
    this.memos = null;          // Pencil marks [9][9][]
    this.selectedCell = null;   // {r, c}
    this.history = [];          // Undo stack
    this.isCustomMode = false;  // Whether currently building a custom board
    
    this.startTime = null;
    this.timerInterval = null;
    this.timeElapsed = 0;
  }

  startNewGame(difficulty = 'easy') {
    this.resetState();
    const { puzzle } = generatePuzzle(difficulty);
    this.loadBoard(puzzle);
    this.startTimer();
  }

  startCustomEditor() {
    this.resetState();
    this.isCustomMode = true;
    // Empty board 9x9
    const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.loadBoard(emptyBoard, true); // editing custom board
  }

  loadCustomGame(savedPuzzle) {
    this.resetState();
    this.loadBoard(savedPuzzle.map(row => [...row]));
    this.startTimer();
  }

  loadBoard(puzzleGrid, isEditing = false) {
    this.puzzle = puzzleGrid.map(row => [...row]);
    this.board = puzzleGrid.map(row => [...row]);
    this.memos = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
    
    this.renderer.renderInit(this);
    if (!isEditing) this.checkErrors();
  }

  startTimer() {
    this.stopTimer();
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.renderer.updateTimer(this.timeElapsed);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  selectCell(r, c) {
    if (r < 0 || r > 8 || c < 0 || c > 8) return;
    this.selectedCell = { r, c };
    this.renderer.updateSelection(this);
  }

  setCellValue(r, c, val) {
    // Cannot edit fixed numbers unless in custom editor mode
    // Wait, in custom editor mode we CAN edit, but they are all technically fixed (all 0s initially).
    if (!this.isCustomMode && this.puzzle[r][c] !== 0) return;
    if (this.board[r][c] === val) return; // same value
    
    // Save to history
    this.history.push({
      board: this.board.map(row => [...row]),
      memos: this.memos.map(row => row.map(m => [...m]))
    });

    this.board[r][c] = val;
    
    // Auto-remove memos in same row, col, box if it's playing mode
    if (val !== 0 && !this.isCustomMode) {
      this.removeRelatedMemos(r, c, val);
    }
    
    this.renderer.updateCell(this, r, c);
    this.checkErrors();
  }

  removeRelatedMemos(r, c, val) {
    // row, col
    for(let i = 0; i<9; i++) {
      if (this.memos[r][i].includes(val)) this.memos[r][i] = this.memos[r][i].filter(v => v !== val);
      if (this.memos[i][c].includes(val)) this.memos[i][c] = this.memos[i][c].filter(v => v !== val);
    }
    // box
    const startRow = r - (r % 3);
    const startCol = c - (c % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let br = startRow + i;
            let bc = startCol + j;
            if (this.memos[br][bc].includes(val)) {
                this.memos[br][bc] = this.memos[br][bc].filter(v => v !== val);
            }
        }
    }
    // and re-render the whole board memos since they changed
    this.renderer.renderInit(this); // simple re-render
  }

  undo() {
    if (this.history.length === 0) return;
    const lastState = this.history.pop();
    this.board = lastState.board;
    this.memos = lastState.memos;
    this.renderer.renderInit(this);
    this.checkErrors();
  }

  autoMemo() {
    // Only in playing mode
    if (this.isCustomMode) return;
    
    this.history.push({
      board: this.board.map(row => [...row]),
      memos: this.memos.map(row => row.map(m => [...m]))
    });

    // 1. Calculate candidates
    // Wait, isSafe method needs to be modified for finding candidates.
    // I can do a simple check.
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] === 0) {
          let candidates = [];
          for (let val = 1; val <= 9; val++) {
             // temporarily remove value to check if safe
             // actually, it's already 0
             if(this.localIsSafe(r, c, val)) {
                 candidates.push(val);
             }
          }
          this.memos[r][c] = candidates;
        }
      }
    }
    this.renderer.renderInit(this);
    this.renderer.showMessage("Auto Memo complete!", "success");
  }

  // helper to check if a number can be placed at r, c given current BOARD
  localIsSafe(r, c, val) {
    for (let x = 0; x < 9; x++) {
      if (this.board[r][x] === val || this.board[x][c] === val) return false;
    }
    const startRow = r - (r % 3);
    const startCol = c - (c % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i + startRow][j + startCol] === val) return false;
      }
    }
    return true;
  }

  checkErrors() {
    // Find all cells that violate sudoku rules and mark them.
    let errorCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let val = this.board[r][c];
        if (val !== 0) {
          // temporaily empty
          this.board[r][c] = 0;
          if (!this.localIsSafe(r, c, val)) {
            errorCells.push({r, c});
          }
          this.board[r][c] = val;
        }
      }
    }
    this.renderer.updateErrors(errorCells);
    
    if (this.isCustomMode && errorCells.length > 0) {
        this.renderer.showMessage("Custom board has conflicts!", "error");
    } else if (errorCells.length > 0) {
        this.renderer.showMessage("Errors found on board", "error");
    } else {
        this.renderer.showMessage("");
        // Check win condition
        if (!this.isCustomMode) {
          let emptyCount = 0;
          for(let r=0; r<9; r++) {
             for(let c=0; c<9; c++) {
                 if (this.board[r][c] === 0) emptyCount++;
             }
          }
          if (emptyCount === 0) {
              this.stopTimer();
              this.renderer.showMessage("🎉 Puzzle Solved! 🎉", "success");
          }
        }
    }
  }

  handleInput(action, val) {
     if (!this.selectedCell) return;
     const { r, c } = this.selectedCell;
     
     if (action === 'move') {
       if (val === 'up') this.selectCell(r - 1, c);
       else if (val === 'down') this.selectCell(r + 1, c);
       else if (val === 'left') this.selectCell(r, c - 1);
       else if (val === 'right') this.selectCell(r, c + 1);
     } else if (action === 'set') {
       this.setCellValue(r, c, val);
     } else if (action === 'delete') {
       this.setCellValue(r, c, 0);
     }
  }
}
