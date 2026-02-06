const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// === FULLSCREEN ===
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// === GAME VARIABLES ===
let score = 0;
let gameOver = false;

const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  r: 20,
  vy: -12
};

const gravity = 0.35;
const jump = -12;

let platforms = [];
let hearts = [];

// === RESET GAME ===
function resetGame() {
  score = 0;
  gameOver = false;

  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  player.vy = -12;

  // Plattformen
  platforms = [];
  for (let i = 0; i < 8; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 120),
      y: i * (canvas.height / 8),
      w: 120,
      h: 15
    });
  }

  // Herzen
  hearts = [];
  for (let i = 0; i < 8; i++) {
    hearts.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * canvas.height,
      collected: false
    });
  }
}

// === MAUSSTEUERUNG ===
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
});

// === RESET BUTTON ===
canvas.addEventListener("click", e => {
  if (!gameOver) return;

  const x = e.clientX;
  const y = e.clientY;

  if (
    x > canvas.width / 2 - 80 &&
    x < canvas.width / 2 + 80 &&
    y > canvas.height / 2 + 20 &&
    y < canvas.height / 2 + 65
  ) {
    resetGame();
  }
});

// === GAME LOOP ===
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    // Physik
    player.vy += gravity;
    player.y += player.vy;

    // Plattform-Kollision (von oben)
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

    // Kamera-Effekt
    if (player.y < canvas.height * 0.4) {
      const diff = canvas.height * 0.4 - player.y;
      player.y = canvas.height * 0.4;

      platforms.forEach(p => {
        p.y += diff;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * (canvas.width - 120);
        }
      });

      hearts.forEach(h => {
        h.y += diff;
        if (h.y > canvas.height) {
          h.y = Math.random() * -200;
          h.x = Math.random() * (canvas.width - 30);
          h.collected = false;
        }
      });
    }

    // Herz-Sammeln
    hearts.forEach(h => {
      if (!h.collected && Math.hypot(player.x - h.x, player.y - h.y) < 35) {
        h.collected = true;
        score++;
      }
    });

    // Gewinnscreen bei 40 Herzen
    if (score >= 40) {
      window.location.href = "win.html";
    }

    // Game Over (runterfallen)
    if (player.y > canvas.height) {
      gameOver = true;
    }
  }

  draw();
  requestAnimationFrame(update);
}

// === ZEICHNEN ===
function draw() {
  // Plattformen
  ctx.fillStyle = "#ff8fab";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // Herzen
  ctx.font = "22px Arial";
  hearts.forEach(h => {
    if (!h.collected) ctx.fillText("❤️", h.x, h.y);
  });

  // Spieler
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText(`❤️ ${score} / 40`, 10, 25);

  // Game Over Overlay
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "26px Arial";
    ctx.fillText("PAHAHA DU OPFER 🫵😂", canvas.width / 2, canvas.height / 2 - 40);

    // Reset Button
    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 20, 160, 45);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Nochmal 😈", canvas.width / 2, canvas.height / 2 + 52);
  }
}

// === START ===
resetGame();
update();
