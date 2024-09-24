let board;
let scoreBoard;
let restartButton;
let movingBoard;
let gameSelect;
let context;
let boardWidth = 600;
let boardHeight = 600;

// Snake properties
let snakeWidth = 25;
let snakeHeight = 25;
let snakeX = Math.floor(boardWidth / 2 / snakeWidth) * snakeWidth; // Snap to grid
let snakeY = Math.floor(boardHeight / 2 / snakeHeight) * snakeHeight; // Snap to grid

let snake = [{ x: snakeX, y: snakeY }];
let score = 0;

// Food properties
let food = {
    x: 0,
    y: 0,
    width: snakeWidth,
    height: snakeHeight
};

let enemy = {
    x: 0,
    y: 0,
    width: snakeWidth,
    height: snakeHeight
}

//physics
let lastTime = 0;
let accumulatedTime = 0; // Time accumulator for grid-based movement
const snakeSpeed = 3; // Set to the width of the snake for consistent movement
let velocityX = 0;
let velocityY = 0;
let magnetDistance = 100;


//game
let gameOver = false;
let gameMode = "normal";

window.onload = function () {
    board = document.getElementById("board");
    scoreBoard = document.getElementById("score");
    movingBoard = document.getElementById("moving-board");
    restartButton = document.getElementById("restart");
    gameSelect = document.getElementById("gameModes");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    generateEnemy()
    generateFood(); // Generate initial food position
    requestAnimationFrame(update);
    restartButton.addEventListener("click", resetGame);
    gameSelect.addEventListener("change", changeGame)
    document.addEventListener("keydown", snakeMove);
}

function changeGame() {
    gameMode = gameSelect.value; // Directly assign the selected value
    console.log(gameMode);
    resetGame()
}


function update(currentTime) {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    let deltaTime = (currentTime - lastTime) / 1000; // Time in seconds
    lastTime = currentTime;

    // Add the deltaTime to the accumulated time
    accumulatedTime += deltaTime * 60; // Adjust for frame rate

    // Only move when enough time has accumulated to move the full grid step (25px)
    if (accumulatedTime >= snakeWidth / snakeSpeed) {
        accumulatedTime = 0; // Reset accumulator

        // Move snake's head by one full step in the grid (25px)
        const head = {
            x: snake[0].x + (Math.sign(velocityX) * snakeWidth),
            y: snake[0].y + (Math.sign(velocityY) * snakeWidth)
        };

        // Check for food collision
        if (detectCollision(head, food)) {
            generateFood(); // Generate new food
            score++;
        } else {
            snake.pop(); // Remove the last segment if not eating
        }

        const distanceToFood = Math.hypot(head.x - food.x, head.y - food.y);

        if (gameMode === "magnet" && magnetDistance > distanceToFood) {
            const foodSpeed = 5; // Adjust this value for how fast the food follows
            food.x += (head.x - food.x) * (foodSpeed / 100); // Interpolate towards head.x
            food.y += (head.y - food.y) * (foodSpeed / 100); // Interpolate towards head.y
        }

        if (gameMode === "enemy" ) {
            const enemySpeed = 10; // Adjust this value for how fast the food follows
            enemy.x += (head.x - enemy.x) * (enemySpeed / 100); // Interpolate towards head.x
            enemy.y += (head.y - enemy.y) * (enemySpeed / 100); // Interpolate towards head.y
            if (detectCollision(head, enemy)) {
                gameOver = true;
            }

        }



        if (head.x < 0 || head.x > board.width - snakeWidth || head.y < 0 || head.y > board.height - snakeHeight) {
            gameOver = true;
        }

        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver = true;
        }

        // Add new head to the snake array
        snake.unshift(head);
    }

    context.fillStyle = "black";
    context.font = "15px sans-serif";
    scoreBoard.innerHTML = `${score}`;
    if (gameOver) {
        scoreBoard.innerHTML = `GAME OVER: ${score}`;
        movingBoard.style.transform = "translateY(-500px)"
    }

    drawSnake(); // Draw the updated snake
    drawFood(); // Draw the food
    drawEnemy()
}


function drawSnake() {
    context.fillStyle = "green";
    snake.forEach(segment => {
        context.fillRect(segment.x, segment.y, snakeWidth, snakeHeight);
        context.strokeRect(segment.x, segment.y, snakeWidth, snakeHeight);
    });
}

// Generate food at a random position
function generateFood() {
    if (gameOver) return;
    food.x = Math.floor(Math.random() * (boardWidth / snakeWidth)) * snakeWidth;
    food.y = Math.floor(Math.random() * (boardHeight / snakeHeight)) * snakeHeight;

    // Ensure food does not overlap with the snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood(); // Regenerate if food overlaps with the snake
    }
}

function drawEnemy() {
    context.fillStyle = "blue"; // Color of the food
    context.beginPath();
    context.arc(enemy.x, enemy.y, 25,0, 2 * Math.PI);
    context.fill(); // Fill the circle
    context.stroke(); // Add an outline for visibility
}

function generateEnemy () {
    if (gameOver) return;
    enemy.x = Math.floor(Math.random() * (boardWidth / snakeWidth)) * snakeWidth;
    enemy.y = Math.floor(Math.random() * (boardHeight / snakeHeight)) * snakeHeight;

    // Ensure food does not overlap with the snake
    if (snake.some(segment => (segment.x === enemy.x && segment.y === enemy.y) && (food.x === enemy.x && food.y === enemy.y ))) {
        generateEnemy(); // Regenerate if food overlaps with the snake
    }
}

function drawFood() {
    context.fillStyle = "red"; // Color of the food
    context.fillRect(food.x, food.y, food.width, food.height);
}

// Move the snake based on key presses
function snakeMove(e) {
    if (gameOver) return;  // Don't allow movement during game over
    switch (e.key) {
        case "a":
            if (velocityX === 0) { // Prevent reversing direction
                velocityY = 0;
                velocityX = -snakeSpeed;
            }
            break;
        case "d":
            if (velocityX === 0) { // Prevent reversing direction
                velocityY = 0;
                velocityX = snakeSpeed;
            }
            break;
        case "w":
            if (velocityY === 0) { // Prevent reversing direction
                velocityX = 0;
                velocityY = -snakeSpeed;
            }
            break;
        case "s":
            if (velocityY === 0) { // Prevent reversing direction
                velocityX = 0;
                velocityY = snakeSpeed;
            }
            break;
    }
}

// Reset game logic
function resetGame() {
    movingBoard.style.transform = "translateY(0px)"

    // Reset snake to its initial position and length
    snakeX = Math.floor(boardWidth / 2 / snakeWidth) * snakeWidth;
    snakeY = Math.floor(boardHeight / 2 / snakeHeight) * snakeHeight;
    snake = [{ x: snakeX, y: snakeY }];

    // Reset velocity
    velocityX = 0;
    velocityY = 0;

    // Reset score and game over state
    score = 0;
    gameOver = false;

    // Generate new food
    generateFood();
    generateEnemy();
    // Continue the game loop
    requestAnimationFrame(update);
}

// Detect collision between the snake head and food
function detectCollision(a, b) {
    return  a.x < b.x + b.width &&
        a.x + snakeWidth > b.x &&
        a.y < b.y + b.height &&
        a.y + snakeHeight > b.y;
}
