const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = { x: 200, y: 500, vy: 0 };
let platforms = [];
let hearts = [];
let score = 0;

function reset() {
  player.y = 500;
  score = 0;
  platforms = [];
  hearts = [];
  for (let i = 0; i < 6; i++) {
    platforms.push({
      x: Math.random() * 300,
      y: i * 100
    });
    if (Math.random() > 0.6) {
      hearts.push({
        x: platforms[i].x + 20,
        y: platforms[i].y - 20
      });
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spieler
  ctx.beginPath();
  ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
  ctx.fill();

  player.vy += 0.5;
  player.y += player.vy;

  // Plattformen
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, 80, 10);
    if (
      player.y + 15 > p.y &&
      player.y + 15 < p.y + 10 &&
      player.x > p.x &&
      player.x < p.x + 80 &&
      player.vy > 0
    ) {
      player.vy = -10;
    }
  });

  // Herzen
  hearts.forEach((h, i) => {
    ctx.fillText("💗", h.x, h.y);
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

  // Fallen
  if (player.y > canvas.height) reset();

  requestAnimationFrame(loop);
}

document.addEventListener("mousemove", e => {
  player.x = e.clientX - canvas.offsetLeft;
});

reset();
loop();
