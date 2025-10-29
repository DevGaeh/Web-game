import { CONFIG } from './config.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { GameLoop } from './gameLoop.js';
import { ObstacleManager } from './obstacle.js';
import { Background } from './background.js';
import { aabbCollision } from './utils.js';

const canvas = document.getElementById('pantalla-principal');
canvas.width = CONFIG.ANCHO;
canvas.height = CONFIG.ALTO;
const ctx = canvas.getContext('2d');

Input.init();

// Cargar todos los sprites
const kaelImage = new Image();
kaelImage.src = './assets/images/personaje.png';

const backgroundImage = new Image();
backgroundImage.src = './assets/images/fondo-pokemon.png';

const espinaImage = new Image();
espinaImage.src = './assets/images/diglett.png';

const golemImage = new Image();
golemImage.src = './assets/images/pikachu.png';

const avispaImage = new Image();
avispaImage.src = './assets/images/avispa.png';

let player;
let obstacles;
let background;
let loop;

let elapsed = 0;
let distance = 0;
let speed = CONFIG.VELOCIDAD_BASE;

let lives = 3;
let invulnerable = false;
let invulnerableTimer = 0;
const INVULNERABLE_TIME = 1.2;

let gameOver = false;
let highScore = 0;
let currentScore = 0;

// Cargar el high score del localStorage al iniciar
function loadHighScore() {
  const saved = localStorage.getItem('runnerHighScore');
  if (saved !== null) {
    highScore = parseInt(saved, 10);
  }
  return highScore;
}

// Guardar el high score en localStorage
function saveHighScore(score) {
  localStorage.setItem('runnerHighScore', score.toString());
}

// Actualizar el high score si es necesario
function updateHighScore(score) {
  if (score > highScore) {
    highScore = score;
    saveHighScore(highScore);
    return true; // Retorna true si se rompió el récord
  }
  return false;
}

// Esperar a que todas las imágenes carguen
Promise.all([
  new Promise(resolve => kaelImage.onload = resolve),
  new Promise(resolve => backgroundImage.onload = resolve),
  new Promise(resolve => espinaImage.onload = resolve),
  new Promise(resolve => golemImage.onload = resolve),
  new Promise(resolve => avispaImage.onload = resolve)
]).then(() => {
  player = new Player(120, CONFIG.SUELO - 96, kaelImage);
  background = new Background(backgroundImage);
  
  // Pasar todos los sprites en un objeto
  obstacles = new ObstacleManager({
    low: espinaImage,
    block: golemImage,
    fly: avispaImage
  });
  
  // Cargar el high score al iniciar
  loadHighScore();
  
  loop = new GameLoop(update, render);
  loop.start();
});

function resetGame() {
  elapsed = 0;
  distance = 0;
  currentScore = 0;
  speed = CONFIG.VELOCIDAD_BASE;
  lives = 3;
  invulnerable = false;
  invulnerableTimer = 0;
  gameOver = false;
  player.y = CONFIG.SUELO - player.h;
  player.vy = 0;
  player.onGround = true;
  obstacles.reset();
  background.reset();
}

function update(dt) {
  if (gameOver) {
    if (Input.isPressed('KeyR')) resetGame();
    return;
  }

  elapsed += dt;
  distance += speed * dt;
  speed = CONFIG.VELOCIDAD_BASE + Math.floor(elapsed / 5) * 20;

  // Actualizar puntuación actual (puedes ajustar la fórmula)
  currentScore = Math.floor(distance);

  background.update(dt, speed);
  player.update(dt, Input);
  obstacles.update(dt, speed, distance);

  if (invulnerable) {
    invulnerableTimer -= dt;
    if (invulnerableTimer <= 0) invulnerable = false;
  }

  const pBox = player.getAABB();
  for (const ob of obstacles.getObstacles()) {
    if (aabbCollision(pBox, ob.getAABB())) {
      if (!invulnerable) {
        lives -= 1;
        invulnerable = true;
        invulnerableTimer = INVULNERABLE_TIME;
        ob.passed = true;
        if (lives <= 0) {
          gameOver = true;
          // Actualizar high score cuando el juego termina
          updateHighScore(currentScore);
        }
      }
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar fondo
  background.draw(ctx);

  // obstáculos
  obstacles.draw(ctx);

  // jugador (parpadeo si invulnerable)
  if (invulnerable) {
    const blink = Math.floor(performance.now() / 120) % 2 === 0;
    if (blink) player.draw(ctx);
  } else {
    player.draw(ctx);
  }

  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(12, 12, 260, 96);
  ctx.fillStyle = '#e6eef8';
  ctx.font = '18px system-ui, Arial';
  ctx.fillText(`Distancia: ${Math.floor(distance)} m`, 24, 36);
  ctx.fillText(`Velocidad: ${Math.floor(speed)} px/s`, 24, 56);
  ctx.fillText(`Vidas: ${lives}`, 24, 76);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`Récord: ${highScore} m`, 24, 96);

  // Game Over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 56px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80);
    
    // Puntuación actual
    ctx.fillStyle = '#fff';
    ctx.font = '32px system-ui, Arial';
    ctx.fillText(`Puntuación: ${currentScore} m`, canvas.width / 2, canvas.height / 2 - 20);
    
    // High score con icono si es nuevo récord
    if (currentScore >= highScore && currentScore > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px system-ui, Arial';
      ctx.fillText(`🏆 ¡NUEVO RÉCORD! 🏆`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.font = '24px system-ui, Arial';
      ctx.fillText(`Récord: ${highScore} m`, canvas.width / 2, canvas.height / 2 + 55);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px system-ui, Arial';
      ctx.fillText(`Récord: ${highScore} m`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Instrucción para reiniciar
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px system-ui, Arial';
    ctx.fillText('Presiona R para reiniciar', canvas.width / 2, canvas.height / 2 + 100);
    
    ctx.textAlign = 'start';
  }
}

window.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && gameOver) resetGame();
});