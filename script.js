(function () {
  const width = 10;
  const bombAmount = 10;
  const board = document.getElementById('board');
  const result = document.getElementById('result');
  const flagsLeft = document.getElementById('flagsLeft');
  let squares = [];
  let isGameOver = false;
  let flags = bombAmount;
  let score = 0;

  flagsLeft.textContent = flags;

  // create board
  function createBoard() {
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffled = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      square.classList.add(shuffled[i]);
      board.appendChild(square);
      squares.push(square);

      square.addEventListener('click', () => click(square));
      square.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        addFlag(square);
      });
    }

    // assign numbers
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains('valid')) {
        let total = 0;
        const isLeftEdge = i % width === 0;
        const isRightEdge = i % width === width - 1;

        // top
        if (i >= width && squares[i - width].classList.contains('bomb')) total++;
        // top-right
        if (i >= width && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
        // right
        if (!isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
        // bottom-right
        if (i < width * (width - 1) && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
        // bottom
        if (i < width * (width - 1) && squares[i + width].classList.contains('bomb')) total++;
        // bottom-left
        if (i < width * (width - 1) && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
        // left
        if (!isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
        // top-left
        if (i >= width && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;

        squares[i].setAttribute('data', total);
      }
    }
  }

  createBoard();

  function addFlag(square) {
    if (isGameOver) return;
    if (!square.classList.contains('checked') && (flags > 0 || square.classList.contains('flag'))) {
      if (!square.classList.contains('flag')) {
        square.classList.add('flag');
        square.textContent = '🚩';
        flags--;
      } else {
        square.classList.remove('flag');
        square.textContent = '';
        flags++;
      }
      flagsLeft.textContent = flags;
      checkForWin();
    }
  }

  function click(square) {
    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;

    if (square.classList.contains('bomb')) {
      gameOver();
      return;
    }

    let total = square.getAttribute('data');
    square.classList.add('checked');
    if (total && total !== '0') {
      square.textContent = total;
      score++;
      checkForWin();
      return;
    }

    score++;
    checkForWin();
  }

  function gameOver() {
    result.textContent = 'YOU LOSE!';
    isGameOver = true;
    squares.forEach((sq) => {
      if (sq.classList.contains('bomb')) {
        sq.textContent = '💣';
        sq.classList.add('checked'); // ✅ required for .checked length = 10
      }
    });
  }

  function checkForWin() {
    const checkedCount = document.querySelectorAll('.checked').length;
    if (checkedCount === width * width - bombAmount) {
      winGame();
    }

    const flaggedBombs = squares.filter(
      (sq) => sq.classList.contains('flag') && sq.classList.contains('bomb')
    ).length;

    if (flaggedBombs === bombAmount && flags === 0) {
      winGame();
    }
  }

  function winGame() {
    result.textContent = 'YOU WIN!';
    isGameOver = true;
  }
})();
