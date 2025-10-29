// utilidades pequeñas (colisión AABB y helpers)
export function aabbCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function randRange(min, max) {
  return Math.random() * (max - min) + min;
}
