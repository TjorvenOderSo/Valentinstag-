const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score = 0;
let gameOver = false;

const player = {
  x: 200,
  y: 450,
  r: 15,
  vy: -10
};

const gravity = 0.35;
const jump = -10;

let platforms = [];
let hearts = [];

function resetGame() {
  score = 0;
  gameOver = false;

  player.x = 200;
  player.y = 450;
  player.vy = -10;

  platforms = [];
  for (let i = 0; i < 8; i++) {
    platforms.push({
      x: Math.random() * 300,
      y: i * 80,
      w: 100,
      h: 10
    });
  }

  hearts = [];
  for (let i = 0; i < 8; i++) {
    hearts.push({
      x: Math.random() * 360,
      y: Math.random() * 600,
      collected: false
    });
  }
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
});

canvas.addEventListener("click", e => {
  if (!gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (x > 120 && x < 280 && y > 300 && y < 345) {
    resetGame();
  }
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    player.vy += gravity;
    player.y += player.vy;

    platforms.forEach(p => {
      if (
        player.vy > 0 &&
        player.x > p.x &&
        player.x < p.x + p.w &&
        player.y + player.r > p.y &&
        player.y + player.r < p.y + p.h
      ) {
        player.vy = jump;
      }
    });

    if (player.y < 250) {
      const diff = 250 - player.y;
      player.y = 250;

      platforms.forEach(p => {
        p.y += diff;
        if (p.y > 600) {
          p.y = 0;
          p.x = Math.random() * 300;
        }
      });

      hearts.forEach(h => {
        h.y += diff;
        if (h.y > 600) {
          h.y = Math.random() * -200;
          h.x = Math.random() * 360;
          h.collected = false;
        }
      });
    }

    hearts.forEach(h => {
      if (
        !h.collected &&
        Math.hypot(player.x - h.x, player.y - h.y) < 35
      ) {
        h.collected = true;
        score++;
      }
    });

    if (score >= 40) {
      window.location.href = "win.html";
    }

    if (player.y > canvas.height) {
      gameOver = true;
    }
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.fillStyle = "#ff8fab";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  ctx.font = "22px Arial";
  hearts.forEach(h => {
    if (!h.collected) ctx.fillText("❤️", h.x, h.y);
  });

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("❤️ " + score + " / 40", 10, 25);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "26px Arial";
    ctx.fillText("PAHAHA DU OPFER 🫵😂", 200, 240);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(120, 300, 160, 45);

    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Nochmal 😈", 200, 330);
  }
}

resetGame();
update();
