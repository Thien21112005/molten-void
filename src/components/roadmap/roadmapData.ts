import type { PlayerProgress } from "../../game/levels/types";
import { isLevelUnlocked } from "../../game/levels/progress";

export interface NodeCoord {
  id: number;
  x: number;
  y: number;
}

// 15 Level Nodes arranged horizontally from Left (Level 1) to Right (Level 15)
// in a rolling cosmic wave / S-curve (width = 2560px, height = 520px)
export const LEVEL_NODES: NodeCoord[] = [
  { id: 1, x: 140, y: 260 },   // Start Station (Left Center)
  { id: 2, x: 290, y: 370 },   // Dip down
  { id: 3, x: 450, y: 400 },   // Valley
  { id: 4, x: 610, y: 310 },   // Rise
  { id: 5, x: 770, y: 170 },   // Peak
  { id: 6, x: 930, y: 130 },   // High Summit
  { id: 7, x: 1090, y: 240 },  // Center crossover
  { id: 8, x: 1250, y: 380 },  // Valley
  { id: 9, x: 1410, y: 400 },  // Deep curve
  { id: 10, x: 1570, y: 280 }, // Rise
  { id: 11, x: 1730, y: 160 }, // Peak
  { id: 12, x: 1890, y: 130 }, // High Summit
  { id: 13, x: 2050, y: 250 }, // Center crossover
  { id: 14, x: 2210, y: 370 }, // Dip
  { id: 15, x: 2390, y: 260 }, // Apex Final Station (Right Center)
];

export const MAP_WIDTH = 2560;
export const MAP_HEIGHT = 520;

export interface RoadmapStar {
  x: number;
  y: number;
  type: "sparkle" | "sparkleSm" | "medium" | "dot";
  color: string;
  dur: string;
  delay: string;
  size?: number;
  opacity?: number;
}

