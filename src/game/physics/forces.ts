import type { GravityWell, Orb, Wormhole } from "../types";

export function applyGravityWells(o: Orb, gravityWells: GravityWell[], sdt: number): void {
  for (const gw of gravityWells) {
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
}

export function applyWormholes(
  o: Orb,
  wormholes: Wormhole[],
  sdt: number,
  onWarp: (tx: number, ty: number, r: number) => void
): void {
  if ((o.portalCooldown ?? 0) > 0) {
    o.portalCooldown = Math.max(0, (o.portalCooldown ?? 0) - sdt);
  } else {
    for (const wh of wormholes) {
      const d1Sq = (o.x - wh.x1) ** 2 + (o.y - wh.y1) ** 2;
      const d2Sq = (o.x - wh.x2) ** 2 + (o.y - wh.y2) ** 2;
      const sp = Math.hypot(o.vx, o.vy) || 120;
      let entered = false;
      let tx = 0;
      let ty = 0;

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
        o.x = tx + (o.vx / sp) * (wh.r + 4);
        o.y = ty + (o.vy / sp) * (wh.r + 4);
        o.portalCooldown = 0.4;
        onWarp(tx, ty, wh.r);
        break;
      }
    }
  }
}
