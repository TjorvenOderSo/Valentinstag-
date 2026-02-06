function startGame() {
  let count = 0;

  let interval = setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerText = "💗";
    heart.style.left = Math.random() * window.innerWidth + "px";
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 2000);

    count++;
    if (count > 40) {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = "game.html";
      }, 1000);
    }
  }, 100);
}
