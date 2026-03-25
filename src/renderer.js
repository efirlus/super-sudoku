// renderer.js - Handle DOM rendering and CSS classes

export class Renderer {
  constructor() {
    this.boardEl = document.getElementById('sudoku-board');
    this.msgEl = document.getElementById('error-msg');
    this.timerEl = document.getElementById('timer');
    this.cells = Array.from({ length: 9 }, () => Array(9).fill(null));
  }

  renderInit(game) {
    this.boardEl.innerHTML = '';
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // Value
        const val = game.board[r][c];
        
        if (val !== 0) {
          cell.textContent = val;
          if (!game.isCustomMode && game.puzzle[r][c] !== 0) {
            cell.classList.add('fixed');
          }
        } else {
          // Render memos if 0
          if (game.memos[r][c] && game.memos[r][c].length > 0) {
            const memoGrid = document.createElement('div');
            memoGrid.className = 'memo-grid';
            for (let m = 1; m <= 9; m++) {
              const memoNum = document.createElement('div');
              memoNum.className = 'memo-num';
              if (game.memos[r][c].includes(m)) {
                memoNum.textContent = m;
              }
              memoGrid.appendChild(memoNum);
            }
            cell.appendChild(memoGrid);
          }
        }
        
        // Events
        cell.addEventListener('mousedown', () => game.selectCell(r, c));
        
        this.boardEl.appendChild(cell);
        this.cells[r][c] = cell;
      }
    }
    
    this.updateSelection(game);
  }

  updateCell(game, r, c) {
    // Only re-render a single cell when inputting a value without memos change
    const cell = this.cells[r][c];
    const val = game.board[r][c];
    
    cell.innerHTML = ''; // wipe content
    
    if (val !== 0) {
      cell.textContent = val;
    } else {
        // Need to render memo, actually it's easier to just call renderInit,
        // but let's re-render memo grid properly.
        if (game.memos[r][c] && game.memos[r][c].length > 0) {
            const memoGrid = document.createElement('div');
            memoGrid.className = 'memo-grid';
            for (let m = 1; m <= 9; m++) {
                const memoNum = document.createElement('div');
                memoNum.className = 'memo-num';
                if (game.memos[r][c].includes(m)) {
                    memoNum.textContent = m;
                }
                memoGrid.appendChild(memoNum);
            }
            cell.appendChild(memoGrid);
        }
    }
    
    // Maintain classes
    if (!game.isCustomMode && game.puzzle[r][c] !== 0) {
      cell.classList.add('fixed');
    }
    this.updateSelection(game);
  }

  updateSelection(game) {
    // reset highlights
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cl = this.cells[i][j].classList;
            cl.remove('selected', 'highlight', 'related-highlight', 'same-number-highlight');
        }
    }

    if (!game.selectedCell) return;
    
    const { r, c } = game.selectedCell;
    const selectedVal = game.board[r][c];
    
    // Highlight related
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (i === r || j === c) {
                this.cells[i][j].classList.add('related-highlight');
            }
        }
    }
    
    const startRow = r - (r % 3);
    const startCol = c - (c % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            this.cells[startRow + i][startCol + j].classList.add('related-highlight');
        }
    }

    // Highlight same numbers
    if (selectedVal !== 0) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (game.board[i][j] === selectedVal) {
                    this.cells[i][j].classList.add('same-number-highlight');
                }
            }
        }
    }

    // the directly selected cell
    this.cells[r][c].classList.add('selected');
  }

  updateErrors(errorCells) {
     // wipe all error classes
     for (let r=0; r<9; r++) {
         for (let c=0; c<9; c++) {
              this.cells[r][c].classList.remove('error');
         }
     }
     errorCells.forEach(({r, c}) => {
         this.cells[r][c].classList.add('error');
     });
  }

  updateTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    this.timerEl.textContent = `${m}:${s}`;
  }

  showMessage(msg, type = 'error') {
     this.msgEl.textContent = msg;
     if (type === 'success') {
         this.msgEl.style.color = 'var(--green)';
     } else {
         this.msgEl.style.color = 'var(--red)';
     }
  }
}
