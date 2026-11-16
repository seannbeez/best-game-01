// Neon Rush — best score persistence. localStorage is guarded: in a sandbox
// or private mode it may throw, and the game must never crash for it.
const BEST_KEY = 'neon-rush-best-score';

export function loadBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch (e) { return 0; }
}

export function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch (e) { /* storage unavailable: best score lives only for this session */ }
}
