import { CONFIG } from './config.js';
import { CONTROLES } from './controles.js';
import { Jugador } from './jugador.js';

const canvas = document.getElementById('pantalla-principal');
const ctx = canvas.getContext('2d');

CONTROLES.iniciar();

function ajustarBufferAlCSS() {
  const w = Math.max(1, Math.floor(canvas.clientWidth));
  const h = Math.max(1, Math.floor(canvas.clientHeight));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

ajustarBufferAlCSS();
window.addEventListener('resize', ajustarBufferAlCSS);

const jugador = new Jugador(120, CONFIG.SUELO - 45);

let last = performance.now();

function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); 
    last = now;
    jugador.actualizar(CONTROLES, dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sueloY = Math.min(canvas.height, CONFIG.SUELO);
    ctx.fillStyle = '#7cfc00';
    ctx.fillRect(0, sueloY, canvas.width, canvas.height - sueloY);
    const scaleX = canvas.width / CONFIG.ANCHO_PANTALLA;
    const scaleY = canvas.height / CONFIG.ALTO_PANTALLA;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    jugador.dibujar(ctx);
    ctx.restore();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
