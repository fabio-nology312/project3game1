
// 2d Canvas needs to be used for this game
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');


const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 5;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background but the style pushed to the centre of the page
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height); 

  // Paddle Colour
  context.fillStyle = 'red';

  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]); // pixels for dashed line
  context.moveTo(0, 350); // x and y values startting at the end of the canvas on the right (700 pixels tall)
  context.lineTo(500, 350); // from end to end dashed on the x axis
  context.strokeStyle = 'grey'; 
  context.stroke(); // stroke because i want a line acrss

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill(); // ball to be a solid

  // Score line which is should be painted in the canvas
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50); //player
  context.fillText(computerScore, 20, canvas.height / 2 - 30); //computer
}

// Create Canvas Element on screen
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}



// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement. It only moves if player moves 
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed; //howver the speed is slower than the ball movement
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden= true;
  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');
 // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
   playAgainBtn.textContent = 'Play Again';
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);

 
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
   if (playerScore === winningScore || computerScore === winningScore) {
        isGameOver = true;
        //Set Winner
        const winner = playerScore === winningScore ? 'Palyer 1' : 'Computer';
     showGameOverEl(winner);
   }
}

// Called Every Frame game logic
function animate() {
  renderCanvas();
  ballMove(); // controls the speed that the ball is travelling
  ballBoundaries(); //to bounce off and change directions. if the ball reaches 0 or 700 it adds 1 to score
  computerAI(); 
  gameOver(); //gameover function
  if (!isGameOver) {
    window.requestAnimationFrame(animate); // keep calling the function in a loop for the frames
  }
 
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;

   }
   isGameOver = false;
   isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset(); // put the ball ball back to the centre and resets the speed
  createCanvas();
  animate();
  //setInterval(animate, 1000/60); to have my function running on 60 frames for 1000ms
  
  
  canvas.addEventListener('mousemove', (e) => {
    console.log(e.clientX);
    playerMoved = true; // computer reacts if I make the first move
    // Compensate for canvas being centered but also track where the mouse is movingg
    
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load 
startGame();

