import { LEVELS } from "../game/levels/levelsData";
import {
  loadProgress,
  getTotalStars,
  isLevelUnlocked,
  MAX_POSSIBLE_STARS,
} from "../game/levels/progress";
import { StarRating } from "./StarRating";
import { cn } from "../utils/cn";

export interface RoadmapModalProps {
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
  currentLevel?: number;
}

export function RoadmapModal({
  onSelectLevel,
  onBackToMenu,
  currentLevel = 1,
}: RoadmapModalProps) {
  const progress = loadProgress();
  const totalStars = getTotalStars(progress);

  return (
    <div className="animate-rise-in m-auto flex h-[min(94vh,44rem)] w-[min(96vw,52rem)] flex-col rounded-3xl border-2 border-void-700/80 bg-void-950/95 p-4 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-void-800/80 pb-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3.5 py-1.5 text-xs font-bold tracking-wider text-white/80 transition hover:bg-void-800 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            className="h-4 w-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Menu
        </button>

        <div className="text-center">
          <h2 className="font-display text-xl tracking-wider text-white sm:text-2xl">
            COSMIC ROADMAP
          </h2>
          <p className="text-[11px] font-bold tracking-[0.25em] text-ice-400/80">
            SECTOR 1 — 15 EXPEDITIONS
          </p>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 shadow-[0_0_15px_rgba(255,179,38,0.15)]">
          <svg viewBox="0 0 24 24" fill="#ffb326" className="h-4 w-4 drop-shadow-[0_0_6px_rgba(255,179,38,0.8)]">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-display text-sm tracking-wide text-amber-300">
            {totalStars} <span className="text-xs text-white/40">/ {MAX_POSSIBLE_STARS}</span>
          </span>
        </div>
      </div>

      {/* Levels Grid Container */}
      <div className="flex-1 overflow-y-auto px-1 py-4 scrollbar-thin">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(progress, level.id);
            const record = progress.levels[level.id] || { stars: 0, highScore: 0, cleared: false };
            const isCurrent = level.id === currentLevel;

            return (
              <div
                key={level.id}
                onClick={() => unlocked && onSelectLevel(level.id)}
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl border-2 p-3.5 text-center transition-all duration-200",
                  unlocked
                    ? "cursor-pointer bg-void-900/90 shadow-md hover:-translate-y-1 hover:border-ice-400 hover:shadow-[0_0_20px_rgba(46,230,201,0.25)]"
                    : "cursor-not-allowed border-void-800/60 bg-void-950/40 opacity-45",
                  isCurrent && unlocked
                    ? "border-ember-400 ring-2 ring-ember-400/40 shadow-[0_0_25px_rgba(255,122,26,0.35)]"
                    : unlocked
                      ? "border-void-700/80"
                      : "border-void-800/50",
                )}
              >
                {/* Active pulse indicator */}
                {isCurrent && unlocked && (
                  <span className="absolute -top-2 rounded-full border border-ember-400/80 bg-ember-500 px-2 py-0.5 text-[9px] font-bold tracking-widest text-void-950 shadow-sm">
                    CURRENT
                  </span>
                )}

                {/* Level Circle Badge */}
                <div
                  className={cn(
                    "my-1 flex h-12 w-12 items-center justify-center rounded-full font-display text-lg shadow-inner",
                    unlocked
                      ? isCurrent
                        ? "bg-gradient-to-br from-ember-400 to-amber-600 text-void-950 font-bold"
                        : record.cleared
                          ? "bg-gradient-to-br from-ice-400 to-teal-700 text-void-950 font-bold"
                          : "border border-void-600 bg-void-800 text-white"
                      : "border border-void-800 bg-void-900/70 text-white/30",
                  )}
                >
                  {unlocked ? (
                    level.id
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 text-white/40">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  )}
                </div>

                {/* Level Name */}
                <span className="mt-1 line-clamp-1 font-display text-xs tracking-wide text-white/90">
                  {level.name}
                </span>

                {/* Stars display (shows bright vs dim stars) */}
                <div className="mt-1.5 flex justify-center">
                  <StarRating stars={record.stars} size="sm" />
                </div>

                {/* High Score or Par Orbs */}
                <div className="mt-2 text-[10px] font-semibold">
                  {record.highScore > 0 ? (
                    <span className="text-amber-300 font-display">
                      {record.highScore.toLocaleString("en-US")} pts
                    </span>
                  ) : unlocked ? (
                    <span className="text-white/40 tracking-wider">
                      {level.parOrbs} Cores
                    </span>
                  ) : (
                    <span className="text-white/25">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-void-800/80 pt-3 text-[11px] font-semibold text-white/40">
        <span>⭐ 3 Stars = Perfect Efficiency</span>
        <span>Clear each expedition to unlock the next</span>
      </div>
    </div>
  );
}
