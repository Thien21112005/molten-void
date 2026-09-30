/* Procedural WebAudio Synth & Epic Cosmic BGM Engine — 100% code-generated, zero audio assets. */

type OscType = OscillatorType;

export type MusicMode = "menu" | "battle" | "roadmap" | "paused" | "off" | "ambient";
export type MenuTrack = "odyssey" | "cyber";
export type MusicTrack = "odyssey" | "cyber" | "armageddon" | "synth";
export type TrackPreviewId = "armageddon" | "cyber" | "odyssey";

function getAudioUrl(filename: string): string {
  const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
  const base = meta?.env?.BASE_URL || "./";
  const cleanBase = base.endsWith("/") ? base : base + "/";
  return `${cleanBase}audio/${filename}`;
}

// Chord definitions in Hz for procedural synth engines
interface ChordHarmonics {
  root: number;      // Deep bass
  pad: number[];     // Triad chord frequencies
  arp: number[];     // High arpeggio notes
}

// THEME 1: COSMIC ODYSSEY — Floating, Dreamy, Deep Space Lydian Ambient (Fmaj7 -> G -> Em7 -> Am7...)
const COSMIC_ODYSSEY_PROGRESSION: ChordHarmonics[] = [
  // Bar 1: Fmaj7 (F2=87.31, Pad: F3, A3, C4, Arp: E4..C5)
  { root: 87.31, pad: [174.61, 220.0, 261.63], arp: [329.63, 392.0, 440.0, 523.25] },
  // Bar 2: G (G2=98.0, Pad: G3, B3, D4, Arp: D4..D5)
  { root: 98.00, pad: [196.0, 246.94, 293.66], arp: [293.66, 392.0, 493.88, 587.33] },
  // Bar 3: Em7 (E2=82.41, Pad: E3, G3, B3, Arp: E4..E5)
  { root: 82.41, pad: [164.81, 196.0, 246.94], arp: [329.63, 392.0, 493.88, 659.25] },
  // Bar 4: Am7 (A1=55.0, Pad: A3, C4, E4, Arp: C4..C5)
  { root: 55.00, pad: [220.0, 261.63, 329.63], arp: [261.63, 329.63, 440.0, 523.25] },
  // Bar 5: Dm7 (D2=73.42, Pad: D3, F3, A3, Arp: F4..D5)
  { root: 73.42, pad: [146.83, 174.61, 220.0], arp: [349.23, 440.0, 523.25, 587.33] },
  // Bar 6: G7 (G2=98.0, Pad: G3, B3, F4, Arp: D4..B4)
  { root: 98.00, pad: [196.0, 246.94, 349.23], arp: [293.66, 349.23, 392.0, 493.88] },
  // Bar 7: Cmaj7 (C2=65.41, Pad: C3, E3, G3, Arp: E4..C5)
  { root: 65.41, pad: [130.81, 164.81, 196.0], arp: [329.63, 392.0, 493.88, 523.25] },
  // Bar 8: A7 (A1=55.0, Pad: A3, C#4, E4, Arp: E4..C#5)
  { root: 55.00, pad: [220.0, 277.18, 329.63], arp: [329.63, 392.0, 440.0, 554.37] },
];

