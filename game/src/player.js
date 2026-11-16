// Neon Rush — the player ship. Acceleration-based movement, mouse aim, hold to
// fire, and the three timed power-ups (shield, rapid fire, spread shot).
import { PLAYER } from './config.js';

export class Player {
  constructor(x, y) {
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.radius = PLAYER.radius;
    this.health = PLAYER.maxHealth;
    this.lives = PLAYER.startLives;
    this.fireTimer = 0;
    this.invulnerable = 0;
    this.shield = 0;
    this.rapid = 0;
    this.spread = 0;
    this.thrusting = false;
  }

  get alive() { return this.lives > 0; }

  update(dt, input, arena) {
    // Steering: WASD or arrow keys, with acceleration and damping.
    let ax = 0;
    let ay = 0;
    if (input.held('w', 'arrowup')) ay -= 1;
    if (input.held('s', 'arrowdown')) ay += 1;
    if (input.held('a', 'arrowleft')) ax -= 1;
    if (input.held('d', 'arrowright')) ax += 1;
    this.thrusting = ax !== 0 || ay !== 0;
    if (this.thrusting) {
      const len = Math.hypot(ax, ay) || 1;
      this.vx += (ax / len) * PLAYER.accel * dt;
      this.vy += (ay / len) * PLAYER.accel * dt;
    }
    const damp = Math.max(0, 1 - PLAYER.friction * dt);
    this.vx *= damp;
    this.vy *= damp;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > PLAYER.speed) {
      this.vx = (this.vx / speed) * PLAYER.speed;
      this.vy = (this.vy / speed) * PLAYER.speed;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const m = arena.margin;
    this.x = Math.max(m + this.radius, Math.min(arena.width - m - this.radius, this.x));
    this.y = Math.max(m + this.radius, Math.min(arena.height - m - this.radius, this.y));

    // Aim at the mouse; fire while the button or Space is held.
    this.angle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
    this.fireTimer -= dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.shield = Math.max(0, this.shield - dt);
    this.rapid = Math.max(0, this.rapid - dt);
    this.spread = Math.max(0, this.spread - dt);
  }

  // True when the fire button is held and the cooldown has elapsed.
  wantsFire(input) {
    if (!input.mouseDown && !input.held(' ')) return false;
    if (this.fireTimer > 0) return false;
    this.fireTimer = this.rapid > 0 ? PLAYER.fireCooldown / 2 : PLAYER.fireCooldown;
    return true;
  }

  // Bullet angles for one shot: one straight, or three spread while powered.
  shotAngles() {
    if (this.spread > 0) return [this.angle - 0.16, this.angle, this.angle + 0.16];
    return [this.angle];
  }

  // Damage the player; returns 'blocked', 'hit', 'dead' (lost a life) or 'gameover'.
  takeDamage(amount) {
    if (this.invulnerable > 0 || this.shield > 0) return 'blocked';
    this.health -= amount;
    this.invulnerable = PLAYER.hitInvulnerable;
    if (this.health > 0) return 'hit';
    this.lives -= 1;
    if (this.lives <= 0) return 'gameover';
    this.health = PLAYER.maxHealth;
    this.invulnerable = 2.0;
    return 'dead';
  }

  heal(amount) {
    this.health = Math.min(PLAYER.maxHealth, this.health + amount);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    // Mercy blink while invulnerable.
    if (this.invulnerable > 0 && Math.floor(this.invulnerable * 12) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }
    ctx.rotate(this.angle);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-12, -11);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 11);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050510';
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Shield ring.
    if (this.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 220, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#78dcff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