export const ROADMAP_STARS: RoadmapStar[] = [
  // Section 1: x: 40 - 640 (Start / Levels 1-4)
  { x: 70, y: 80, type: "sparkle", color: "#ffd23e", dur: "3.2s", delay: "0.2s" },
  { x: 190, y: 50, type: "sparkleSm", color: "#7dfce7", dur: "2.8s", delay: "1.4s" },
  { x: 270, y: 140, type: "sparkle", color: "#ffffff", dur: "3.5s", delay: "0.8s" },
  { x: 380, y: 65, type: "sparkleSm", color: "#c084fc", dur: "3.0s", delay: "2.1s" },
  { x: 490, y: 110, type: "sparkle", color: "#38bdf8", dur: "3.4s", delay: "1.2s" },
  { x: 120, y: 440, type: "sparkleSm", color: "#ffd23e", dur: "2.9s", delay: "0.5s" },
  { x: 340, y: 470, type: "sparkle", color: "#7dfce7", dur: "3.6s", delay: "2.3s" },
  { x: 580, y: 460, type: "sparkleSm", color: "#ffffff", dur: "3.1s", delay: "1.7s" },
  { x: 50, y: 160, type: "medium", color: "#38bdf8", dur: "2.6s", delay: "0.3s", size: 2.5 },
  { x: 130, y: 40, type: "medium", color: "#ffd23e", dur: "3.0s", delay: "1.8s", size: 2.2 },
  { x: 230, y: 190, type: "medium", color: "#ffffff", dur: "2.5s", delay: "0.9s", size: 2 },
  { x: 320, y: 80, type: "medium", color: "#7dfce7", dur: "3.3s", delay: "2.4s", size: 2.8 },
  { x: 440, y: 160, type: "medium", color: "#c084fc", dur: "2.8s", delay: "0.7s", size: 2.2 },
  { x: 540, y: 40, type: "medium", color: "#fde047", dur: "3.1s", delay: "1.5s", size: 2.5 },
  { x: 200, y: 470, type: "medium", color: "#38bdf8", dur: "2.7s", delay: "1.1s", size: 2.2 },
  { x: 420, y: 490, type: "medium", color: "#ffffff", dur: "3.2s", delay: "0.4s", size: 2.6 },
  { x: 520, y: 420, type: "medium", color: "#7dfce7", dur: "2.9s", delay: "2.0s", size: 2 },
  { x: 90, y: 110, type: "dot", color: "#ffffff", dur: "4s", delay: "0.2s", size: 1.5, opacity: 0.6 },
  { x: 160, y: 130, type: "dot", color: "#7dfce7", dur: "4.5s", delay: "1.2s", size: 1.2, opacity: 0.5 },
  { x: 250, y: 40, type: "dot", color: "#ffd23e", dur: "3.8s", delay: "0.6s", size: 1.6, opacity: 0.7 },
  { x: 360, y: 120, type: "dot", color: "#ffffff", dur: "4.2s", delay: "2.0s", size: 1.4, opacity: 0.5 },
  { x: 460, y: 70, type: "dot", color: "#38bdf8", dur: "3.9s", delay: "1.4s", size: 1.5, opacity: 0.6 },
  { x: 80, y: 470, type: "dot", color: "#c084fc", dur: "4.1s", delay: "0.8s", size: 1.2, opacity: 0.5 },
  { x: 260, y: 440, type: "dot", color: "#ffffff", dur: "4.4s", delay: "1.9s", size: 1.5, opacity: 0.6 },
  { x: 480, y: 480, type: "dot", color: "#7dfce7", dur: "3.7s", delay: "0.4s", size: 1.4, opacity: 0.7 },
  { x: 610, y: 420, type: "dot", color: "#ffd23e", dur: "4.3s", delay: "1.6s", size: 1.2, opacity: 0.5 },

  // Section 2: x: 640 - 1280 (Aethon Gas Giant & Peaks / Levels 5-8)
  { x: 680, y: 60, type: "sparkle", color: "#ffd23e", dur: "3.4s", delay: "0.5s" },
  { x: 740, y: 110, type: "sparkleSm", color: "#7dfce7", dur: "2.9s", delay: "1.7s" },
  { x: 840, y: 45, type: "sparkle", color: "#ffffff", dur: "3.6s", delay: "2.2s" },
  { x: 920, y: 75, type: "sparkleSm", color: "#c084fc", dur: "3.1s", delay: "0.8s" },
  { x: 1020, y: 55, type: "sparkle", color: "#38bdf8", dur: "3.3s", delay: "1.9s" },
  { x: 1160, y: 100, type: "sparkleSm", color: "#ffd23e", dur: "2.8s", delay: "0.3s" },
  { x: 1240, y: 50, type: "sparkle", color: "#ffffff", dur: "3.5s", delay: "2.6s" },
  { x: 710, y: 460, type: "sparkleSm", color: "#7dfce7", dur: "3.0s", delay: "1.1s" },
  { x: 900, y: 480, type: "sparkle", color: "#ffd23e", dur: "3.7s", delay: "0.4s" },
  { x: 1050, y: 430, type: "sparkleSm", color: "#ffffff", dur: "2.7s", delay: "1.6s" },
  { x: 1200, y: 470, type: "sparkle", color: "#c084fc", dur: "3.4s", delay: "2.4s" },
  { x: 660, y: 120, type: "medium", color: "#38bdf8", dur: "2.7s", delay: "1.0s", size: 2.5 },
  { x: 790, y: 35, type: "medium", color: "#ffffff", dur: "3.1s", delay: "0.6s", size: 2.2 },
  { x: 880, y: 110, type: "medium", color: "#ffd23e", dur: "2.8s", delay: "2.1s", size: 2.6 },
  { x: 970, y: 40, type: "medium", color: "#7dfce7", dur: "3.4s", delay: "1.3s", size: 2 },
  { x: 1080, y: 130, type: "medium", color: "#c084fc", dur: "2.5s", delay: "0.2s", size: 2.4 },
  { x: 1190, y: 45, type: "medium", color: "#fde047", dur: "3.2s", delay: "2.5s", size: 2.2 },
  { x: 670, y: 370, type: "medium", color: "#ffffff", dur: "2.9s", delay: "1.4s", size: 2.5 },
  { x: 860, y: 390, type: "medium", color: "#38bdf8", dur: "3.3s", delay: "0.7s", size: 2.2 },
  { x: 990, y: 470, type: "medium", color: "#ffd23e", dur: "2.6s", delay: "2.0s", size: 2.8 },
  { x: 1140, y: 420, type: "medium", color: "#7dfce7", dur: "3.0s", delay: "1.5s", size: 2 },
  { x: 720, y: 80, type: "dot", color: "#ffffff", dur: "4.3s", delay: "0.9s", size: 1.5, opacity: 0.6 },
  { x: 810, y: 70, type: "dot", color: "#7dfce7", dur: "3.9s", delay: "1.8s", size: 1.2, opacity: 0.5 },
  { x: 940, y: 50, type: "dot", color: "#ffd23e", dur: "4.1s", delay: "0.3s", size: 1.6, opacity: 0.7 },
  { x: 1040, y: 90, type: "dot", color: "#ffffff", dur: "4.5s", delay: "2.2s", size: 1.4, opacity: 0.5 },
  { x: 1130, y: 60, type: "dot", color: "#38bdf8", dur: "3.7s", delay: "1.1s", size: 1.5, opacity: 0.6 },
  { x: 760, y: 460, type: "dot", color: "#c084fc", dur: "4.0s", delay: "0.5s", size: 1.2, opacity: 0.5 },
  { x: 920, y: 440, type: "dot", color: "#ffffff", dur: "4.4s", delay: "1.7s", size: 1.5, opacity: 0.6 },
  { x: 1070, y: 490, type: "dot", color: "#7dfce7", dur: "3.8s", delay: "0.8s", size: 1.4, opacity: 0.7 },
  { x: 1210, y: 440, type: "dot", color: "#ffd23e", dur: "4.2s", delay: "2.3s", size: 1.2, opacity: 0.5 },

  // Section 3: x: 1280 - 1920 (Cruiser & High Summit / Levels 8-12)
  { x: 1320, y: 70, type: "sparkle", color: "#ffd23e", dur: "3.3s", delay: "0.4s" },
  { x: 1380, y: 120, type: "sparkleSm", color: "#7dfce7", dur: "2.8s", delay: "1.5s" },
  { x: 1470, y: 55, type: "sparkle", color: "#ffffff", dur: "3.7s", delay: "2.0s" },
  { x: 1540, y: 90, type: "sparkleSm", color: "#c084fc", dur: "3.0s", delay: "0.7s" },
  { x: 1640, y: 45, type: "sparkle", color: "#38bdf8", dur: "3.5s", delay: "1.8s" },
  { x: 1760, y: 95, type: "sparkleSm", color: "#ffd23e", dur: "2.9s", delay: "0.2s" },
  { x: 1850, y: 50, type: "sparkle", color: "#ffffff", dur: "3.6s", delay: "2.4s" },
  { x: 1330, y: 450, type: "sparkleSm", color: "#7dfce7", dur: "3.1s", delay: "1.2s" },
  { x: 1510, y: 480, type: "sparkle", color: "#ffd23e", dur: "3.8s", delay: "0.6s" },
  { x: 1680, y: 440, type: "sparkleSm", color: "#ffffff", dur: "2.8s", delay: "1.9s" },
  { x: 1820, y: 470, type: "sparkle", color: "#c084fc", dur: "3.4s", delay: "2.1s" },
  { x: 1300, y: 140, type: "medium", color: "#38bdf8", dur: "2.8s", delay: "0.8s", size: 2.5 },
  { x: 1410, y: 40, type: "medium", color: "#ffffff", dur: "3.2s", delay: "1.6s", size: 2.2 },
  { x: 1500, y: 130, type: "medium", color: "#ffd23e", dur: "2.7s", delay: "0.3s", size: 2.6 },
  { x: 1590, y: 50, type: "medium", color: "#7dfce7", dur: "3.5s", delay: "2.2s", size: 2 },
  { x: 1700, y: 140, type: "medium", color: "#c084fc", dur: "2.6s", delay: "1.1s", size: 2.4 },
  { x: 1810, y: 35, type: "medium", color: "#fde047", dur: "3.3s", delay: "1.7s", size: 2.2 },
  { x: 1360, y: 480, type: "medium", color: "#ffffff", dur: "2.9s", delay: "0.5s", size: 2.5 },
  { x: 1480, y: 420, type: "medium", color: "#38bdf8", dur: "3.4s", delay: "2.3s", size: 2.2 },
  { x: 1620, y: 470, type: "medium", color: "#ffd23e", dur: "2.7s", delay: "1.4s", size: 2.8 },
  { x: 1780, y: 420, type: "medium", color: "#7dfce7", dur: "3.1s", delay: "0.9s", size: 2 },
  { x: 1350, y: 80, type: "dot", color: "#ffffff", dur: "4.2s", delay: "1.0s", size: 1.5, opacity: 0.6 },
  { x: 1440, y: 90, type: "dot", color: "#7dfce7", dur: "3.8s", delay: "1.7s", size: 1.2, opacity: 0.5 },
  { x: 1560, y: 60, type: "dot", color: "#ffd23e", dur: "4.3s", delay: "0.4s", size: 1.6, opacity: 0.7 },
  { x: 1660, y: 100, type: "dot", color: "#ffffff", dur: "4.6s", delay: "2.1s", size: 1.4, opacity: 0.5 },
  { x: 1750, y: 55, type: "dot", color: "#38bdf8", dur: "3.9s", delay: "1.3s", size: 1.5, opacity: 0.6 },
  { x: 1420, y: 460, type: "dot", color: "#c084fc", dur: "4.1s", delay: "0.7s", size: 1.2, opacity: 0.5 },
  { x: 1580, y: 450, type: "dot", color: "#ffffff", dur: "4.5s", delay: "1.8s", size: 1.5, opacity: 0.6 },
  { x: 1720, y: 490, type: "dot", color: "#7dfce7", dur: "3.7s", delay: "0.6s", size: 1.4, opacity: 0.7 },
  { x: 1860, y: 430, type: "dot", color: "#ffd23e", dur: "4.3s", delay: "2.0s", size: 1.2, opacity: 0.5 },

  // Section 4: x: 1920 - 2560 (Approach to Singularity / Levels 12-15)
  { x: 1960, y: 65, type: "sparkle", color: "#ffd23e", dur: "3.2s", delay: "0.3s" },
  { x: 2020, y: 110, type: "sparkleSm", color: "#7dfce7", dur: "2.9s", delay: "1.6s" },
  { x: 2110, y: 45, type: "sparkle", color: "#ffffff", dur: "3.6s", delay: "2.1s" },
  { x: 2190, y: 85, type: "sparkleSm", color: "#c084fc", dur: "3.0s", delay: "0.8s" },
  { x: 2280, y: 50, type: "sparkle", color: "#38bdf8", dur: "3.4s", delay: "1.7s" },
  { x: 2370, y: 105, type: "sparkleSm", color: "#ffd23e", dur: "2.8s", delay: "0.4s" },
  { x: 2450, y: 55, type: "sparkle", color: "#ffffff", dur: "3.5s", delay: "2.5s" },
  { x: 2520, y: 90, type: "sparkleSm", color: "#7dfce7", dur: "3.1s", delay: "1.0s" },
  { x: 1970, y: 460, type: "sparkle", color: "#ffd23e", dur: "3.7s", delay: "0.5s" },
  { x: 2120, y: 440, type: "sparkleSm", color: "#ffffff", dur: "2.8s", delay: "1.8s" },
  { x: 2310, y: 470, type: "sparkle", color: "#c084fc", dur: "3.4s", delay: "2.2s" },
  { x: 2470, y: 450, type: "sparkleSm", color: "#7dfce7", dur: "3.0s", delay: "0.7s" },
  { x: 1940, y: 130, type: "medium", color: "#38bdf8", dur: "2.7s", delay: "0.9s", size: 2.5 },
  { x: 2050, y: 35, type: "medium", color: "#ffffff", dur: "3.1s", delay: "1.5s", size: 2.2 },
  { x: 2150, y: 125, type: "medium", color: "#ffd23e", dur: "2.8s", delay: "0.2s", size: 2.6 },
  { x: 2240, y: 40, type: "medium", color: "#7dfce7", dur: "3.4s", delay: "2.3s", size: 2 },
  { x: 2330, y: 135, type: "medium", color: "#c084fc", dur: "2.6s", delay: "1.2s", size: 2.4 },
  { x: 2420, y: 35, type: "medium", color: "#fde047", dur: "3.2s", delay: "1.8s", size: 2.2 },
  { x: 2510, y: 120, type: "medium", color: "#38bdf8", dur: "2.8s", delay: "0.4s", size: 2.5 },
  { x: 2040, y: 480, type: "medium", color: "#ffffff", dur: "3.0s", delay: "0.6s", size: 2.5 },
  { x: 2180, y: 420, type: "medium", color: "#38bdf8", dur: "3.3s", delay: "2.4s", size: 2.2 },
  { x: 2360, y: 480, type: "medium", color: "#ffd23e", dur: "2.7s", delay: "1.3s", size: 2.8 },
  { x: 2490, y: 410, type: "medium", color: "#7dfce7", dur: "3.1s", delay: "0.8s", size: 2 },
  { x: 1990, y: 85, type: "dot", color: "#ffffff", dur: "4.3s", delay: "1.1s", size: 1.5, opacity: 0.6 },
  { x: 2080, y: 75, type: "dot", color: "#7dfce7", dur: "3.9s", delay: "1.6s", size: 1.2, opacity: 0.5 },
  { x: 2210, y: 65, type: "dot", color: "#ffd23e", dur: "4.2s", delay: "0.5s", size: 1.6, opacity: 0.7 },
  { x: 2300, y: 95, type: "dot", color: "#ffffff", dur: "4.5s", delay: "2.0s", size: 1.4, opacity: 0.5 },
  { x: 2400, y: 60, type: "dot", color: "#38bdf8", dur: "3.8s", delay: "1.4s", size: 1.5, opacity: 0.6 },
  { x: 2490, y: 80, type: "dot", color: "#ffffff", dur: "4.4s", delay: "0.9s", size: 1.4, opacity: 0.6 },
  { x: 2070, y: 450, type: "dot", color: "#c084fc", dur: "4.0s", delay: "0.6s", size: 1.2, opacity: 0.5 },
  { x: 2240, y: 460, type: "dot", color: "#ffffff", dur: "4.6s", delay: "1.9s", size: 1.5, opacity: 0.6 },
  { x: 2390, y: 440, type: "dot", color: "#7dfce7", dur: "3.7s", delay: "0.7s", size: 1.4, opacity: 0.7 },
  { x: 2530, y: 470, type: "dot", color: "#ffd23e", dur: "4.1s", delay: "2.1s", size: 1.2, opacity: 0.5 },
];

