import type { PlayerProgress, LevelRecord } from "./types";

const PROGRESS_KEY = "mv_level_progress_v1";
export const TOTAL_LEVELS = 15;
export const MAX_POSSIBLE_STARS = TOTAL_LEVELS * 3;

export function getInitialProgress(): PlayerProgress {
  const levels: Record<number, LevelRecord> = {};
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    levels[i] = {
      stars: 0,
      highScore: 0,
      cleared: false,
    };
  }
  return {
    levels,
    highestUnlocked: 1, // Level 1 unlocked by default
  };
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return getInitialProgress();
    const data = JSON.parse(raw) as Partial<PlayerProgress>;
    const initial = getInitialProgress();
    
    return {
      levels: {
        ...initial.levels,
        ...(data.levels || {}),
      },
      highestUnlocked: Math.max(1, Math.min(TOTAL_LEVELS, data.highestUnlocked || 1)),
    };
  } catch {
    return getInitialProgress();
  }
}

export function saveLevelClear(
  levelId: number,
  stars: number,
  score: number,
): { progress: PlayerProgress; isNewBestScore: boolean; isNewBestStars: boolean } {
  const current = loadProgress();
  const existing = current.levels[levelId] || { stars: 0, highScore: 0, cleared: false };

  const isNewBestStars = stars > existing.stars;
  const isNewBestScore = score > existing.highScore;

  current.levels[levelId] = {
    stars: Math.max(existing.stars, stars),
    highScore: Math.max(existing.highScore, score),
    cleared: true,
  };

  // Unlock next level if available
  if (levelId < TOTAL_LEVELS && levelId >= current.highestUnlocked) {
    current.highestUnlocked = levelId + 1;
  }

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  } catch {
    /* ignore storage quota errors */
  }

  return { progress: current, isNewBestScore, isNewBestStars };
}

export function getTotalStars(progress: PlayerProgress): number {
  return Object.values(progress.levels).reduce((sum, lvl) => sum + (lvl.stars || 0), 0);
}

export function isLevelUnlocked(progress: PlayerProgress, levelId: number): boolean {
  if (levelId === 1) return true;
  return levelId <= progress.highestUnlocked;
}
