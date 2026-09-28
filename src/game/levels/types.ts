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
