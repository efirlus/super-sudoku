import './style.css';
import { Renderer } from './renderer.js';
import { SudokuGame } from './game.js';
import { setupInputHandlers } from './input.js';
import { saveCustomBoard, getSavedBoards, deleteSavedBoard } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const renderer = new Renderer();
  const game = new SudokuGame(renderer);
  
  setupInputHandlers(game);

  // Buttons
  const btnNewGame = document.getElementById('btn-new-game');
  const selectDiff = document.getElementById('difficulty');
  const btnAutoMemo = document.getElementById('btn-auto-memo');
  const btnUndo = document.getElementById('btn-undo');
  const btnLoad = document.getElementById('btn-load');
  const btnCustom = document.getElementById('btn-custom'); // game view save custom
  
  // Numpad
  const numBtns = document.querySelectorAll('.num-btn');
  
  const customModal = document.getElementById('custom-modal');
  const customNameInput = document.getElementById('custom-board-name');
  const btnSaveCustom = document.getElementById('btn-save-custom');
  const btnCancelCustom = document.getElementById('btn-cancel-custom');
  
  const loadPage = document.getElementById('load-page');
  const savedBoardsGrid = document.getElementById('saved-boards-grid');
  const btnCloseLoad = document.getElementById('btn-close-load');
  const btnAddCustom = document.getElementById('btn-add-custom-board');
  const cardActions = document.getElementById('card-actions');
  const btnStartLoaded = document.getElementById('btn-start-loaded');
  const btnDeleteLoaded = document.getElementById('btn-delete-loaded');

  // Control Events
  btnNewGame.addEventListener('click', () => {
    game.startNewGame(selectDiff.value);
    btnCustom.classList.add('hidden');
    btnAutoMemo.classList.remove('hidden');
  });

  btnAutoMemo.addEventListener('click', () => {
    game.autoMemo();
  });

  btnUndo.addEventListener('click', () => {
    game.undo();
  });

  numBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.val, 10);
      if (val === 0) {
        game.handleInput('delete');
      } else {
        game.handleInput('set', val);
      }
    });
  });

  // Saving custom directly from editor view
  btnCustom.addEventListener('click', () => {
    customModal.classList.remove('hidden');
    customNameInput.focus();
  });

  // Save Modal
  btnCancelCustom.addEventListener('click', () => {
    customModal.classList.add('hidden');
    customNameInput.value = '';
  });

  btnSaveCustom.addEventListener('click', () => {
    const errorCells = renderer.boardEl.querySelectorAll('.error');
    if (errorCells.length > 0) {
        alert("Board has errors! Fix them to save.");
        return;
    }
    
    const name = customNameInput.value.trim();
    saveCustomBoard(name, game.board);
    customModal.classList.add('hidden');
    customNameInput.value = '';
    
    // Reset UI
    btnCustom.classList.add('hidden');
    btnAutoMemo.classList.remove('hidden');
    
    renderer.showMessage("Custom board saved!", "success");
    game.startNewGame(selectDiff.value); // revert to playing state
  });

  // Load Modal
  let selectedBoardId = null;

  const renderLoadPage = () => {
    savedBoardsGrid.innerHTML = '';
    const boards = getSavedBoards();
    selectedBoardId = null;
    
    // Initial states
    btnAddCustom.classList.remove('hidden');
    cardActions.classList.add('hidden');
    
    if (boards.length === 0) {
        savedBoardsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;">No saved boards found.</div>';
    } else {
        boards.forEach(b => {
            const card = document.createElement('div');
            card.className = 'board-card';
            card.dataset.id = b.id;
            
            const info = document.createElement('div');
            info.className = 'board-card-info';
            // Render thumbnail instead of text
            const thumb = document.createElement('div');
            thumb.className = 'board-thumbnail';
            for (let r=0; r<9; r++) {
                for (let c=0; c<9; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'thumb-cell';
                    if (b.puzzle[r][c] !== 0) {
                        cell.textContent = b.puzzle[r][c];
                        cell.classList.add('filled');
                    }
                    thumb.appendChild(cell);
                }
            }
            info.appendChild(thumb);
            card.appendChild(info);
            
            card.addEventListener('click', () => {
                // Deselect others
                document.querySelectorAll('.board-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectedBoardId = b.id;

                // Show actions
                btnAddCustom.classList.add('hidden');
                cardActions.classList.remove('hidden');
                btnDeleteLoaded.classList.toggle('hidden', !!b.preset);
            });

            savedBoardsGrid.appendChild(card);
        });
    }
  };

  btnLoad.addEventListener('click', () => {
    loadPage.classList.remove('hidden');
    renderLoadPage();
  });

  btnCloseLoad.addEventListener('click', () => {
    loadPage.classList.add('hidden');
  });

  btnAddCustom.addEventListener('click', () => {
    loadPage.classList.add('hidden');
    game.stopTimer();
    game.startCustomEditor();
    btnCustom.classList.remove('hidden');
    btnAutoMemo.classList.add('hidden'); // no auto memo in custom mode
    renderer.showMessage("Custom Editor Mode. Fill the board, then save.", "success");
  });

  btnStartLoaded.addEventListener('click', () => {
    if (!selectedBoardId) return;
    const boards = getSavedBoards();
    const b = boards.find(x => x.id === selectedBoardId);
    if (b) {
        game.loadCustomGame(b.puzzle);
        loadPage.classList.add('hidden');
        btnCustom.classList.add('hidden');
        btnAutoMemo.classList.remove('hidden');
        renderer.showMessage("Loaded Custom Board", "success");
    }
  });

  btnDeleteLoaded.addEventListener('click', () => {
    if (!selectedBoardId) return;
    if (confirm('Delete this board?')) {
        deleteSavedBoard(selectedBoardId);
        renderLoadPage(); // re-render list
    }
  });

  // Start with a new easy game initially
  game.startNewGame('easy');
});
