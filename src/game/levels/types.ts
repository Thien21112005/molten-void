export type GemKind = "ice" | "gold";

export interface LevelGemConfig {
  rx: number; // 0.0 to 1.0 (relative to playfield width)
  ry: number; // 0.0 to 1.0 (relative to playfield height)
  kind: GemKind;
}

export interface LevelBlockConfig {
  rx: number; // 0.0 to 1.0
  ry: number; // 0.0 to 1.0
  rw: number; // relative width (e.g. 0.03)
  rh: number; // relative height (e.g. 0.22)
}

export interface GravityWellConfig {
  rx: number; // 0.0 to 1.0 (relative to playfield width)
  ry: number; // 0.0 to 1.0 (relative to playfield height)
  strength?: number; // Gravitational pull multiplier (default 1.0)
  radius?: number; // Influence radius (relative, default 0.22)
}

export interface WormholeConfig {
  x1: number; // Portal A relative x
  y1: number; // Portal A relative y
  x2: number; // Portal B relative x
  y2: number; // Portal B relative y
  r?: number; // Portal relative radius (default 0.035)
}

export interface RotatorConfig {
  rx: number; // Relative center x
  ry: number; // Relative center y
  len: number; // Relative length
  width?: number; // Relative thickness (default 0.02)
  speed: number; // Angular speed in rad/s (positive = clockwise)
  initAngle?: number; // Starting angle in radians
}

export interface LevelConfig {
  id: number;
  name: string;
  tagline: string;
  parOrbs: number;
  // Star criteria: remaining comet cores when all crystals shattered
  // 3 stars: finished with remainingOrbs >= star3MinOrbs (usually max efficiency, e.g. 2 or 3)
  // 2 stars: finished with remainingOrbs >= star2MinOrbs (e.g. 1)
  // 1 star: cleared level with at least 0 remaining
  star3MinOrbs: number;
  star2MinOrbs: number;
  gems: LevelGemConfig[];
  blocks: LevelBlockConfig[];
  gravityWells?: GravityWellConfig[];
  wormholes?: WormholeConfig[];
  rotators?: RotatorConfig[];
}

export interface LevelRecord {
  stars: number; // 0 to 3
  highScore: number;
  cleared: boolean;
}

export interface PlayerProgress {
  levels: Record<number, LevelRecord>;
  highestUnlocked: number;
}
