import { sfx } from "./audio";
import { loadSettings } from "./settings";
import {
  getLevelConfig,
  saveLevelClear,
  loadProgress,
  getTotalStars,
  TOTAL_LEVELS,
  type PlayerProgress,
} from "./levels";

export type Screen = "menu" | "playing" | "paused" | "gameover" | "victory" | "roadmap";

export interface HighScore {
  s: number;
  l: number;
  d: string;
}

export interface VictoryData {
  level: number;
  levelName: string;
  stars: number;
  score: number;
  levelScore: number;
  coresBonus: number;
  isNewBestScore: boolean;
  isNewBestStars: boolean;
  totalStars: number;
}

export interface UIState {
  screen: Screen;
  score: number;
  level: number;
  orbs: number;
  maxOrbs: number;
  gems: number;
  best: number;
  newBest: boolean;
  hs: HighScore[];
  muted: boolean;
  firstShot: boolean;
  victoryData?: VictoryData;
  progress?: PlayerProgress;
}

const HS_KEY = "mv_hs_v1";
const MAX_ORBS = 9;
const TAU = Math.PI * 2;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

interface Gem {
  x: number;
  y: number;
  r: number;
  kind: "ice" | "gold";
  phase: number;
  dead: boolean;
}
interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  t: number;
  alive: boolean;
  slowT: number;
  trail: { x: number; y: number }[];
}
interface Particle {
  kind: 0 | 1 | 2 | 3; // shard | spark | smoke | ring
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  tl: number;
  size: number;
  rot: number;
  vr: number;
  col: string; // "r,g,b"
  grav: number;
  drag: number;
}
interface FloatText {
  x: number;
  y: number;
  t: number;
  life: number;
  str: string;
  size: number;
  col: string;
  sub?: string;
  big?: boolean;
}
interface Mote {
  x: number;
  y: number;
  spd: number;
  phase: number;
  size: number;
  col: string;
  a: number;
}
interface TwStar {
  x: number;
  y: number;
  r: number;
  ph: number;
  sp: number;
}

