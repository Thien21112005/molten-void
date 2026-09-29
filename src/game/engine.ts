import { sfx } from "./audio";
import { haptics } from "./haptics";
import { loadSettings } from "./settings";
import {
  getLevelConfig,
  saveLevelClear,
  loadProgress,
  getTotalStars,
  TOTAL_LEVELS,
  type PlayerProgress,
} from "./levels";
import {
  unlockAchievement,
  checkCampaignMilestoneAchievements,
} from "./achievements/achievementsData";
import { SKINS, loadEquippedSkin } from "./skins/skinsData";
import type { SkinId } from "./skins/types";

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

export type CoreType = "standard" | "cluster" | "blast" | "heavy";

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
  launcherPos?: { x: number; y: number };
  landscape?: boolean;
  isAiming?: boolean;
  selectedCore: CoreType;
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
interface GravityWell {
  x: number;
  y: number;
  radius: number;
  strength: number;
}
interface Wormhole {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
}
interface Rotator {
  x: number;
  y: number;
  len: number;
  width: number;
  speed: number;
  angle: number;
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
  coreType: CoreType;
  piercesLeft?: number;
  piercedBlocks?: Set<Block>;
  portalCooldown?: number;
  bounces?: number;
  gravityInfluenced?: boolean;
  hasSplit?: boolean;
  isSplitShard?: boolean;
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
  private slowMo = 0;
  private levelScore = 0;
  private victoryData: VictoryData | null = null;
  private unsubMute?: () => void;

