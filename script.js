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

      square.addEventListener('click', function () {
        click(square);
      });

      square.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        addFlag(square);
      });
    }

    // add numbers
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      const isLeftEdge = i % width === 0;
      const isRightEdge = i % width === width - 1;

      if (squares[i].classList.contains('valid')) {
        if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
        if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
        if (i >= 10 && squares[i - width].classList.contains('bomb')) total++;
        if (i >= 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
        if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
        if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
        if (i <= 89 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
        if (i <= 89 && squares[i + width].classList.contains('bomb')) total++;

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
    }
  }

  function click(square) {
    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;

    if (square.classList.contains('bomb')) {
      gameOver();
    } else {
      let total = square.getAttribute('data');
      square.classList.add('checked');
      square.textContent = total;
      score++;
      if (score === 90) winGame();
    }
  }

  function gameOver() {
    result.textContent = 'YOU LOSE!';
    isGameOver = true;
    squares.forEach((sq) => {
      if (sq.classList.contains('bomb')) {
        sq.textContent = '💣';
      }
    });
  }

  function winGame() {
    result.textContent = 'YOU WIN!';
    isGameOver = true;
  }
})();