export const ROADMAP_CONSTELLATIONS = [
  // 1. Explorer's Bow (Near Level 1-2)
  {
    lines: [
      { x1: 90, y1: 70, x2: 170, y2: 45 },
      { x1: 170, y1: 45, x2: 250, y2: 80 },
      { x1: 250, y1: 80, x2: 310, y2: 50 },
    ],
    stars: [
      { x: 90, y: 70, color: "#7dfce7" },
      { x: 170, y: 45, color: "#ffd23e" },
      { x: 250, y: 80, color: "#ffffff" },
      { x: 310, y: 50, color: "#7dfce7" },
    ],
  },
  // 2. Crown of Aethon (Above Summit Level 5-6)
  {
    lines: [
      { x1: 690, y1: 50, x2: 760, y2: 25 },
      { x1: 760, y1: 25, x2: 830, y2: 40 },
      { x1: 830, y1: 40, x2: 900, y2: 25 },
      { x1: 900, y1: 25, x2: 960, y2: 55 },
    ],
    stars: [
      { x: 690, y: 50, color: "#c084fc" },
      { x: 760, y: 25, color: "#ffd23e" },
      { x: 830, y: 40, color: "#ffffff" },
      { x: 900, y: 25, color: "#ffd23e" },
      { x: 960, y: 55, color: "#7dfce7" },
    ],
  },
  // 3. Stellar Cross (Above Level 9-11)
  {
    lines: [
      { x1: 1440, y1: 75, x2: 1580, y2: 75 },
      { x1: 1510, y1: 30, x2: 1510, y2: 120 },
    ],
    stars: [
      { x: 1440, y: 75, color: "#38bdf8" },
      { x: 1580, y: 75, color: "#38bdf8" },
      { x: 1510, y: 30, color: "#ffd23e" },
      { x: 1510, y: 120, color: "#ffffff" },
      { x: 1510, y: 75, color: "#ffd23e" },
    ],
  },
  // 4. Apex Triangle (Near Final Station Level 14-15)
  {
    lines: [
      { x1: 2210, y1: 60, x2: 2280, y2: 25 },
      { x1: 2280, y1: 25, x2: 2350, y2: 70 },
      { x1: 2350, y1: 70, x2: 2210, y2: 60 },
    ],
    stars: [
      { x: 2210, y: 60, color: "#ffd23e" },
      { x: 2280, y: 25, color: "#ffffff" },
      { x: 2350, y: 70, color: "#7dfce7" },
    ],
  },
];

