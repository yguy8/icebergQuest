//menu que el usuario puede mover 
const menu = document.getElementById("another-games");
const icon = document.getElementById("menu-icon");

let offsetX, offsetY, isDragging = false;

// --- Drag con mouse ---
menu.addEventListener("mousedown", (e) => {
  if (e.target.closest("#menu-icon")) return; // no arrastrar si clic en icono
  isDragging = true;
  offsetX = e.clientX - menu.offsetLeft;
  offsetY = e.clientY - menu.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    menu.style.left = (e.clientX - offsetX) + "px";
    menu.style.top = (e.clientY - offsetY) + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// --- Drag con touch ---
menu.addEventListener("touchstart", (e) => {
  if (e.target.closest("#menu-icon")) return;
  isDragging = true;
  const touch = e.touches[0];
  offsetX = touch.clientX - menu.offsetLeft;
  offsetY = touch.clientY - menu.offsetTop;
});

document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    menu.style.left = (touch.clientX - offsetX) + "px";
    menu.style.top = (touch.clientY - offsetY) + "px";
  }
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// --- Toggle expand/collapse ---
icon.addEventListener("click", () => {
  menu.classList.toggle("expanded");

  if (menu.classList.contains("expanded")) {
    // SVG lleno (abierto)
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e1ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-gamepad-3"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 12l-3 -3h-2a1 1 0 0 0 -1 1v4a1 1 0 0 0 1 1h2z" /><path d="M15 12l3 -3h2a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2z" /><path d="M12 15l-3 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1 -1v-2z" /><path d="M12 9l-3 -3v-2a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v2z" /></svg>
    `;
  } else {
    // SVG outline (cerrado)
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#e1ff00" class="icon icon-tabler icons-tabler-filled icon-tabler-device-gamepad-3"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.707 14.293l3 3a1 1 0 0 1 .293 .707v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a1 1 0 0 1 .293 -.707l3 -3a1 1 0 0 1 1.414 0m-6.707 -6.293a1 1 0 0 1 .707 .293l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1 -.707 .293h-2a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2zm14 0a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-2a1 1 0 0 1 -.707 -.293l-3 -3a1 1 0 0 1 0 -1.414l3 -3a1 1 0 0 1 .707 -.293zm-6 -6a2 2 0 0 1 2 2v2a1 1 0 0 1 -.293 .707l-3 3a1 1 0 0 1 -1.414 0l-3 -3a1 1 0 0 1 -.293 -.707v-2a2 2 0 0 1 2 -2z" /></svg>
    `;
  }
});

// Canvas y contexto
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tamaño y suelo
let groundY;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - 100;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  // Reposicionar jugador y re-crear nieve al redimensionar
  player.y = groundY - player.h;
  createSnowflakes();
});

const scoreEl = document.getElementById("score");

// Estado del juego
let player = { x: 80, y: 0, vy: 0, w: 40, h: 40, jumping: false };
player.y = groundY - player.h;

let gameSpeed = 6;
let gravity = 0.6, jump = -12;
let obstacles = [];
let frame = 0, score = 0, gameOver = false;

// Nieve de fondo
let snowflakes = [];
function createSnowflakes() {
  snowflakes = [];
  const count = Math.round((canvas.width * canvas.height) / 25000); // densidad adaptativa
  for (let i = 0; i < count; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1.5,
      speedY: Math.random() * 0.8 + 0.4,
      driftX: Math.random() * 0.5 - 0.25
    });
  }
}
createSnowflakes();

