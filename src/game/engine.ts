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
import {
  type Screen,
  type HighScore,
  type VictoryData,
  type CoreType,
  type MascotState,
  type UIState,
  type Gem,
  type Block,
  type GravityWell,
  type Wormhole,
  type Rotator,
  type Orb,
  type Particle,
  type FloatText,
  type Mote,
  type TwStar,
  type AimMode,
  HS_KEY,
  MAX_ORBS,
} from "./types";
import { TAU, clamp, rand, pick, easeOutBack } from "./utils/math";
import { ParticleSystem } from "./fx/particleSystem";
import { FloatTextSystem } from "./fx/floatTextSystem";
import { AmbientEnvironment } from "./fx/ambientEnvironment";
import { SpriteFactory } from "./renderers/spriteFactory";
import { simulateTrajectory } from "./physics/trajectorySimulator";
import { applyGravityWells, applyWormholes } from "./physics/forces";
import {
  resolveWallCollision,
  resolveBlockCollision,
  resolveRotatorCollision,
} from "./physics/collisions";
import {
  drawBlocks,
  drawGems,
  drawGravityWells,
  drawWormholes,
  drawRotators,
} from "./renderers/obstacleRenderer";
import { drawGhostTrail, drawLauncher } from "./renderers/launcherRenderer";
import { drawOrbs } from "./renderers/orbRenderer";

