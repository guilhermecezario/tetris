const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const canvasNextPiece = document.getElementById('nextPiece');
const contextNextPiece = canvasNextPiece.getContext('2d');

const canvasHoldPiece = document.getElementById('holdPiece');
const contextHoldPiece = canvasHoldPiece.getContext('2d');

const elementButtonStart = document.getElementById('buttonStart');
const elementButtonPause = document.getElementById('buttonPause');

const elementTextPause = document.querySelector('.content-text-paused');

elementButtonStart.addEventListener('click', () => {
  start();
});

elementButtonPause.addEventListener('click', () => {
  pause();
});

context.scale(1, 1);
contextNextPiece.scale(1, 1);
contextHoldPiece.scale(1, 1);

const colors = [
  ['#1EE682', '#0CA759'],
  ['#60E71D', '#41A211'],
  ['#1DB4F3', '#097AA9'],
  ['#E7C61D', '#A28911'],
  ['#FF0550', '#B20036'],
  ['#881DF3', '#5909A9'],
  ['#E71DA4', '#A21171'],
  ['#E71DA4', '#A21171'],
];

const pieces = [
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],[
    [0, 2, 0],
    [0, 2, 0],
    [0, 2, 2],
  ], [
    [0, 3, 0],
    [0, 3, 0],
    [3, 3, 0],
  ], [
    [4, 4],
    [4, 4],
  ], [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ], [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0],
  ], [
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0],
  ]
];

const smallPieces = [
  [
    [1],
    [1],
    [1],
    [1],
  ],
  [
    [2, 0],
    [2, 0],
    [2, 2],
  ],
  [
    [0, 3],
    [0, 3],
    [3, 3],
  ],
  [
    [4, 4],
    [4, 4],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [0, 6, 6],
    [6, 6, 0],
  ],
  [
    [0, 7, 0],
    [7, 7, 7],
  ]
]

const backgroundColor = "#191a1f"

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

const player = {
  pos: {x: 0, y: 0},
  index: null,
  piece: null,
  indexNext: null,
  indexHold: null,
  score: 0,
};

let gameInterval = null

const arena = createMatrix(12, 20);

context.fillStyle = backgroundColor;
context.fillRect(0, 0, canvas.width, canvas.height);

let playGame = false;

let startGame = false;

function start() {
  if (playGame) {
    updateDisabledButtons(true)

    gameInterval = setInterval(() => {
      requestAnimationFrame(update)
    }, dropInterval)
  
    requestAnimationFrame(update)
  } else {
    updateDisabledButtons(true)
  
    player.indexNext = ramdomIndexPiece();
  
    playerReset();
    updateScore();
  
    update();
  
    gameInterval = setInterval(() => {
      requestAnimationFrame(update)
    }, dropInterval)
  
    requestAnimationFrame(update)
  }

  playGame = true
}

function pause() {
  updateDisabledButtons(false)

  clearInterval(gameInterval);
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length -1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function collide(arena, player) {
  const m = player.piece;
  const p = player.pos;

  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + p.y] && arena[y + p.y][x + p.x]) !== 0) {
        return true;
      }
    }
  }

  return false;
}

function createMatrix(w, h) {
  const matrix = [];

  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function ramdomIndexPiece() {
  return Math.floor(Math.random() * 7);
}

function drawPiece(matrix, offset, ctx) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const newX = (x + offset.x) * 20;
        const newY = (y + offset.y) * 20;

        var grd = ctx.createRadialGradient(10 + newX, 10 + newY, 0, 10 + newX, 10 + newY, 10);
        grd.addColorStop(0, colors[value][0]);
        grd.addColorStop(1, colors[value][1]);

        ctx.fillStyle = grd;

        ctx.fillRect(newX + 1, newY + 1, 18, 18);

        ctx.strokeStyle = backgroundColor;
        ctx.strokeRect(newX, newY, 20, 20);
      }
    });
  });
}

function draw() {
  clearContext(context, canvas.width, canvas.height);

  clearContext(contextNextPiece, 90, 90);

  clearContext(contextHoldPiece, 90, 90);

  drawPiece(arena, {x: 0, y: 0}, context);
  drawPiece(player.piece, player.pos, context);

  drawSmallPiece(contextNextPiece, player.indexNext)

  if (player.indexHold || player.indexHold == 0) {
    drawSmallPiece(contextHoldPiece, player.indexHold)
  };
}

function drawSmallPiece(ctx, index) {
  const piece = smallPieces[index]

  ctx.canvas.width = piece[0].length * 20
  ctx.canvas.height = piece.length * 20

  drawPiece(piece, { x: 0, y: 0 }, ctx);
}

function drawHoldPiece() {}

function clearContext(ctx, width, height) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

function merge(arena, player) {
  player.piece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  const rotateMatrix = matrix.map((r, i) => matrix.map((v) => v[i]))

  if (dir > 0) {
    return rotateMatrix.map(row => row.reverse());
  } else {
    return rotateMatrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;

  if (collide(arena, player)) {
    player.pos.y--;

    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }

  requestAnimationFrame(update)

  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;

  if (collide(arena, player)) {
    player.pos.x -= offset;
  }

  requestAnimationFrame(update)
}

function playerReset() {
  player.indexHold = player.index;

  player.piece = pieces[player.indexNext];
  player.index = player.indexNext;
  
  player.indexNext = ramdomIndexPiece();

  player.pos.y = 0;
  player.pos.x = 4;

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;

  player.piece = rotate(player.piece, dir);

  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (offset > player.piece[0].length) {
      player.piece = rotate(player.piece, -dir);
      player.pos.x = pos;
      return;
    }
  }

  requestAnimationFrame(update)
}

function update(time = 0) {
  const deltaTime = time - lastTime;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  lastTime = time;

  draw();
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

function updateDisabledButtons(disabled) {
  startGame = disabled;

  elementButtonStart.disabled = disabled;
  elementButtonPause.disabled = !disabled;

  elementTextPause.style.display = disabled ? "none" : "flex";
}

document.addEventListener('keydown', event => {
  if (!startGame) return;

  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  }
});
