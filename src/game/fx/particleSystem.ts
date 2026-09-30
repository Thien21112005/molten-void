import type { Particle } from "../types";
import { TAU, clamp } from "../utils/math";

export class ParticleSystem {
  public particles: Particle[] = [];

  public push(...items: Particle[]): number {
    return this.particles.push(...items);
  }

  public add(p: Particle): void {
    this.particles.push(p);
  }

  public get length(): number {
    return this.particles.length;
  }

  public set length(val: number) {
    this.particles.length = val;
  }

  public clear(): void {
    this.particles = [];
  }

  public update(dt: number): void {
    const arr = this.particles;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life -= dt;
      if (p.life <= 0) {
        arr[i] = arr[arr.length - 1];
        arr.pop();
        continue;
      }
      p.vy += p.grav * dt;
      p.vx *= 1 - Math.min(0.9, p.drag * dt);
      p.vy *= 1 - Math.min(0.9, p.drag * dt * 0.5);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    if (arr.length > 550) {
      arr.splice(0, arr.length - 550);
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const f = p.life / p.tl;
      if (p.kind === 0) {
        // Shard polygon
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${p.col},${clamp(f * 1.3, 0, 1)})`;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.kind === 1) {
        // Velocity spark
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${p.col},${clamp(f, 0, 1)})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (p.kind === 2) {
        // Soft expanding smoke puff
        ctx.fillStyle = `rgba(${p.col},${f * 0.22})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.6 - f * 0.6), 0, TAU);
        ctx.fill();
      } else {
        // Celestial shockwave ring
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${p.col},${f * 0.9})`;
        ctx.lineWidth = 3 * f + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - f * 0.7), 0, TAU);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }
}
