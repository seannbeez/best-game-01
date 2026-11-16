// Neon Rush — tuning constants. One place for every number that shapes the game,
// so balance changes never touch the entities themselves.
export const ARENA = { width: 1280, height: 800, margin: 28 };

export const PLAYER = {
  radius: 14,
  speed: 340,          // px per second
  accel: 2600,         // px per second squared
  friction: 6.0,       // velocity damping per second
  fireCooldown: 0.16,  // seconds between shots
  bulletSpeed: 760,
  bulletDamage: 1,
  maxHealth: 100,
  startLives: 3,
  hitInvulnerable: 1.0, // seconds of mercy after taking a hit
  contactDamage: 15,    // damage from touching an enemy
};

export const ENEMY_TYPES = {
  chaser:  { hp: 2,  speed: 115, radius: 14, score: 100, color: '#ff2d78', name: 'Chaser' },
  weaver:  { hp: 1,  speed: 175, radius: 12, score: 150, color: '#ff9f1c', name: 'Weaver' },
  shooter: { hp: 3,  speed: 85,  radius: 16, score: 200, color: '#b967ff', name: 'Shooter' },
  tank:    { hp: 10, speed: 55,  radius: 24, score: 400, color: '#ff3b30', name: 'Tank' },
};

export const WAVES = {
  baseCount: 6,        // enemies in wave 1
  perWave: 3,          // extra enemies each wave
  tankFromWave: 4,     // tanks appear from this wave on
  shooterFromWave: 2,  // shooters appear from this wave on
  waveClearBonus: 500, // bonus per wave number, times the wave
  intermission: 3.0,   // seconds between waves
  speedPerWave: 6,     // extra enemy speed per wave
};

export const POWERUPS = {
  dropChance: 0.12,    // chance an enemy drops a power-up
  lifetime: 10,        // seconds before a dropped power-up fades
  shieldSeconds: 5,
  rapidSeconds: 8,
  spreadSeconds: 8,
  healthAmount: 30,
};

export const COLORS = {
  background: '#050510',
  grid: 'rgba(0, 255, 255, 0.07)',
  border: '#00f0ff',
  player: '#00f0ff',
  playerBullet: '#aefcff',
  enemyBullet: '#ff5c8a',
  text: '#e8fbff',
  dimText: '#7fb8c9',
  gold: '#ffd166',
};

export const POINTS = { kill: 0 }; // per-type score lives on ENEMY_TYPES
