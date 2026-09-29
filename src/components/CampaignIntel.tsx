import React from "react";
import type { PlayerProgress } from "../game/levels/types";
import { getTotalStars, MAX_POSSIBLE_STARS } from "../game/levels/progress";
import type { Translations } from "../game/i18n";
import { cn } from "../utils/cn";

export interface CampaignIntelProps {
  progress: PlayerProgress;
  t: Translations;
  onOpenRoadmap: () => void;
  bestScore?: number;
}

interface SectorInfo {
  id: number;
  name: string;
  icon: string;
  startLevel: number;
  endLevel: number;
  colorBorder: string;
  colorBg: string;
  colorText: string;
}

export function CampaignIntel({
  progress,
  t,
  onOpenRoadmap,
  bestScore = 0,
}: CampaignIntelProps) {
  const totalStars = getTotalStars(progress);
  const totalProgressPercent = Math.min(100, Math.round((totalStars / MAX_POSSIBLE_STARS) * 100));

  const sectors: SectorInfo[] = [
    {
      id: 1,
      name: t.sector1Name,
      icon: "🪐",
      startLevel: 1,
      endLevel: 5,
      colorBorder: "border-amber-500/40",
      colorBg: "bg-amber-500/10",
      colorText: "text-amber-300",
    },
    {
      id: 2,
      name: t.sector2Name,
      icon: "⚡",
      startLevel: 6,
      endLevel: 10,
      colorBorder: "border-cyan-500/40",
      colorBg: "bg-cyan-500/10",
      colorText: "text-cyan-300",
    },
    {
      id: 3,
      name: t.sector3Name,
      icon: "🌀",
      startLevel: 11,
      endLevel: 15,
      colorBorder: "border-purple-500/40",
      colorBg: "bg-purple-500/10",
      colorText: "text-purple-300",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-void-700/80 bg-void-950/85 p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-void-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-ice-500/40 bg-ice-500/15 text-xs text-ice-300 shadow-[0_0_10px_rgba(46,230,201,0.3)]">
            ✦
          </span>
          <span className="font-display text-xs sm:text-sm font-bold tracking-wider text-ice-300 uppercase">
            {t.campaignIntel}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 shadow-sm">
          <span>★</span>
          <span>{totalStars}</span>
          <span className="text-[9px] text-white/50">/ {MAX_POSSIBLE_STARS}</span>
        </div>
      </div>

      {/* Star Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-white/60 uppercase">
          <span>{t.totalProgress}</span>
          <span className="text-ice-300 font-display">{totalProgressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-void-900 border border-void-800">
          <div
            className="h-full bg-gradient-to-r from-ember-500 via-amber-400 to-ice-400 shadow-[0_0_12px_rgba(255,160,46,0.6)] transition-all duration-500"
            style={{ width: `${Math.max(4, totalProgressPercent)}%` }}
          />
        </div>
      </div>

      {/* 3 Sector Clusters */}
      <div className="space-y-2">
        {sectors.map((sec) => {
          let sectorStars = 0;
          let sectorCleared = 0;
          const levelsStatus: { id: number; stars: number; cleared: boolean; unlocked: boolean }[] = [];

          for (let lvl = sec.startLevel; lvl <= sec.endLevel; lvl++) {
            const rec = progress.levels[lvl] || { stars: 0, cleared: false };
            const unlocked = lvl === 1 || lvl <= progress.highestUnlocked;
            if (rec.cleared) sectorCleared++;
            sectorStars += rec.stars || 0;
            levelsStatus.push({
              id: lvl,
              stars: rec.stars || 0,
              cleared: !!rec.cleared,
              unlocked,
            });
          }

          const isSectorUnlocked = progress.highestUnlocked >= sec.startLevel;
          const isSectorCompleted = sectorCleared === 5;

          return (
            <div
              key={sec.id}
              className={cn(
                "rounded-xl border p-2.5 transition",
                isSectorUnlocked
                  ? cn("bg-void-900/70 border-void-700/80 hover:border-void-600")
                  : "bg-void-950/40 border-void-800/50 opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{sec.icon}</span>
                  <div>
                    <h4 className={cn("text-xs font-bold leading-tight", sec.colorText)}>
                      {sec.name}
                    </h4>
                    <span className="text-[10px] text-white/40">
                      Màn {sec.startLevel} - {sec.endLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-display font-bold text-amber-300">
                      ★ {sectorStars}
                      <span className="text-[10px] text-white/40 font-normal">/15</span>
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                      isSectorCompleted
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                        : isSectorUnlocked
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          : "bg-void-900 text-white/30 border border-void-800",
                    )}
                  >
                    {isSectorCompleted
                      ? t.sectorStatusCleared
                      : isSectorUnlocked
                        ? t.sectorStatusActive
                        : t.sectorStatusLocked}
                  </span>
                </div>
              </div>

              {/* 5 mini level nodes */}
              <div className="mt-2 flex items-center justify-between gap-1.5 pt-1.5 border-t border-void-800/60">
                {levelsStatus.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center rounded-lg py-1 px-0.5 border text-center transition",
                      node.cleared
                        ? "border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_8px_rgba(255,160,46,0.15)]"
                        : node.unlocked
                          ? "border-ice-500/30 bg-ice-500/5 text-ice-300"
                          : "border-void-800/80 bg-void-900/40 text-white/20",
                    )}
                  >
                    <span className="text-[10px] font-bold font-display">{node.id}</span>
                    <span className="text-[9px] leading-none">
                      {node.cleared ? "★".repeat(node.stars) || "★" : node.unlocked ? "•" : "🔒"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Starmap Action Button */}
      <button
        type="button"
        onClick={onOpenRoadmap}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ice-500/50 bg-gradient-to-r from-ice-500/20 via-void-900 to-ice-500/20 py-2.5 text-xs font-bold uppercase tracking-wider text-ice-300 shadow-[0_0_18px_rgba(46,230,201,0.2)] transition hover:border-ice-400 hover:text-white hover:brightness-110 active:scale-98 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
          <circle cx="5" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <circle cx="19" cy="8" r="2.5" />
          <path d="M7.2 7.5L10 16" strokeDasharray="2 2" />
          <path d="M14 16.5L17 9.5" strokeDasharray="2 2" />
        </svg>
        <span>{t.openRoadmapAction}</span>
      </button>
    </div>
  );
}
