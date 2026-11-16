// Neon Rush — keyboard and mouse input. Tracks held keys, the mouse position
// (in canvas coordinates) and whether the fire button is held. The game reads
// this object; it never reads DOM events directly.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseX = canvas.width / 2;
    this.mouseY = canvas.height / 2 - 120;
    this.mouseDown = false;
    this.pressed = new Set(); // keys pressed since last consume (edge-triggered)
    this.clicked = false;     // mouse clicked since last consume

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouseDown = false; });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { this.mouseDown = true; this.clicked = true; }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // True while any of the given keys is held.
  held(...names) { return names.some((n) => this.keys.has(n)); }

  // True once for a key pressed since the last frame; consumed on read.
  wasPressed(name) {
    if (this.pressed.has(name)) { this.pressed.delete(name); return true; }
    return false;
  }

  // True once for a mouse click since the last frame; consumed on read.
  wasClicked() {
    if (this.clicked) { this.clicked = false; return true; }
    return false;
  }

  // Drop edge-triggered state at the end of each frame so a press is never
  // acted on twice.
  endFrame() {
    this.pressed.clear();
    this.clicked = false;
  }
}
