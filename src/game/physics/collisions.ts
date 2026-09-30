import type { Block, Orb, Rotator } from "../types";
import { clamp } from "../utils/math";

export function resolveWallCollision(
  o: Orb,
  W: number,
  H: number,
  sdt: number
): { impact: number } {
  const rest = 0.56;
  let impact = 0;
  if (o.x - o.r < 0) {
    o.x = o.r;
    impact = Math.abs(o.vx);
    o.vx = Math.abs(o.vx) * rest;
  } else if (o.x + o.r > W) {
    o.x = W - o.r;
    impact = Math.abs(o.vx);
    o.vx = -Math.abs(o.vx) * rest;
  }
  if (o.y - o.r < 0) {
    o.y = o.r;
    impact = Math.max(impact, Math.abs(o.vy));
    o.vy = Math.abs(o.vy) * rest;
  } else if (o.y + o.r > H) {
    o.y = H - o.r;
    impact = Math.max(impact, Math.abs(o.vy));
    o.vy = -Math.abs(o.vy) * rest;
    if (Math.abs(o.vy) < 55) o.vy = 0;
  }
  // ground friction so the orb comes to rest
  if (o.y >= H - o.r - 0.5) {
    o.vx *= Math.max(0, 1 - 2.4 * sdt);
    if (Math.abs(o.vx) < 4) o.vx = 0;
  }
  return { impact };
}

export function resolveBlockCollision(
  o: Orb,
  blocks: Block[],
  onPierce: (b: Block, cx: number, cy: number) => void,
  onBounce: (vn: number, cx: number, cy: number) => void
): void {
  for (const b of blocks) {
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
        onPierce(b, cx, cy);
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
        onBounce(vn, cx, cy);
      }
    }
  }
}

export function resolveRotatorCollision(
  o: Orb,
  rotators: Rotator[],
  onBounce: (cx: number, cy: number) => void
): void {
  for (const rot of rotators) {
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
        onBounce(cx, cy);
      }
    }
  }
}
