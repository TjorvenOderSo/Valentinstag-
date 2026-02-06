const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gravity = 0.6;
let jumpPower = -12;
let velocityY = 0;
let onGround = false;

let player = {
  x: 180,
  y: 500,
  radius: 15
};

let platforms = [
  { x: 120, y: 550, w: 160, h: 10 },
  { x: 50, y: 420, w: 120, h: 10 },
  { x: 200, y: 300, w: 120, h: 10 }
];

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d6d";
  ctx.fill();
}

function drawPlatforms() {
  ctx.fillStyle = "#ff8fab";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocityY += gravity;
  player.y += velocityY;

  onGround = false;

  platforms.forEach(p => {
    if (
      player.y + player.radius >= p.y &&
      player.y + player.radius <= p.y + p.h &&
      player.x > p.x &&
      player.x < p.x + p.w &&
      velocityY > 0
    ) {
      player.y = p.y - player.radius;
      velocityY = 0;
      onGround = true;
    }
  });

  drawPlatforms();
  drawPlayer();

  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && onGround) {
    velocityY = jumpPower;
  }
});

update();