function updateSnowflakes() {
  snowflakes.forEach(f => {
    f.y += f.speedY;
    f.x += f.driftX;
    if (f.y > canvas.height) {
      f.y = -f.r;
      f.x = Math.random() * canvas.width;
    }
    if (f.x < -10) f.x = canvas.width + 10;
    if (f.x > canvas.width + 10) f.x = -10;
  });
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#194a7eff");
  g.addColorStop(1, "#123a6b");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Línea del suelo
  ctx.fillStyle = "#e6f2ff";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // Nieve
  ctx.fillStyle = "white";
  snowflakes.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer(player) {
  // Ajuste vertical del pingüino
  const offsetY = -20; // súbelo 20 píxeles (ajusta este valor a tu gusto)

  // Cuerpo (rectángulo) usando coordenadas top-left
  ctx.fillStyle = "#1c2530";
  ctx.fillRect(player.x, player.y + offsetY, player.w, player.h);

  // Parte superior redonda (semicírculo encima)
  ctx.beginPath();
  ctx.arc(player.x + player.w / 2, player.y + offsetY, player.w / 2, Math.PI, 0);
  ctx.fill();

  // Panza ovalada (desplazada hacia la derecha)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    player.x + player.w * 0.65,
    player.y + player.h * 0.55 + offsetY,
    player.w * 0.30,
    player.h * 0.28,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Pico a la derecha
  ctx.fillStyle = "#ffa726";
  ctx.beginPath();
  const beakY = player.y + player.h * 0.25 + offsetY;
  ctx.moveTo(player.x + player.w - 2, beakY - 4);
  ctx.lineTo(player.x + player.w + 12, beakY);
  ctx.lineTo(player.x + player.w - 2, beakY + 4);
  ctx.closePath();
  ctx.fill();

  // Ojo derecho (blanco + pupila negra)
  const eyeX = player.x + player.w * 0.70;
  const eyeY = player.y + player.h * 0.15 + offsetY;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, player.w * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, player.w * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Mejilla rosada
  ctx.fillStyle = "#ffc0cb";
  ctx.beginPath();
  ctx.arc(player.x + player.w * 0.60, player.y + player.h * 0.32 + offsetY, player.w * 0.10, 0, Math.PI * 2);
  ctx.fill();

  // Ala visible (perfil)
  ctx.fillStyle = "#1c2530";
  ctx.beginPath();
  ctx.ellipse(
    player.x + player.w * 0.15,
    player.y + player.h * 0.55 + offsetY,
    player.w * 0.18,
    player.h * 0.30,
    -Math.PI / 6, 0, Math.PI * 2
  );
  ctx.fill();

  // Patineta roja (tabla tipo cápsula) — toca el suelo (NO se mueve)
  const deckY = player.y + player.h - 16;
  const deckW = player.w * 1.3;
  const deckH = player.h * 0.18;
  const deckX = player.x + (player.w - deckW) / 2;

  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.moveTo(deckX + deckH / 2, deckY);
  ctx.lineTo(deckX + deckW - deckH / 2, deckY);
  ctx.arc(deckX + deckW - deckH / 2, deckY + deckH / 2, deckH / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(deckX + deckH / 2, deckY + deckH);
  ctx.arc(deckX + deckH / 2, deckY + deckH / 2, deckH / 2, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Llantas amarillas
  ctx.fillStyle = "#fdd835";
  const wheelR = deckH * 0.7;
  const wheelY = deckY + deckH + wheelR;
  const leftWheelX = deckX + deckW * 0.25;
  const rightWheelX = deckX + deckW * 0.75;
  ctx.beginPath();
  ctx.arc(leftWheelX, wheelY, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightWheelX, wheelY, wheelR, 0, Math.PI * 2);
  ctx.fill();

  // Pies sobre la patineta
  ctx.fillStyle = "#ffb74d";
  const feetY = deckY - 4;
  ctx.beginPath();
  ctx.ellipse(player.x + player.w * 0.35, feetY, player.w * 0.20, player.h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(player.x + player.w * 0.65, feetY, player.w * 0.20, player.h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}



// Obstáculos: cubos de hielo con borde y brillo
function drawObstacles() {
  obstacles.forEach(o => {
    // Cuerpo translúcido
    ctx.fillStyle = "rgba(173, 216, 230, 0.85)";
    ctx.fillRect(o.x, o.y, o.w, o.h);

    // Borde
    ctx.strokeStyle = "#87CEEB";
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x, o.y, o.w, o.h);

    // Brillo diagonal superior izquierda
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(o.x + 3, o.y + 3);
    ctx.lineTo(o.x + o.w * 0.35, o.y + 3);
    ctx.lineTo(o.x + 3, o.y + o.h * 0.35);
    ctx.closePath();
    ctx.fill();

    // Sombrita inferior derecha
    ctx.fillStyle = "rgba(0,0,50,0.15)";
    ctx.fillRect(o.x + o.w * 0.70, o.y + o.h * 0.70, o.w * 0.28, o.h * 0.28);
  });
}

// Lógica
function update() {
  if (gameOver) return;

  frame++;
  player.vy += gravity;
  player.y += player.vy;

  // Suelo
  if (player.y + player.h > groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.jumping = false;
  }

  // Spawning obstáculos
  if (frame % 90 === 0) {
    const size = Math.random() * 40 + 30;
    obstacles.push({ x: canvas.width, y: groundY - size, w: size, h: size, passed: false });
  }

  // Movimiento obstáculos
  obstacles.forEach(o => o.x -= gameSpeed);

 // Colisiones AABB (coincide con dibujo top-left)
obstacles.forEach(o => {
  if (
    player.x < o.x + o.w &&
    player.x + player.w > o.x &&
    player.y < o.y + o.h &&
    player.y + player.h > o.y
  ) {
    gameOver = true;
    onGameOver();
  }

  if (!o.passed && o.x + o.w < player.x) {
    score++;
    o.passed = true;
    scoreEl.textContent = score;

    // cada 20 obstáculos aumenta la velocidad
    if (score % 20 === 0) {
      gameSpeed += 1; // sube la velocidad (ajusta el incremento a tu gusto)
    }
  }
});


  // Filtrar fuera de pantalla
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Nieve
  updateSnowflakes();
}

// Dibujo
function draw() {
  drawBackground();
  drawPlayer(player);
  drawObstacles();

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px sans-serif";
    ctx.fillText("Fin del juego", canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = "20px sans-serif";
    ctx.fillText("Presiona Enter para reiniciar", canvas.width / 2 - 150, canvas.height / 2 + 40);
  }
}

// Bucle
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// Controles
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !player.jumping && !gameOver) {
    player.vy = jump;
    player.jumping = true;
    onJump();
  }
  if (gameOver && e.code === "Enter") {
    player = { x: 80, y: groundY - 40, vy: 0, w: 40, h: 40, jumping: false };
    obstacles = [];
    score = 0;
    scoreEl.textContent = 0;
    gameOver = false;
  }
});

canvas.addEventListener("click", () => {
  if (!player.jumping && !gameOver) {
    player.vy = jump;
    player.jumping = true;
    onJump();
  }
});


//Música del juego
let soundOn = true;

// Función auxiliar para reproducir un tono
function playTone(freq, duration, type = "sine", volume = 0.08) {
  if (!soundOn) return;
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
  setTimeout(() => ac.close(), duration * 1000 + 200);
}

/// --- Sonido de salto (menos agudo, más suave) ---
function onJump() {
  if (!soundOn) return;
  const ac = new (window.AudioContext || window.webkitAudioContext)();

  // Dos notas ascendentes rápidas pero más graves
  [350, 550].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + i * 0.05);
    osc.stop(ac.currentTime + i * 0.05 + 0.15);
  });

  setTimeout(() => ac.close(), 500);
}

// --- Sonido de Game Over (descendente y calmado) ---
function onGameOver() {
  if (!soundOn) return;
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  [440, 330, 220].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.07;
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + i * 0.5);
    osc.stop(ac.currentTime + i * 0.5 + 0.6);
  });
  setTimeout(() => ac.close(), 2500);
}

// --- Control con tecla M para activar/desactivar sonido ---
document.addEventListener("keydown", e => {
  if (e.code === "KeyM") {
    soundOn = !soundOn;
  }
});
