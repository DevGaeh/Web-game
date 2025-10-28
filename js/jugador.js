// Archivo de configuración del jugador, primero haré un cuadrado y luego implmentaré un sprite
// importamos las configuraciones globales
import { CONFIG } from './config.js';

export class Jugador {
  constructor(x, y) {
    this.posx = x;
    this.posy = y;
    this.ANCHO = 45;
    this.ALTO = 45;
    this.velocidad_y = 0;
    this.enElSuelo = true;
    this.color = '#000';
  }

  dibujar(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.posx), Math.round(this.posy), this.ANCHO, this.ALTO);
  }

  actualizar(controles, dt) {
    const gravedad = CONFIG.GRAVEDAD;
    if (controles.estaPresionada('ArrowUp') || controles.estaPresionada('Space')) {
      if (this.enElSuelo) {
        this.velocidad_y = CONFIG.VELOCIDAD_DE_SALTO; // px/s negativo
        this.enElSuelo = false;
      }
    }

    this.velocidad_y += gravedad * dt; // v = v0 + a * dt
    this.posy += this.velocidad_y * dt; // y = y0 + v * dt

    const suelo = CONFIG.SUELO - this.ALTO;
    if (this.posy >= suelo) {
      this.posy = suelo;
      this.velocidad_y = 0;
      this.enElSuelo = true;
    }
  }
}
