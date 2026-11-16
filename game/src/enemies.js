// Neon Rush — enemies. Four behaviours, all chasing the same player:
//  - Chaser: steers straight at the player.
//  - Weaver: fast, sine-weaves sideways while closing in.
//  - Shooter: holds a firing distance and shoots at the player.
//  - Tank: slow, heavy, soaks bullets.
import { ENEMY_TYPES, WAVES } from './config.js';

export class Enemy {
  constructor(type, x, y, wave) {
    const t = ENEMY_TYPES[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = t.radius;
    this.hp = t.hp + Math.floor(wave / 5); // slow health growth on later waves
    this.maxHp = this.hp;
    this.speed = t.speed + wave * WAVES.speedPerWave;
    this.score = t.score;
    this.color = t.color;
    this.angle = 0;
    this.phase = Math.random() * Math.PI * 2; // weave phase
    this.fireTimer = 1.5 + Math.random() * 1.5;
    this.hitFlash = 0;
  }

  update(dt, player, bullets, sfx) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    this.angle = Math.atan2(dy, dx);

    if (this.type === 'weaver') {
      // Sine weave across the line of approach.
      const px = -ny;
      const py = nx;
      const wobble = Math.sin(this.phase) * 0.9;
      this.phase += dt * 5;
      this.x += (nx + px * wobble) * this.speed * dt;
      this.y += (ny + py * wobble) * this.speed * dt;
    } else if (this.type === 'shooter') {
      // Keep a firing distance; strafe slowly while shooting.
      const want = 300;
      const toward = dist > want + 40 ? 1 : dist < want - 40 ? -0.6 : 0;
      this.x += nx * this.speed * toward * dt;
      this.y += ny * this.speed * toward * dt;
      this.x += Math.cos(this.phase) * 30 * dt;
      this.y += Math.sin(this.phase) * 30 * dt;
      this.phase += dt * 1.2;
      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && dist < 520) {
        this.fireTimer = 2.2;
        bullets.fireEnemy(this.x, this.y, Math.atan2(dy, dx), 260, 10);
        if (sfx) sfx.enemyShoot();
      }
    } else {
      // Chaser and tank: straight at the player.
      this.x += nx * this.speed * dt;
      this.y += ny * this.speed * dt;
    }
  }

  // Returns true when this hit kills the enemy.
  takeHit(damage) {
    this.hp -= damage;
    this.hitFlash = 0.12;
    return this.hp <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
    const r = this.radius;
    ctx.beginPath();
    if (this.type === 'chaser') {
      ctx.moveTo(r, 0); ctx.lineTo(-r * 0.8, -r * 0.8); ctx.lineTo(-r * 0.3, 0); ctx.lineTo(-r * 0.8, r * 0.8);
    } else if (this.type === 'weaver') {
      ctx.moveTo(r, 0); ctx.lineTo(0, r * 0.8); ctx.lineTo(-r, 0); ctx.lineTo(0, -r * 0.8);
    } else if (this.type === 'shooter') {
      ctx.rect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
    } else {
      // Tank: hexagon.
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Health bar over damaged heavies.
    if (this.maxHp >= 3 && this.hp < this.maxHp) {
      const w = this.radius * 2;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(this.x - w / 2, this.y - this.radius - 10, w, 4);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - w / 2, this.y - this.radius - 10, w * (this.hp / this.maxHp), 4);
    }
  }
}

// Pick a spawn point on an arena edge, at least minDist from the player.
export function edgeSpawn(arena, player, minDist = 260) {
  for (let tries = 0; tries < 12; tries++) {
    const side = Math.floor(Math.random() * 4);
    const m = arena.margin + 20;
    let x;
    let y;
    if (side === 0) { x = m + Math.random() * (arena.width - 2 * m); y = m; }
    else if (side === 1) { x = m + Math.random() * (arena.width - 2 * m); y = arena.height - m; }
    else if (side === 2) { x = m; y = m + Math.random() * (arena.height - 2 * m); }
    else { x = arena.width - m; y = m + Math.random() * (arena.height - 2 * m); }
    if (Math.hypot(x - player.x, y - player.y) >= minDist) return { x, y };
  }
  return { x: arena.margin + 20, y: arena.margin + 20 };
}

// The wave's roster: more enemies and tougher types as waves climb.
export function waveRoster(wave) {
  const count = WAVES.baseCount + wave * WAVES.perWave;
  const roster = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (wave >= WAVES.tankFromWave && roll < 0.12) roster.push('tank');
    else if (wave >= WAVES.shooterFromWave && roll < 0.35) roster.push('shooter');
    else if (roll < 0.62) roster.push('weaver');
    else roster.push('chaser');
  }
  return roster;
}
