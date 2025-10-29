import { CONFIG } from './config.js';

export class Background {
  constructor(image) {
    this.image = image;
    this.x1 = 0;
    this.x2 = image.width; // La segunda imagen empieza donde termina la primera
    this.y = 0;
    this.speed = 0.3; // Velocidad del parallax (más lento que el juego para efecto de profundidad)
  }

  update(dt, gameSpeed) {
    // Mover ambas imágenes hacia la izquierda
    const scrollSpeed = gameSpeed * this.speed * dt;
    this.x1 -= scrollSpeed;
    this.x2 -= scrollSpeed;

    // Cuando la primera imagen sale completamente de la pantalla, la reposicionamos
    if (this.x1 + this.image.width <= 0) {
      this.x1 = this.x2 + this.image.width;
    }

    // Cuando la segunda imagen sale completamente de la pantalla, la reposicionamos
    if (this.x2 + this.image.width <= 0) {
      this.x2 = this.x1 + this.image.width;
    }
  }

  draw(ctx) {
    // Dibujar la primera imagen escalada a la altura del canvas
    ctx.drawImage(
      this.image,
      Math.round(this.x1),
      this.y,
      this.image.width,
      CONFIG.ALTO
    );

    // Dibujar la segunda imagen
    ctx.drawImage(
      this.image,
      Math.round(this.x2),
      this.y,
      this.image.width,
      CONFIG.ALTO
    );
  }

  reset() {
    this.x1 = 0;
    this.x2 = this.image.width;
  }
}