// Bomberman 2 - full JavaScript game logic
// Drop this whole block into your script.js (or under //your code here)

(function () {
  // --- config ---
  const width = 10;
  const bombAmount = 10;

  // --- find or create required DOM elements (robust to starter templates) ---
  let board = document.getElementById('board');
  if (!board) {
    board = document.createElement('div');
    board.id = 'board';
    document.body.appendChild(board);
  }

  let result = document.getElementById('result');
  if (!result) {
    result = document.createElement('div');
    result.id = 'result';
    document.body.insertBefore(result, board);
  }

  let flagsLeftSpan = document.getElementById('flagsLeft');
  if (!flagsLeftSpan) {
    // create a small container showing flags left
    const fcont = document.createElement('div');
    fcont.innerHTML = 'Flags left: <span id="flagsLeft"></span>';
    document.body.insertBefore(fcont, result);
    flagsLeftSpan = document.getElementById('flagsLeft');
  }

  // --- state ---
  let squares = [];
  let isGameOver = false;
  let flags = bombAmount;
  let score = 0; // safe revealed count. Win when score === 90

  // initialize UI
  board.style.display = 'grid';
  board.style.gridTemplateColumns = `repeat(${width}, 40px)`;
  board.style.gridTemplateRows = `repeat(${width}, 40px)`;
  board.style.gap = '2px';
  board.style.justifyContent = 'center';
  flagsLeftSpan.textContent = flags;

  // helper: generate shuffled board (bombs/valid)
  function createShuffledArray() {
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    // Fisher-Yates shuffle
    for (let i = gameArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameArray[i], gameArray[j]] = [gameArray[j], gameArray[i]];
    }
    return gameArray;
  }

  // create board DOM
  function createBoard() {
    const gameArray = createShuffledArray();

    // clear previous (if any)
    board.innerHTML = '';
    squares = [];
    isGameOver = false;
    flags = bombAmount;
    score = 0;
    flagsLeftSpan.textContent = flags;
    result.textContent = '';

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', String(i)); // id 0..99
      square.classList.add(gameArray[i]); // 'valid' or 'bomb'
      // accept the requirement: each valid box should have class 'valid', bomb boxes 'bomb'
      square.style.userSelect = 'none';
      square.style.display = 'flex';
      square.style.alignItems = 'center';
      square.style.justifyContent = 'center';
      square.style.fontWeight = '600';
      square.style.cursor = 'pointer';
      square.style.backgroundColor = '#bdbdbd';
      square.style.border = '1px solid #888';
      square.style.width = '40px';
      square.style.height = '40px';
      square.style.fontSize = '18px';

      // left click
      square.addEventListener('click', function (e) {
        if (isGameOver) return;
        clickSquare(square);
      });

      // right click - toggle flag (🚩)
      square.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (isGameOver) return;
        toggleFlag(square);
      });

      board.appendChild(square);
      squares.push(square);
    }

    // set data attribute for each 'valid' cell => number of bombs in neighborhood
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains('valid')) {
        const bombsCount = countNeighborBombs(i);
        // acceptance criteria: set data attribute with the number
        // example in prompt: data="0" (they used attribute name "data")
        squares[i].setAttribute('data', String(bombsCount));
      } else {
        // bombs can also have a data attribute (not required), but keep empty or 0
        squares[i].setAttribute('data', '0');
      }
    }
  }

  // count bombs around index i (handles edges)
  function countNeighborBombs(i) {
    let total = 0;
    const isLeftEdge = i % width === 0;
    const isRightEdge = i % width === width - 1;

    // neighbors offsets
    // top-left, top, top-right, left, right, bottom-left, bottom, bottom-right
    const neighbors = [
      -width - 1,
      -width,
      -width + 1,
      -1,
      +1,
      +width - 1,
      +width,
      +width + 1,
    ];

    for (const offset of neighbors) {
      const ni = i + offset;
      // skip off-board
      if (ni < 0 || ni >= width * width) continue;
      // skip left-edge wrap
      if ((offset === -width - 1 || offset === -1 || offset === +width - 1) && isLeftEdge)
        continue;
      // skip right-edge wrap
      if ((offset === -width + 1 || offset === +1 || offset === +width + 1) && isRightEdge)
        continue;
      if (squares[ni] && squares[ni].classList.contains('bomb')) total++;
    }

    return total;
  }

  // toggle flag on a square
  function toggleFlag(square) {
    if (square.classList.contains('checked')) return; // can't flag revealed
    if (!square.classList.contains('flag')) {
      // add flag if flags remaining
      if (flags === 0) return; // no flags left
      square.classList.add('flag');
      square.textContent = '🚩';
      flags--;
    } else {
      // remove flag
      square.classList.remove('flag');
      square.textContent = '';
      flags++;
    }
    flagsLeftSpan.textContent = flags;
    checkWinByFlags(); // optional check: user might have flagged all bombs
  }

  // left-click behavior
  function clickSquare(square) {
    // If flagged by user, remove flag first (per prompt: left-click continues normal flow on flagged cell)
    if (square.classList.contains('flag')) {
      square.classList.remove('flag');
      // if we removed a flag, return it
      flags++;
      flagsLeftSpan.textContent = flags;
      // clear flag emoji so reveal below can show number/bomb
      square.textContent = '';
    }

    if (square.classList.contains('bomb')) {
      // reveal bomb -> game over (lose)
      revealBomb(square);
      gameOver(false);
    } else if (square.classList.contains('valid')) {
      // reveal the number
      if (square.classList.contains('checked')) return; // already revealed
      const val = square.getAttribute('data') || '0';
      square.classList.add('checked');
      square.style.backgroundColor = '#eee';
      // show the number (if zero, show blank or 0 as per acceptance — we'll show the number)
      square.textContent = val === '0' ? '0' : val;
      score++;
      // check win
      if (score === width * width - bombAmount) {
        gameOver(true);
      }
    }
  }

  // reveal a bomb square (single)
  function revealBomb(square) {
    square.classList.add('checked');
    square.textContent = '💣';
    square.style.backgroundColor = '#ffb3b3';
  }

  // reveal all bombs (used on game over)
  function revealAllBombs() {
    for (const sq of squares) {
      if (sq.classList.contains('bomb')) {
        sq.classList.add('checked');
        sq.textContent = '💣';
        sq.style.backgroundColor = '#ffb3b3';
      }
    }
  }

  // check win condition if user flagged all bombs (optional): but acceptance requires score==90 for win.
  function checkWinByFlags() {
    // This function tries to detect if user flagged all bombs and flagged count equals bombAmount
    // But we will not declare win here because acceptance strictly says "scored 90 points ... YOU WIN!"
    // Keep this as a helper (no auto-win).
  }

  // game over handler
  function gameOver(didWin) {
    isGameOver = true;
    if (didWin) {
      result.textContent = 'YOU WIN!';
      // reveal all bombs as flagged visually (optional)
      for (const sq of squares) {
        if (sq.classList.contains('bomb')) {
          sq.textContent = '💣';
          sq.classList.add('checked');
        }
      }
    } else {
      // lose: reveal all bombs and mark result
      revealAllBombs();
      result.textContent = 'YOU LOSE!';
    }
  }

  // Start game
  createBoard();

  // Optional: expose restart function as global for convenience
  window.restartBomberman2 = createBoard;
})();


function reset() {
    for (i = 1; i <= 9; i++) {
        const block = document.getElementById(`${i}`);
        block.style.backgroundColor = "transparent";
    }
}
  
document.getElementById('reset_button').addEventListener('click', reset);

document.getElementById('change_button').addEventListener('click', () => {
    reset();
    const blockId = document.getElementById("block_id").value;
    const color = document.getElementById("colour_id").value;
    // alert(colorId)
    const block = document.getElementById(`${blockId}`);
    block.style.backgroundColor = color;
});