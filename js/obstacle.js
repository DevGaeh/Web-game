import { randRange } from './utils.js';
import { CONFIG } from './config.js';

class ObstacleSpriteAnimation {
  constructor(image, spriteWidth, spriteHeight, frameCount) {
    this.image = image;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.frameCount = frameCount;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 1000 / 10; // 10 FPS para animación más controlada
  }

  update(dt) {
    this.frameTimer += dt * 1000;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  draw(ctx, x, y, w, h) {
    // Calcular correctamente la posición del frame actual
    const sourceX = this.currentFrame * this.spriteWidth;
    const sourceY = 0; // Solo hay una fila

    ctx.drawImage(
      this.image,
      sourceX,              // X de origen en el sprite
      sourceY,              // Y de origen en el sprite
      this.spriteWidth,     // Ancho del frame a recortar
      this.spriteHeight,    // Alto del frame a recortar
      Math.round(x),        // X de destino en canvas
      Math.round(y),        // Y de destino en canvas
      w,                    // Ancho escalado en canvas
      h                     // Alto escalado en canvas
    );
  }
}

export class Obstacle {
  constructor(x, type = 'block', sprites = {}) {
    this.x = x;
    this.type = type;
    this.sprite = null;

    if (type === 'block') {
      this.w = 48;
      this.h = 64;
      this.y = CONFIG.SUELO - this.h;
      this.color = '#f87171';
      
      // Si tenemos el sprite del Golem, creamos la animación
      if (sprites.block) {
        const SPRITE_WIDTH = Math.floor(1337 / 6);  // 1337 / 6 = 222px por frame
        const SPRITE_HEIGHT = 186;                   // Alto del frame del Golem
        const FRAME_COUNT = 6;                       // 6 frames de animación
        
        this.sprite = new ObstacleSpriteAnimation(
          sprites.block,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          FRAME_COUNT
        );
      }
    } else if (type === 'low') {
      this.w = 96;
      this.h = 32;
      this.y = CONFIG.SUELO - this.h;
      this.color = '#fb923c';
      
      // Si tenemos el sprite de la espina, creamos la animación
      if (sprites.low) {
        const SPRITE_WIDTH = 230;  // 1565 / 4 = 391px por frame
        const SPRITE_HEIGHT = 200;                   // Alto del frame de la espina
        const FRAME_COUNT = 4;                       // 4 frames
        
        this.sprite = new ObstacleSpriteAnimation(
          sprites.low,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          FRAME_COUNT
        );
      }
    } else { // flying small obstacle (avispa)
      this.w = 40;
      this.h = 40;
      this.y = CONFIG.SUELO - 150;
      this.color = '#34d399';
      
      // Si tenemos el sprite de la avispa, creamos la animación
      if (sprites.fly) {
        const SPRITE_WIDTH = 251;  // Ancho de cada frame de la avispa
        const SPRITE_HEIGHT = 315; // Alto del frame de la avispa
        const FRAME_COUNT = 4;     // 4 frames
        
        this.sprite = new ObstacleSpriteAnimation(
          sprites.fly,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          FRAME_COUNT
        );
      }
    }
    this.passed = false;
  }

  update(dt, speed) {
    this.x -= speed * dt;
    
    // Actualizar animación si existe
    if (this.sprite) {
      this.sprite.update(dt);
    }
  }

  draw(ctx) {
    if (this.sprite) {
      // Dibujar el sprite animado
      this.sprite.draw(ctx, this.x, this.y, this.w, this.h);
    } else {
      // Dibujar rectángulo de color (fallback)
      ctx.fillStyle = this.color;
      ctx.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h);
    }
    
    // Sombra para obstáculos cercanos al suelo
    if (this.y + this.h >= CONFIG.SUELO - 2) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(Math.round(this.x) + 6, Math.round(this.y + this.h), this.w - 12, 6);
    }
  }

  getAABB() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

export class ObstacleManager {
  constructor(sprites = {}) {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.2; // segundos base entre spawns
    this.minInterval = 0.6;
    this.lastDistance = 0;
    this.sprites = sprites; // Guardamos todos los sprites
  }

  reset() {
    this.obstacles.length = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1.2;
    this.lastDistance = 0;
  }

  update(dt, speed, distance) {
    // ajustar spawnInterval ligeramente con la distancia/tiempo
    const difficultyFactor = Math.min(1.5, 1 + Math.floor(distance / 1000) * 0.08);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      // elegir tipo basado en probabilidad y distancia
      const p = Math.random();
      let type = 'block';
      if (p < 0.15) type = 'low';
      else if (p > 0.85 && distance > 300) type = 'fly';
      const spawnX = CONFIG.ANCHO + randRange(20, 120);
      
      // Pasar todos los sprites al crear obstáculo
      this.obstacles.push(new Obstacle(spawnX, type, this.sprites));
      
      // recalcular intervalo
      this.spawnInterval = Math.max(this.minInterval, 1.2 / difficultyFactor + (Math.random() * 0.4 - 0.2));
      this.spawnTimer = this.spawnInterval;
    }

    // actualizar obstáculos y limpiar los que salieron de pantalla
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      ob.update(dt, speed);
      if (ob.x + ob.w < -50) this.obstacles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const ob of this.obstacles) ob.draw(ctx);
  }

  getObstacles() {
    return this.obstacles;
  }
}