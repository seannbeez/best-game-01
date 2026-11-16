# Neon Rush

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/seannbeez/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/seannbeez/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Neon Rush** is a polished top-down arcade arena shooter. You pilot a neon ship
through endless waves of enemies — chasers that hunt you, weavers that zigzag,
shooters that fire back, and heavy tanks — blasting them for score, grabbing
power-ups (health, shield, rapid fire, spread shot), and chasing the high score
until your three lives run out.

## How to play

| Control | Action |
|---|---|
| WASD / arrow keys | Move the ship |
| Mouse | Aim |
| Click / Space | Fire |
| P | Pause |
| M | Mute |
| Enter | Start (title screen) |
| R | Restart (game-over screen) |

Survive each wave to earn a wave-clear bonus, then face the next, harder wave.
Your best score is saved in the browser.

## Run it locally

```sh
node serve.ts
```

Then open <http://localhost:8080/game/> in a desktop browser. No build step,
no install, no network: the game is plain static files under `game/`, with
procedural canvas visuals and WebAudio sound effects.

## How it is built

- `game/index.html` — the page and canvas
- `game/src/main.js` — game loop, state machine, collisions, screenshot states
- `game/src/config.js` — every tuning number in one place
- `game/src/player.js` — the ship: movement, aim, fire, power-up timers
- `game/src/enemies.js` — four enemy behaviours and wave rosters
- `game/src/bullets.js` — player and enemy bullet pools
- `game/src/particles.js` — explosions, trails, floating score text
- `game/src/powerups.js` — power-up drops and pickups
- `game/src/waves.js` — wave flow, spawn queue, intermission
- `game/src/render.js` — arena, HUD, title / pause / game-over screens
- `game/src/audio.js` — procedural WebAudio sound effects
- `game/src/input.js` — keyboard and mouse input
- `game/src/storage.js` — best-score persistence
- `main.ts` — the entry program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json`

Screenshots in `screenshots/` show the real game: the title screen, a wave in
progress with the HUD, a later wave with a power-up, and the game-over screen
with the final score and restart.

<sub>Entered on [make.fun](https://make.fun/?ref=ebv85brk&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
