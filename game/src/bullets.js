// Neon Rush — bullets. Two plain pools (player shots and enemy shots) with
// circle movement and out-of-arena culling. No allocation in the hot loop beyond
// the bullet objects themselves.
export class Bullets {
  constructor() {
    this.player = [];
    this.enemy = [];
  }

  firePlayer(x, y, angle, speed, damage) {
    this.player.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4,
      damage,
      life: 1.4,
    });
  }

  fireEnemy(x, y, angle, speed, damage) {
    this.enemy.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5,
      damage,
      life: 4.0,
    });
  }

  update(dt, width, height) {
    for (const pool of [this.player, this.enemy]) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const b = pool[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0 || b.x < -20 || b.x > width + 20 || b.y < -20 || b.y > height + 20) {
          pool.splice(i, 1);
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 10;
    for (const b of this.player) {
      ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = '#aefcff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const b of this.enemy) {
      ctx.shadowColor = '#ff5c8a';
      ctx.fillStyle = '#ff5c8a';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  clear() {
    this.player.length = 0;
    this.enemy.length = 0;
  }
}