export interface SteppingDot {
  x: number;
  y: number;
  active: boolean;
}

export function calculateRoadmapPaths(progress: PlayerProgress): {
  fullPath: string;
  completedPath: string;
  steppingDots: SteppingDot[];
} {
  let d = `M ${LEVEL_NODES[0].x} ${LEVEL_NODES[0].y}`;
  let compD = `M ${LEVEL_NODES[0].x} ${LEVEL_NODES[0].y}`;
  const dots: SteppingDot[] = [];

  for (let i = 0; i < LEVEL_NODES.length - 1; i++) {
    const p0 = LEVEL_NODES[i];
    const p1 = LEVEL_NODES[i + 1];
    const midX = (p0.x + p1.x) / 2;

    const segment = ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    d += segment;

    const isCompleted = isLevelUnlocked(progress, p1.id);
    if (isCompleted) {
      compD += segment;
    }

    for (const t of [0.25, 0.5, 0.75]) {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const bx = uuu * p0.x + 3 * uu * t * midX + 3 * u * tt * midX + ttt * p1.x;
      const by = uuu * p0.y + 3 * uu * t * p0.y + 3 * u * tt * p1.y + ttt * p1.y;

      dots.push({
        x: Math.round(bx),
        y: Math.round(by),
        active: isCompleted,
      });
    }
  }

  return { fullPath: d, completedPath: compD, steppingDots: dots };
}
