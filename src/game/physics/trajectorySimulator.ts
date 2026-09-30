import type { Block, Gem, GravityWell, Wormhole } from "../types";
import { clamp } from "../utils/math";

export interface TrajectoryResult {
  pts: { x: number; y: number }[];
  hit: { x: number; y: number } | null;
}

export function simulateTrajectory(
  launcher: { x: number; y: number },
  angle: number,
  power: number,
  maxSpeed: number,
  G: number,
  W: number,
  H: number,
  gravityWells: GravityWell[],
  wormholes: Wormhole[],
  blocks: Block[],
  gems: Gem[],
  maxSteps: number
): TrajectoryResult {
  const sp = (0.2 + 0.8 * power) * maxSpeed;
  let x = launcher.x;
  let y = launcher.y;
  let vx = Math.cos(angle) * sp;
  let vy = Math.sin(angle) * sp;
  const dt = 1 / 50;
  const pts: { x: number; y: number }[] = [];
  let hit: { x: number; y: number } | null = null;

  for (let i = 0; i < maxSteps; i++) {
    vy += G * dt;

    // Gravity well trajectory bending
    for (const gw of gravityWells) {
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
    for (const wh of wormholes) {
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

    if (i % 3 === 0) {
      pts.push({ x, y });
    }

    if (x < 0 || x > W || y > H || y < 0) {
      hit = { x: clamp(x, 0, W), y: clamp(y, 0, H) };
      break;
    }

    let blocked = false;
    for (const b of blocks) {
      if (x > b.x - 6 && x < b.x + b.w + 6 && y > b.y - 6 && y < b.y + b.h + 6) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      for (const g of gems) {
        if (!g.dead && (x - g.x) ** 2 + (y - g.y) ** 2 < (g.r + 4) ** 2) {
          blocked = true;
          break;
        }
      }
    }

    if (blocked) {
      hit = { x, y };
      break;
    }
  }

  return { pts, hit };
}
