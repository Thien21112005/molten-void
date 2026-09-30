import type { Block, Gem, GravityWell, Rotator, Wormhole } from "../types";
import { TAU } from "../utils/math";

export function drawBlocks(ctx: CanvasRenderingContext2D, blocks: Block[]): void {
  for (const b of blocks) {
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
}

export function drawGems(
  ctx: CanvasRenderingContext2D,
  gems: Gem[],
  t: number,
  goldSprite: HTMLCanvasElement | null,
  iceSprite: HTMLCanvasElement | null
): void {
  for (const g of gems) {
    if (g.dead) continue;
    const bob = Math.sin(t * 2 + g.phase) * 3;
    const pulse = 1 + 0.05 * Math.sin(t * 3 + g.phase);
    const spr = g.kind === "gold" ? goldSprite : iceSprite;
    if (!spr) continue;
    const size = g.r * 5 * pulse;
    ctx.drawImage(spr, g.x - size / 2, g.y + bob - size / 2, size, size);
    if (g.kind === "gold") {
      const sa = t * 1.4 + g.phase;
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
}

export function drawGravityWells(
  ctx: CanvasRenderingContext2D,
  gravityWells: GravityWell[],
  t: number
): void {
  for (const gw of gravityWells) {
    const pulse = 1 + 0.08 * Math.sin(t * 3.5);
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
    ctx.rotate(t * 2.2);
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

export function drawWormholes(
  ctx: CanvasRenderingContext2D,
  wormholes: Wormhole[],
  t: number
): void {
  for (const wh of wormholes) {
    // Entanglement bridge dashed line between portals
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(46, 230, 201, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.moveTo(wh.x1, wh.y1);
    ctx.lineTo(wh.x2, wh.y2);
    ctx.stroke();
    ctx.restore();

    const drawPortal = (px: number, py: number, isEntry: boolean) => {
      const pulse = 1 + 0.07 * Math.sin(t * 4 + (isEntry ? 0 : Math.PI));
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
      ctx.rotate((isEntry ? 1 : -1) * t * 3.5);
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

export function drawRotators(ctx: CanvasRenderingContext2D, rotators: Rotator[]): void {
  for (const rot of rotators) {
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
