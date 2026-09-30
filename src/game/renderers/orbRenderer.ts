import type { Orb } from "../types";
import type { SkinId } from "../skins/types";
import { SKINS } from "../skins/skinsData";
import type { SpriteFactory } from "./spriteFactory";
import { TAU } from "../utils/math";

export function drawOrbs(
  ctx: CanvasRenderingContext2D,
  orbs: Orb[],
  equippedSkin: SkinId,
  spriteFactory: SpriteFactory
): void {
  for (const o of orbs) {
    if (!o.alive) continue;
    const sprite = spriteFactory.getOrbSprite(o.coreType, equippedSkin);
    ctx.globalCompositeOperation = "lighter";
    const skin = SKINS.find((s) => s.id === equippedSkin) || SKINS[0];
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
}
