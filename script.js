(function () {
  const width = 10;
  const bombAmount = 10;
  const board = document.getElementById('board');
  const result = document.getElementById('result');
  const flagsLeft = document.getElementById('flagsLeft');
  let squares = [];
  let isGameOver = false;
  let flags = bombAmount;

  flagsLeft.textContent = flags;

  // Create game board
  function createBoard() {
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      square.classList.add(shuffledArray[i]);
      board.appendChild(square);
      squares.push(square);

      // Left click
      square.addEventListener('click', () => click(square));
      // Right click (flag)
      square.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        addFlag(square);
      });
    }

    // Assign numbers (bomb count around each valid square)
    for (let i = 0; i < width * width; i++) {
      if (squares[i].classList.contains('valid')) {
        let total = 0;
        const isLeftEdge = i % width === 0;
        const isRightEdge = i % width === width - 1;

        // top
        if (i - width >= 0 && squares[i - width].classList.contains('bomb')) total++;
        // top-right
        if (i - width + 1 >= 0 && !isRightEdge && squares[i - width + 1].classList.contains('bomb')) total++;
        // right
        if (!isRightEdge && squares[i + 1] && squares[i + 1].classList.contains('bomb')) total++;
        // bottom-right
        if (i + width + 1 < width * width && !isRightEdge && squares[i + width + 1].classList.contains('bomb')) total++;
        // bottom
        if (i + width < width * width && squares[i + width].classList.contains('bomb')) total++;
        // bottom-left
        if (i + width - 1 < width * width && !isLeftEdge && squares[i + width - 1].classList.contains('bomb')) total++;
        // left
        if (!isLeftEdge && squares[i - 1] && squares[i - 1].classList.contains('bomb')) total++;
        // top-left
        if (i - width - 1 >= 0 && !isLeftEdge && squares[i - width - 1].classList.contains('bomb')) total++;

        squares[i].setAttribute('data', total);
      }
    }
  }

  createBoard();

  // Add flag with right click
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

  // Left click functionality
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
    }
    checkForWin();
  }

  // Game over
  function gameOver() {
    result.textContent = 'YOU LOSE!';
    isGameOver = true;
    squares.forEach((sq) => {
      if (sq.classList.contains('bomb')) {
        sq.textContent = '💣';
        sq.classList.add('checked'); // mark bombs as checked for test validation
      }
    });
  }

  // Check win condition
  function checkForWin() {
    const checkedCount = document.querySelectorAll('.checked').length;
    const flaggedBombs = squares.filter(
      (sq) => sq.classList.contains('flag') && sq.classList.contains('bomb')
    ).length;

    if (checkedCount === width * width - bombAmount || (flaggedBombs === bombAmount && flags === 0)) {
      result.textContent = 'YOU WIN!';
      isGameOver = true;
    }
  }
})();
