const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gravity = 0.25;
const jumpPower = -8;
const speed = 5;

let player = {
  x: 200,
  y: 500,
  vy: 0,
  radius: 15
};

let platforms = [];
let hearts = [];
let score = 0;
let gameOver = false;

function reset() {
  player.y = 500;
  player.vy = 0;
  score = 0;
  gameOver = false;

  platforms = [];
  hearts = [];

  for (let i = 0; i < 7; i++) {
    const px = Math.random() * 300;
    const py = 600 - i * 90;

    platforms.push({ x: px, y: py });

    if (Math.random() > 0.6) {
      hearts.push({ x: px + 30, y: py - 20 });
    }
  }
}

let mouseX = player.x;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX - canvas.offsetLeft;
});

function update() {
  if (gameOver) return;

  // Bewegung
  player.vy += gravity;
  player.y += player.vy;

  // Sanfte Steuerung
  player.x += (mouseX - player.x) * 0.1;

  // Plattform-Kollision
  platforms.forEach(p => {
    if (
      player.vy > 0 &&
      player.y + player.radius > p.y &&
      player.y + player.radius < p.y + 10 &&
      player.x > p.x &&
      player.x < p.x + 80
    ) {
      player.vy = jumpPower;
    }
  });

  // Herzen sammeln
  hearts.forEach((h, i) => {
    if (
      Math.abs(player.x - h.x) < 20 &&
      Math.abs(player.y - h.y) < 20
    ) {
      hearts.splice(i, 1);
      score++;
      if (score >= 20) {
        window.location.href = "end.html";
      }
    }
  });

  // Kamera-Effekt (nach oben scrollen)
  if (player.y < 200) {
    const diff = 200 - player.y;
    player.y = 200;
    platforms.forEach(p => p.y += diff);
    hearts.forEach(h => h.y += diff);
  }

  // Neue Plattformen
  platforms = platforms.filter(p => p.y < 600);
  while (platforms.length < 7) {
    const px = Math.random() * 300;
    const py = Math.min(...platforms.map(p => p.y)) - 90;

    platforms.push({ x: px, y: py });

    if (Math.random() > 0.7) {
      hearts.push({ x: px + 30, y: py - 20 });
    }
  }

  // Fallen
  if (player.y > canvas.height + 50) {
    reset();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ball
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff69b4";
  ctx.fill();

  // Plattformen
  ctx.fillStyle = "#444";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, 80, 10);
  });

  // Herzen
  ctx.font = "20px sans-serif";
  hearts.forEach(h => {
    ctx.fillText("💗", h.x, h.y);
  });

  // Score
  ctx.fillStyle = "#000";
  ctx.fillText("Herzen: " + score + "/20", 10, 20);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

reset();
loop();
