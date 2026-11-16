// Neon Rush — power-ups. Enemies sometimes drop one; the player collects it by
// flying over it. Four kinds: health, shield, rapid fire, spread shot.
import { POWERUPS } from './config.js';

export const POWERUP_KINDS = {
  health: { color: '#2eff8a', label: 'HEALTH +30', symbol: '+' },
  shield: { color: '#78dcff', label: 'SHIELD 5s', symbol: 'S' },
  rapid:  { color: '#ffe14d', label: 'RAPID FIRE 8s', symbol: 'R' },
  spread: { color: '#ff7ad9', label: 'SPREAD SHOT 8s', symbol: 'W' },
};

export class PowerUps {
  constructor() {
    this.list = [];
  }

  // Roll the drop chance at a kill site.
  maybeDrop(x, y) {
    if (Math.random() >= POWERUPS.dropChance) return;
    const kinds = Object.keys(POWERUP_KINDS);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    this.list.push({
      x, y, kind,
      radius: 14,
      life: POWERUPS.lifetime,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Test the player against every drop; returns the collected kinds.
  collect(player) {
    const got = [];
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      if (Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
        got.push(p.kind);
        this.list.splice(i, 1);
      }
    }
    return got;
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      p.phase += dt * 3;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.list) {
      const def = POWERUP_KINDS[p.kind];
      const bob = Math.sin(p.phase) * 3;
      const alpha = p.life < 3 ? 0.4 + 0.6 * Math.abs(Math.sin(p.phase * 2)) : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y + bob);
      ctx.shadowColor = def.color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = def.color;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.symbol, 0, 1);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list.length = 0;
  }
}
