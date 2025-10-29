export const Input = {
  keys: new Set(),
  init() {
    window.addEventListener('keydown', e => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => {
      this.keys.delete(e.code);
    });
  },
  isPressed(code) {
    return this.keys.has(code);
  }
};
