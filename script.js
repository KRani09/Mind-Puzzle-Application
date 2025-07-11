const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

const rows = 10;
const cols = 10;
const tileSize = canvas.width / cols;

let maze = [];
const player = { row: 0, col: 0 };
let timeElapsed = 0;
let timerInterval;
let score = 0;

// ----------- COOKIE FUNCTIONS --------------
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i<ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
  }
  return "";
}
// -------------------------------------------

function startTimer() {
  timeElapsed = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `Time: ${timeElapsed}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function generateMaze() {
  maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      const types = ['empty', 'trap', 'teleport', 'wall'];
      return {
        type: Math.random() < 0.7 ? 'empty' : types[Math.floor(Math.random() * types.length)],
        visible: false
      };
    })
  );
  maze[0][0].type = 'empty';
  maze[rows - 1][cols - 1].type = 'goal';
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = maze[r][c];
      const dist = Math.abs(r - player.row) + Math.abs(c - player.col);
      tile.visible = dist <= 2;

      if (!tile.visible) {
        ctx.fillStyle = '#000';
      } else {
        switch (tile.type) {
          case 'empty': ctx.fillStyle = '#ccc'; break;
          case 'trap': ctx.fillStyle = '#f00'; break;
          case 'teleport': ctx.fillStyle = '#0ff'; break;
          case 'wall': ctx.fillStyle = '#444'; break;
          case 'goal': ctx.fillStyle = '#0f0'; break;
        }
      }
      ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(c * tileSize, r * tileSize, tileSize, tileSize);

      if (r === player.row && c === player.col) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(
          c * tileSize + tileSize / 2,
          r * tileSize + tileSize / 2,
          tileSize / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

function movePlayer(dir) {
  let newRow = player.row;
  let newCol = player.col;
  if (dir === 'ArrowUp') newRow--;
  if (dir === 'ArrowDown') newRow++;
  if (dir === 'ArrowLeft') newCol--;
  if (dir === 'ArrowRight') newCol++;

  if (
    newRow >= 0 && newRow < rows &&
    newCol >= 0 && newCol < cols &&
    maze[newRow][newCol].type !== 'wall'
  ) {
    player.row = newRow;
    player.col = newCol;

    const tile = maze[newRow][newCol];
    if (tile.type === 'teleport') {
      player.row = Math.floor(Math.random() * rows);
      player.col = Math.floor(Math.random() * cols);
    }

   if (tile.type === 'goal') {
  score++;
  setCookie('mindmaze_score', score, 30);
  scoreDisplay.textContent = `Score: ${score}`;

  // Remove current goal
  maze[newRow][newCol].type = 'empty';

  // Place goal at a new random empty tile
  let placed = false;
  while (!placed) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (maze[r][c].type === 'empty' && !(r === player.row && c === player.col)) {
      maze[r][c].type = 'goal';
      placed = true;
    }
  }

  drawMaze();
}

    }

    drawMaze();
  }


function restartGame() {
  generateMaze();
  player.row = 0;
  player.col = 0;
  startTimer();
  drawMaze();
}

// INIT
window.addEventListener('keydown', (e) => movePlayer(e.key));

window.onload = function () {
  const savedScore = getCookie('mindmaze_score');
  score = savedScore ? parseInt(savedScore) : 0;
  scoreDisplay.textContent = `Score: ${score}`;
  restartGame();
};
