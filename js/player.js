import { CONFIG } from './config.js';

// --- Clase para manejar las animaciones del Sprite (ADAPTADA) ---
class SpriteAnimation {
  constructor(image, animations, offsetX = 0, offsetY = 0, columns = 4) {
    this.image = image;
    this.animations = animations;
    this.currentAnim = 'run';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 1000 / 12; // 12 FPS

    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.columns = columns;
  }

  setAnimation(name) {
    if (this.currentAnim !== name) {
      this.currentAnim = name;
      this.currentFrame = 0;
    }
  }

  update(dt) {
    this.frameTimer += dt * 1000;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      const anim = this.animations[this.currentAnim];
      this.currentFrame = (this.currentFrame + 1) % anim.frames;
    }
  }

  draw(ctx, x, y, w, h) {
    const anim = this.animations[this.currentAnim];
    
    // Calcular la posición del frame actual en el spritesheet
    const frameIndex = anim.startFrame + this.currentFrame;
    
    // Calcular columna y fila basándose en el frameIndex
    const col = frameIndex % this.columns;
    const row = Math.floor(frameIndex / this.columns);
    
    // Calcular las coordenadas de origen en la imagen
    const sourceX = this.offsetX + (col * anim.spriteWidth);
    const sourceY = this.offsetY + (row * anim.spriteHeight);

    ctx.drawImage(
      this.image,
      sourceX, sourceY, anim.spriteWidth, anim.spriteHeight,  // Origen
      Math.round(x), Math.round(y), w, h                       // Destino
    );
  }
}


// --- Clase Player (ADAPTADA PARA 4 COLUMNAS x 2 FILAS) ---
export class Player {
  constructor(x, y, spriteImage) {
    this.x = x;
    this.y = y;
    this.w = 50; // Tamaño del personaje en pantalla
    this.h = 66;
    this.vy = 0;
    this.onGround = false;
    this.isFastFalling = false;
    
    // Offset inicial del spritesheet
    const SPRITESHEET_OFFSET_X = 0;
    const SPRITESHEET_OFFSET_Y = 0;

    // Dimensiones de cada sprite
    const SPRITE_WIDTH = 237;   // Ancho de cada frame
    const SPRITE_HEIGHT = 365;  // Alto de cada frame

    // Layout del spritesheet (4 columnas x 2 filas = 8 frames totales):
    // Fila 0 (frames 0-3): Correr (4 frames)
    // Fila 1 (frames 4-7): Saltar/Caer (misma animación, 4 frames)
    
    this.sprite = new SpriteAnimation(
      spriteImage,
      {
        'run': { 
          frames: 4,              // 4 frames de animación
          startFrame: 0,          // Empieza en el frame 0 (fila 0)
          spriteWidth: SPRITE_WIDTH, 
          spriteHeight: SPRITE_HEIGHT
        },
        'jump': { 
          frames: 4,              // 4 frames de la segunda fila
          startFrame: 4,          // Empieza en el frame 4 (fila 1)
          spriteWidth: SPRITE_WIDTH, 
          spriteHeight: SPRITE_HEIGHT
        },
        'fall': { 
          frames: 4,              // Mismos 4 frames que jump
          startFrame: 4,          // Mismo startFrame que jump (fila 1)
          spriteWidth: SPRITE_WIDTH, 
          spriteHeight: SPRITE_HEIGHT
        }
      },
      SPRITESHEET_OFFSET_X,
      SPRITESHEET_OFFSET_Y,
      4  // 4 columnas
    );
  }

  update(dt, input) {
    // Salto
    if ((input.isPressed('Space') || input.isPressed('ArrowUp')) && this.onGround) {
      this.vy = CONFIG.VELOCIDAD_DE_SALTO;
      this.onGround = false;
      this.isFastFalling = false;
    }
    
    // Fast Fall: Si presiona flecha abajo en el aire y está cayendo
    if (input.isPressed('ArrowDown') && !this.onGround && this.vy > 0) {
      this.isFastFalling = true;
    } else if (this.onGround) {
      this.isFastFalling = false;
    }
    
    // Física vertical
    let gravity = CONFIG.GRAVEDAD;
    
    // Aplicar gravedad extra si está en fast fall
    if (this.isFastFalling) {
      gravity = CONFIG.GRAVEDAD * 2.5; // Cae 2.5 veces más rápido
    }
    
    this.vy += gravity * dt;
    this.y += this.vy * dt;

    // Suelo
    const ground = CONFIG.SUELO - this.h;
    if (this.y > ground) {
      this.y = ground;
      this.vy = 0;
      this.onGround = true;
      this.isFastFalling = false;
    }

    // Actualizar animación basada en el estado
    if (!this.onGround) {
      if (this.vy < 0) {
        this.sprite.setAnimation('jump');
      } else {
        this.sprite.setAnimation('fall');
      }
    } else {
      this.sprite.setAnimation('run');
    }

    this.sprite.update(dt);
  }

  draw(ctx) {
    this.sprite.draw(ctx, this.x, this.y, this.w, this.h);
  }

  getAABB() {
    return { x: this.x + 20, y: this.y + 15, w: this.w - 40, h: this.h - 20 };
  }
}