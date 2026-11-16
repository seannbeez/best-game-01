// Neon Rush — particles and floating score text. Pure visual feedback: sparks on
// explosions, thrust trails behind the player, and score popups where an enemy died.
export class Particles {
  constructor() {
    this.list = [];
    this.texts = [];
  }

  burst(x, y, color, count = 18, speed = 260) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.list.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        size: 1.5 + Math.random() * 2.5,
        color,
      });
    }
  }

  trail(x, y, color) {
    this.list.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      size: 1.5 + Math.random() * 1.5,
      color,
    });
  }

  scoreText(x, y, text, color = '#ffd166') {
    this.texts.push({ x, y, text, color, life: 1.0 });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= (1 - 2.5 * dt);
      p.vy *= (1 - 2.5 * dt);
      p.life -= dt;
      if (p.life <= 0) this.list.splice(i, 1);
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y -= 42 * dt;
      t.life -= dt * 0.9;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Courier New", monospace';
    for (const t of this.texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list.length = 0;
    this.texts.length = 0;
  }
}
