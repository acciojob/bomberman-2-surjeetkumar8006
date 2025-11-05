(function () {
  const width = 10;
  const bombAmount = 10;
  const board = document.getElementById("board");
  const result = document.getElementById("result");
  const flagsLeft = document.getElementById("flagsLeft");
  let squares = [];
  let isGameOver = false;
  let flags = bombAmount;

  flagsLeft.textContent = flags;

  // Create the game board
  function createBoard() {
    const bombsArray = Array(bombAmount).fill("bomb");
    const emptyArray = Array(width * width - bombAmount).fill("valid");
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.setAttribute("id", i);
      square.classList.add(shuffledArray[i]);
      board.appendChild(square);
      squares.push(square);

      // Click events
      square.addEventListener("click", () => click(square));
      square.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        addFlag(square);
      });
    }

    // Assign numbers
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains("valid")) {
        let total = 0;
        const isLeftEdge = i % width === 0;
        const isRightEdge = i % width === width - 1;

        // Check all 8 directions carefully with bounds
        const directions = [
          i - width, // top
          i - width + 1, // top-right
          i + 1, // right
          i + width + 1, // bottom-right
          i + width, // bottom
          i + width - 1, // bottom-left
          i - 1, // left
          i - width - 1, // top-left
        ];

        // Validate each direction
        directions.forEach((pos, index) => {
          const isTop = i < width;
          const isBottom = i >= width * (width - 1);

          // Skip invalid edges
          if (pos < 0 || pos >= width * width) return;
          if ((index === 1 || index === 3 || index === 4 || index === 6 || index === 7) && (isLeftEdge || isRightEdge)) {
            // prevent wrapping around edges
          }

          // Edge rules to prevent wrapping horizontally
          if (index === 1 || index === 3 || index === 4 || index === 6 || index === 7) {
            if ((isLeftEdge && (index === 6 || index === 7 || index === 5)) ||
                (isRightEdge && (index === 1 || index === 2 || index === 3))) return;
          }

          if (squares[pos] && squares[pos].classList.contains("bomb")) total++;
        });

        squares[i].setAttribute("data", total);
      }
    }
  }

  createBoard();

  // Add a flag
  function addFlag(square) {
    if (isGameOver) return;
    if (!square.classList.contains("checked") && (flags > 0 || square.classList.contains("flag"))) {
      if (!square.classList.contains("flag")) {
        square.classList.add("flag");
        square.textContent = "🚩";
        flags--;
      } else {
        square.classList.remove("flag");
        square.textContent = "";
        flags++;
      }
      flagsLeft.textContent = flags;
      checkForWin();
    }
  }

  // Left click
  function click(square) {
    if (isGameOver) return;
    if (square.classList.contains("checked") || square.classList.contains("flag")) return;

    if (square.classList.contains("bomb")) {
      gameOver();
      return;
    }

    const total = parseInt(square.getAttribute("data")) || 0;
    square.classList.add("checked");
    if (total > 0) square.textContent = total;
    checkForWin();
  }

  // Game over logic
  function gameOver() {
    result.textContent = "YOU LOSE!";
    isGameOver = true;
    squares.forEach((sq) => {
      if (sq.classList.contains("bomb")) {
        sq.textContent = "💣";
        sq.classList.add("checked");
      }
    });
  }

  // Win condition
  function checkForWin() {
    const checkedCount = document.querySelectorAll(".checked").length;
    const flaggedBombs = squares.filter(
      (sq) => sq.classList.contains("flag") && sq.classList.contains("bomb")
    ).length;

    if (checkedCount === width * width - bombAmount || (flaggedBombs === bombAmount && flags === 0)) {
      result.textContent = "YOU WIN!";
      isGameOver = true;
    }
  }
})();
