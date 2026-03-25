// input.js - Handles mouse and keyboard events

export function setupInputHandlers(game) {
  // Keybindings mapping
  const vimKeys = {
    'h': 'left', 'j': 'down', 'k': 'up', 'l': 'right',
    'q': 1, 'w': 2, 'e': 3,
    'a': 4, 's': 5, 'd': 6,
    'z': 7, 'x': 8, 'c': 9,
    'r': 'delete'
  };

  const normalKeys = {
    'ArrowLeft': 'left', 'ArrowDown': 'down', 'ArrowUp': 'up', 'ArrowRight': 'right',
    'Backspace': 'delete', 'Delete': 'delete',
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };

  document.addEventListener('keydown', (e) => {
    // Ignore if modal is open
    if (!document.getElementById('custom-modal').classList.contains('hidden')) return;
    if (!document.getElementById('load-modal').classList.contains('hidden')) return;
    
    // Check if target is an input element
    if (e.target.tagName === 'INPUT') return;

    const key = e.key;

    // Normal Mode Checks
    if (normalKeys[key] !== undefined) {
      const action = normalKeys[key];
      if (typeof action === 'number') {
        game.handleInput('set', action);
      } else if (action === 'delete') {
        game.handleInput('delete');
      } else {
        game.handleInput('move', action);
      }
      e.preventDefault();
      return;
    }

    // Vim Mode Checks
    if (vimKeys[key.toLowerCase()] !== undefined) {
      const action = vimKeys[key.toLowerCase()];
      if (typeof action === 'number') {
        game.handleInput('set', action);
      } else if (action === 'delete') {
        game.handleInput('delete');
      } else {
        game.handleInput('move', action);
      }
      e.preventDefault();
      return;
    }
  });
}
