import type { AimMode, CoreType, Screen } from "../types";
import type { SkinId } from "../skins/types";
import type { SpriteFactory } from "./spriteFactory";
import { TAU, clamp } from "../utils/math";

export interface LauncherRenderOptions {
  launcher: { x: number; y: number };
  padR: number;
  orbR: number;
  t: number;
  aimMode: AimMode;
  pullStart: { x: number; y: number };
  pullCur: { x: number; y: number };
  maxDragDistance: number;
  kbAngle: number;
  charging: boolean;
  chargePow: number;
  hasActiveOrb: boolean;
  orbs: number;
  screen: Screen;
  selectedCore: CoreType;
  equippedSkin: SkinId;
  spriteFactory: SpriteFactory;
  simTraj: (angle: number, power: number) => { pts: { x: number; y: number }[]; hit: { x: number; y: number } | null };
  powerColor: (p: number) => string;
}

export function drawGhostTrail(
  ctx: CanvasRenderingContext2D,
  ghostTrail: { x: number; y: number }[],
  screen: Screen
): void {
  if (ghostTrail.length < 2 || screen === "menu") return;
  ctx.save();

  // 1. Subtle stardust dashed flight path line
  ctx.beginPath();
  ctx.moveTo(ghostTrail[0].x, ghostTrail[0].y);
  for (let i = 1; i < ghostTrail.length; i++) {
    ctx.lineTo(ghostTrail[i].x, ghostTrail[i].y);
  }
  ctx.strokeStyle = "rgba(148, 163, 215, 0.22)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 7]);
  ctx.stroke();

  // 2. Translucent stardust ghost beads
  ctx.globalCompositeOperation = "lighter";
  const total = ghostTrail.length;
  const step = Math.max(1, Math.floor(total / 24));
  for (let i = 0; i < total; i += step) {
    const pt = ghostTrail[i];
    const prog = i / total;
    const alpha = 0.22 + 0.38 * (1 - prog * 0.45);

    // Outer cyan-teal stardust halo
    ctx.fillStyle = `rgba(46, 230, 201, ${alpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4.5, 0, TAU);
    ctx.fill();

    // Core white stardust pinprick
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.8, 0, TAU);
    ctx.fill();
  }

  // 3. Terminal impact / expiry crosshair ring at final position
  const last = ghostTrail[total - 1];
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = "rgba(255, 210, 62, 0.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 7.5, 0, TAU);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255, 210, 62, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(last.x - 5, last.y);
  ctx.lineTo(last.x + 5, last.y);
  ctx.moveTo(last.x, last.y - 5);
  ctx.lineTo(last.x, last.y + 5);
  ctx.stroke();

  ctx.restore();
}

export function drawLauncher(
  ctx: CanvasRenderingContext2D,
  options: LauncherRenderOptions
): void {
  const {
    launcher,
    padR,
    orbR,
    t,
    aimMode,
    pullStart,
    pullCur,
    maxDragDistance,
    kbAngle,
    charging,
    chargePow,
    hasActiveOrb,
    orbs,
    screen,
    selectedCore,
    equippedSkin,
    spriteFactory,
    simTraj,
    powerColor,
  } = options;
  const { x, y } = launcher;
  const pulse = 1 + 0.05 * Math.sin(t * 3.2);
  const R = padR * pulse;

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
  if (aimMode === "pull") {
    const dx = pullStart.x - pullCur.x;
    const dy = pullStart.y - pullCur.y;
    const len = Math.hypot(dx, dy);
    if (len > 10) {
      angle = Math.atan2(dy, dx);
      power = clamp(len / maxDragDistance, 0, 1);
    }
  } else if (aimMode === "kb") {
    angle = kbAngle;
    power = charging ? chargePow : 0;
  }

  if (angle !== null && power > 0.02 && !hasActiveOrb) {
    const { pts, hit } = simTraj(angle, power);
    const pc = powerColor(power);
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
  if (!hasActiveOrb && orbs > 0 && (screen === "playing" || screen === "paused")) {
    const padSprite = spriteFactory.getOrbSprite(selectedCore, equippedSkin);
    let ox = x;
    let oy = y;
    if (angle !== null && power > 0.02) {
      const maxVisualPull = clamp(padR * 2.8, 55, 95);
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
    const size = orbR * 5 * (angle !== null && power > 0.02 ? 0.92 : 1);
    ctx.drawImage(padSprite, ox - size / 2, oy - size / 2, size, size);
  }

  // kb power arc
  if (aimMode === "kb" && charging) {
    const pc = powerColor(chargePow);
    ctx.strokeStyle = `${pc}0.9)`;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y, R * 1.7, -Math.PI / 2, -Math.PI / 2 + chargePow * TAU);
    ctx.stroke();
    ctx.lineCap = "butt";
  }
}
