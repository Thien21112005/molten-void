import type { Mote, TwStar } from "../types";
import { TAU, rand } from "../utils/math";

export class AmbientEnvironment {
  public twinkle: TwStar[] = [];
  public motes: Mote[] = [];

  public init(W: number, H: number): void {
    this.twinkle = [];
    for (let i = 0; i < 26; i++) {
      this.twinkle.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.8, 2.2),
        ph: rand(0, TAU),
        sp: rand(0.6, 2.2),
      });
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

  public update(dt: number, t: number, W: number, H: number): void {
    for (const m of this.motes) {
      m.y -= m.spd * dt;
      m.x += Math.sin(t * 0.7 + m.phase) * 8 * dt;
      if (m.y < -8) {
        m.y = H + 8;
        m.x = rand(0, W);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, t: number): void {
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.twinkle) {
      const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
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
  }
}
