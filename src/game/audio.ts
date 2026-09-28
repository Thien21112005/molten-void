/* Tiny procedural WebAudio synth — no audio assets. */

type OscType = OscillatorType;

class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem("mv_muted") === "1";
    } catch {
      /* ignore */
    }
  }

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem("mv_muted", m ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
  }

  private tone(
    freq: number,
    dur: number,
    type: OscType,
    vol: number,
    delay = 0,
    endFreq?: number,
  ) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), t0);
    if (endFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol: number, fFrom: number, fTo: number, delay = 0, q = 1) {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(fFrom, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, fTo), t0 + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  click() {
    this.tone(640, 0.06, "square", 0.12);
    this.tone(960, 0.05, "square", 0.07, 0.02);
  }

  shoot(power: number) {
    const p = 0.35 + power * 0.65;
    this.noise(0.28, 0.22 * p, 320, 2600, 0, 0.8);
    this.tone(150, 0.2, "sine", 0.14 * p, 0, 420 + power * 260);
  }

  bounce(impact: number) {
    const v = Math.min(0.3, 0.05 + impact * 0.25);
    this.tone(150 + impact * 120, 0.09, "triangle", v, 0, 90);
  }

  thud(impact: number) {
    const v = Math.min(0.28, 0.06 + impact * 0.2);
    this.tone(110, 0.12, "square", v, 0, 60);
    this.noise(0.1, v * 0.6, 500, 120, 0, 0.7);
  }

  shatter(combo: number, gold: boolean) {
    const c = Math.min(combo, 8);
    const base = (gold ? 700 : 520) * Math.pow(1.075, c);
    this.tone(base, 0.16, "square", 0.1);
    this.tone(base * 1.5, 0.14, "square", 0.08, 0.01);
    this.tone(base * 2.02, 0.22, "triangle", 0.1, 0.02);
    this.noise(0.16, 0.16, 2600, 5200, 0, 0.6);
    if (gold) {
      this.tone(base * 1.25, 0.3, "sine", 0.12, 0.06, base * 2.5);
    }
  }

  orbEarned() {
    this.tone(523, 0.09, "triangle", 0.14);
    this.tone(784, 0.1, "triangle", 0.14, 0.08);
    this.tone(1046, 0.16, "triangle", 0.14, 0.16);
  }

  levelClear() {
    const notes = [392, 523, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, 0.14, "triangle", 0.13, i * 0.07));
    this.noise(0.4, 0.08, 1200, 4200, 0.1, 0.5);
  }

  gameOver() {
    const notes = [330, 262, 196, 131];
    notes.forEach((n, i) => this.tone(n, 0.3, "sawtooth", 0.08, i * 0.16, n * 0.82));
    this.noise(0.5, 0.06, 400, 90, 0.1, 0.6);
  }

  chargeTick(p: number) {
    this.tone(300 + p * 500, 0.04, "square", 0.05);
  }

  cancel() {
    this.tone(220, 0.08, "sine", 0.07, 0, 140);
  }
}

export const sfx = new Sfx();
