// Neon Rush — the game itself: state machine, fixed-step-ish loop, collisions,
// scoring, and the demo hook that sets up exact states for screenshots
// (?demo=title | play | wave | gameover). No network, no assets, no build step.
import { ARENA, PLAYER, POWERUPS } from './config.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { Player } from './player.js';
import { Enemy, edgeSpawn } from './enemies.js';
import { Bullets } from './bullets.js';
import { Particles } from './particles.js';
import { PowerUps, POWERUP_KINDS } from './powerups.js';
import { Waves } from './waves.js';
import { render } from './render.js';
import { loadBest, saveBest } from './storage.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

class Game {
  constructor() {
    this.input = new Input(canvas);
    this.sfx = new SoundFX();
    this.player = new Player(ARENA.width / 2, ARENA.height / 2 + 80);
    this.bullets = new Bullets();
    this.particles = new Particles();
    this.powerups = new PowerUps();
    this.waves = new Waves(ARENA);
    this.enemies = [];
    this.state = 'title'; // title | play | paused | over
    this.score = 0;
    this.kills = 0;
    this.best = loadBest();
    this.time = 0;
    this.shake = 0;
    this.titleButton = null;
    this.overButton = null;
    this.frozen = false; // demo hook: freeze updates, keep rendering
    this.last = performance.now();
    this._wireAudioUnlock();
    this._titleSwarm();
    this._applyDemo();
    requestAnimationFrame((t) => this.loop(t));
  }

  // Audio may only start after a user gesture.
  _wireAudioUnlock() {
    const unlock = () => { this.sfx.unlock(); this.sfx.resume(); };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
  }

  // A few enemies drift behind the title screen so it feels alive.
  _titleSwarm() {
    const spots = [
      ['chaser', 200, 620], ['weaver', 1080, 620], ['shooter', 1080, 180],
      ['weaver', 220, 180], ['chaser', 640, 640],
    ];
    for (const [type, x, y] of spots) {
      const e = new Enemy(type, x, y, 1);
      e.speed = 24;
      this.enemies.push(e);
    }
  }

  startRun() {
    this.score = 0;
    this.kills = 0;
    this.shake = 0;
    this.enemies = [];
    this.bullets.clear();
    this.particles.clear();
    this.powerups.clear();
    this.player.reset(ARENA.width / 2, ARENA.height / 2 + 80);
    this.waves.startRun();
    this.state = 'play';
    this.sfx.click();
  }

  endRun() {
    this.state = 'over';
    if (this.score > this.best) {
      this.best = this.score;
      saveBest(this.score);
    }
    this.sfx.gameOver();
  }

