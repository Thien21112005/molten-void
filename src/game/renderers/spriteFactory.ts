import type { CoreType } from "../types";
import { SKINS } from "../skins/skinsData";
import type { SkinId } from "../skins/types";
import { TAU, rand, pick } from "../utils/math";

export class SpriteFactory {
  private coreSprites: Partial<Record<string, HTMLCanvasElement>> = {};

  public clearCoreCache(): void {
    this.coreSprites = {};
  }

  public getOrbSprite(coreType: CoreType, equippedSkin: SkinId): HTMLCanvasElement {
    const cacheKey = coreType === "standard" ? `standard_${equippedSkin}` : coreType;
    if (this.coreSprites[cacheKey]) {
      return this.coreSprites[cacheKey]!;
    }

    const s = 128;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const g = c.getContext("2d")!;
    const cx = s / 2;
    const glow = g.createRadialGradient(cx, cx, 0, cx, cx, cx);

    if (coreType === "cluster") {
      glow.addColorStop(0, "rgba(230,255,250,0.98)");
      glow.addColorStop(0.18, "rgba(125,252,231,0.95)");
      glow.addColorStop(0.38, "rgba(46,230,201,0.75)");
      glow.addColorStop(0.65, "rgba(0,180,216,0.2)");
      glow.addColorStop(1, "rgba(0,180,216,0)");
    } else if (coreType === "blast") {
      glow.addColorStop(0, "rgba(255,250,220,0.98)");
      glow.addColorStop(0.18, "rgba(255,160,40,0.95)");
      glow.addColorStop(0.38, "rgba(255,60,20,0.85)");
      glow.addColorStop(0.65, "rgba(200,20,20,0.25)");
      glow.addColorStop(1, "rgba(200,20,20,0)");
    } else if (coreType === "heavy") {
      glow.addColorStop(0, "rgba(255,255,255,0.98)");
      glow.addColorStop(0.18, "rgba(186,230,253,0.95)");
      glow.addColorStop(0.38, "rgba(56,189,248,0.8)");
      glow.addColorStop(0.65, "rgba(30,58,138,0.3)");
      glow.addColorStop(1, "rgba(30,58,138,0)");
    } else {
      // standard with equipped skin customization
      const skin = SKINS.find((sk) => sk.id === equippedSkin) || SKINS[0];
      glow.addColorStop(0, skin.palette.core);
      glow.addColorStop(0.2, skin.palette.mid);
      glow.addColorStop(0.45, skin.palette.outer);
      glow.addColorStop(0.7, skin.palette.ambient);
      glow.addColorStop(1, "rgba(0,0,0,0)");
    }

    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);

    // Core detail highlight
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cx, s * 0.13, -2.4, -0.6);
    g.stroke();

    this.coreSprites[cacheKey] = c;
    return c;
  }

  public makeGemSprite(kind: "ice" | "gold"): HTMLCanvasElement {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const g = c.getContext("2d")!;
    const cx = s / 2;
    const cy = s / 2;
    const ice = kind === "ice";
    const glowCol = ice ? "rgba(46,230,201," : "rgba(255,210,62,";
    const base = ice ? "#12b39c" : "#f0b32a";
    const light = ice ? "#8ffce9" : "#fff3b0";
    const deep = ice ? "#0a5c52" : "#a06d10";

    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, cx);
    glow.addColorStop(0, glowCol + "0.55)");
    glow.addColorStop(0.5, glowCol + "0.16)");
    glow.addColorStop(1, glowCol + "0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);

    const R = s * 0.3;
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 6;
      const rr = i % 2 === 0 ? R : R * 0.82;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    g.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.closePath();
    const body = g.createLinearGradient(cx, cy - R, cx, cy + R);
    body.addColorStop(0, light);
    body.addColorStop(0.5, base);
    body.addColorStop(1, deep);
    g.fillStyle = body;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = ice ? "rgba(200,255,244,0.9)" : "rgba(255,250,210,0.9)";
    g.stroke();

    // Crystal facets
    g.strokeStyle = ice ? "rgba(230,255,250,0.5)" : "rgba(255,250,220,0.55)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx, cy - R);
    g.lineTo(cx, cy + R * 0.8);
    g.moveTo(pts[1][0], pts[1][1]);
    g.lineTo(cx, cy + R * 0.8);
    g.lineTo(pts[4][0], pts[4][1]);
    g.stroke();

    // Inner highlight
    g.beginPath();
    g.moveTo(cx - R * 0.4, cy - R * 0.35);
    g.lineTo(cx - R * 0.1, cy - R * 0.6);
    g.lineTo(cx + R * 0.1, cy - R * 0.35);
    g.closePath();
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.fill();
    return c;
  }

  public static buildStarfield(W: number, H: number, dpr: number): HTMLCanvasElement {
    const sf = document.createElement("canvas");
    sf.width = Math.round(W * dpr);
    sf.height = Math.round(H * dpr);
    const c = sf.getContext("2d")!;
    c.scale(dpr, dpr);
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0b0718");
    bg.addColorStop(0.55, "#070510");
    bg.addColorStop(1, "#050309");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    const neb = (x: number, y: number, r: number, col: string) => {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    };
    neb(W * 0.18, H * 0.75, Math.max(W, H) * 0.5, "rgba(255,94,26,0.055)");
    neb(W * 0.85, H * 0.15, Math.max(W, H) * 0.45, "rgba(32,226,192,0.05)");
    neb(W * 0.55, H * 0.5, Math.max(W, H) * 0.6, "rgba(124,77,255,0.045)");

    const starCols = ["255,255,255", "190,240,255", "255,225,170"];
    for (let i = 0; i < 150; i++) {
      c.fillStyle = `rgba(${pick(starCols)},${rand(0.15, 0.7)})`;
      c.beginPath();
      c.arc(rand(0, W), rand(0, H), rand(0.4, 1.4), 0, TAU);
      c.fill();
    }
    return sf;
  }

  public static buildVignette(W: number, H: number, dpr: number): HTMLCanvasElement {
    const vg = document.createElement("canvas");
    vg.width = Math.round(W * dpr);
    vg.height = Math.round(H * dpr);
    const vc = vg.getContext("2d")!;
    vc.scale(dpr, dpr);
    const rad = vc.createRadialGradient(
      W / 2,
      H * 0.45,
      Math.min(W, H) * 0.35,
      W / 2,
      H * 0.5,
      Math.max(W, H) * 0.75
    );
    rad.addColorStop(0, "rgba(0,0,0,0)");
    rad.addColorStop(1, "rgba(2,1,6,0.62)");
    vc.fillStyle = rad;
    vc.fillRect(0, 0, W, H);
    return vg;
  }
}
