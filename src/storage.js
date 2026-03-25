// storage.js - LocalStorage interactions for custom boards

const STORAGE_KEY = 'super_sudoku_custom_boards';

const PRESET_BOARDS = [
  {
    id: 'preset-1',
    name: 'Almost Blank',
    preset: true,
    puzzle: [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,0,2,0,0,0,0,0,0],
    ],
  },
];

export function saveCustomBoard(name, puzzleBoard) {
  const userBoards = getUserBoards();
  const newBoard = {
    id: Date.now().toString(),
    name: name || `Custom Board ${userBoards.length + 1}`,
    puzzle: puzzleBoard, // The 9x9 board array
    createdAt: new Date().toISOString()
  };

  userBoards.push(newBoard);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userBoards));
  return newBoard;
}

function getUserBoards() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getSavedBoards() {
  return [...PRESET_BOARDS, ...getUserBoards()];
}

export function deleteSavedBoard(id) {
  let boards = getUserBoards();
  boards = boards.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  return boards;
}
