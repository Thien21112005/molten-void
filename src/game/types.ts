import type { PlayerProgress } from "./levels";

export type Screen = "menu" | "playing" | "paused" | "gameover" | "victory" | "roadmap";

export interface HighScore {
  s: number;
  l: number;
  d: string;
}

export interface VictoryData {
  level: number;
  levelName: string;
  stars: number;
  score: number;
  levelScore: number;
  coresBonus: number;
  isNewBestScore: boolean;
  isNewBestStars: boolean;
  totalStars: number;
}

export type CoreType = "standard" | "cluster" | "blast" | "heavy";

export type MascotReaction = "idle" | "aiming" | "cheer" | "sad" | "victory" | "angry";

export interface MascotState {
  reaction: MascotReaction;
  key: string;
  params?: Record<string, string | number>;
  id: number;
}

export interface UIState {
  screen: Screen;
  score: number;
  level: number;
  orbs: number;
  maxOrbs: number;
  gems: number;
  best: number;
  newBest: boolean;
  hs: HighScore[];
  muted: boolean;
  firstShot: boolean;
  launcherPos?: { x: number; y: number };
  landscape?: boolean;
  isAiming?: boolean;
  selectedCore: CoreType;
  victoryData?: VictoryData;
  progress?: PlayerProgress;
  isFromPaused?: boolean;
  mascot?: MascotState;
  hasActiveOrb?: boolean;
}

export const HS_KEY = "mv_hs_v1";
export const MAX_ORBS = 9;

export interface Gem {
  x: number;
  y: number;
  r: number;
  kind: "ice" | "gold";
  phase: number;
  dead: boolean;
}

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GravityWell {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export interface Wormhole {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
}

export interface Rotator {
  x: number;
  y: number;
  len: number;
  width: number;
  speed: number;
  angle: number;
}

export interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  t: number;
  alive: boolean;
  slowT: number;
  trail: { x: number; y: number }[];
  coreType: CoreType;
  piercesLeft?: number;
  piercedBlocks?: Set<Block>;
  portalCooldown?: number;
  bounces?: number;
  gravityInfluenced?: boolean;
  hasSplit?: boolean;
  isSplitShard?: boolean;
}

export interface Particle {
  kind: 0 | 1 | 2 | 3; // shard | spark | smoke | ring
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  tl: number;
  size: number;
  rot: number;
  vr: number;
  col: string; // "r,g,b"
  grav: number;
  drag: number;
}

export interface FloatText {
  x: number;
  y: number;
  t: number;
  life: number;
  str: string;
  size: number;
  col: string;
  sub?: string;
  big?: boolean;
}

export interface Mote {
  x: number;
  y: number;
  spd: number;
  phase: number;
  size: number;
  col: string;
  a: number;
}

export interface TwStar {
  x: number;
  y: number;
  r: number;
  ph: number;
  sp: number;
}

export type AimMode = "none" | "pull" | "kb";