type AimMode = "none" | "pull" | "kb";

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onUI: (s: UIState) => void;
  private raf = 0;
  private lastTs = 0;
  private ro: ResizeObserver | null = null;

  private W = 800;
  private H = 600;
  private dpr = 1;
  private landscape = true;

  // state
  private screen: Screen = "menu";
  private score = 0;
  private level = 1;
  private orbs = 3;
  private combo = 0;
  private pending: { type: "clear" | "next" | "over"; t: number } | null = null;
  private newBest = false;
  private hs: HighScore[] = [];
  private best = 0;
  private firstShot = false;
  private t = 0;
  private levelScore = 0;
  private victoryData: VictoryData | null = null;
  private unsubMute?: () => void;

  // world
  private gems: Gem[] = [];
  private blocks: Block[] = [];
  private orb: Orb | null = null;
  private launcher = { x: 100, y: 500 };
  private padR = 24;
  private orbR = 12;
  private gemR = 16;
  private G = 1200;
  private maxSpeed = 1400;

  // fx
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private motes: Mote[] = [];
  private twinkle: TwStar[] = [];
  private shake = 0;
  private hitstop = 0;
  private flash = 0;

  // aim
  private aimMode: AimMode = "none";
  private pullStart = { x: 0, y: 0 };
  private pullCur = { x: 0, y: 0 };
  private pointerId = -1;
  private kbAngle = -0.7;
  private kbAimX = 0;
  private charging = false;
  private chargePow = 0;
  private chargeBucket = -1;

  // statics (pre-rendered)
  private starfield: HTMLCanvasElement | null = null;
  private vignette: HTMLCanvasElement | null = null;
  private orbSprite: HTMLCanvasElement | null = null;
  private iceSprite: HTMLCanvasElement | null = null;
  private goldSprite: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement, onUI: (s: UIState) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    this.ctx = ctx;
    this.onUI = onUI;
    try {
      const raw = localStorage.getItem(HS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HighScore[];
        if (Array.isArray(parsed)) this.hs = parsed.slice(0, 5);
      }
    } catch {
      /* ignore */
    }
    this.best = this.hs.length ? this.hs[0].s : 0;
  }

  // ---------- lifecycle ----------

  init() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("visibilitychange", this.onVis);
    this.canvas.addEventListener("pointerdown", this.onPtrDown);
    this.canvas.addEventListener("pointermove", this.onPtrMove);
    this.canvas.addEventListener("pointerup", this.onPtrUp);
    this.canvas.addEventListener("pointercancel", this.onPtrCancel);
    this.canvas.addEventListener("contextmenu", this.onCtxMenu);
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.canvas.parentElement ?? this.canvas);
    } else {
      window.addEventListener("resize", this.resize);
    }
    try {
      void document.fonts?.load('12px "Chakra Petch"');
      void document.fonts?.load('700 12px "Be Vietnam Pro"');
    } catch {
      /* ignore */
    }
    this.resize();
    this.buildLevel(1);
    sfx.setMusicMode("menu");
    this.unsubMute = sfx.onMuteChange(() => {
      this.pushUI();
    });
    this.pushUI();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.unsubMute?.();
    sfx.setMusicMode("off");
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("visibilitychange", this.onVis);
    this.canvas.removeEventListener("pointerdown", this.onPtrDown);
    this.canvas.removeEventListener("pointermove", this.onPtrMove);
    this.canvas.removeEventListener("pointerup", this.onPtrUp);
    this.canvas.removeEventListener("pointercancel", this.onPtrCancel);
    this.canvas.removeEventListener("contextmenu", this.onCtxMenu);
    if (this.ro) this.ro.disconnect();
    else window.removeEventListener("resize", this.resize);
  }

  // ---------- public controls ----------

  play(startLevel = 1) {
    this.score = 0;
    this.startLevel(startLevel);
  }

  startLevel(lvl: number) {
    sfx.ensure();
    sfx.click();
    sfx.setMusicMode("battle");
    this.level = clamp(lvl, 1, TOTAL_LEVELS);
    this.levelScore = 0;
    this.pending = null;
    this.particles.length = 0;
    this.texts.length = 0;
    this.orb = null;
    this.firstShot = false;
    this.victoryData = null;
    this.buildLevel(this.level);
    const cfg = getLevelConfig(this.level);
    this.banner(`LEVEL ${this.level}`, cfg.name.toUpperCase());
    this.screen = "playing";
    this.pushUI();
  }

  nextLevel() {
    if (this.level < TOTAL_LEVELS) {
      this.startLevel(this.level + 1);
    } else {
      this.openRoadmap();
    }
  }

  restart() {
    this.startLevel(this.level);
  }

  openRoadmap() {
    sfx.ensure();
    sfx.click();
    sfx.setMusicMode("roadmap");
    this.screen = "roadmap";
    this.aimMode = "none";
    this.charging = false;
    this.pushUI();
  }

  pause() {
    if (this.screen !== "playing") return;
    this.screen = "paused";
    this.aimMode = "none";
    this.charging = false;
    sfx.click();
    sfx.setMusicMode("paused");
    this.pushUI();
  }

  resume() {
    if (this.screen !== "paused") return;
    sfx.ensure();
    this.screen = "playing";
    sfx.click();
    sfx.setMusicMode("battle");
    this.pushUI();
  }

  toMenu() {
    sfx.click();
    sfx.setMusicMode("menu");
    this.screen = "menu";
    this.orb = null;
    this.aimMode = "none";
    this.charging = false;
    this.victoryData = null;
    this.buildLevel(1);
    this.pushUI();
  }

  toggleMute() {
    sfx.ensure();
    sfx.setMuted(!sfx.muted);
    this.pushUI();
  }

  // ---------- input: pointer ----------

  private onCtxMenu = (e: Event) => e.preventDefault();

  private ptrPos(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onPtrDown = (e: PointerEvent) => {
    sfx.ensure();
    if (this.screen !== "playing" || this.orb?.alive) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.ptrPos(e);
    this.pullStart = p;
    this.pullCur = p;
    this.aimMode = "pull";
  };

  private onPtrMove = (e: PointerEvent) => {
    if (this.aimMode !== "pull" || e.pointerId !== this.pointerId) return;
    this.pullCur = this.ptrPos(e);
  };

  private maxDragDistance(): number {
    const minDim = Math.min(this.W, this.H);
    return clamp(minDim * 0.22, 130, 190);
  }

  private onPtrUp = (e: PointerEvent) => {
    if (this.aimMode !== "pull" || e.pointerId !== this.pointerId) return;
    this.aimMode = "none";
    this.pointerId = -1;
    if (this.screen !== "playing" || this.orb?.alive) return;
    const dx = this.pullStart.x - this.pullCur.x;
    const dy = this.pullStart.y - this.pullCur.y;
    const len = Math.hypot(dx, dy);
    if (len < 10) {
      if (len > 4) sfx.cancel();
      return;
    }
    const power = clamp(len / this.maxDragDistance(), 0, 1);
    this.fire(Math.atan2(dy, dx), power);
  };

  private onPtrCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.aimMode = "none";
    this.pointerId = -1;
  };

  // ---------- input: keyboard ----------

  private aimRange(): [number, number] {
    return this.landscape ? [-3.08, -0.06] : [-2.4, -0.75];
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k)) e.preventDefault();
    sfx.ensure();

    if (k === "m" || k === "M") {
      this.toggleMute();
      return;
    }
    if (k === "p" || k === "P" || k === "Escape") {
      if (this.screen === "playing") this.pause();
      else if (this.screen === "paused") this.resume();
      return;
    }
    if (k === "r" || k === "R") {
      if (this.screen !== "menu") this.restart();
      return;
    }
    if (k === "Enter" || k === " ") {
      if (this.screen === "menu") {
        this.play();
        return;
      }
      if (this.screen === "gameover" && k === "Enter") {
        this.restart();
        return;
      }
    }

    if (this.screen !== "playing") return;

    if (k === "ArrowUp" || k === "w" || k === "W" || k === "ArrowLeft" || k === "a" || k === "A") {
      this.kbAimX = -1;
      if (this.aimMode === "none" && !this.orb?.alive) this.aimMode = "kb";
    } else if (k === "ArrowDown" || k === "s" || k === "S" || k === "ArrowRight" || k === "d" || k === "D") {
      this.kbAimX = 1;
      if (this.aimMode === "none" && !this.orb?.alive) this.aimMode = "kb";
    }

    if (k === " " && !e.repeat) {
      if (!this.orb?.alive && this.orbs > 0) {
        this.aimMode = "kb";
        this.charging = true;
        this.chargePow = 0;
        this.chargeBucket = -1;
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowUp" || k === "w" || k === "W" || k === "ArrowLeft" || k === "a" || k === "A") {
      if (this.kbAimX === -1) this.kbAimX = 0;
    } else if (k === "ArrowDown" || k === "s" || k === "S" || k === "ArrowRight" || k === "d" || k === "D") {
      if (this.kbAimX === 1) this.kbAimX = 0;
    } else if (k === " ") {
      if (this.charging) {
        this.charging = false;
        this.aimMode = "none";
        if (this.screen === "playing" && !this.orb?.alive && this.chargePow > 0.06) {
          this.fire(this.kbAngle, this.chargePow);
        } else {
          sfx.cancel();
        }
        this.chargePow = 0;
      }
    }
  };

  private onVis = () => {
    if (document.hidden && this.screen === "playing") this.pause();
  };

  // ---------- sizing / statics ----------

  private resize = () => {
    const el = this.canvas.parentElement ?? this.canvas;
    this.W = Math.max(320, el.clientWidth);
    this.H = Math.max(320, el.clientHeight);
    this.dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.landscape = this.W >= this.H;

    const minDim = Math.min(this.W, this.H);
    this.G = this.H * 1.9;
    this.maxSpeed = this.H * 2.0;
    this.orbR = clamp(minDim * 0.026, 9, 16);
    this.gemR = clamp(minDim * 0.034, 12, 22);
    this.padR = clamp(minDim * 0.042, 17, 30);
    this.launcher = this.landscape
      ? { x: this.W * 0.12, y: this.H * 0.84 }
      : { x: this.W * 0.5, y: this.H * 0.86 };
    this.buildStatic();

    // keep entities in bounds
    for (const g of this.gems) {
      g.x = clamp(g.x, g.r + 4, this.W - g.r - 4);
      g.y = clamp(g.y, g.r + 4, this.H - g.r - 4);
    }
    for (const b of this.blocks) {
      b.x = clamp(b.x, 4, this.W - b.w - 4);
      b.y = clamp(b.y, 4, this.H - b.h - 4);
    }
  };

  private buildStatic() {
    const { W, H, dpr } = this;
    // starfield
    const sf = document.createElement("canvas");
    sf.width = Math.round(W * dpr);
    sf.height = Math.round(H * dpr);
    const c = sf.getContext("2d")!;
    c.scale(dpr, dpr);
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0b0718");
    bg.addColorStop(0.55, "#070510");
    bg.addColorStop(1, "#050309");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    const neb = (x: number, y: number, r: number, col: string) => {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    };
    neb(W * 0.18, H * 0.75, Math.max(W, H) * 0.5, "rgba(255,94,26,0.055)");
    neb(W * 0.85, H * 0.15, Math.max(W, H) * 0.45, "rgba(32,226,192,0.05)");
    neb(W * 0.55, H * 0.5, Math.max(W, H) * 0.6, "rgba(124,77,255,0.045)");
    const starCols = ["255,255,255", "190,240,255", "255,225,170"];
    for (let i = 0; i < 150; i++) {
      c.fillStyle = `rgba(${pick(starCols)},${rand(0.15, 0.7)})`;
      c.beginPath();
      c.arc(rand(0, W), rand(0, H), rand(0.4, 1.4), 0, TAU);
      c.fill();
    }
    this.starfield = sf;

    // vignette
    const vg = document.createElement("canvas");
    vg.width = Math.round(W * dpr);
    vg.height = Math.round(H * dpr);
    const vc = vg.getContext("2d")!;
    vc.scale(dpr, dpr);
    const rad = vc.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75);
    rad.addColorStop(0, "rgba(0,0,0,0)");
    rad.addColorStop(1, "rgba(2,1,6,0.62)");
    vc.fillStyle = rad;
    vc.fillRect(0, 0, W, H);
    this.vignette = vg;

    // sprites
    this.orbSprite = this.makeOrbSprite();
    this.iceSprite = this.makeGemSprite("ice");
    this.goldSprite = this.makeGemSprite("gold");

    // ambient twinkle + motes
    this.twinkle = [];
    for (let i = 0; i < 26; i++) {
      this.twinkle.push({ x: rand(0, W), y: rand(0, H), r: rand(0.8, 2.2), ph: rand(0, TAU), sp: rand(0.6, 2.2) });
    }
    if (this.motes.length === 0) {
      for (let i = 0; i < 24; i++) {
        this.motes.push({
          x: rand(0, W),
          y: rand(0, H),
          spd: rand(8, 26),
          phase: rand(0, TAU),
          size: rand(1, 2.6),
          col: Math.random() < 0.5 ? "255,150,60" : "60,230,200",
          a: rand(0.1, 0.3),
        });
      }
    }
  }

  private makeOrbSprite(): HTMLCanvasElement {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const g = c.getContext("2d")!;
    const cx = s / 2;
    const glow = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
    glow.addColorStop(0, "rgba(255,240,200,0.95)");
    glow.addColorStop(0.18, "rgba(255,210,62,0.95)");
    glow.addColorStop(0.34, "rgba(255,122,26,0.8)");
    glow.addColorStop(0.6, "rgba(255,80,20,0.22)");
    glow.addColorStop(1, "rgba(255,80,20,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    // molten core detail
    g.strokeStyle = "rgba(255,255,255,0.55)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cx, s * 0.13, -2.4, -0.6);
    g.stroke();
    return c;
  }

  private makeGemSprite(kind: "ice" | "gold"): HTMLCanvasElement {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const g = c.getContext("2d")!;
    const cx = s / 2;
    const cy = s / 2;
    const ice = kind === "ice";
    const glowCol = ice ? "rgba(46,230,201," : "rgba(255,210,62,";
    const base = ice ? "#12b39c" : "#f0b32a";
    const light = ice ? "#8ffce9" : "#fff3b0";
    const deep = ice ? "#0a5c52" : "#a06d10";

    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, cx);
    glow.addColorStop(0, glowCol + "0.55)");
    glow.addColorStop(0.5, glowCol + "0.16)");
    glow.addColorStop(1, glowCol + "0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);

    const R = s * 0.3;
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 6;
      const rr = i % 2 === 0 ? R : R * 0.82;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    g.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.closePath();
    const body = g.createLinearGradient(cx, cy - R, cx, cy + R);
    body.addColorStop(0, light);
    body.addColorStop(0.5, base);
    body.addColorStop(1, deep);
    g.fillStyle = body;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = ice ? "rgba(200,255,244,0.9)" : "rgba(255,250,210,0.9)";
    g.stroke();

    // facets
    g.strokeStyle = ice ? "rgba(230,255,250,0.5)" : "rgba(255,250,220,0.55)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx, cy - R);
    g.lineTo(cx, cy + R * 0.8);
    g.moveTo(pts[1][0], pts[1][1]);
    g.lineTo(cx, cy + R * 0.8);
    g.lineTo(pts[4][0], pts[4][1]);
    g.stroke();
    // inner highlight
    g.beginPath();
    g.moveTo(cx - R * 0.4, cy - R * 0.35);
    g.lineTo(cx - R * 0.1, cy - R * 0.6);
    g.lineTo(cx + R * 0.1, cy - R * 0.35);
    g.closePath();
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.fill();
    return c;
  }

  // ---------- level building ----------

  private buildLevel(n: number) {
    const { W, H } = this;
    this.blocks = [];
    this.gems = [];
    this.orb = null;
    this.combo = 0;
    this.pending = null;
    this.firstShot = false;

    const cfg = getLevelConfig(n);
    this.orbs = cfg.parOrbs;
    this.levelScore = 0;

    // Load handcrafted obstacles
    for (const b of cfg.blocks) {
      const bw = Math.max(12, b.rw * (this.landscape ? W : H));
      const bh = Math.max(16, b.rh * H);
      const bx = b.rx * W;
      const by = b.ry * H;
      this.blocks.push({
        x: clamp(bx, 4, W - bw - 4),
        y: clamp(by, 4, H - bh - 4),
        w: bw,
        h: bh,
      });
    }

    // Load handcrafted crystals
    for (const g of cfg.gems) {
      const gx = g.rx * W;
      const gy = g.ry * H;
      this.gems.push({
        x: clamp(gx, this.gemR + 4, W - this.gemR - 4),
        y: clamp(gy, this.gemR + 4, H - this.gemR - 4),
        r: this.gemR,
        kind: g.kind,
        phase: rand(0, TAU),
        dead: false,
      });
    }

    // Default aim angle toward average crystal center
    if (this.gems.length > 0) {
      const avgX = this.gems.reduce((s, g) => s + g.x, 0) / this.gems.length;
      const avgY = this.gems.reduce((s, g) => s + g.y, 0) / this.gems.length;
      this.kbAngle = Math.atan2(avgY - this.launcher.y, avgX - this.launcher.x);
    }
  }

  // ---------- game actions ----------

  private fire(angle: number, power: number) {
    if (this.orb?.alive || this.orbs <= 0 || this.screen !== "playing") return;
    this.orbs--;
    this.combo = 0;
    this.firstShot = true;
    const sp = (0.2 + 0.8 * power) * this.maxSpeed;
    this.orb = {
      x: this.launcher.x,
      y: this.launcher.y,
      vx: Math.cos(angle) * sp,
      vy: Math.sin(angle) * sp,
      r: this.orbR,
      t: 0,
      alive: true,
      slowT: 0,
      trail: [],
    };
    sfx.shoot(power);
    this.shake = Math.min(26, this.shake + 1.5 + power * 3);
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        kind: 2,
        x: this.launcher.x + rand(-8, 8),
        y: this.launcher.y + rand(-8, 8),
        vx: rand(-60, 60),
        vy: rand(-80, 10),
        life: rand(0.3, 0.6),
        tl: 0.6,
        size: rand(4, 10),
        rot: 0,
        vr: 0,
        col: "150,120,140",
        grav: 0,
        drag: 2,
      });
    }
    this.pushUI();
  }

  private hitGem(g: Gem) {
    g.dead = true;
    this.combo++;
    const gold = g.kind === "gold";
    const pts = (gold ? 500 : 100) * this.combo;
    this.score += pts;
    this.levelScore += pts;

    if (gold) {
      if (this.orbs < MAX_ORBS) this.orbs++;
      sfx.orbEarned();
    }
    sfx.shatter(this.combo, gold);

    // fx
    this.hitstop = Math.max(this.hitstop, 0.045 + 0.014 * Math.min(this.combo, 6));
    this.shake = Math.min(26, this.shake + 3.5 + 1.8 * Math.min(this.combo, 6));
    if (gold) this.flash = Math.max(this.flash, 0.4);

    const cols = gold
      ? ["255,210,62", "255,243,176", "255,160,46"]
      : ["125,252,231", "46,230,201", "230,255,250"];
    const isReduced = loadSettings().particleDensity === "reduced";
    const pCount1 = isReduced ? 6 : 13;
    const pCount2 = isReduced ? 4 : 10;
    for (let i = 0; i < pCount1; i++) {
      const a = rand(0, TAU);
      const sp = rand(120, 430);
      this.particles.push({
        kind: 0,
        x: g.x,
        y: g.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: rand(0.45, 0.9),
        tl: 0.9,
        size: g.r * rand(0.25, 0.55),
        rot: rand(0, TAU),
        vr: rand(-9, 9),
        col: pick(cols),
        grav: 950,
        drag: 0.6,
      });
    }
    for (let i = 0; i < pCount2; i++) {
      const a = rand(0, TAU);
      const sp = rand(220, 620);
      this.particles.push({
        kind: 1,
        x: g.x,
        y: g.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.15, 0.35),
        tl: 0.35,
        size: rand(1.5, 3),
        rot: 0,
        vr: 0,
        col: gold ? "255,240,170" : "200,255,240",
        grav: 0,
        drag: 3.5,
      });
    }
    this.particles.push({
      kind: 3,
      x: g.x,
      y: g.y,
      vx: 0,
      vy: 0,
      life: 0.32,
      tl: 0.32,
      size: g.r * 3.4,
      rot: 0,
      vr: 0,
      col: gold ? "255,220,100" : "120,255,230",
      grav: 0,
      drag: 0,
    });

    if (this.orb) {
      this.orb.vx *= 0.965;
      this.orb.vy *= 0.965;
    }

    const size = clamp(Math.min(this.W, this.H) * 0.045, 17, 30);
    this.texts.push({
      x: g.x,
      y: g.y - g.r - 6,
      t: 0,
      life: 0.9,
      str: `+${pts}`,
      size,
      col: gold ? "#ffd23e" : "#7dfce7",
      sub: this.combo > 1 ? `COMBO x${this.combo}` : undefined,
    });
    if (gold) {
      this.texts.push({
        x: g.x,
        y: g.y - g.r - 40,
        t: 0,
        life: 1.1,
        str: "+1 CORE",
        size: size * 0.8,
        col: "#ffa02e",
      });
    }

    if (this.gems.every((q) => q.dead) && !this.pending) {
      this.pending = { type: "clear", t: 0.75 };
    }
    this.pushUI();
  }

  private killOrb() {
    if (!this.orb) return;
    const o = this.orb;
    this.orb = null;
    this.combo = 0;
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        kind: 2,
        x: o.x + rand(-6, 6),
        y: o.y + rand(-6, 6),
        vx: rand(-50, 50),
        vy: rand(-70, 0),
        life: rand(0.4, 0.8),
        tl: 0.8,
        size: rand(5, 12),
        rot: 0,
        vr: 0,
        col: "160,130,120",
        grav: -40,
        drag: 1.5,
      });
    }
    for (let i = 0; i < 8; i++) {
      const a = rand(0, TAU);
      const sp = rand(80, 260);
      this.particles.push({
        kind: 1,
        x: o.x,
        y: o.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.15, 0.3),
        tl: 0.3,
        size: 2,
        rot: 0,
        vr: 0,
        col: "255,180,90",
        grav: 0,
        drag: 3,
      });
    }
    this.shake = Math.min(26, this.shake + 2);
    if (this.orbs <= 0 && !this.pending && !this.gems.every((q) => q.dead)) {
      this.pending = { type: "over", t: 0.85 };
    }
    this.pushUI();
  }

  private doLevelClear() {
    const cfg = getLevelConfig(this.level);
    let stars = 1;
    if (this.orbs >= cfg.star3MinOrbs) {
      stars = 3;
    } else if (this.orbs >= cfg.star2MinOrbs) {
      stars = 2;
    }

    const coresBonus = this.orbs * 300;
    this.score += coresBonus;
    this.levelScore += coresBonus;

    const { isNewBestScore, isNewBestStars } = saveLevelClear(
      this.level,
      stars,
      this.levelScore,
    );
    const progress = loadProgress();

    this.victoryData = {
      level: this.level,
      levelName: cfg.name,
      stars,
      score: this.score,
      levelScore: this.levelScore,
      coresBonus,
      isNewBestScore,
      isNewBestStars,
      totalStars: getTotalStars(progress),
    };

    this.flash = 0.55;
    this.shake = Math.min(26, this.shake + 5);
    sfx.levelClear();

    // confetti
    const cols = ["255,160,46", "46,230,201", "255,210,62", "255,255,255", "255,77,109"];
    for (let i = 0; i < 46; i++) {
      const a = rand(-Math.PI, 0);
      const sp = rand(200, 620);
      this.particles.push({
        kind: 0,
        x: this.W / 2 + rand(-40, 40),
        y: this.H * 0.3,
        vx: Math.cos(a) * sp * 0.7,
        vy: Math.sin(a) * sp,
        life: rand(0.8, 1.5),
        tl: 1.5,
        size: rand(3, 7),
        rot: rand(0, TAU),
        vr: rand(-12, 12),
        col: pick(cols),
        grav: 620,
        drag: 0.4,
      });
    }

    this.screen = "victory";
    sfx.setMusicMode("menu");
    this.pushUI();
  }

  private doGameOver() {
    const prevBest = this.best;
    this.newBest = this.score > prevBest && this.score > 0;
    const d = new Date();
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    this.hs.push({ s: this.score, l: this.level, d: dateStr });
    this.hs.sort((a, b) => b.s - a.s);
    this.hs = this.hs.slice(0, 5);
    this.best = this.hs[0]?.s ?? 0;
    try {
      localStorage.setItem(HS_KEY, JSON.stringify(this.hs));
    } catch {
      /* ignore */
    }
    this.screen = "gameover";
    sfx.setMusicMode("menu");
    sfx.gameOver();
    this.shake = Math.min(26, this.shake + 8);
    this.pushUI();
  }

  private banner(str: string, sub?: string) {
    this.texts.push({
      x: this.W / 2,
      y: this.H * 0.3,
      t: 0,
      life: 1.5,
      str,
      size: clamp(Math.min(this.W, this.H) * 0.075, 26, 58),
      col: "#ffd23e",
      sub,
      big: true,
    });
  }

  // ---------- update ----------

  private loop = (ts: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (this.lastTs === 0) this.lastTs = ts;
    const dt = clamp((ts - this.lastTs) / 1000, 0, 0.033);
    this.lastTs = ts;
    this.update(dt);
    this.render();
  };

  private update(dt: number) {
    this.t += dt;

    // ambient motes always
    for (const m of this.motes) {
      m.y -= m.spd * dt;
      m.x += Math.sin(this.t * 0.7 + m.phase) * 8 * dt;
      if (m.y < -8) {
        m.y = this.H + 8;
        m.x = rand(0, this.W);
      }
    }

    if (this.screen === "paused") return;

    // fx update (also during menu / gameover)
    this.updateParticles(dt);
    this.updateTexts(dt);
    this.shake = Math.max(0, this.shake - this.shake * 7 * dt - 10 * dt);
    this.flash = Math.max(0, this.flash - this.flash * 5 * dt);

    if (this.screen !== "playing") return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    // keyboard aim
    if (this.kbAimX !== 0 && !this.orb?.alive) {
      const [a0, a1] = this.aimRange();
      this.kbAngle = clamp(this.kbAngle + this.kbAimX * 2.4 * dt, a0, a1);
    }
    if (this.charging) {
      this.chargePow = Math.min(1, this.chargePow + 1.15 * dt);
      const bucket = Math.floor(this.chargePow * 10);
      if (bucket !== this.chargeBucket) {
        this.chargeBucket = bucket;
        sfx.chargeTick(this.chargePow);
      }
    }

    // orb physics (2 substeps)
    if (this.orb?.alive) {
      const o = this.orb;
      const sdt = dt / 2;
      for (let s = 0; s < 2; s++) {
        o.t += sdt;
        o.vy += this.G * sdt;
        o.x += o.vx * sdt;
        o.y += o.vy * sdt;

        const rest = 0.56;
        let impact = 0;
        if (o.x - o.r < 0) {
          o.x = o.r;
          impact = Math.abs(o.vx);
          o.vx = Math.abs(o.vx) * rest;
        } else if (o.x + o.r > this.W) {
          o.x = this.W - o.r;
          impact = Math.abs(o.vx);
          o.vx = -Math.abs(o.vx) * rest;
        }
        if (o.y - o.r < 0) {
          o.y = o.r;
          impact = Math.max(impact, Math.abs(o.vy));
          o.vy = Math.abs(o.vy) * rest;
        } else if (o.y + o.r > this.H) {
          o.y = this.H - o.r;
          impact = Math.max(impact, Math.abs(o.vy));
          o.vy = -Math.abs(o.vy) * rest;
          if (Math.abs(o.vy) < 55) o.vy = 0;
        }
        // ground friction so the orb comes to rest
        if (o.y >= this.H - o.r - 0.5) {
          o.vx *= Math.max(0, 1 - 2.4 * sdt);
          if (Math.abs(o.vx) < 4) o.vx = 0;
        }
        if (impact > 150) {
          const n = Math.min(8, 2 + Math.floor(impact / 220));
          for (let i = 0; i < n; i++) {
            this.particles.push({
              kind: 1,
              x: o.x,
              y: o.y,
              vx: rand(-160, 160),
              vy: rand(-200, 40),
              life: rand(0.12, 0.3),
              tl: 0.3,
              size: rand(1.5, 2.5),
              rot: 0,
              vr: 0,
              col: "255,190,110",
              grav: 300,
              drag: 2,
            });
          }
          sfx.bounce(impact / this.maxSpeed);
          this.shake = Math.min(26, this.shake + Math.min(4, impact / 400));
        }

        // blocks
        for (const b of this.blocks) {
          const cx = clamp(o.x, b.x, b.x + b.w);
          const cy = clamp(o.y, b.y, b.y + b.h);
          let dx = o.x - cx;
          let dy = o.y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 < o.r * o.r) {
            const d = Math.sqrt(d2);
            if (d < 0.001) {
              dx = 0;
              dy = -1;
            } else {
              dx /= d;
              dy /= d;
            }
            o.x = cx + dx * o.r;
            o.y = cy + dy * o.r;
            const vn = o.vx * dx + o.vy * dy;
            if (vn < 0) {
              o.vx -= 1.62 * vn * dx;
              o.vy -= 1.62 * vn * dy;
              if (-vn > 160) {
                sfx.thud(-vn / this.maxSpeed);
                this.shake = Math.min(26, this.shake + Math.min(4, -vn / 420));
                for (let i = 0; i < 6; i++) {
                  this.particles.push({
                    kind: 1,
                    x: cx,
                    y: cy,
                    vx: rand(-140, 140),
                    vy: rand(-180, 60),
                    life: rand(0.1, 0.25),
                    tl: 0.25,
                    size: 2,
                    rot: 0,
                    vr: 0,
                    col: "180,170,255",
                    grav: 300,
                    drag: 2,
                  });
                }
              }
            }
          }
        }

        // gems
        for (const g of this.gems) {
          if (g.dead) continue;
          const dx = o.x - g.x;
          const dy = o.y - g.y;
          const rr = o.r + g.r * 0.92;
          if (dx * dx + dy * dy < rr * rr) this.hitGem(g);
        }
        if (!this.orb?.alive) break;
      }

      o.trail.push({ x: o.x, y: o.y });
      if (o.trail.length > 15) o.trail.shift();

      const sp = Math.hypot(o.vx, o.vy);
      if (sp < 75) o.slowT += dt;
      else o.slowT = 0;
      if (o.t > 8 || o.slowT > 0.55) this.killOrb();
    }

    // pending timers
    if (this.pending) {
      this.pending.t -= dt;
      if (this.pending.t <= 0) {
        const p = this.pending;
        this.pending = null;
        if (p.type === "clear") this.doLevelClear();
        else if (p.type === "next") {
          this.level++;
          this.buildLevel(this.level);
          this.banner(`LEVEL ${this.level}`, this.level === 2 ? "WATCH THE BARRIERS" : undefined);
          this.pushUI();
        } else this.doGameOver();
      }
    }
  }

  private updateParticles(dt: number) {
    const arr = this.particles;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life -= dt;
      if (p.life <= 0) {
        arr[i] = arr[arr.length - 1];
        arr.pop();
        continue;
      }
      p.vy += p.grav * dt;
      p.vx *= 1 - Math.min(0.9, p.drag * dt);
      p.vy *= 1 - Math.min(0.9, p.drag * dt * 0.5);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    if (arr.length > 550) arr.splice(0, arr.length - 550);
  }

  private updateTexts(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const tx = this.texts[i];
      tx.t += dt;
      tx.y -= (tx.big ? 6 : 44) * dt;
      if (tx.t >= tx.life) this.texts.splice(i, 1);
    }
  }

  // ---------- trajectory sim ----------

  private simTraj(angle: number, power: number) {
    const sp = (0.2 + 0.8 * power) * this.maxSpeed;
    let x = this.launcher.x;
    let y = this.launcher.y;
    let vx = Math.cos(angle) * sp;
    let vy = Math.sin(angle) * sp;
    const dt = 1 / 50;
    const pts: { x: number; y: number }[] = [];
    let hit: { x: number; y: number } | null = null;
    const cfg = loadSettings();
    const maxSteps = cfg.trajectoryGuide === "minimal" ? 22 : 70;
    for (let i = 0; i < maxSteps; i++) {
      vy += this.G * dt;
      x += vx * dt;
      y += vy * dt;
      if (i % 3 === 0) pts.push({ x, y });
      if (x < 0 || x > this.W || y > this.H || y < 0) {
        hit = { x: clamp(x, 0, this.W), y: clamp(y, 0, this.H) };
        break;
      }
      let blocked = false;
      for (const b of this.blocks) {
        if (x > b.x - 6 && x < b.x + b.w + 6 && y > b.y - 6 && y < b.y + b.h + 6) {
          blocked = true;
          break;
        }
      }
      if (!blocked)
        for (const g of this.gems) {
          if (!g.dead && (x - g.x) ** 2 + (y - g.y) ** 2 < (g.r + 4) ** 2) {
            blocked = true;
            break;
          }
        }
      if (blocked) {
        hit = { x, y };
        break;
      }
    }
    return { pts, hit };
  }

  private powerColor(p: number) {
    if (p < 0.5) return `rgba(${Math.round(46 + (255 - 46) * (p / 0.5))},${Math.round(230 - (230 - 160) * (p / 0.5))},201,`;
    return `rgba(255,${Math.round(160 - (160 - 77) * ((p - 0.5) / 0.5))},${Math.round(201 - (201 - 109) * ((p - 0.5) / 0.5))},`;
  }

  // ---------- render ----------

  private render() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);

    const cfg = loadSettings();
    const shakeAmt = cfg.screenShake ? this.shake : 0;
    const sx = (Math.random() * 2 - 1) * shakeAmt;
    const sy = (Math.random() * 2 - 1) * shakeAmt;
    ctx.save();
    ctx.translate(sx, sy);

    if (this.starfield) ctx.drawImage(this.starfield, 0, 0, W, H);

    // twinkle
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.twinkle) {
      const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(this.t * s.sp + s.ph));
      ctx.fillStyle = `rgba(220,240,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    for (const m of this.motes) {
      ctx.fillStyle = `rgba(${m.col},${m.a})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // blocks
    for (const b of this.blocks) {
      ctx.fillStyle = "#191433";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#241c46";
      ctx.fillRect(b.x, b.y, b.w, Math.min(4, b.h * 0.3));
      ctx.strokeStyle = "rgba(140,128,220,0.55)";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      ctx.strokeStyle = "rgba(140,128,220,0.16)";
      ctx.beginPath();
      for (let yy = b.y + 14; yy < b.y + b.h; yy += 14) {
        ctx.moveTo(b.x + 3, yy);
        ctx.lineTo(b.x + b.w - 3, yy);
      }
      for (let xx = b.x + 14; xx < b.x + b.w; xx += 14) {
        ctx.moveTo(xx, b.y + 3);
        ctx.lineTo(xx, b.y + b.h - 3);
      }
      ctx.stroke();
    }

    // gems
    for (const g of this.gems) {
      if (g.dead) continue;
      const bob = Math.sin(this.t * 2 + g.phase) * 3;
      const pulse = 1 + 0.05 * Math.sin(this.t * 3 + g.phase);
      const spr = g.kind === "gold" ? this.goldSprite : this.iceSprite;
      if (!spr) continue;
      const size = g.r * 5 * pulse;
      ctx.drawImage(spr, g.x - size / 2, g.y + bob - size / 2, size, size);
      if (g.kind === "gold") {
        const sa = this.t * 1.4 + g.phase;
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,243,176,0.8)";
        ctx.lineWidth = 1.6;
        const sr = g.r * (0.55 + 0.18 * Math.sin(sa * 2));
        ctx.save();
        ctx.translate(g.x, g.y + bob);
        ctx.rotate(sa);
        ctx.beginPath();
        ctx.moveTo(-sr, 0);
        ctx.lineTo(sr, 0);
        ctx.moveTo(0, -sr);
        ctx.lineTo(0, sr);
        ctx.stroke();
        ctx.restore();
        ctx.globalCompositeOperation = "source-over";
      }
    }

    // launcher + aim
    if (this.screen !== "menu") this.drawLauncher();

    // orb + trail
    const o = this.orb;
    if (o?.alive && this.orbSprite) {
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < o.trail.length; i++) {
        const tr = o.trail[i];
        const f = i / o.trail.length;
        ctx.fillStyle = `rgba(255,150,50,${f * 0.3})`;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, o.r * (0.25 + 0.75 * f), 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      const size = o.r * 5;
      ctx.drawImage(this.orbSprite, o.x - size / 2, o.y - size / 2, size, size);
    }

    // particles
    this.drawParticles();

    // texts
    this.drawTexts();

    ctx.restore();

    if (this.vignette) ctx.drawImage(this.vignette, 0, 0, W, H);

    if (this.flash > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,190,90,${this.flash * 0.22})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  private drawLauncher() {
    const { ctx } = this;
    const { x, y } = this.launcher;
    const pulse = 1 + 0.05 * Math.sin(this.t * 3.2);
    const R = this.padR * pulse;

    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(x, y, 0, x, y, R * 2.6);
    glow.addColorStop(0, "rgba(255,130,40,0.3)");
    glow.addColorStop(1, "rgba(255,130,40,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, R * 2.6, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.strokeStyle = "rgba(255,160,46,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,210,62,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, R * 1.35, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4 + Math.PI / 4;
      ctx.strokeStyle = "rgba(255,160,46,0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * R * 1.45, y + Math.sin(a) * R * 1.45);
      ctx.lineTo(x + Math.cos(a) * R * 1.75, y + Math.sin(a) * R * 1.75);
      ctx.stroke();
    }

    // aim preview
    let angle: number | null = null;
    let power = 0;
    if (this.aimMode === "pull") {
      const dx = this.pullStart.x - this.pullCur.x;
      const dy = this.pullStart.y - this.pullCur.y;
      const len = Math.hypot(dx, dy);
      if (len > 10) {
        angle = Math.atan2(dy, dx);
        power = clamp(len / this.maxDragDistance(), 0, 1);
      }
    } else if (this.aimMode === "kb") {
      angle = this.kbAngle;
      power = this.charging ? this.chargePow : 0;
    }

    if (angle !== null && power > 0.02 && !this.orb?.alive) {
      const { pts, hit } = this.simTraj(angle, power);
      const pc = this.powerColor(power);
      for (let i = 0; i < pts.length; i++) {
        const f = 1 - i / pts.length;
        ctx.fillStyle = `${pc}${0.15 + f * 0.6})`;
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 1.5 + f * 3.4, 0, TAU);
        ctx.fill();
      }
      if (hit) {
        ctx.strokeStyle = `${pc}0.9)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, 9, 0, TAU);
        ctx.moveTo(hit.x - 14, hit.y);
        ctx.lineTo(hit.x - 5, hit.y);
        ctx.moveTo(hit.x + 5, hit.y);
        ctx.lineTo(hit.x + 14, hit.y);
        ctx.moveTo(hit.x, hit.y - 14);
        ctx.lineTo(hit.x, hit.y - 5);
        ctx.moveTo(hit.x, hit.y + 5);
        ctx.lineTo(hit.x, hit.y + 14);
        ctx.stroke();
      }
    }

    // loaded orb on pad (or pulled back)
    if (
      !this.orb?.alive &&
      this.orbs > 0 &&
      (this.screen === "playing" || this.screen === "paused") &&
      this.orbSprite
    ) {
      let ox = x;
      let oy = y;
      if (angle !== null && power > 0.02) {
        const maxVisualPull = clamp(this.padR * 2.8, 55, 95);
        const pull = 6 + power * maxVisualPull;
        ox = x - Math.cos(angle) * pull;
        oy = y - Math.sin(angle) * pull;
        ctx.strokeStyle = "rgba(255,210,122,0.85)";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle + 1.3) * R, y - Math.sin(angle + 1.3) * R);
        ctx.lineTo(ox, oy);
        ctx.moveTo(x - Math.cos(angle - 1.3) * R, y - Math.sin(angle - 1.3) * R);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      }
      const size = this.orbR * 5 * (angle !== null && power > 0.02 ? 0.92 : 1);
      ctx.drawImage(this.orbSprite, ox - size / 2, oy - size / 2, size, size);
    }

    // kb power arc
    if (this.aimMode === "kb" && this.charging) {
      const pc = this.powerColor(this.chargePow);
      ctx.strokeStyle = `${pc}0.9)`;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(x, y, R * 1.7, -Math.PI / 2, -Math.PI / 2 + this.chargePow * TAU);
      ctx.stroke();
      ctx.lineCap = "butt";
    }
  }

  private drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      const f = p.life / p.tl;
      if (p.kind === 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${p.col},${clamp(f * 1.3, 0, 1)})`;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.kind === 1) {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${p.col},${clamp(f, 0, 1)})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (p.kind === 2) {
        ctx.fillStyle = `rgba(${p.col},${f * 0.22})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.6 - f * 0.6), 0, TAU);
        ctx.fill();
      } else {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${p.col},${f * 0.9})`;
        ctx.lineWidth = 3 * f + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - f * 0.7), 0, TAU);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }

  private drawTexts() {
    const { ctx } = this;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const tx of this.texts) {
      const f = tx.t / tx.life;
      const inS = tx.big ? clamp(tx.t / 0.18, 0, 1) : clamp(tx.t / 0.1, 0, 1);
      const scale = tx.big ? 0.6 + 0.4 * easeOutBack(inS) : easeOutBack(inS);
      const alpha = f > 0.7 ? 1 - (f - 0.7) / 0.3 : 1;
      ctx.save();
      ctx.translate(tx.x, tx.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.font = `${tx.size}px Bungee, sans-serif`;
      ctx.lineWidth = Math.max(4, tx.size * 0.18);
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(7,5,16,0.85)";
      ctx.strokeText(tx.str, 0, 0);
      ctx.fillStyle = tx.col;
      ctx.fillText(tx.str, 0, 0);
      if (tx.sub) {
        ctx.font = `${tx.size * 0.5}px Bungee, sans-serif`;
        ctx.lineWidth = Math.max(3, tx.size * 0.1);
        ctx.strokeText(tx.sub, 0, tx.size * 0.85);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(tx.sub, 0, tx.size * 0.85);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- UI sync ----------

  private pushUI() {
    this.onUI({
      screen: this.screen,
      score: this.score,
      level: this.level,
      orbs: this.orbs,
      maxOrbs: MAX_ORBS,
      gems: this.gems.filter((g) => !g.dead).length,
      best: this.best,
      newBest: this.newBest,
      hs: this.hs,
      muted: sfx.muted,
      firstShot: this.firstShot,
      victoryData: this.victoryData ?? undefined,
      progress: loadProgress(),
    });
  }
}
