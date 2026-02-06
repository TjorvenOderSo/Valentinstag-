const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const jumpSound = document.getElementById("jumpSound");
const heartSound = document.getElementById("heartSound");

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
  y: canvas.height - 60,
  r: 20,
  vy: -12,
  scale: 1,
  scaleDir: 1
};

const gravity = 0.35;
const jump = -12;

let platforms = [];
let hearts = [];
let clouds = [];
let satellites = [];

// === LEVEL-INFO ===
const PLATFORM_WIDTH = 120;
const MIN_SPACING = 70;
const MAX_SPACING = 120;

// === RESET GAME ===
function resetGame() {
  score = 0;
  gameOver = false;

  player.x = canvas.width / 2;
  player.y = canvas.height - 60;
  player.vy = -12;
  player.scale = 1;
  player.scaleDir = 1;

  platforms = [];
  hearts = [];
  clouds = [];
  satellites = [];

  // Bodenplattform
  platforms.push({
    x: canvas.width / 2 - 150,
    y: canvas.height - 20,
    w: 300,
    h: 15,
    baseX: canvas.width / 2 - 150
  });

  // Plattformen gestaffelt
  let lastX = canvas.width / 2 - 60;
  let lastY = canvas.height - 60;
  const platformCount = Math.floor(canvas.height / MIN_SPACING) * 2;
  for (let i = 1; i < platformCount; i++) {
    let spacing = MIN_SPACING + Math.random() * (MAX_SPACING - MIN_SPACING);
    let y = lastY - spacing;
    let xOffset = Math.random() * 120 - 60;
    let newX = Math.min(Math.max(lastX + xOffset, 0), canvas.width - PLATFORM_WIDTH);

    platforms.push({
      x: newX,
      y: y,
      w: PLATFORM_WIDTH,
      h: 15,
      baseX: newX
    });

    lastX = newX;
    lastY = y;
  }

  // Herzen
  platforms.forEach(p => {
    if (Math.random() < 0.7) {
      hearts.push({
        x: p.x + Math.random() * (p.w - 20) + 10,
        y: p.y - 20,
        collected: false
      });
    }
  });

  for (let i = 0; i < platformCount / 2; i++) {
    hearts.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * canvas.height * 0.5,
      collected: false
    });
  }

  // Wolken
  for (let i = 0; i < 15; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      w: 80 + Math.random() * 40,
      h: 40 + Math.random() * 20,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2 // für fließende Schwebeanimation
    });
  }

  // Satelliten
  for (let i = 0; i < 10; i++) {
    satellites.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.25,
      size: 15 + Math.random() * 15,
      speed: 0.3 + Math.random() * 0.3,
      angle: Math.random() * Math.PI * 2 // Rotation
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
  if (x > canvas.width / 2 - 80 && x < canvas.width / 2 + 80 &&
      y > canvas.height / 2 + 20 && y < canvas.height / 2 + 65) {
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

    // Ball wippen beim Sprung
    player.scale = 1 + Math.sin(Date.now() * 0.01) * 0.05;

    // Plattform-Kollision
    platforms.forEach(p => {
      if (player.vy > 0 &&
          player.x > p.x &&
          player.x < p.x + p.w &&
          player.y + player.r > p.y &&
          player.y + player.r < p.y + p.h) {
        player.vy = jump;
        jumpSound.currentTime = 0;
        jumpSound.play();
      }
    });

    // Kamera
    if (player.y < canvas.height * 0.4) {
      const diff = canvas.height * 0.4 - player.y;
      player.y = canvas.height * 0.4;

      platforms.forEach(p => {
        p.y += diff;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.min(Math.max(p.baseX + Math.random() * 60 - 30, 0), canvas.width - PLATFORM_WIDTH);
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

      clouds.forEach(c => { c.y += diff * 0.2; });
      satellites.forEach(s => { s.y += diff * 0.15; });
    }

    // Herz-Sammeln
    hearts.forEach(h => {
      if (!h.collected && Math.hypot(player.x - h.x, player.y - h.y) < 35) {
        h.collected = true;
        score++;
        heartSound.currentTime = 0;
        heartSound.play();
      }
    });

    // Gewinnscreen
    if (score >= 40) {
      window.location.href = "win.html";
    }

    // Game Over
    if (player.y > canvas.height) gameOver = true;
  }

  draw();
  requestAnimationFrame(update);
}

// === DRAW ===
function draw() {
  // THEMENWECHSEL
  if (player.y > canvas.height * 0.7) ctx.fillStyle = "#ffdee9"; // Boden
  else if (player.y > canvas.height * 0.4) ctx.fillStyle = "#ccefff"; // Himmel
  else if (player.y > canvas.height * 0.15) ctx.fillStyle = "#0b0b2b"; // Weltall
  else ctx.fillStyle = "#d9d9d9"; // Mond
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wolken schweben
  clouds.forEach(c => {
    if (player.y <= canvas.height * 0.7) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + Math.sin(Date.now() * 0.002 + c.offset) * 10, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      c.x += c.speed;
      if (c.x - c.w / 2 > canvas.width) c.x = -c.w;
    }
  });

  // Satelliten rotieren
  satellites.forEach(s => {
    if (player.y <= canvas.height * 0.4) {
      s.angle += 0.02;
      ctx.save();
      ctx.translate(s.x + s.size/2, s.y + s.size/2);
      ctx.rotate(s.angle);
      ctx.fillStyle = "#ffb6c1";
      ctx.fillRect(-s.size/2, -s.size/4, s.size, s.size/2);
      ctx.restore();
      s.x += s.speed;
      if (s.x - s.size > canvas.width) s.x = -s.size;
    }
  });

  // Plattformen
  ctx.fillStyle = "#ff8fab";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // Herzen
  ctx.font = "22px Arial";
  hearts.forEach(h => { if (!h.collected) ctx.fillText("❤️", h.x, h.y); });

  // Spieler Ball mit leichtem Wippen
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(player.scale, 1);
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();
  ctx.restore();

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText(`❤️ ${score} / 40`, 10, 25);

  // Game Over
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "26px Arial";
    ctx.fillText("PAHAHA DU OPFER 🫵😂", canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 20, 160, 45);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Nochmal 😈", canvas.width / 2, canvas.height / 2 + 52);
  }
}

// === START ===
// ... ALLE DEINEN VARIABLEN, RESETGAME-FUNKTION, UPDATE UND DRAW ... //
// Genau wie wir sie vorher hatten, nur unten ändern:

function startGame() {
  resetGame();
  update();
}