export type {
  Screen,
  HighScore,
  VictoryData,
  CoreType,
  MascotState,
  UIState,
  Gem,
  Block,
  GravityWell,
  Wormhole,
  Rotator,
  Orb,
  Particle,
  FloatText,
  Mote,
  TwStar,
  AimMode,
};
export { HS_KEY, MAX_ORBS };

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
  private previousScreen: Screen = "menu";
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
  private mascotTimer: number | null = null;
  private mascotState: MascotState = { reaction: "idle", key: "", id: 0 };

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
  private spriteFactory = new SpriteFactory();
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

  // ghost trajectory trail (Angry Birds style)
  private ghostTrail: { x: number; y: number }[] = [];
  private currentShotPath: { x: number; y: number }[] = [];

  // fx systems
  private particles = new ParticleSystem();
  private texts = new FloatTextSystem();
  private ambient = new AmbientEnvironment();
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
    this.previousScreen = this.screen;
    this.screen = "roadmap";
    this.aimMode = "none";
    this.charging = false;
    this.pushUI();
  }

  closeRoadmap() {
    sfx.ensure();
    sfx.click();
    if (this.previousScreen === "paused" || this.previousScreen === "playing") {
      this.screen = "paused";
      sfx.setMusicMode("paused");
    } else {
      this.screen = "menu";
      sfx.setMusicMode("menu");
    }
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
    if (this.screen !== "paused" && this.screen !== "roadmap") return;
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
    this.spriteFactory.clearCoreCache();
    this.orbSprite = this.spriteFactory.getOrbSprite("standard", this.equippedSkin);
    this.pushUI();
  }

  public setMascot(
    reaction: "idle" | "aiming" | "cheer" | "sad" | "victory",
    key: string,
    params?: Record<string, string | number>,
    durationMs = 2200
  ) {
    if (this.mascotTimer) {
      window.clearTimeout(this.mascotTimer);
      this.mascotTimer = null;
    }
    this.mascotState = {
      reaction,
      key,
      params,
      id: Date.now(),
    };
    this.pushUI();

    if (reaction !== "idle" && durationMs > 0) {
      this.mascotTimer = window.setTimeout(() => {
        this.mascotState = { reaction: "idle", key: "", id: Date.now() };
        this.pushUI();
      }, durationMs);
    }
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
    this.setMascot("aiming", "mascotAiming", undefined, 0);
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
      this.setMascot("idle", "", undefined, 0);
      return;
    }
    const power = clamp(len / this.maxDragDistance(), 0, 1);
    this.fire(Math.atan2(dy, dx), power);
  };

  private onPtrCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.aimMode = "none";
    this.pointerId = -1;
    this.setMascot("idle", "", undefined, 0);
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
    this.starfield = SpriteFactory.buildStarfield(W, H, dpr);
    this.vignette = SpriteFactory.buildVignette(W, H, dpr);

    // sprites
    this.orbSprite = this.spriteFactory.getOrbSprite("standard", this.equippedSkin);
    this.iceSprite = this.spriteFactory.makeGemSprite("ice");
    this.goldSprite = this.spriteFactory.makeGemSprite("gold");

    // ambient twinkle + motes
    this.ambient.init(W, H);
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
    this.ghostTrail = [];
    this.currentShotPath = [];

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
    this.setMascot("idle", "", undefined, 0);
    this.currentShotPath = [{ x: this.launcher.x, y: this.launcher.y }];
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
      this.setMascot("cheer", "mascotGold", undefined, 2500);
    } else if (this.combo >= 2) {
      this.setMascot("cheer", "mascotCombo", { combo: this.combo }, 2400);
    } else {
      this.setMascot("cheer", "mascotHit", undefined, 2000);
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
      if (this.currentShotPath.length > 2) {
        this.ghostTrail = [...this.currentShotPath];
      }
      this.currentShotPath = [];
      if (this.combo === 0) {
        if (this.orbs === 1) {
          this.setMascot("sad", "mascotLastCore", undefined, 2600);
        } else {
          this.setMascot("sad", "mascotMiss", undefined, 2400);
        }
      } else if (this.gems.filter((q) => !q.dead).length === 1) {
        this.setMascot("cheer", "mascotClutch", undefined, 2500);
      }
      this.combo = 0;
      if (this.orbs <= 0 && !this.pending && !this.gems.every((q) => q.dead)) {
        this.pending = { type: "over", t: 0.85 };
        this.setMascot("sad", "mascotGameOver", undefined, 3500);
      }
      this.pushUI();
    }
  }

  private doLevelClear() {
    if (this.currentShotPath.length > 2) {
      this.ghostTrail = [...this.currentShotPath];
    }
    this.currentShotPath = [];
    this.setMascot("victory", "mascotVictory", undefined, 4500);
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
    this.texts.banner(this.W, this.H, str, sub);
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
    this.ambient.update(dt, this.t, this.W, this.H);

    if (this.screen === "paused") return;

    let simDt = dt;
    if (this.slowMo > 0) {
      this.slowMo -= dt;
      simDt = dt * 0.22; // 4.5x Matrix cinematic slow-motion
    }

    // fx update (also during menu / gameover)
    this.particles.update(simDt);
    this.texts.update(simDt);
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
          applyGravityWells(o, this.gravityWells, sdt);

          // Wormhole Portals
          applyWormholes(o, this.wormholes, sdt, (tx, ty, r) => {
            unlockAchievement("wormhole_voyager");
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
              size: r * 2.4,
              rot: 0,
              vr: 0,
              col: "46,230,201",
              grav: 0,
              drag: 0,
            });

            this.texts.push({
              x: tx,
              y: ty - r - 12,
              t: 0,
              life: 0.8,
              str: "WARP!",
              size: 15,
              col: "#2ee6c9",
            });
          });

          o.x += o.vx * sdt;
          o.y += o.vy * sdt;

          // Wall collision & boundaries
          const { impact } = resolveWallCollision(o, this.W, this.H, sdt);
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

          // Blocks collision & pierce
          resolveBlockCollision(
            o,
            this.blocks,
            (b, cx, cy) => {
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
            },
            (vn, cx, cy) => {
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
          );

          // Rotators collision
          resolveRotatorCollision(o, this.rotators, (cx, cy) => {
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
          });

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

      // Sample ghost trajectory path for the primary comet
      if (activeOrbs[0] && activeOrbs[0].alive) {
        const prim = activeOrbs[0];
        const last = this.currentShotPath[this.currentShotPath.length - 1];
        if (!last || (prim.x - last.x) ** 2 + (prim.y - last.y) ** 2 >= 144) {
          this.currentShotPath.push({ x: prim.x, y: prim.y });
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

  // ---------- trajectory sim ----------

  private simTraj(angle: number, power: number) {
    const cfg = loadSettings();
    const maxSteps = cfg.trajectoryGuide === "minimal" ? 22 : 70;
    return simulateTrajectory(
      this.launcher,
      angle,
      power,
      this.maxSpeed,
      this.G,
      this.W,
      this.H,
      this.gravityWells,
      this.wormholes,
      this.blocks,
      this.gems,
      maxSteps
    );
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

    // ambient twinkle & motes
    this.ambient.draw(ctx, this.t);

    // gravity wells (accretion halos under structures)
    drawGravityWells(ctx, this.gravityWells, this.t);

    // wormholes
    drawWormholes(ctx, this.wormholes, this.t);

    // blocks
    drawBlocks(ctx, this.blocks);

    // rotators
    drawRotators(ctx, this.rotators);

    // gems
    drawGems(ctx, this.gems, this.t, this.goldSprite, this.iceSprite);

    // ghost trajectory trail of previous shot (Angry Birds style)
    drawGhostTrail(ctx, this.ghostTrail, this.screen);

    // launcher + aim
    if (this.screen !== "menu") {
      drawLauncher(ctx, {
        launcher: this.launcher,
        padR: this.padR,
        orbR: this.orbR,
        t: this.t,
        aimMode: this.aimMode,
        pullStart: this.pullStart,
        pullCur: this.pullCur,
        maxDragDistance: this.maxDragDistance(),
        kbAngle: this.kbAngle,
        charging: this.charging,
        chargePow: this.chargePow,
        hasActiveOrb: this.hasActiveOrb,
        orbs: this.orbs,
        screen: this.screen,
        selectedCore: this.selectedCore,
        equippedSkin: this.equippedSkin,
        spriteFactory: this.spriteFactory,
        simTraj: (angle, power) => this.simTraj(angle, power),
        powerColor: (p) => this.powerColor(p),
      });
    }

    // orbs + trails
    drawOrbs(ctx, this.orbsList, this.equippedSkin, this.spriteFactory);

    // particles
    this.particles.draw(ctx);

    // texts
    this.texts.draw(ctx);

    ctx.restore();

    if (this.vignette) ctx.drawImage(this.vignette, 0, 0, W, H);

    if (this.flash > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255,190,90,${this.flash * 0.22})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
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
      isFromPaused: this.previousScreen === "paused" || this.previousScreen === "playing",
      mascot: this.mascotState,
      hasActiveOrb: this.hasActiveOrb,
    });
  }
}
