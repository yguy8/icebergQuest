const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let player = { x: canvas.width/2-25, y: canvas.height-120, w: 60, h: 60, vx: 0 };
let obstacles = [];
let krillList = [];
let distance = 0;
let krillCount = 0;
let gameOver = false;

// dibujar pingüino con trineo
function drawPenguinConTrineo(x,y,w,h,colorTrineo){
  // trineo
  ctx.fillStyle = colorTrineo;
  ctx.fillRect(x-10, y+h-10, w+20, 15);

  // cuerpo
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2);
  ctx.fill();

  // panza blanca
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x+w/2, y+h/2+5, w/3, h/3, 0, 0, Math.PI*2);
  ctx.fill();

  // pico naranja
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(x+w/2-10, y+h/2-5);
  ctx.lineTo(x+w/2+10, y+h/2-5);
  ctx.lineTo(x+w/2, y+h/2+5);
  ctx.closePath();
  ctx.fill();

  // ojos
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x+w/2-10, y+h/2-15, 5, 0, Math.PI*2);
  ctx.arc(x+w/2+10, y+h/2-15, 5, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x+w/2-10, y+h/2-15, 2, 0, Math.PI*2);
  ctx.arc(x+w/2+10, y+h/2-15, 2, 0, Math.PI*2);
  ctx.fill();
}

function drawPlayer() {
  drawPenguinConTrineo(player.x, player.y, player.w, player.h, "royalblue");
}

function drawObstacles() {
  obstacles.forEach(o=>{
    drawPenguinConTrineo(o.x,o.y,o.w,o.h,"red");
  });
}

// dibujar krill realista
function drawKrill(x,y){
  // cuerpo alargado
  ctx.fillStyle = "#ff9999";
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 6, 0, 0, Math.PI*2);
  ctx.fill();

  // segmentos
  ctx.strokeStyle = "#cc6666";
  ctx.lineWidth = 2;
  for(let i=-12; i<=12; i+=6){
    ctx.beginPath();
    ctx.moveTo(x+i, y-6);
    ctx.lineTo(x+i, y+6);
    ctx.stroke();
  }

  // cabeza
  ctx.fillStyle = "#ff6666";
  ctx.beginPath();
  ctx.arc(x+20, y, 6, 0, Math.PI*2);
  ctx.fill();

  // ojo
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x+22, y-2, 2, 0, Math.PI*2);
  ctx.fill();

  // antenas
  ctx.strokeStyle = "#ff6666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x+24, y-2);
  ctx.lineTo(x+32, y-8);
  ctx.moveTo(x+24, y);
  ctx.lineTo(x+32, y+4);
  ctx.stroke();
}

function drawKrillList(){
  krillList.forEach(k=>{
    drawKrill(k.x,k.y);
  });
}

// tablero de puntuación
function drawBoard(){
  ctx.fillStyle = "rgba(0,0,50,0.7)";
  ctx.fillRect(20, 20, 220, 70);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 220, 70);

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Distancia: " + distance, 40, 50);
  ctx.fillText("Krill: " + krillCount, 40, 80);
}

function update() {
  if(gameOver) return;

  // mover jugador
  player.x += player.vx;
  if(player.x<0) player.x=0;
  if(player.x+player.w>canvas.width) player.x=canvas.width-player.w;

  // generar obstáculos
  if(Math.random()<0.02){
    let lane = Math.floor(Math.random()*3);
    let laneWidth = canvas.width/3;
    obstacles.push({
      x: lane*laneWidth + laneWidth/2 - 30,
      y: -100,
      w: 60,
      h: 60
    });
  }

  // generar krill
  if(Math.random()<0.01){
    let lane = Math.floor(Math.random()*3);
    let laneWidth = canvas.width/3;
    krillList.push({
      x: lane*laneWidth + laneWidth/2,
      y: -50
    });
  }

  // mover obstáculos
  obstacles.forEach(o=>o.y+=6);

  // mover krill
  krillList.forEach(k=>k.y+=6);

  // colisiones con obstáculos
  obstacles.forEach(o=>{
    if(player.x<o.x+o.w && player.x+player.w>o.x &&
       player.y<o.y+o.h && player.y+player.h>o.y){
      gameOver=true;
    }
  });

  // colisiones con krill
  krillList.forEach((k,i)=>{
    if(player.x<k.x+10 && player.x+player.w>k.x-10 &&
       player.y<k.y+10 && player.y+player.h>k.y-10){
      krillCount++;
      krillList.splice(i,1);
    }
  });

  // limpiar fuera de pantalla
  obstacles = obstacles.filter(o=>o.y<canvas.height);
  krillList = krillList.filter(k=>k.y<canvas.height);

  // distancia
  distance++;
}

function draw() {
  ctx.fillStyle="#cceeff";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  drawPlayer();
  drawObstacles();
  drawKrillList();
  drawBoard();

  if(gameOver){
    ctx.fillStyle="darkblue"; ctx.font="40px sans-serif";
    ctx.fillText("¡GAME OVER!",canvas.width/2-120,canvas.height/2);
    ctx.font="20px sans-serif";
    ctx.fillText("Presiona Enter para reiniciar",canvas.width/2-140,canvas.height/2+40);
  }
}

function loop(){
  update(); draw();
  requestAnimationFrame(loop);
}
loop();

// controles
document.addEventListener("keydown",e=>{
  if(e.code==="ArrowLeft" || e.key==="a" || e.key==="A"){ player.vx=-6; }
  if(e.code==="ArrowRight" || e.key==="d" || e.key==="D"){ player.vx=6; }
  if(gameOver && e.code==="Enter"){
    player={x:canvas.width/2-25,y:canvas.height-120,w:60,h:60,vx:0};
    obstacles=[]; krillList=[]; distance=0; krillCount=0;
    gameOver=false;
  }
});
document.addEventListener("keyup",e=>{
  if(e.code==="ArrowLeft"||e.code==="ArrowRight"||e.key==="a"||e.key==="A"||e.key==="d"||e.key==="D"){ 
    player.vx=0; 
  }
});
