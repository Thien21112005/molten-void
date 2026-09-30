import type { FloatText } from "../types";
import { clamp, easeOutBack } from "../utils/math";

export class FloatTextSystem {
  public texts: FloatText[] = [];

  public push(...items: FloatText[]): number {
    return this.texts.push(...items);
  }

  public add(t: FloatText): void {
    this.texts.push(t);
  }

  public get length(): number {
    return this.texts.length;
  }

  public set length(val: number) {
    this.texts.length = val;
  }

  public banner(W: number, H: number, str: string, sub?: string): void {
    this.texts.push({
      x: W / 2,
      y: H * 0.3,
      t: 0,
      life: 1.5,
      str,
      size: clamp(Math.min(W, H) * 0.075, 26, 58),
      col: "#ffd23e",
      sub,
      big: true,
    });
  }

  public clear(): void {
    this.texts = [];
  }

  public update(dt: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const tx = this.texts[i];
      tx.t += dt;
      tx.y -= (tx.big ? 6 : 44) * dt;
      if (tx.t >= tx.life) {
        this.texts.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
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
}
