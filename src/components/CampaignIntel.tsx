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
    <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-void-700/80 bg-void-950/85 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-void-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-lg border border-ice-500/40 bg-ice-500/15 text-[10px] text-ice-300 shadow-[0_0_8px_rgba(46,230,201,0.3)]">
            ✦
          </span>
          <span className="font-display text-xs sm:text-sm font-bold tracking-wider text-ice-300 uppercase">
            {t.campaignIntel}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 shadow-sm">
          <span>★ {totalStars}</span>
          <span className="text-[9px] text-white/40">/ {MAX_POSSIBLE_STARS}</span>
        </div>
      </div>

      {/* Star Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-white/60 uppercase">
          <span>{t.totalProgress}</span>
          <span className="text-ice-300 font-display">{totalProgressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-void-900 border border-void-800">
          <div
            className="h-full bg-gradient-to-r from-ember-500 via-amber-400 to-ice-400 shadow-[0_0_10px_rgba(255,160,46,0.6)] transition-all duration-500"
            style={{ width: `${Math.max(4, totalProgressPercent)}%` }}
          />
        </div>
      </div>

      {/* 3 Sector Clusters */}
      <div className="space-y-1.5">
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
                "rounded-xl border px-3 py-2 transition",
                isSectorUnlocked
                  ? "bg-void-900/70 border-void-700/80 hover:border-void-600"
                  : "bg-void-950/40 border-void-800/50 opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{sec.icon}</span>
                  <div>
                    <h4 className={cn("text-xs font-bold leading-tight", sec.colorText)}>
                      {sec.name}
                    </h4>
                    <span className="text-[10px] text-white/40">
                      {t.levelSpan} {sec.startLevel} - {sec.endLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold text-amber-300">
                    ★ {sectorStars}
                    <span className="text-[10px] text-white/40 font-normal">/15</span>
                  </span>
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

              {/* Sleek compact level indicators */}
              <div className="mt-1.5 flex items-center gap-1.5 pt-1 border-t border-void-800/50">
                {levelsStatus.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "flex h-5 flex-1 items-center justify-center rounded border text-[9px] font-display transition",
                      node.cleared
                        ? "border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-[0_0_6px_rgba(255,160,46,0.3)] font-bold"
                        : node.unlocked
                          ? "border-ice-500/60 bg-ice-500/15 text-ice-300 shadow-[0_0_8px_rgba(46,230,201,0.25)] ring-1 ring-ice-400/40 font-black"
                          : "border-void-800/80 bg-void-950/70 text-white/30 font-medium",
                    )}
                    title={`${t.level} ${node.id}: ${node.cleared ? `${node.stars} ${t.stars}` : node.unlocked ? t.sectorStatusActive : t.sectorStatusLocked}`}
                  >
                    {node.cleared ? (node.stars === 3 ? "★★★" : `${node.stars}★`) : node.id}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
