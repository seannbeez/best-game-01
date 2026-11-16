// Neon Rush — procedural sound effects. Every sound is synthesised with WebAudio,
// so the game ships no audio files and makes no network request. All calls are
// guarded: a suspended or missing AudioContext never throws into the game loop.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.unlocked = false;
  }

  // Browsers require a user gesture before audio may start. Call on the first
  // pointer or key event; until then every play() is a silent no-op.
  unlock() {
    if (this.unlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
      this.unlocked = true;
    } catch (e) { /* audio unavailable: the game plays silent */ }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _tone(freq, dur, type, vol, slideTo) {
    if (!this.unlocked || this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { /* ignore */ }
  }

  _noise(dur, vol, lowpass) {
    if (!this.unlocked || this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = lowpass;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      src.start(t0);
    } catch (e) { /* ignore */ }
  }

  shoot()      { this._tone(880, 0.08, 'square', 0.12, 220); }
  enemyShoot() { this._tone(320, 0.12, 'sawtooth', 0.07, 160); }
  explosion()  { this._noise(0.28, 0.5, 900); this._tone(160, 0.25, 'sine', 0.3, 40); }
  hit()        { this._tone(200, 0.12, 'sawtooth', 0.2, 90); }
  powerup()    { this._tone(523, 0.09, 'sine', 0.2); setTimeout(() => this._tone(659, 0.09, 'sine', 0.2), 70); setTimeout(() => this._tone(784, 0.14, 'sine', 0.22), 140); }
  waveStart()  { this._tone(392, 0.15, 'triangle', 0.2); setTimeout(() => this._tone(523, 0.2, 'triangle', 0.2), 120); }
  waveClear()  { this._tone(523, 0.12, 'triangle', 0.2); setTimeout(() => this._tone(659, 0.12, 'triangle', 0.2), 100); setTimeout(() => this._tone(784, 0.2, 'triangle', 0.22), 200); }
  gameOver()   { this._tone(392, 0.3, 'sawtooth', 0.18, 196); setTimeout(() => this._tone(311, 0.3, 'sawtooth', 0.18, 155), 250); setTimeout(() => this._tone(233, 0.6, 'sawtooth', 0.2, 58), 500); }
  click()      { this._tone(660, 0.05, 'sine', 0.15); }
}
