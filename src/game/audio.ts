/* Procedural WebAudio Synth & Epic Cosmic BGM Engine — 100% code-generated, zero audio assets. */

type OscType = OscillatorType;

export type MusicMode = "ambient" | "battle" | "off";

// Chord definitions in Hz for 8-bar Dark Heroic progression (D minor root)
interface ChordHarmonics {
  root: number;      // Deep bass
  pad: number[];     // Triad chord frequencies
  arp: number[];     // High arpeggio notes
}

const D_MINOR_PROGRESSION: ChordHarmonics[] = [
  // Bar 1: Dm (D2=73.42, Pad: D3=146.83, F3=174.61, A3=220, Arp: D4..D5)
  { root: 73.42, pad: [146.83, 174.61, 220.0], arp: [293.66, 349.23, 440.0, 587.33] },
  // Bar 2: Dm
  { root: 73.42, pad: [146.83, 174.61, 220.0], arp: [349.23, 440.0, 587.33, 523.25] },
  // Bar 3: Bb (Bb1=58.27, Pad: Bb2=116.54, D3=146.83, F3=174.61)
  { root: 58.27, pad: [116.54, 146.83, 174.61], arp: [233.08, 293.66, 349.23, 466.16] },
  // Bar 4: Bb
  { root: 58.27, pad: [116.54, 146.83, 174.61], arp: [293.66, 349.23, 466.16, 587.33] },
  // Bar 5: Gm (G1=49.0, Pad: G2=98.0, Bb2=116.54, D3=146.83)
  { root: 49.00, pad: [98.00, 116.54, 146.83], arp: [196.00, 233.08, 293.66, 392.00] },
  // Bar 6: F (F1=43.65, Pad: F2=87.31, A2=110.0, C3=130.81)
  { root: 87.31, pad: [174.61, 220.00, 261.63], arp: [261.63, 329.63, 392.00, 523.25] },
  // Bar 7: C (C2=65.41, Pad: C3=130.81, E3=164.81, G3=196.0)
  { root: 65.41, pad: [130.81, 164.81, 196.00], arp: [261.63, 329.63, 392.00, 523.25] },
  // Bar 8: A7 (A1=55.0, Pad: A2=110.0, C#3=138.59, E3=164.81)
  { root: 55.00, pad: [110.00, 138.59, 164.81], arp: [220.00, 277.18, 329.63, 440.00] },
];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;

  // Volume channels (0.0 to 1.0)
  muted = false;
  sfxVolume = 0.8;
  musicVolume = 0.6;

  // Music sequencer state
  private musicMode: MusicMode = "ambient";
  private isSequencerRunning = false;
  private timerId: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0; // 0 to 127 (16 steps * 8 bars)
  private readonly secondsPerStep = 60 / (122 * 4); // 16th note ~0.123s at 122 BPM
  private readonly scheduleLookahead = 0.15; // Schedule 150ms ahead

  constructor() {
    try {
      this.muted = localStorage.getItem("mv_muted") === "1";
      const savedSfx = localStorage.getItem("mv_sfx_vol");
      if (savedSfx !== null) this.sfxVolume = Math.max(0, Math.min(1, parseFloat(savedSfx)));
      const savedMusic = localStorage.getItem("mv_music_vol");
      if (savedMusic !== null) this.musicVolume = Math.max(0, Math.min(1, parseFloat(savedMusic)));
    } catch {
      /* ignore storage errors */
    }
  }

  /** Initialize or resume WebAudio context on user interaction */
  ensure() {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;

      this.ctx = new AC();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1.0;
      this.masterGain.connect(this.ctx.destination);

      // Separate SFX channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume * 0.75;
      this.sfxGain.connect(this.masterGain);

      // Separate BGM channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume * 0.42;
      this.musicGain.connect(this.masterGain);

      // Noise buffer for percussion and energy whooshes
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      // Start music sequencer clock
      this.startMusicSequencer();
    }

    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  /* ================= VOLUME & CHANNELS ================= */

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem("mv_muted", m ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 1.0, this.ctx.currentTime, 0.02);
    }
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("mv_sfx_vol", this.sfxVolume.toString());
    } catch {
      /* ignore */
    }
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume * 0.75, this.ctx.currentTime, 0.02);
    }
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("mv_music_vol", this.musicVolume.toString());
    } catch {
      /* ignore */
    }
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.42, this.ctx.currentTime, 0.02);
    }
  }

  setMusicMode(mode: MusicMode) {
    this.musicMode = mode;
  }

  /* ================= PROCEDURAL MUSIC SEQUENCER ================= */

  private startMusicSequencer() {
    if (this.isSequencerRunning || !this.ctx) return;
    this.isSequencerRunning = true;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.currentStep = 0;

    const intervalMs = 35;
    this.timerId = window.setInterval(() => {
      this.onSequencerTick();
    }, intervalMs);
  }

  stopMusicSequencer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isSequencerRunning = false;
  }

  destroy() {
    this.stopMusicSequencer();
    if (this.ctx && this.ctx.state !== "closed") {
      void this.ctx.close();
    }
  }

  private onSequencerTick() {
    if (!this.ctx || !this.isSequencerRunning || this.musicMode === "off") return;

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleLookahead) {
      this.scheduleMusicStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 128; // 8 bars * 16 steps
    }
  }

  private scheduleMusicStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    const bar = Math.floor(step / 16) % 8;
    const stepInBar = step % 16;
    const chord = D_MINOR_PROGRESSION[bar];
    const isBattle = this.musicMode === "battle";

    // 1. Cinematic Atmosphere Pad (Trig on beat 0 of each bar)
    if (stepInBar === 0) {
      this.playPadChord(chord.pad, time, 1.9, isBattle ? 0.09 : 0.14);
    }

    // 2. Cosmic Sub Bass Pulse
    if (isBattle) {
      // Driving 8th note bassline (every even step)
      if (stepInBar % 2 === 0) {
        const isAccent = stepInBar === 0 || stepInBar === 6 || stepInBar === 10;
        this.playCyberBass(chord.root, time, isAccent ? 0.16 : 0.10);
      }
    } else {
      // Ambient Mode: slow deep drone on beat 0 and beat 8
      if (stepInBar === 0 || stepInBar === 8) {
        this.playCyberBass(chord.root, time, 0.08, 0.45);
      }
    }

    // 3. Percussion / Heartbeat Kick & Cosmic Noise Hats
    if (isBattle) {
      // Epic battle kick on beats 1 and 3 (step 0 and 8), plus syncopation on step 12
      if (stepInBar === 0 || stepInBar === 8 || stepInBar === 12) {
        this.playHeartbeatKick(time, stepInBar === 0 ? 0.32 : 0.24);
      }

      // Space Shaker / Hi-Hat on 16th notes (off-beats)
      if (stepInBar % 2 === 1) {
        this.playCosmicHiHat(time, stepInBar === 7 || stepInBar === 15 ? 0.08 : 0.04);
      }
    }

    // 4. Stardust Arpeggio Chimes
    if (isBattle) {
      // Rhythmic sparkling arpeggios on every 16th note
      const noteIdx = (stepInBar + bar * 2) % chord.arp.length;
      const freq = chord.arp[noteIdx];
      this.playArpNote(freq, time, 0.05);
    } else {
      // Ambient mode: gentle chime every 4 steps
      if (stepInBar % 4 === 0) {
        const noteIdx = (stepInBar / 4) % chord.arp.length;
        this.playArpNote(chord.arp[noteIdx], time, 0.035, 0.35);
      }
    }
  }

  private playCyberBass(freq: number, time: number, vol: number, dur = 0.14) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(380, time);
    filter.frequency.exponentialRampToValueAtTime(110, time + dur);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter).connect(gain).connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  private playPadChord(notes: number[], time: number, dur: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, time);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(550, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter).connect(gain).connect(this.musicGain!);
      osc.start(time);
      osc.stop(time + dur + 0.05);
    });
  }

  private playHeartbeatKick(time: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.16);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    osc.connect(gain).connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playCosmicHiHat(time: number, vol: number) {
    if (!this.ctx || !this.musicGain || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    src.connect(filter).connect(gain).connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.05);
  }

  private playArpNote(freq: number, time: number, vol: number, dur = 0.12) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain).connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  /* ================= SOUND EFFECTS (SFX) ================= */

  private tone(
    freq: number,
    dur: number,
    type: OscType,
    vol: number,
    delay = 0,
    endFreq?: number,
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), t0);
    if (endFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol: number, fFrom: number, fTo: number, delay = 0, q = 1) {
    if (!this.ctx || !this.sfxGain || !this.noiseBuf) return;
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
    src.connect(f).connect(g).connect(this.sfxGain);
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

export const sfx = new SoundEngine();
export const audio = sfx;
