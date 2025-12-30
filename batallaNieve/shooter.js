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

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const scoreEl = document.getElementById("score");

let player = { x: 80, y: canvas.height/2, w: 40, h: 40, vy: 0 };
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Dibujar jugador
function drawPlayer() {
  ctx.fillStyle="white";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

// Dibujar balas
function drawBullets() {
  ctx.fillStyle="yellow";
  bullets.forEach(b=>{
    ctx.fillRect(b.x,b.y,b.w,b.h);
  });
}

// Dibujar enemigos
function drawEnemies() {
  ctx.fillStyle="red";
  enemies.forEach(e=>{
    ctx.fillRect(e.x,e.y,e.w,e.h);
  });
}

// Actualizar lógica
function update() {
  if(gameOver) return;

  // Movimiento jugador
  player.y += player.vy;
  if(player.y<0) player.y=0;
  if(player.y+player.h>canvas.height) player.y=canvas.height-player.h;

  // Balas
  bullets.forEach((b,i)=>{
    b.x+=8;
    if(b.x>canvas.width) bullets.splice(i,1);
    enemies.forEach((e,j)=>{
      if(b.x<b.x+b.w && b.x+b.w>e.x &&
         b.y<b.y+b.h && b.y+b.h>e.y){
        enemies.splice(j,1);
        bullets.splice(i,1);
        score++;
        scoreEl.textContent=score;
      }
    });
  });

  // Enemigos
  if(Math.random()<0.02){
    let size=30;
    enemies.push({x:canvas.width, y:Math.random()*(canvas.height-50), w:size, h:size});
  }
  enemies.forEach((e,i)=>{
    e.x-=4;
    if(e.x+e.w<0) enemies.splice(i,1);
    if(player.x<e.x+e.w && player.x+player.w>e.x &&
       player.y<e.y+e.h && player.y+player.h>e.y){
      gameOver=true;
    }
  });
}

// Dibujar todo
function draw() {
  ctx.fillStyle="#001f3f";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();
  if(gameOver){
    ctx.fillStyle="red"; ctx.font="40px sans-serif";
    ctx.fillText("GAME OVER",canvas.width/2-100,canvas.height/2);
    ctx.font="20px sans-serif";
    ctx.fillText("Presiona Enter para reiniciar",canvas.width/2-120,canvas.height/2+40);
  }
}

function loop(){
  update(); draw();
  requestAnimationFrame(loop);
}
loop();

// Controles
document.addEventListener("keydown",e=>{
  if(e.code==="ArrowUp"){ player.vy=-6; }
  if(e.code==="ArrowDown"){ player.vy=6; }
  if(e.code==="Space"){ bullets.push({x:player.x+player.w,y:player.y+player.h/2,w:10,h:4}); }
  if(gameOver && e.code==="Enter"){
    player={x:80,y:canvas.height/2,w:40,h:40,vy:0};
    bullets=[]; enemies=[]; score=0;
    scoreEl.textContent=0; gameOver=false;
  }
});
document.addEventListener("keyup",e=>{
  if(e.code==="ArrowUp"||e.code==="ArrowDown"){ player.vy=0; }
});