// THEME 2: CYBER PULSE — 118 BPM Driving Retro Synthwave in D Minor (Dm -> F -> C -> Bb -> Dm -> Gm -> Bb -> C)
const CYBER_PULSE_PROGRESSION: ChordHarmonics[] = [
  // Bar 1: Dm
  { root: 73.42, pad: [146.83, 174.61, 220.0], arp: [293.66, 349.23, 440.0, 587.33] },
  // Bar 2: F
  { root: 87.31, pad: [174.61, 220.0, 261.63], arp: [349.23, 440.0, 523.25, 698.46] },
  // Bar 3: C
  { root: 65.41, pad: [130.81, 164.81, 196.0], arp: [261.63, 329.63, 392.0, 523.25] },
  // Bar 4: Bb
  { root: 58.27, pad: [116.54, 146.83, 174.61], arp: [233.08, 293.66, 349.23, 466.16] },
  // Bar 5: Dm
  { root: 73.42, pad: [146.83, 174.61, 220.0], arp: [440.0, 349.23, 293.66, 220.0] },
  // Bar 6: Gm
  { root: 49.00, pad: [98.0, 116.54, 146.83], arp: [196.0, 233.08, 293.66, 392.0] },
  // Bar 7: Bb
  { root: 58.27, pad: [116.54, 146.83, 174.61], arp: [349.23, 293.66, 233.08, 293.66] },
  // Bar 8: C
  { root: 65.41, pad: [130.81, 164.81, 196.0], arp: [329.63, 392.0, 523.25, 659.25] },
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
  menuTrack: MenuTrack = "odyssey";
  musicTrack: MusicTrack = "odyssey";

  // Native HTML5 background audio (Armageddon - Alibi Music)
  private bgmAudio: HTMLAudioElement | null = null;
  private previewTimer: number | null = null;
  activePreview: TrackPreviewId | null = null;

  // Music sequencer state
  private musicMode: MusicMode = "menu";
  private isSequencerRunning = false;
  private timerId: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0; // 0 to 127 (16 steps * 8 bars)
  private readonly secondsPerStep = 60 / (118 * 4); // 16th note ~0.127s at 118 BPM
  private readonly scheduleLookahead = 0.15; // Schedule 150ms ahead

  constructor() {
    try {
      this.muted = localStorage.getItem("mv_muted") === "1";
      const savedSfx = localStorage.getItem("mv_sfx_vol");
      if (savedSfx !== null) this.sfxVolume = Math.max(0, Math.min(1, parseFloat(savedSfx)));
      const savedMusic = localStorage.getItem("mv_music_vol");
      if (savedMusic !== null) this.musicVolume = Math.max(0, Math.min(1, parseFloat(savedMusic)));
      const savedTheme = localStorage.getItem("mv_menu_track") as MenuTrack | null;
      if (savedTheme === "odyssey" || savedTheme === "cyber") {
        this.menuTrack = savedTheme;
        this.musicTrack = savedTheme;
      }
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
      if (AC) {
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

        // Start music sequencer clock for procedural synth
        this.startMusicSequencer();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    // Trigger BGM track playback
    this.updateMusicPlayback();
  }

  private muteListeners: Set<(muted: boolean) => void> = new Set();

  onMuteChange(listener: (muted: boolean) => void): () => void {
    this.muteListeners.add(listener);
    return () => {
      this.muteListeners.delete(listener);
    };
  }

  /* ================= VOLUME & CHANNELS ================= */

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem("mv_muted", m ? "1" : "0");
      // Keep mv_settings_v1 in sync so settings never has stale muted state
      const raw = localStorage.getItem("mv_settings_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.muted = m;
        localStorage.setItem("mv_settings_v1", JSON.stringify(parsed));
      }
    } catch {
      /* ignore */
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 1.0, this.ctx.currentTime, 0.02);
    }
    if (this.bgmAudio) {
      this.bgmAudio.muted = m;
    }
    this.updateMusicPlayback();
    this.muteListeners.forEach((fn) => {
      try {
        fn(m);
      } catch {
        /* ignore */
      }
    });
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
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.getCalculatedBgmVolume();
    }
    this.updateMusicPlayback();
  }

  setMusicTrack(track: MusicTrack) {
    this.musicTrack = track;
    if (track === "odyssey" || track === "cyber") {
      this.menuTrack = track;
    }
    try {
      localStorage.setItem("mv_menu_track", track);
    } catch {
      /* ignore */
    }
    this.updateMusicPlayback();
  }

  setMusicMode(mode: MusicMode) {
    const prev = this.musicMode;
    this.musicMode = mode === "ambient" ? "menu" : mode;

    // Stop any active preview when navigating
    if (this.activePreview) {
      this.stopPreview();
    }

    // Rewind Armageddon if entering menu from another mode
    if (this.musicMode === "menu" && prev !== "menu" && this.bgmAudio) {
      try {
        this.bgmAudio.currentTime = 0;
      } catch {
        /* ignore */
      }
    }

    // Reset sequencer clock for battle or roadmap
    if ((this.musicMode === "battle" || this.musicMode === "roadmap") && this.ctx) {
      this.currentStep = 0;
      this.nextStepTime = this.ctx.currentTime + 0.03;
    }

    this.updateMusicPlayback();
  }

  // Previews any of the 3 soundtracks inside Settings Modal
  previewTrack(trackId: TrackPreviewId, onStateChange?: (active: TrackPreviewId | null) => void) {
    this.ensure();

    if (this.activePreview === trackId) {
      this.stopPreview(onStateChange);
      return;
    }

    this.stopPreview();
    this.activePreview = trackId;
    onStateChange?.(trackId);

    if (trackId === "armageddon") {
      this.initBgmAudio();
      if (this.bgmAudio) {
        try {
          this.bgmAudio.currentTime = 0;
          this.bgmAudio.volume = Math.max(0, Math.min(1, this.musicVolume * 0.75));
          this.bgmAudio.muted = this.muted;
          void this.bgmAudio.play().catch(() => {});
        } catch {
          /* ignore */
        }
      }
    } else {
      if (this.bgmAudio && !this.bgmAudio.paused) {
        this.bgmAudio.pause();
      }
      this.currentStep = 0;
      if (this.ctx) {
        this.nextStepTime = this.ctx.currentTime + 0.02;
      }
    }

    if (this.previewTimer !== null) {
      window.clearTimeout(this.previewTimer);
    }
    this.previewTimer = window.setTimeout(() => {
      this.stopPreview(onStateChange);
    }, 8500);
  }

  stopPreview(onStateChange?: (active: TrackPreviewId | null) => void) {
    this.activePreview = null;
    onStateChange?.(null);
    if (this.previewTimer !== null) {
      window.clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    if (this.bgmAudio && (this.musicMode !== "menu" && this.musicMode !== "ambient")) {
      this.bgmAudio.pause();
      try {
        this.bgmAudio.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    this.updateMusicPlayback();
  }

  /* ================= NATIVE BGM TRACK MANAGEMENT ================= */

  private initBgmAudio() {
    if (this.bgmAudio || typeof document === "undefined") return;

    const audioEl = document.createElement("audio");
    audioEl.loop = true;
    audioEl.preload = "auto";

    // Detect browser opus/webm support; fallback to AAC/m4a
    const canPlayWebm = audioEl.canPlayType && audioEl.canPlayType("audio/webm; codecs=opus").replace(/no/, "");
    const primaryFile = canPlayWebm ? "bgm-armageddon.webm" : "bgm-armageddon.m4a";
    const fallbackFile = canPlayWebm ? "bgm-armageddon.m4a" : "bgm-armageddon.webm";

    audioEl.src = getAudioUrl(primaryFile);

    audioEl.addEventListener("error", () => {
      if (!audioEl.src.endsWith(fallbackFile)) {
        audioEl.src = getAudioUrl(fallbackFile);
        const shouldPlay =
          this.activePreview === "armageddon" ||
          (!this.activePreview && (this.musicMode === "menu" || this.musicMode === "ambient"));
        if (shouldPlay && !this.muted) {
          void audioEl.play().catch(() => {});
        }
      }
    });

    audioEl.volume = this.getCalculatedBgmVolume();
    audioEl.muted = this.muted;
    this.bgmAudio = audioEl;
  }

  private getCalculatedBgmVolume(): number {
    if (this.muted) return 0;
    const isPlayingArmageddon =
      this.activePreview === "armageddon" ||
      (!this.activePreview && (this.musicMode === "menu" || this.musicMode === "ambient"));
    if (!isPlayingArmageddon) return 0;
    // Epic battle intensity: 75%
    return Math.max(0, Math.min(1, this.musicVolume * 0.75));
  }

  updateMusicPlayback() {
    this.initBgmAudio();

    // 1. If muted or volume 0, silence
    if (this.muted || this.musicVolume <= 0.001) {
      if (this.bgmAudio && !this.bgmAudio.paused && !this.activePreview) {
        this.bgmAudio.pause();
      }
      return;
    }

    // 2. Armageddon plays for Main Menu BGM or active Armageddon preview
    const isPlayingArmageddon =
      this.activePreview === "armageddon" ||
      (!this.activePreview && (this.musicMode === "menu" || this.musicMode === "ambient"));

    if (isPlayingArmageddon) {
      if (this.bgmAudio) {
        this.bgmAudio.muted = false;
        this.bgmAudio.volume = this.getCalculatedBgmVolume();
        if (this.bgmAudio.paused) {
          const p = this.bgmAudio.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
        }
      }
    } else {
      if (this.bgmAudio && !this.bgmAudio.paused) {
        this.bgmAudio.pause();
      }
    }
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
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
    if (this.ctx && this.ctx.state !== "closed") {
      void this.ctx.close();
    }
  }

  private onSequencerTick() {
    // When muted, volume 0, or inactive, silence the sequencer
    if (
      !this.ctx ||
      !this.isSequencerRunning ||
      this.muted ||
      this.musicVolume <= 0.001
    ) {
      return;
    }

    // If Armageddon is playing (Menu mode or Armageddon preview), sequencer is silent
    const isArmageddonActive =
      this.activePreview === "armageddon" ||
      (!this.activePreview && (this.musicMode === "menu" || this.musicMode === "ambient"));

    if (isArmageddonActive) {
      return;
    }

    // In paused or off mode without preview, sequencer is silent
    if (!this.activePreview && (this.musicMode === "paused" || this.musicMode === "off")) {
      return;
    }

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleLookahead) {
      this.scheduleMusicStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 128; // 8 bars * 16 steps
    }
  }

  private scheduleMusicStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    let theme: "cyber" | "odyssey" | null = null;

    if (this.activePreview === "cyber") {
      theme = "cyber";
    } else if (this.activePreview === "odyssey") {
      theme = "odyssey";
    } else if (!this.activePreview) {
      if (this.musicMode === "battle") {
        theme = "cyber"; // Battle is Cyber Pulse!
      } else if (this.musicMode === "roadmap") {
        theme = "odyssey"; // Roadmap is Cosmic Odyssey!
      }
    }

    if (!theme) return;

    const bar = Math.floor(step / 16) % 8;
    const stepInBar = step % 16;

    if (theme === "odyssey") {
      // THEME: COSMIC ODYSSEY (Lush, Floating, Deep Space Ambient for Roadmap)
      const chord = COSMIC_ODYSSEY_PROGRESSION[bar];
      if (stepInBar === 0) {
        this.playPadChord(chord.pad, time, 2.2, 0.16);
      }
      if (stepInBar === 0 || stepInBar === 8) {
        this.playCyberBass(chord.root, time, 0.08, 0.45);
      }
      if (stepInBar % 4 === 0) {
        const noteIdx = (stepInBar / 4 + bar) % chord.arp.length;
        this.playArpNote(chord.arp[noteIdx], time, 0.045, 0.35);
      }
      return;
    }

    if (theme === "cyber") {
      // THEME: CYBER PULSE (118 BPM Punchy Retro Synthwave Groove for Battle)
      const chord = CYBER_PULSE_PROGRESSION[bar];
      if (stepInBar === 0) {
        this.playPadChord(chord.pad, time, 1.4, 0.12);
      }
      if (stepInBar % 2 === 0) {
        const isAccent = stepInBar === 0 || stepInBar === 6 || stepInBar === 10;
        this.playCyberBass(chord.root, time, isAccent ? 0.18 : 0.12, 0.11);
      }
      if (stepInBar === 0 || stepInBar === 8 || stepInBar === 12) {
        this.playHeartbeatKick(time, stepInBar === 0 ? 0.28 : 0.2);
      }
      if (stepInBar % 2 === 1) {
        this.playCosmicHiHat(time, stepInBar === 7 || stepInBar === 15 ? 0.07 : 0.035);
      }
      const noteIdx = (stepInBar + bar * 2) % chord.arp.length;
      this.playArpNote(chord.arp[noteIdx], time, 0.045, 0.10);
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
    // Melodic Major Pentatonic Scale: C5, D5, E5, G5, A5, C6, D6, E6, G6, A6
    const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
    const index = Math.min(Math.max(0, combo - 1), PENTATONIC.length - 1);
    const baseFreq = PENTATONIC[index] * (gold ? 1.25 : 1.0); // Transpose gold crystal to bright harmonic

    // Pure crystal bell fundamental & harmonics
    this.tone(baseFreq, 0.22, "sine", 0.16);
    this.tone(baseFreq * 2, 0.18, "triangle", 0.1, 0.01);
    this.tone(baseFreq * 2.76, 0.14, "sine", 0.08, 0.02); // Celestial bell overtone

    // Stardust glass shatter noise
    this.noise(0.18, 0.14, 3000, 6000, 0, 0.55);

    if (gold) {
      // Golden celestial fanfare chime
      this.tone(baseFreq * 1.5, 0.28, "sine", 0.14, 0.04);
      this.tone(baseFreq * 3.0, 0.2, "sine", 0.09, 0.08);
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

  spaceChime() {
    this.tone(880, 0.08, "sine", 0.12);
    this.tone(1320, 0.09, "sine", 0.1, 0.06);
    this.tone(1760, 0.14, "sine", 0.08, 0.12);
  }

  starPop(index: number) {
    const freqs = [587.33, 880, 1318.51];
    const f = freqs[Math.min(index, 2)] ?? 880;
    this.tone(f, 0.12, "sine", 0.15);
    this.tone(f * 1.5, 0.14, "triangle", 0.1, 0.04);
  }

  scoreTick() {
    this.tone(1200 + Math.random() * 300, 0.02, "sine", 0.03);
  }

  thrusterBoost() {
    this.noise(0.35, 0.16, 400, 3200, 0, 0.7);
    this.tone(220, 0.22, "triangle", 0.12, 0, 580);
  }

  cancel() {
    this.tone(220, 0.08, "sine", 0.07, 0, 140);
  }

  laser() {
    this.tone(980, 0.14, "sawtooth", 0.09, 0, 160);
  }
}

export const sfx = new SoundEngine();
export const audio = sfx;

// Global first user-gesture unlock to overcome browser autoplay restrictions
if (typeof window !== "undefined") {
  const onFirstGesture = () => {
    audio.ensure();
    window.removeEventListener("pointerdown", onFirstGesture);
    window.removeEventListener("keydown", onFirstGesture);
    window.removeEventListener("touchstart", onFirstGesture);
  };
  window.addEventListener("pointerdown", onFirstGesture, { passive: true });
  window.addEventListener("keydown", onFirstGesture, { passive: true });
  window.addEventListener("touchstart", onFirstGesture, { passive: true });
}