  // --- demo hook for screenshots: ?demo=title|play|wave|gameover ---
  // Sets up an exact, readable state and freezes it so the capture is stable.
  _applyDemo() {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    if (!demo) return;
    if (demo === 'title') {
      this.state = 'title';
      this.frozen = true;
    } else if (demo === 'play') {
      this.startRun();
      this.score = 1250;
      this.kills = 9;
      this.waves.wave = 1;
      this.waves.active = true;
      this.waves.intermission = 0;
      this.waves.queue = ['chaser', 'weaver', 'shooter'];
      const spots = [
        ['chaser', 900, 260], ['weaver', 1050, 480], ['shooter', 300, 220],
        ['chaser', 980, 620], ['weaver', 420, 560],
      ];
      for (const [type, x, y] of spots) this.enemies.push(new Enemy(type, x, y, 1));
      // Bullets already in flight, mid-action.
      this.bullets.firePlayer(this.player.x + 30, this.player.y - 10, -0.9, PLAYER.bulletSpeed, 1);
      this.bullets.firePlayer(this.player.x + 30, this.player.y + 6, -0.6, PLAYER.bulletSpeed, 1);
      this.particles.burst(880, 300, '#ff2d78', 14, 200);
      this.frozen = true;
    } else if (demo === 'wave') {
      this.startRun();
      this.score = 8450;
      this.kills = 47;
      this.waves.wave = 5;
      this.waves.active = true;
      this.waves.intermission = 0;
      this.waves.queue = ['tank', 'shooter', 'weaver', 'chaser'];
      this.player.health = 65;
      this.player.spread = 6;
      const spots = [
        ['tank', 950, 300], ['shooter', 1060, 520], ['weaver', 820, 180],
        ['chaser', 1100, 380], ['weaver', 340, 640], ['tank', 260, 260],
        ['chaser', 560, 200], ['shooter', 700, 660],
      ];
      for (const [type, x, y] of spots) this.enemies.push(new Enemy(type, x, y, 5));
      this.bullets.firePlayer(this.player.x + 30, this.player.y - 10, -1.1, PLAYER.bulletSpeed, 1);
      this.bullets.firePlayer(this.player.x + 30, this.player.y, -0.8, PLAYER.bulletSpeed, 1);
      this.bullets.firePlayer(this.player.x + 30, this.player.y + 10, -0.5, PLAYER.bulletSpeed, 1);
      this.bullets.fireEnemy(1060, 520, 2.6, 260, 10);
      this.powerups.list.push({ x: 760, y: 420, kind: 'health', radius: 14, life: 9, phase: 0 });
      this.particles.burst(950, 300, '#ff3b30', 16, 220);
      this.frozen = true;
    } else if (demo === 'gameover') {
      this.startRun();
      this.score = 12350;
      this.kills = 86;
      this.best = 15200;
      this.waves.wave = 7;
      this.waves.active = true;
      this.waves.intermission = 0;
      this.waves.queue = ['chaser', 'weaver'];
      this.player.lives = 0;
      this.player.health = 0;
      // The swarm that got the player is still out there, behind the overlay.
      this.enemies.push(new Enemy('chaser', 300, 220, 7));
      this.enemies.push(new Enemy('weaver', 980, 560, 7));
      this.enemies.push(new Enemy('shooter', 1020, 240, 7));
      this.state = 'over';
      this.frozen = true;
    }
  }

