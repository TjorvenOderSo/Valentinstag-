const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score = 0;
let gameOver = false;

// Player
const player = {
  x: 200,
  y: 450,
  r: 15,
  vy: -8
};

const gravity = 0.35;
const jumpForce = -10;

// Plattformen & Herzen
let platforms = [];
let hearts = [];

function resetGame() {
  score = 0;
  gameOver = false;

  player.x = 200;
  player.y = 450;
  player.vy = -8;

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
      r: 10,
      collected: false
    });
  }
}

// Maussteuerung
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
});

// Game Loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    // Physik
    player.vy += gravity;
    player.y += player.vy;

    // Plattform-Kollision
    platforms.forEach(p => {
      if (
        player.vy > 0 &&
        player.x > p.x &&
        player.x < p.x + p.w &&
        player.y + player.r > p.y &&
        player.y + player.r < p.y + p.h
      ) {
        player.vy = jumpForce;
      }
    });

    // Kamera-Effekt
    if (player.y < 250) {
      let diff = 250 - player.y;
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

    // Herz-Kollision
    hearts.forEach(h => {
      if (
        !h.collected &&
        Math.hypot(player.x - h.x, player.y - h.y) < player.r + h.r
      ) {
        h.collected = true;
        score++;
      }
    });

    // 🎉 GEWINN
    if (score >= 40) {
      window.location.href = "win.html";
    }

    // Game Over (runterfallen)
    if (player.y > canvas.height) {
      gameOver = true;
    }
  }

  drawPlatforms();
  drawHearts();
  drawPlayer();
  drawScore();

  if (gameOver) drawGameOver();

  requestAnimationFrame(update);
}

// Zeichnen
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();
}

function drawPlatforms() {
  ctx.fillStyle = "#ff8fab";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
}

function drawHearts() {
  ctx.font = "20px Arial";
  hearts.forEach(h => {
    if (!h.collected) ctx.fillText("❤️", h.x, h.y);
  });
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("❤️ " + score + " / 40", 10, 25);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAHAHA DU OPFER 🫵😂", canvas.width / 2, 250);
  ctx.fillText("Neu starten = Seite neu laden", canvas.width / 2, 290);
}

// Start
resetGame();
update();
