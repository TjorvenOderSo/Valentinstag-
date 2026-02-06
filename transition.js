function start() {
  let count = 0;

  const interval = setInterval(() => {
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
        window.location.href = "info.html";
      }, 800);
    }
  }, 80);
}
