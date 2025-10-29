export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this._last = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    this._last = performance.now();
    requestAnimationFrame(this._frame.bind(this));
  }

  stop() {
    this.running = false;
  }

  _frame(t) {
    if (!this.running) return;
    const dt = Math.min((t - this._last) / 1000, 0.05);
    this._last = t;
    this.update(dt);
    this.render();
    requestAnimationFrame(this._frame.bind(this));
  }
}
