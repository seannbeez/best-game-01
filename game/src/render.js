// Neon Rush — all drawing. The arena background, the HUD, and the title /
// pause / game-over screens. Screens are drawn on the same canvas as the game
// so a screenshot always shows the real game, never a mock-up.
import { COLORS, ARENA, PLAYER } from './config.js';

function drawBackground(ctx, time) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  // Faint perspective grid, slowly drifting for a sense of motion.
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const step = 64;
  const drift = (time * 6) % step;
  ctx.beginPath();
  for (let x = step - drift; x < ARENA.width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ARENA.height);
  }
  for (let y = step - drift; y < ARENA.height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(ARENA.width, y);
  }
  ctx.stroke();
  // Neon arena border.
  ctx.save();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.shadowColor = COLORS.border;
  ctx.shadowBlur = 12;
  ctx.strokeRect(ARENA.margin, ARENA.margin, ARENA.width - 2 * ARENA.margin, ARENA.height - 2 * ARENA.margin);
  ctx.restore();
}

function drawLives(ctx, lives) {
  ctx.save();
  ctx.translate(0, 0);
  for (let i = 0; i < PLAYER.startLives; i++) {
    const x = 84 + i * 26;
    const y = 102;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = i < lives ? COLORS.player : 'rgba(0,240,255,0.18)';
    ctx.shadowColor = COLORS.player;
    ctx.shadowBlur = i < lives ? 8 : 0;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, -6);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawHud(ctx, game) {
  const p = game.player;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  // Score, top left.
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText('SCORE ' + String(game.score).padStart(6, '0'), 48, 52);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('BEST ' + String(Math.max(game.best, game.score)).padStart(6, '0'), 48, 76);
  drawLives(ctx, p.lives);
  // Wave, top centre.
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText('WAVE ' + game.waves.wave, ARENA.width / 2, 52);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '15px "Courier New", monospace';
  const left = game.enemies.length + game.waves.queue.length;
  ctx.fillText(game.waves.betweenWaves ? 'NEXT WAVE INCOMING' : left + ' HOSTILES LEFT', ARENA.width / 2, 76);
  // Health bar, top right.
  const barW = 220;
  const barX = ARENA.width - 48 - barW;
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText('HULL ' + Math.max(0, Math.ceil(p.health)) + '%', ARENA.width - 48, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(barX, 54, barW, 12);
  const hpFrac = Math.max(0, p.health / PLAYER.maxHealth);
  ctx.fillStyle = hpFrac > 0.5 ? '#2eff8a' : hpFrac > 0.25 ? '#ffd166' : '#ff3b30';
  ctx.fillRect(barX, 54, barW * hpFrac, 12);
  // Active power-up timers, under the health bar.
  ctx.font = '14px "Courier New", monospace';
  let line = 0;
  if (p.shield > 0) { ctx.fillStyle = '#78dcff'; ctx.fillText('SHIELD ' + p.shield.toFixed(0) + 's', ARENA.width - 48, 92 + line * 18); line++; }
  if (p.rapid > 0) { ctx.fillStyle = '#ffe14d'; ctx.fillText('RAPID ' + p.rapid.toFixed(0) + 's', ARENA.width - 48, 92 + line * 18); line++; }
  if (p.spread > 0) { ctx.fillStyle = '#ff7ad9'; ctx.fillText('SPREAD ' + p.spread.toFixed(0) + 's', ARENA.width - 48, 92 + line * 18); line++; }
  // Mute hint, bottom right.
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(game.sfx.muted ? 'M — SOUND OFF' : 'M — MUTE · P — PAUSE', ARENA.width - 48, ARENA.height - 44);
  ctx.restore();
}

function drawWaveBanner(ctx, game) {
  if (!game.waves.betweenWaves || game.state !== 'play') return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 44px "Courier New", monospace';
  ctx.shadowColor = COLORS.gold;
  ctx.shadowBlur = 18;
  const next = game.waves.wave + 1;
  ctx.fillText(game.waves.wave === 0 ? 'GET READY' : 'WAVE ' + next + ' INCOMING', ARENA.width / 2, 300);
  ctx.restore();
}

function drawTitle(ctx, game) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 16, 0.55)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 96px "Courier New", monospace';
  ctx.fillText('NEON RUSH', ARENA.width / 2, 250);
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillText('— ARCADE ARENA SHOOTER —', ARENA.width / 2, 300);
  ctx.fillStyle = COLORS.text;
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText('Survive the waves. Blast everything. Chase the high score.', ARENA.width / 2, 360);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '18px "Courier New", monospace';
  ctx.fillText('MOVE  WASD / ARROWS      AIM  MOUSE      FIRE  CLICK / SPACE', ARENA.width / 2, 420);
  ctx.fillText('P  PAUSE      M  MUTE      Grab power-ups: health, shield, rapid, spread', ARENA.width / 2, 452);
  if (game.best > 0) {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText('BEST SCORE  ' + game.best, ARENA.width / 2, 500);
  }
  // Start button (also clickable).
  const bw = 280;
  const bh = 64;
  const bx = ARENA.width / 2 - bw / 2;
  const by = 550;
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#e8fbff';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText('▶  START', ARENA.width / 2, by + 42);
  ctx.restore();
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('or press ENTER', ARENA.width / 2, by + 96);
  ctx.restore();
  game.titleButton = { x: bx, y: by, w: bw, h: bh };
}

function drawGameOver(ctx, game) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 16, 0.62)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff2d78';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ff2d78';
  ctx.font = 'bold 72px "Courier New", monospace';
  ctx.fillText('GAME OVER', ARENA.width / 2, 250);
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.fillText('FINAL SCORE  ' + game.score, ARENA.width / 2, 330);
  ctx.fillStyle = game.score >= game.best && game.score > 0 ? COLORS.gold : COLORS.dimText;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(game.score >= game.best && game.score > 0 ? '★ NEW BEST SCORE ★' : 'BEST SCORE  ' + game.best, ARENA.width / 2, 378);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText('You reached WAVE ' + game.waves.wave + '  ·  ' + game.kills + ' enemies destroyed', ARENA.width / 2, 424);
  const bw = 300;
  const bh = 64;
  const bx = ARENA.width / 2 - bw / 2;
  const by = 500;
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#e8fbff';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText('↻  RESTART', ARENA.width / 2, by + 41);
  ctx.restore();
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('or press R', ARENA.width / 2, by + 96);
  ctx.restore();
  game.overButton = { x: bx, y: by, w: bw, h: bh };
}

function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 5, 16, 0.6)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 56px "Courier New", monospace';
  ctx.fillText('PAUSED', ARENA.width / 2, 380);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText('Press P to resume', ARENA.width / 2, 430);
  ctx.restore();
}

export function render(ctx, game) {
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }
  drawBackground(ctx, game.time);
  if (game.state === 'title') {
    // A quiet demo swarm drifts behind the title so the screen feels alive.
    for (const e of game.enemies) e.draw(ctx);
    drawTitle(ctx, game);
  } else {
    game.powerups.draw(ctx);
    for (const e of game.enemies) e.draw(ctx);
    game.bullets.draw(ctx);
    // The ship is gone once the run is over (it was destroyed).
    if (game.state !== 'over') game.player.draw(ctx);
    game.particles.draw(ctx);
    drawHud(ctx, game);
    drawWaveBanner(ctx, game);
    if (game.state === 'over') drawGameOver(ctx, game);
    if (game.state === 'paused') drawPaused(ctx);
  }
  ctx.restore();
}
