import type { AimMode, CoreType, MascotReaction, Orb, Screen } from "../types";
import { clamp } from "../utils/math";
import { sfx } from "../audio";

export interface InputHost {
  canvas: HTMLCanvasElement;
  getScreen: () => Screen;
  isLandscape: () => boolean;
  hasActiveOrb: () => boolean;
  getOrbsCount: () => number;
  getActiveClusterOrb: () => Orb | undefined;
  splitClusterOrb: (orb: Orb) => void;
  fire: (angle: number, power: number) => void;
  selectCore: (core: CoreType) => void;
  toggleMute: () => void;
  pause: () => void;
  resume: () => void;
  play: () => void;
  restart: () => void;
  setMascot: (
    reaction: MascotReaction,
    key: string,
    params?: Record<string, string | number>,
    durationMs?: number
  ) => void;
  pushUI: () => void;
  getDimensions: () => { W: number; H: number };
}

export class InputManager {
  aimMode: AimMode = "none";
  pullStart = { x: 0, y: 0 };
  pullCur = { x: 0, y: 0 };
  pointerId = -1;

  kbAngle = -0.7;
  kbAimX = 0;
  charging = false;
  chargePow = 0;
  chargeBucket = -1;

  private host: InputHost;
  private canvas: HTMLCanvasElement;

  constructor(host: InputHost) {
    this.host = host;
    this.canvas = host.canvas;
  }

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("pointerdown", this.onPtrDown);
    this.canvas.addEventListener("pointermove", this.onPtrMove);
    this.canvas.addEventListener("pointerup", this.onPtrUp);
    this.canvas.addEventListener("pointercancel", this.onPtrCancel);
    this.canvas.addEventListener("contextmenu", this.onCtxMenu);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPtrDown);
    this.canvas.removeEventListener("pointermove", this.onPtrMove);
    this.canvas.removeEventListener("pointerup", this.onPtrUp);
    this.canvas.removeEventListener("pointercancel", this.onPtrCancel);
    this.canvas.removeEventListener("contextmenu", this.onCtxMenu);
  }

  update(dt: number): void {
    if (this.kbAimX !== 0 && !this.host.hasActiveOrb()) {
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
  }

  resetAim(): void {
    this.aimMode = "none";
    this.charging = false;
    this.chargePow = 0;
    this.chargeBucket = -1;
    this.pointerId = -1;
  }

  setKbAngle(angle: number): void {
    this.kbAngle = angle;
  }

  maxDragDistance(): number {
    const { W, H } = this.host.getDimensions();
    const minDim = Math.min(W, H);
    return clamp(minDim * 0.22, 130, 190);
  }

  aimRange(): [number, number] {
    return this.host.isLandscape() ? [-3.08, -0.06] : [-2.4, -0.75];
  }

  private ptrPos(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onCtxMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onPtrDown = (e: PointerEvent) => {
    sfx.ensure();
    if (this.host.getScreen() !== "playing") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // In-flight cluster split check!
    const activeCluster = this.host.getActiveClusterOrb();
    if (activeCluster) {
      this.host.splitClusterOrb(activeCluster);
      return;
    }

    if (this.host.hasActiveOrb()) return;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.ptrPos(e);
    this.pullStart = p;
    this.pullCur = p;
    this.aimMode = "pull";
    this.host.setMascot("aiming", "mascotAiming", undefined, 0);
    this.host.pushUI();
  };

  private onPtrMove = (e: PointerEvent) => {
    if (this.aimMode !== "pull" || e.pointerId !== this.pointerId) return;
    this.pullCur = this.ptrPos(e);
  };

  private onPtrUp = (e: PointerEvent) => {
    if (this.aimMode !== "pull" || e.pointerId !== this.pointerId) return;
    this.aimMode = "none";
    this.pointerId = -1;
    this.host.pushUI();
    if (this.host.getScreen() !== "playing" || this.host.hasActiveOrb()) return;
    const dx = this.pullStart.x - this.pullCur.x;
    const dy = this.pullStart.y - this.pullCur.y;
    const len = Math.hypot(dx, dy);
    if (len < 10) {
      if (len > 4) sfx.cancel();
      this.host.setMascot("idle", "", undefined, 0);
      return;
    }
    const power = clamp(len / this.maxDragDistance(), 0, 1);
    this.host.fire(Math.atan2(dy, dx), power);
  };

  private onPtrCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.aimMode = "none";
    this.pointerId = -1;
    this.host.setMascot("idle", "", undefined, 0);
    this.host.pushUI();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k)) e.preventDefault();
    sfx.ensure();

    if (k === "m" || k === "M") {
      this.host.toggleMute();
      return;
    }
    const screen = this.host.getScreen();
    if (k === "p" || k === "P" || k === "Escape") {
      if (screen === "playing") this.host.pause();
      else if (screen === "paused") this.host.resume();
      return;
    }
    if (k === "r" || k === "R") {
      if (screen !== "menu") this.host.restart();
      return;
    }
    if (k === "Enter" || k === " ") {
      if (screen === "menu") {
        this.host.play();
        return;
      }
      if (screen === "gameover" && k === "Enter") {
        this.host.restart();
        return;
      }
    }

    if (screen !== "playing") return;

    // In-flight cluster split via keyboard
    if (k === " " || k === "Enter") {
      const activeCluster = this.host.getActiveClusterOrb();
      if (activeCluster) {
        e.preventDefault();
        this.host.splitClusterOrb(activeCluster);
        return;
      }
    }

    // Number keys 1-4 for core selection
    if (k === "1") { this.host.selectCore("standard"); return; }
    if (k === "2") { this.host.selectCore("cluster"); return; }
    if (k === "3") { this.host.selectCore("blast"); return; }
    if (k === "4") { this.host.selectCore("heavy"); return; }

    if (k === "ArrowUp" || k === "w" || k === "W" || k === "ArrowLeft" || k === "a" || k === "A") {
      this.kbAimX = -1;
      if (this.aimMode === "none" && !this.host.hasActiveOrb()) this.aimMode = "kb";
    } else if (k === "ArrowDown" || k === "s" || k === "S" || k === "ArrowRight" || k === "d" || k === "D") {
      this.kbAimX = 1;
      if (this.aimMode === "none" && !this.host.hasActiveOrb()) this.aimMode = "kb";
    }

    if (k === " " && !e.repeat) {
      if (!this.host.hasActiveOrb() && this.host.getOrbsCount() > 0) {
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
        if (this.host.getScreen() === "playing" && !this.host.hasActiveOrb() && this.chargePow > 0.06) {
          this.host.fire(this.kbAngle, this.chargePow);
        } else {
          sfx.cancel();
        }
        this.chargePow = 0;
      }
    }
  };
}