  _inButton(btn) {
    if (!btn) return false;
    const { mouseX, mouseY } = this.input;
    return mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h;
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.frozen) this.update(dt);
    render(ctx, this);
    this.input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 26);

    // Global keys.
    if (this.input.wasPressed('m')) {
      const muted = this.sfx.toggleMute();
      void muted;
    }

    if (this.state === 'title') {
      // Title swarm drifts slowly.
      for (const e of this.enemies) {
        e.x += Math.cos(e.phase) * 12 * dt;
        e.y += Math.sin(e.phase * 0.7) * 12 * dt;
        e.phase += dt * 0.5;
      }
      if (this.input.wasPressed('enter') || (this.input.wasClicked() && this._inButton(this.titleButton))) {
        this.startRun();
      }
      return;
    }

    if (this.state === 'over') {
      if (this.input.wasPressed('r') || (this.input.wasClicked() && this._inButton(this.overButton))) {
        this.startRun();
      }
      return;
    }

    if (this.state === 'paused') {
      if (this.input.wasPressed('p') || this.input.wasPressed('escape')) this.state = 'play';
      return;
    }

    // --- state: play ---
    if (this.input.wasPressed('p') || this.input.wasPressed('escape')) {
      this.state = 'paused';
      return;
    }

    this.player.update(dt, this.input, ARENA);
    if (this.player.thrusting) {
      const back = this.player.angle + Math.PI;
      this.particles.trail(
        this.player.x + Math.cos(back) * 14,
        this.player.y + Math.sin(back) * 14,
        '#00f0ff',
      );
    }
    if (this.player.wantsFire(this.input)) {
      for (const a of this.player.shotAngles()) {
        const nx = this.player.x + Math.cos(a) * 20;
        const ny = this.player.y + Math.sin(a) * 20;
        this.bullets.firePlayer(nx, ny, a, PLAYER.bulletSpeed, PLAYER.bulletDamage);
      }
      this.sfx.shoot();
    }

    const waveEvent = this.waves.update(dt, this.player, this.enemies);
    if (waveEvent === 'wave-started') this.sfx.waveStart();
    for (const e of this.enemies) e.update(dt, this.player, this.bullets, this.sfx);
    this.bullets.update(dt, ARENA.width, ARENA.height);
    this.powerups.update(dt);
    this.particles.update(dt);

    this._collidePlayerBullets();
    this._collideEnemyBullets();
    this._collideEnemies();
    for (const kind of this.powerups.collect(this.player)) this._applyPowerup(kind);

    if (this.waves.isCleared(this.enemies)) {
      const bonus = this.waves.clearWave();
      this.score += bonus;
      this.particles.scoreText(this.player.x, this.player.y - 40, 'WAVE BONUS +' + bonus, '#ffd166');
      this.sfx.waveClear();
    }
  }

  _collidePlayerBullets() {
    for (let i = this.bullets.player.length - 1; i >= 0; i--) {
      const b = this.bullets.player[i];
      let consumed = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) {
          consumed = true;
          if (e.takeHit(b.damage)) {
            this.score += e.score;
            this.kills += 1;
            this.particles.burst(e.x, e.y, e.color, 20, 280);
            this.particles.scoreText(e.x, e.y, '+' + e.score);
            this.powerups.maybeDrop(e.x, e.y);
            this.enemies.splice(j, 1);
            this.sfx.explosion();
          } else {
            this.particles.burst(b.x, b.y, e.color, 4, 120);
          }
          break;
        }
      }
      if (consumed) this.bullets.player.splice(i, 1);
    }
  }

  _collideEnemyBullets() {
    const p = this.player;
    for (let i = this.bullets.enemy.length - 1; i >= 0; i--) {
      const b = this.bullets.enemy[i];
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.radius + p.radius) {
        this.bullets.enemy.splice(i, 1);
        this._damagePlayer(b.damage, b.x, b.y);
        if (this.state !== 'play') return;
      }
    }
  }

  _collideEnemies() {
    const p = this.player;
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
        // Touching an enemy hurts the player and destroys the enemy.
        this.particles.burst(e.x, e.y, e.color, 16, 240);
        this.enemies.splice(j, 1);
        this._damagePlayer(PLAYER.contactDamage, e.x, e.y);
        if (this.state !== 'play') return;
      }
    }
  }

  _damagePlayer(amount, fromX, fromY) {
    const p = this.player;
    const result = p.takeDamage(amount);
    if (result === 'blocked') return;
    if (result === 'hit') {
      this.shake = 7;
      this.sfx.hit();
      this.particles.burst(p.x, p.y, '#ff5c8a', 10, 180);
    } else if (result === 'dead') {
      this.shake = 12;
      this.sfx.explosion();
      this.particles.burst(p.x, p.y, '#00f0ff', 30, 320);
      // Respawn at the centre once the blast settles; enemies stay away.
      p.x = ARENA.width / 2;
      p.y = ARENA.height / 2 + 80;
      p.vx = 0;
      p.vy = 0;
    } else if (result === 'gameover') {
      this.shake = 12;
      this.sfx.explosion();
      this.particles.burst(p.x, p.y, '#00f0ff', 40, 360);
      this.endRun();
    }
    void fromX;
    void fromY;
  }

  _applyPowerup(kind) {
    const p = this.player;
    const def = POWERUP_KINDS[kind];
    if (kind === 'health') p.heal(POWERUPS.healthAmount);
    else if (kind === 'shield') p.shield = POWERUPS.shieldSeconds;
    else if (kind === 'rapid') p.rapid = POWERUPS.rapidSeconds;
    else if (kind === 'spread') p.spread = POWERUPS.spreadSeconds;
    this.particles.scoreText(p.x, p.y - 30, def.label, def.color);
    this.sfx.powerup();
  }
}

new Game();