  // world
  private selectedCore: CoreType = "standard";
  private orbsList: Orb[] = [];
  public get orb(): Orb | null {
    return this.orbsList[0] || null;
  }
  public set orb(val: Orb | null) {
    if (!val) this.orbsList = [];
    else this.orbsList = [val];
  }
  public get hasActiveOrb(): boolean {
    return this.orbsList.some((o) => o.alive);
  }
  private equippedSkin: SkinId = loadEquippedSkin();
  private coreSprites: Partial<Record<CoreType, HTMLCanvasElement>> = {};
  private launcher = { x: 100, y: 500 };
  private padR = 24;
  private orbR = 12;
  private gemR = 16;
  private G = 1200;
  private maxSpeed = 1400;
  private blocks: Block[] = [];
  private gems: Gem[] = [];
  private gravityWells: GravityWell[] = [];
  private wormholes: Wormhole[] = [];
  private rotators: Rotator[] = [];

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
    this.slowMo = 0;
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
    this.slowMo = 0;
    this.buildLevel(1);
    this.pushUI();
  }

  selectCore(type: CoreType) {
    if (this.hasActiveOrb) return;
    this.selectedCore = type;
    sfx.click();
    haptics.tick(10);
    this.pushUI();
  }

  setSkin(skinId: SkinId) {
    this.equippedSkin = skinId;
    this.coreSprites = {};
    this.orbSprite = this.makeOrbSprite();
    this.pushUI();
  }

  splitClusterOrb(o?: Orb): boolean {
    const target =
      o || this.orbsList.find((orb) => orb.alive && orb.coreType === "cluster" && !orb.hasSplit);
    if (!target || target.hasSplit || !target.alive) return false;

    target.hasSplit = true;
    sfx.spaceChime();
    sfx.shoot(0.7);
    haptics.fire();
    this.shake = Math.min(26, this.shake + 4);

    const speed = Math.hypot(target.vx, target.vy) || this.maxSpeed * 0.8;
    const currentAngle = Math.atan2(target.vy, target.vx);

    target.r = Math.max(7, target.r * 0.82);

    const spread = 0.42; // ~24 degrees
    const shard1: Orb = {
      x: target.x,
      y: target.y,
      vx: Math.cos(currentAngle + spread) * speed,
      vy: Math.sin(currentAngle + spread) * speed,
      r: target.r,
      t: target.t,
      alive: true,
      slowT: 0,
      trail: [{ x: target.x, y: target.y }],
      coreType: "cluster",
      hasSplit: true,
      isSplitShard: true,
    };

    const shard2: Orb = {
      x: target.x,
      y: target.y,
      vx: Math.cos(currentAngle - spread) * speed,
      vy: Math.sin(currentAngle - spread) * speed,
      r: target.r,
      t: target.t,
      alive: true,
      slowT: 0,
      trail: [{ x: target.x, y: target.y }],
      coreType: "cluster",
      hasSplit: true,
      isSplitShard: true,
    };

    this.orbsList.push(shard1, shard2);

    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      const sp = rand(100, 280);
      this.particles.push({
        kind: 1,
        x: target.x,
        y: target.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.2, 0.4),
        tl: 0.4,
        size: 3,
        rot: 0,
        vr: 0,
        col: "125,252,231",
        grav: 0,
        drag: 2,
      });
    }

    this.texts.push({
      x: target.x,
      y: target.y - 18,
      t: 0,
      life: 0.8,
      str: "TRIPLE SPLIT!",
      size: 16,
      col: "#7dfce7",
    });

    this.pushUI();
    return true;
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
    if (this.screen !== "playing") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // In-flight cluster split check!
    const activeCluster = this.orbsList.find((o) => o.alive && o.coreType === "cluster" && !o.hasSplit);
    if (activeCluster) {
      this.splitClusterOrb(activeCluster);
      return;
    }

    if (this.hasActiveOrb) return;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.ptrPos(e);
    this.pullStart = p;
    this.pullCur = p;
    this.aimMode = "pull";
    this.pushUI();
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
    this.pushUI();
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
    this.pushUI();
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

    // In-flight cluster split via keyboard
    if (k === " " || k === "Enter") {
      const activeCluster = this.orbsList.find((o) => o.alive && o.coreType === "cluster" && !o.hasSplit);
      if (activeCluster) {
        e.preventDefault();
        this.splitClusterOrb(activeCluster);
        return;
      }
    }

    // Number keys 1-4 for core selection
    if (k === "1") { this.selectCore("standard"); return; }
    if (k === "2") { this.selectCore("cluster"); return; }
    if (k === "3") { this.selectCore("blast"); return; }
    if (k === "4") { this.selectCore("heavy"); return; }

    if (k === "ArrowUp" || k === "w" || k === "W" || k === "ArrowLeft" || k === "a" || k === "A") {
      this.kbAimX = -1;
      if (this.aimMode === "none" && !this.hasActiveOrb) this.aimMode = "kb";
    } else if (k === "ArrowDown" || k === "s" || k === "S" || k === "ArrowRight" || k === "d" || k === "D") {
      this.kbAimX = 1;
      if (this.aimMode === "none" && !this.hasActiveOrb) this.aimMode = "kb";
    }

    if (k === " " && !e.repeat) {
      if (!this.hasActiveOrb && this.orbs > 0) {
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
    this.pushUI();
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
    return this.getOrbSprite("standard");
  }

  private getOrbSprite(coreType: CoreType): HTMLCanvasElement {
    if (this.coreSprites[coreType]) return this.coreSprites[coreType]!;
    const s = 128;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const g = c.getContext("2d")!;
    const cx = s / 2;
    const glow = g.createRadialGradient(cx, cx, 0, cx, cx, cx);

    if (coreType === "cluster") {
      glow.addColorStop(0, "rgba(230,255,250,0.98)");
      glow.addColorStop(0.18, "rgba(125,252,231,0.95)");
      glow.addColorStop(0.38, "rgba(46,230,201,0.75)");
      glow.addColorStop(0.65, "rgba(0,180,216,0.2)");
      glow.addColorStop(1, "rgba(0,180,216,0)");
    } else if (coreType === "blast") {
      glow.addColorStop(0, "rgba(255,250,220,0.98)");
      glow.addColorStop(0.18, "rgba(255,160,40,0.95)");
      glow.addColorStop(0.38, "rgba(255,60,20,0.85)");
      glow.addColorStop(0.65, "rgba(200,20,20,0.25)");
      glow.addColorStop(1, "rgba(200,20,20,0)");
    } else if (coreType === "heavy") {
      glow.addColorStop(0, "rgba(255,255,255,0.98)");
      glow.addColorStop(0.18, "rgba(186,230,253,0.95)");
      glow.addColorStop(0.38, "rgba(56,189,248,0.8)");
      glow.addColorStop(0.65, "rgba(30,58,138,0.3)");
      glow.addColorStop(1, "rgba(30,58,138,0)");
    } else {
      // standard with equipped skin customization
      const skin = SKINS.find((s) => s.id === this.equippedSkin) || SKINS[0];
      glow.addColorStop(0, skin.palette.core);
      glow.addColorStop(0.2, skin.palette.mid);
      glow.addColorStop(0.45, skin.palette.outer);
      glow.addColorStop(0.7, skin.palette.ambient);
      glow.addColorStop(1, "rgba(0,0,0,0)");
    }

    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);

    // Core detail
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cx, s * 0.13, -2.4, -0.6);
    g.stroke();

    this.coreSprites[coreType] = c;
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

    // Load cosmic obstacles
    this.gravityWells = [];
    if (cfg.gravityWells) {
      for (const gw of cfg.gravityWells) {
        this.gravityWells.push({
          x: gw.rx * W,
          y: gw.ry * H,
          radius: (gw.radius ?? 0.22) * Math.min(W, H),
          strength: (gw.strength ?? 1.0) * this.G * 0.9,
        });
      }
    }

    this.wormholes = [];
    if (cfg.wormholes) {
      for (const wh of cfg.wormholes) {
        const r = (wh.r ?? 0.035) * Math.min(W, H);
        this.wormholes.push({
          x1: wh.x1 * W,
          y1: wh.y1 * H,
          x2: wh.x2 * W,
          y2: wh.y2 * H,
          r: clamp(r, 14, 28),
        });
      }
    }

    this.rotators = [];
    if (cfg.rotators) {
      for (const rot of cfg.rotators) {
        this.rotators.push({
          x: rot.rx * W,
          y: rot.ry * H,
          len: rot.len * (this.landscape ? W : H),
          width: (rot.width ?? 0.02) * Math.min(W, H),
          speed: rot.speed,
          angle: rot.initAngle ?? 0,
        });
      }
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
    if (this.hasActiveOrb || this.orbs <= 0 || this.screen !== "playing") return;
    this.orbs--;
    this.combo = 0;
    this.firstShot = true;
    const sp = (0.2 + 0.8 * power) * this.maxSpeed;
    this.orbsList = [
      {
        x: this.launcher.x,
        y: this.launcher.y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        r: this.orbR,
        t: 0,
        alive: true,
        slowT: 0,
        trail: [],
        coreType: this.selectedCore,
        piercesLeft: this.selectedCore === "heavy" ? 1 : 0,
        hasSplit: false,
      },
    ];
    sfx.shoot(power);
    haptics.fire();
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

  private hitGem(g: Gem, triggeringOrb?: Orb) {
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
    haptics.shatter(this.combo);

    // fx
    this.hitstop = Math.max(this.hitstop, 0.045 + 0.014 * Math.min(this.combo, 6));
    this.shake = Math.min(26, this.shake + 3.5 + 1.8 * Math.min(this.combo, 6));
    if (gold) this.flash = Math.max(this.flash, 0.4);

    // Molten Blast Core AoE Explosion!
    if (triggeringOrb?.coreType === "blast") {
      const minDim = Math.min(this.W, this.H);
      const blastRadius = minDim * 0.22;
      sfx.thrusterBoost();
      this.shake = Math.min(28, this.shake + 8);
      this.flash = Math.max(this.flash, 0.5);

      this.particles.push({
        kind: 3,
        x: g.x,
        y: g.y,
        vx: 0,
        vy: 0,
        life: 0.45,
        tl: 0.45,
        size: blastRadius * 2.2,
        rot: 0,
        vr: 0,
        col: "255,80,20",
        grav: 0,
        drag: 0,
      });

      for (let i = 0; i < 22; i++) {
        const a = rand(0, TAU);
        const sp = rand(150, 480);
        this.particles.push({
          kind: 1,
          x: g.x,
          y: g.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: rand(0.2, 0.45),
          tl: 0.45,
          size: rand(2.5, 5),
          rot: 0,
          vr: 0,
          col: "255,140,40",
          grav: 150,
          drag: 2,
        });
      }

      this.texts.push({
        x: g.x,
        y: g.y - g.r - 28,
        t: 0,
        life: 1.0,
        str: "MOLTEN BLAST!",
        size: 18,
        col: "#ff5722",
      });

      // Chain destroy neighboring gems within blast radius
      const nearby = this.gems.filter(
        (other) => !other.dead && Math.hypot(other.x - g.x, other.y - g.y) <= blastRadius,
      );
      if (nearby.length >= 1) {
        unlockAchievement("molten_demolisher");
      }
      for (const other of nearby) {
        this.hitGem(other, triggeringOrb);
      }
    }

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

    if (triggeringOrb) {
      triggeringOrb.vx *= 0.965;
      triggeringOrb.vy *= 0.965;
    }

    const size = clamp(Math.min(this.W, this.H) * 0.045, 17, 30);
    const comboTitle =
      this.combo >= 5
        ? `x${this.combo} COSMIC CHAIN!`
        : this.combo >= 4
          ? `x${this.combo} ULTRA COMBO!`
          : this.combo >= 3
            ? `x${this.combo} MEGA COMBO!`
            : this.combo === 2
              ? `COMBO x2!`
              : undefined;

    this.texts.push({
      x: g.x,
      y: g.y - g.r - 6,
      t: 0,
      life: 0.9 + Math.min(this.combo * 0.1, 0.4),
      str: `+${pts}`,
      size: size * (this.combo > 2 ? 1.15 : 1.0),
      col: gold ? "#ffd23e" : this.combo > 2 ? "#fde047" : "#7dfce7",
      sub: comboTitle,
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

    // Achievement checks
    if (triggeringOrb) {
      if (this.combo >= 3 && (triggeringOrb.bounces ?? 0) >= 1) {
        unlockAchievement("ricochet_master");
      }
      if (this.combo >= 3 && triggeringOrb.coreType === "cluster") {
        unlockAchievement("cluster_master");
      }
      if (triggeringOrb.coreType === "heavy" && (triggeringOrb.piercedBlocks?.size ?? 0) > 0) {
        unlockAchievement("heavy_piercer");
      }
      if (triggeringOrb.gravityInfluenced) {
        unlockAchievement("singularity_slingshot");
      }
    }

    const isFinalGem = this.gems.every((q) => q.dead);
    if (isFinalGem && !this.pending) {
      this.pending = { type: "clear", t: 1.1 };
      this.slowMo = 0.85; // Matrix cinematic slow-motion effect
      this.shake = Math.min(28, this.shake + 11);
      this.flash = 0.65;

      // Expand 3 giant celestial shockwave rings from final crystal epicenter
      const minDim = Math.min(this.W, this.H);
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          kind: 3,
          x: g.x,
          y: g.y,
          vx: 0,
          vy: 0,
          life: 0.75 + i * 0.18,
          tl: 0.75 + i * 0.18,
          size: minDim * (0.65 + i * 0.35),
          rot: 0,
          vr: 0,
          col: i === 0 ? "255,210,62" : i === 1 ? "46,230,201" : "255,255,255",
          grav: 0,
          drag: 0,
        });
      }
    }
    this.pushUI();
  }

  private killOrb(target?: Orb) {
    const o = target || this.orb;
    if (!o) return;
    o.alive = false;
    this.orbsList = this.orbsList.filter((item) => item !== o && item.alive);

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

    if (this.orbsList.length === 0) {
      this.combo = 0;
      if (this.orbs <= 0 && !this.pending && !this.gems.every((q) => q.dead)) {
        this.pending = { type: "over", t: 0.85 };
      }
      this.pushUI();
    }
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
    checkCampaignMilestoneAchievements(progress.levels);

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
    haptics.victory();

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

    let simDt = dt;
    if (this.slowMo > 0) {
      this.slowMo -= dt;
      simDt = dt * 0.22; // 4.5x Matrix cinematic slow-motion
    }

    // fx update (also during menu / gameover)
    this.updateParticles(simDt);
    this.updateTexts(simDt);
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

    // Update rotating obstacles
    for (const rot of this.rotators) {
      rot.angle = (rot.angle + rot.speed * dt) % TAU;
    }

    // orb physics (2 substeps) for all active orbs
    const activeOrbs = this.orbsList.filter((o) => o.alive);
    if (activeOrbs.length > 0) {
      const sdt = simDt / 2;
      for (let s = 0; s < 2; s++) {
        for (const o of activeOrbs) {
          if (!o.alive) continue;
          o.t += sdt;
          o.vy += this.G * sdt;

          // Gravity Wells pull
          for (const gw of this.gravityWells) {
            const gdx = gw.x - o.x;
            const gdy = gw.y - o.y;
            const distSq = gdx * gdx + gdy * gdy;
            if (distSq < gw.radius * gw.radius) {
              o.gravityInfluenced = true;
              const dist = Math.sqrt(distSq);
              const force = (gw.strength * 450) / (distSq + 900);
              o.vx += (gdx / (dist + 0.001)) * force * sdt;
              o.vy += (gdy / (dist + 0.001)) * force * sdt;
            }
          }

          // Wormhole Portals
          if ((o.portalCooldown ?? 0) > 0) {
            o.portalCooldown = Math.max(0, (o.portalCooldown ?? 0) - sdt);
          } else {
            for (const wh of this.wormholes) {
              const d1Sq = (o.x - wh.x1) ** 2 + (o.y - wh.y1) ** 2;
              const d2Sq = (o.x - wh.x2) ** 2 + (o.y - wh.y2) ** 2;
              const sp = Math.hypot(o.vx, o.vy) || 120;
              let entered = false;
              let tx = 0, ty = 0;

              if (d1Sq < (wh.r + o.r * 0.4) ** 2) {
                entered = true;
                tx = wh.x2;
                ty = wh.y2;
              } else if (d2Sq < (wh.r + o.r * 0.4) ** 2) {
                entered = true;
                tx = wh.x1;
                ty = wh.y1;
              }

              if (entered) {
                unlockAchievement("wormhole_voyager");
                o.x = tx + (o.vx / sp) * (wh.r + 4);
                o.y = ty + (o.vy / sp) * (wh.r + 4);
                o.portalCooldown = 0.4;
                sfx.spaceChime();
                haptics.fire();
                this.shake = Math.min(26, this.shake + 3);

                this.particles.push({
                  kind: 3,
                  x: tx,
                  y: ty,
                  vx: 0,
                  vy: 0,
                  life: 0.35,
                  tl: 0.35,
                  size: wh.r * 2.4,
                  rot: 0,
                  vr: 0,
                  col: "46,230,201",
                  grav: 0,
                  drag: 0,
                });

                this.texts.push({
                  x: tx,
                  y: ty - wh.r - 12,
                  t: 0,
                  life: 0.8,
                  str: "WARP!",
                  size: 15,
                  col: "#2ee6c9",
                });
                break;
              }
            }
          }

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
            o.bounces = (o.bounces ?? 0) + 1;
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
            haptics.bounce();
            this.shake = Math.min(26, this.shake + Math.min(4, impact / 400));
          }

          // blocks
          for (const b of this.blocks) {
            if (o.piercedBlocks?.has(b)) continue;
            const cx = clamp(o.x, b.x, b.x + b.w);
            const cy = clamp(o.y, b.y, b.y + b.h);
            let dx = o.x - cx;
            let dy = o.y - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 < o.r * o.r) {
              // Heavy core pierce check:
              if (o.coreType === "heavy" && (o.piercesLeft ?? 0) > 0) {
                if (!o.piercedBlocks) o.piercedBlocks = new Set();
                o.piercedBlocks.add(b);
                o.piercesLeft = (o.piercesLeft ?? 1) - 1;
                o.vx *= 0.86;
                o.vy *= 0.86;
                sfx.thud(1.0);
                haptics.shatter(2);
                this.shake = Math.min(26, this.shake + 5);
                for (let pi = 0; pi < 10; pi++) {
                  this.particles.push({
                    kind: 0,
                    x: cx,
                    y: cy,
                    vx: rand(-160, 160),
                    vy: rand(-160, 160),
                    life: rand(0.25, 0.5),
                    tl: 0.5,
                    size: 4,
                    rot: rand(0, TAU),
                    vr: rand(-5, 5),
                    col: "180,200,230",
                    grav: 500,
                    drag: 1.2,
                  });
                }
                this.texts.push({
                  x: cx,
                  y: cy - 14,
                  t: 0,
                  life: 0.8,
                  str: "PIERCE!",
                  size: 16,
                  col: "#38bdf8",
                });
                break;
              }

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
                o.bounces = (o.bounces ?? 0) + 1;
                o.vx -= 1.62 * vn * dx;
                o.vy -= 1.62 * vn * dy;
                if (-vn > 160) {
                  sfx.thud(-vn / this.maxSpeed);
                  haptics.bounce();
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

          // rotators
          for (const rot of this.rotators) {
            const cosA = Math.cos(rot.angle);
            const sinA = Math.sin(rot.angle);
            const halfL = rot.len / 2;
            const p1x = rot.x - cosA * halfL;
            const p1y = rot.y - sinA * halfL;
            const p2x = rot.x + cosA * halfL;
            const p2y = rot.y + sinA * halfL;

            const segDx = p2x - p1x;
            const segDy = p2y - p1y;
            const segLenSq = segDx * segDx + segDy * segDy;
            const t_proj = segLenSq > 0 ? clamp(((o.x - p1x) * segDx + (o.y - p1y) * segDy) / segLenSq, 0, 1) : 0;
            const cx = p1x + t_proj * segDx;
            const cy = p1y + t_proj * segDy;

            let dx = o.x - cx;
            let dy = o.y - cy;
            const distSq = dx * dx + dy * dy;
            const minR = o.r + rot.width / 2;

            if (distSq < minR * minR) {
              const dist = Math.sqrt(distSq);
              const nx = dist > 0.001 ? dx / dist : 0;
              const ny = dist > 0.001 ? dy / dist : -1;
              o.x = cx + nx * minR;
              o.y = cy + ny * minR;

              const r_arm_x = cx - rot.x;
              const r_arm_y = cy - rot.y;
              const barVx = -rot.speed * r_arm_y;
              const barVy = rot.speed * r_arm_x;

              const relVx = o.vx - barVx;
              const relVy = o.vy - barVy;
              const vn = relVx * nx + relVy * ny;

              if (vn < 0) {
                o.bounces = (o.bounces ?? 0) + 1;
                const restitution = 1.35;
                o.vx = barVx + (relVx - (1 + restitution) * vn * nx);
                o.vy = barVy + (relVy - (1 + restitution) * vn * ny);
                sfx.thud(1.0);
                haptics.bounce();
                this.shake = Math.min(26, this.shake + 3.5);
                for (let i = 0; i < 6; i++) {
                  this.particles.push({
                    kind: 1,
                    x: cx,
                    y: cy,
                    vx: rand(-120, 120),
                    vy: rand(-120, 120),
                    life: rand(0.12, 0.28),
                    tl: 0.28,
                    size: 2.2,
                    rot: 0,
                    vr: 0,
                    col: "255,210,62",
                    grav: 200,
                    drag: 2,
                  });
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
            if (dx * dx + dy * dy < rr * rr) this.hitGem(g, o);
          }
        }
      }

      for (const o of activeOrbs) {
        o.trail.push({ x: o.x, y: o.y });
        if (o.trail.length > 15) o.trail.shift();

        const sp = Math.hypot(o.vx, o.vy);
        if (sp < 75) o.slowT += dt;
        else o.slowT = 0;
        if (o.t > 8 || o.slowT > 0.55) this.killOrb(o);
      }
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
      // Gravity well trajectory bending
      for (const gw of this.gravityWells) {
        const gdx = gw.x - x;
        const gdy = gw.y - y;
        const distSq = gdx * gdx + gdy * gdy;
        if (distSq < gw.radius * gw.radius) {
          const dist = Math.sqrt(distSq);
          const force = (gw.strength * 450) / (distSq + 900);
          vx += (gdx / (dist + 0.001)) * force * dt;
          vy += (gdy / (dist + 0.001)) * force * dt;
        }
      }
      x += vx * dt;
      y += vy * dt;
      // Wormhole trajectory jump
      for (const wh of this.wormholes) {
        const d1Sq = (x - wh.x1) ** 2 + (y - wh.y1) ** 2;
        const d2Sq = (x - wh.x2) ** 2 + (y - wh.y2) ** 2;
        const s = Math.hypot(vx, vy) || 120;
        if (d1Sq < wh.r * wh.r) {
          x = wh.x2 + (vx / s) * (wh.r + 4);
          y = wh.y2 + (vy / s) * (wh.r + 4);
          break;
        } else if (d2Sq < wh.r * wh.r) {
          x = wh.x1 + (vx / s) * (wh.r + 4);
          y = wh.y1 + (vy / s) * (wh.r + 4);
          break;
        }
      }
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

    // gravity wells (accretion halos under structures)
    this.drawGravityWells();

    // wormholes
    this.drawWormholes();

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

    // rotators
    this.drawRotators();

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

    // orbs + trails
    for (const o of this.orbsList) {
      if (!o.alive) continue;
      const sprite = this.getOrbSprite(o.coreType);
      ctx.globalCompositeOperation = "lighter";
      const skin = SKINS.find((s) => s.id === this.equippedSkin) || SKINS[0];
      let trailColor = skin.trailColor;
      if (o.coreType === "cluster") trailColor = "125,252,231";
      else if (o.coreType === "blast") trailColor = "255,80,20";
      else if (o.coreType === "heavy") trailColor = "56,189,248";

      for (let i = 0; i < o.trail.length; i++) {
        const tr = o.trail[i];
        const f = i / o.trail.length;
        ctx.fillStyle = `rgba(${trailColor},${f * 0.35})`;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, o.r * (0.25 + 0.75 * f), 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      const size = o.r * 5;
      ctx.drawImage(sprite, o.x - size / 2, o.y - size / 2, size, size);
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

  private drawGravityWells() {
    const { ctx } = this;
    for (const gw of this.gravityWells) {
      const pulse = 1 + 0.08 * Math.sin(this.t * 3.5);
      const r = gw.radius * pulse;

      // Outer gravitational field halo
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(gw.x, gw.y, 10, gw.x, gw.y, r);
      g.addColorStop(0, "rgba(147, 51, 234, 0.45)");
      g.addColorStop(0.4, "rgba(79, 70, 229, 0.2)");
      g.addColorStop(0.8, "rgba(14, 165, 233, 0.08)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, r, 0, TAU);
      ctx.fill();

      // Accretion spiral lines
      ctx.strokeStyle = "rgba(192, 132, 252, 0.6)";
      ctx.lineWidth = 1.6;
      ctx.save();
      ctx.translate(gw.x, gw.y);
      ctx.rotate(this.t * 2.2);
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.globalCompositeOperation = "source-over";

      // Event Horizon (Singularity Black Core)
      const coreR = Math.max(10, gw.radius * 0.16);
      ctx.fillStyle = "#020108";
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, coreR, 0, TAU);
      ctx.fill();

      // Glowing photon sphere ring
      ctx.strokeStyle = "rgba(238, 242, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, coreR, 0, TAU);
      ctx.stroke();
    }
  }

  private drawWormholes() {
    const { ctx } = this;
    for (const wh of this.wormholes) {
      // Entanglement bridge dashed line between portals
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(46, 230, 201, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -this.t * 20;
      ctx.beginPath();
      ctx.moveTo(wh.x1, wh.y1);
      ctx.lineTo(wh.x2, wh.y2);
      ctx.stroke();
      ctx.restore();

      const drawPortal = (px: number, py: number, isEntry: boolean) => {
        const pulse = 1 + 0.07 * Math.sin(this.t * 4 + (isEntry ? 0 : Math.PI));
        const pr = wh.r * pulse;
        const colorPrimary = isEntry ? "46, 230, 201" : "217, 70, 239";
        const colorSecondary = isEntry ? "14, 165, 233" : "168, 85, 247";

        ctx.globalCompositeOperation = "lighter";
        const grad = ctx.createRadialGradient(px, py, 2, px, py, pr * 1.8);
        grad.addColorStop(0, `rgba(${colorPrimary}, 0.5)`);
        grad.addColorStop(0.5, `rgba(${colorSecondary}, 0.25)`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, pr * 1.8, 0, TAU);
        ctx.fill();

        // Swirling spiral rings
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((isEntry ? 1 : -1) * this.t * 3.5);
        ctx.strokeStyle = `rgba(${colorPrimary}, 0.85)`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, pr, 0, TAU * 0.7);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${colorSecondary}, 0.7)`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, pr * 0.65, Math.PI * 0.5, TAU * 0.85);
        ctx.stroke();
        ctx.restore();

        ctx.globalCompositeOperation = "source-over";
        // Void Core
        ctx.fillStyle = "#030014";
        ctx.beginPath();
        ctx.arc(px, py, pr * 0.35, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(${colorPrimary}, 0.9)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };

      drawPortal(wh.x1, wh.y1, true);
      drawPortal(wh.x2, wh.y2, false);
    }
  }

  private drawRotators() {
    const { ctx } = this;
    for (const rot of this.rotators) {
      ctx.save();
      ctx.translate(rot.x, rot.y);
      ctx.rotate(rot.angle);

      const halfL = rot.len / 2;
      const halfW = rot.width / 2;

      // Outer kinetic energy glow
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(46, 230, 201, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(-halfL - 2, -halfW - 2, rot.len + 4, rot.width + 4);

      ctx.globalCompositeOperation = "source-over";
      // Metallic beam body
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(-halfL, -halfW, rot.len, rot.width);

      // Neon energy core line
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-halfL + 6, -1.5, rot.len - 12, 3);

      // Edge border
      ctx.strokeStyle = "rgba(125, 252, 231, 0.9)";
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-halfL, -halfW, rot.len, rot.width);

      // Center pivot hub
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(0, 0, rot.width * 0.85, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 210, 62, 0.95)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffd23e";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, TAU);
      ctx.fill();

      ctx.restore();
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

    if (angle !== null && power > 0.02 && !this.hasActiveOrb) {
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
      !this.hasActiveOrb &&
      this.orbs > 0 &&
      (this.screen === "playing" || this.screen === "paused")
    ) {
      const padSprite = this.getOrbSprite(this.selectedCore);
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
      ctx.drawImage(padSprite, ox - size / 2, oy - size / 2, size, size);
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
      launcherPos: { x: this.launcher.x, y: this.launcher.y },
      landscape: this.landscape,
      isAiming: this.aimMode !== "none",
      selectedCore: this.selectedCore,
      victoryData: this.victoryData ?? undefined,
      progress: loadProgress(),
    });
  }
}
