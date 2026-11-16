// Neon Rush — wave manager. A wave is a roster of enemies spawned a few at a
// time; clearing it pays a bonus and opens a short intermission before the next
// wave starts, harder than the last.
import { waveRoster, Enemy, edgeSpawn } from './enemies.js';
import { WAVES } from './config.js';

export class Waves {
  constructor(arena) {
    this.arena = arena;
    this.wave = 0;
    this.queue = [];       // types waiting to spawn
    this.spawnTimer = 0;
    this.intermission = 0; // >0 while between waves
    this.active = false;
  }

  startRun() {
    this.wave = 0;
    this.queue = [];
    this.active = false;
    this.intermission = 1.2; // brief beat before wave 1
  }

  startNextWave() {
    this.wave += 1;
    this.queue = waveRoster(this.wave);
    this.spawnTimer = 0;
    this.intermission = 0;
    this.active = true;
    return this.wave;
  }

  // Spawn from the queue while the wave is running. Returns 'wave-started'
  // on the frame a new wave begins (so the game can play its sting).
  update(dt, player, enemies) {
    if (this.intermission > 0) {
      this.intermission -= dt;
      if (this.intermission <= 0 && !this.active) {
        this.startNextWave();
        return 'wave-started';
      }
      return null;
    }
    if (!this.active) return null;
    if (this.queue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = 0.55;
        const type = this.queue.shift();
        const pos = edgeSpawn(this.arena, player);
        enemies.push(new Enemy(type, pos.x, pos.y, this.wave));
      }
    }
    return null;
  }

  // True when the wave is over: nothing left to spawn and nothing alive.
  isCleared(enemies) {
    return this.active && this.queue.length === 0 && enemies.length === 0;
  }

  // Pay the clear bonus and open the intermission before the next wave.
  clearWave() {
    this.active = false;
    this.intermission = WAVES.intermission;
    return WAVES.waveClearBonus * this.wave;
  }

  get betweenWaves() { return this.intermission > 0; }
}
