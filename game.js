const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const jumpSound = document.getElementById("jumpSound");
const heartSound = document.getElementById("heartSound");

// CONSTANTS
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 15;
const PLAYER_RADIUS = 20;
const GRAVITY = 0.25;   // feste Gravitation
const JUMP = -8;        // feste Sprungkraft

// GAME VARIABLES
let score = 0;
let gameOver = false;

// Ball
const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  vy: -8,
  scale: 1
};

// Arrays
let platforms = [];
let hearts = [];

// Theme
let currentTheme = "ground";

// RESET GAME
function resetGame() {
  score = 0;
  gameOver = false;
  currentTheme = "ground";

  player.x = canvas.width / 2;
  player.y = canvas.height - 60;
  player.vy = -8;
  player.scale = 1;

  platforms = [];
  hearts = [];

  // Bodenplattform
  platforms.push({x: canvas.width/2 - 150, y: canvas.height - 20, w: 300, h: PLATFORM_HEIGHT});

  // Start-Plattformen
  let lastY = canvas.height - 60;
  while(lastY > -canvas.height*2){ // 2x Bildschirmhöhe initial
    lastY = addPlatform(lastY);
  }
}

// Add a new platform
function addPlatform(lastY){
  const spacing = 90 + Math.random()*50;
  lastY -= spacing;
  const x = Math.random()*(canvas.width - PLATFORM_WIDTH);
  platforms.push({x:x, y:lastY, w:PLATFORM_WIDTH, h:PLATFORM_HEIGHT});

  // Herz auf Plattform
  if(Math.random()<0.7){
    hearts.push({x:x + PLATFORM_WIDTH/2, y:lastY - 25, collected:false});
  }

  return lastY;
}

// Mouse control
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
});

// Reset on game over click
canvas.addEventListener("click", e => {
  if(!gameOver) return;
  const x = e.clientX - canvas.getBoundingClientRect().left;
  const y = e.clientY - canvas.getBoundingClientRect().top;
  if(x>canvas.width/2-80 && x<canvas.width/2+80 && y>canvas.height/2+20 && y<canvas.height/2+65){
    resetGame();
  }
});

// START GAME
function startGame(){
  resetGame();
  update();
}

// UPDATE LOOP
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(!gameOver){
    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Ball wippen
    player.scale = 1 + Math.sin(Date.now()*0.01)*0.05;

    // Collision with platforms
    platforms.forEach(p=>{
      if(player.vy>0 && player.x>p.x && player.x<p.x+p.w && player.y+PLAYER_RADIUS>p.y && player.y+PLAYER_RADIUS<p.y+p.h){
        player.vy = JUMP;
        jumpSound.currentTime=0;
        jumpSound.play();
      }
    });

    // Heart collection
    hearts.forEach(h=>{
      if(!h.collected && Math.hypot(player.x-h.x, player.y-h.y)<35){
        h.collected = true;
        score++;
        heartSound.currentTime=0;
        heartSound.play();
      }
    });

    // Theme change
    if(player.y < canvas.height*0.6) currentTheme="sky";
    if(player.y < canvas.height*0.3) currentTheme="space";
    if(player.y < 0) currentTheme="moon";

    // Scroll camera
    if(player.y < canvas.height/2){
      const diff = canvas.height/2 - player.y;
      player.y = canvas.height/2;
      platforms.forEach(p=>{
        p.y += diff;
        // neue Plattform oben hinzufügen, wenn letzte zu weit unten
        if(p.y > -PLATFORM_HEIGHT && Math.random()<0.3){
          addPlatform(-canvas.height*3);
        }
      });
      hearts.forEach(h=>h.y+=diff);
    }

    // Game Over
    if(player.y > canvas.height) gameOver = true;

    // Win
    if(score>=40) window.location.href="win.html";
  }

  draw();
  requestAnimationFrame(update);
}

// DRAW FUNCTION
function draw(){
  // Background
  if(currentTheme=="ground") ctx.fillStyle="#ffdee9";
  else if(currentTheme=="sky") ctx.fillStyle="#ccefff";
  else if(currentTheme=="space") ctx.fillStyle="#0b0b2b";
  else if(currentTheme=="moon") ctx.fillStyle="#d9d9d9";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Platforms
  ctx.fillStyle="#ff4d6d";
  platforms.forEach(p=>ctx.fillRect(p.x,p.y,p.w,p.h));

  // Hearts
  ctx.font="22px Arial";
  hearts.forEach(h=>{if(!h.collected)ctx.fillText("❤️",h.x,h.y);});

  // Player
  ctx.save();
  ctx.translate(player.x,player.y);
  ctx.scale(player.scale,1);
  ctx.beginPath();
  ctx.arc(0,0,PLAYER_RADIUS,0,Math.PI*2);
  ctx.fillStyle="#ff4d6d";
  ctx.fill();
  ctx.restore();

  // Score
  ctx.fillStyle="#000";
  ctx.font="18px Arial";
  ctx.fillText(`❤️ ${score} / 40`,10,25);

  // Game Over
  if(gameOver){
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#fff";
    ctx.textAlign="center";
    ctx.font="26px Arial";
    ctx.fillText("PAHAHA DU OPFER 🫵😂",canvas.width/2,canvas.height/2-40);

    ctx.fillStyle="#ff4d6d";
    ctx.fillRect(canvas.width/2-80,canvas.height/2+20,160,45);
    ctx.fillStyle="#fff";
    ctx.font="18px Arial";
    ctx.fillText("Nochmal 😈",canvas.width/2,canvas.height/2+52);
  }
}
