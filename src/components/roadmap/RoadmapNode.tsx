import React from "react";
import type { NodeCoord } from "./roadmapData";
import type { PlayerProgress } from "../../game/levels/types";
import { isLevelUnlocked } from "../../game/levels/progress";
import { LEVELS } from "../../game/levels/levelsData";
import { StarRating } from "../StarRating";
import type { Translations } from "../../game/i18n";
import { audio } from "../../game/audio";
import { IconFlagStart, IconApexCrown } from "../Icons";
import { cn } from "../../utils/cn";

export interface RoadmapNodeProps {
  pos: NodeCoord;
  progress: PlayerProgress;
  currentLevel?: number;
  hasDragged: boolean;
  t?: Translations;
  onSelectLevel: (levelId: number) => void;
  nodeRef?: React.Ref<HTMLDivElement>;
}

export function RoadmapNode({
  pos,
  progress,
  currentLevel,
  hasDragged,
  t,
  onSelectLevel,
  nodeRef,
}: RoadmapNodeProps) {
  const level = LEVELS.find((l) => l.id === pos.id)!;
  const unlocked = isLevelUnlocked(progress, level.id);
  const record = progress.levels[level.id] || { stars: 0, highScore: 0, cleared: false };
  const isCurrent = level.id === currentLevel;
  const isStart = level.id === 1;
  const isApex = level.id === 15;

  return (
    <div
      ref={nodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      {/* START FLAG (Level 1) */}
      {isStart && (
        <div className="animate-bounce-subtle pointer-events-none absolute -top-11 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/80 bg-emerald-500/95 px-2.5 py-0.5 font-display text-[9px] font-bold tracking-widest text-void-950 shadow-[0_0_14px_rgba(52,211,153,0.8)]">
            <IconFlagStart size={11} className="text-void-950" />
            <span>{t?.startNode ?? "START"}</span>
          </span>
          <div className="h-2.5 w-0.5 bg-emerald-400" />
        </div>
      )}

      {/* APEX FINISH CROWN (Level 15) */}
      {isApex && (
        <div className="animate-float-slow pointer-events-none absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 font-display text-[10px] font-bold tracking-widest text-void-950 shadow-[0_0_22px_rgba(255,200,50,0.9)]">
            <IconApexCrown size={12} className="text-void-950" />
            <span>{t?.apexNode ?? "APEX"}</span>
          </span>
          <div className="h-2.5 w-0.5 bg-amber-400" />
        </div>
      )}

      {/* CURRENT ACTIVE BEACON */}
      {isCurrent && unlocked && !isStart && !isApex && (
        <div className="animate-pulse-soft pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full border border-ember-400/90 bg-ember-500 px-2.5 py-0.5 font-display text-[8px] font-bold tracking-widest text-void-950 shadow-[0_0_16px_rgba(255,122,26,0.9)]">
            {t?.play ?? "PLAY"}
          </span>
        </div>
      )}

      {/* 3D CHUNKY LEVEL NODE BUTTON */}
      <button
        type="button"
        disabled={!unlocked}
        onClick={() => {
          if (!hasDragged && unlocked) {
            audio.ensure();
            audio.click();
            onSelectLevel(level.id);
          }
        }}
        className={cn(
          "group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-200 sm:h-18 sm:w-18",
          unlocked
            ? "cursor-pointer active:translate-y-1 active:shadow-none"
            : "cursor-not-allowed border-void-800/80 bg-void-950/80 opacity-50",
          isCurrent && unlocked
            ? "border-ember-400 bg-gradient-to-b from-ember-400 to-amber-600 shadow-[0_8px_0_rgba(150,50,0,0.95),0_0_30px_rgba(255,122,26,0.7)] ring-2 ring-ember-300/50"
            : record.cleared
              ? "border-ice-400 bg-gradient-to-b from-ice-400 to-teal-700 shadow-[0_8px_0_rgba(0,70,60,0.95),0_0_20px_rgba(46,230,201,0.5)]"
              : unlocked
                ? "border-amber-400/80 bg-gradient-to-b from-void-800 to-void-900 shadow-[0_8px_0_rgba(20,15,35,0.95)] hover:border-amber-300 hover:shadow-[0_8px_0_rgba(20,15,35,0.95),0_0_16px_rgba(255,179,38,0.3)]"
                : "shadow-[0_6px_0_rgba(10,8,20,0.9)]",
        )}
      >
        {/* Top Bevel Highlight */}
        <div className="pointer-events-none absolute inset-x-1.5 top-1 h-2 rounded-t-xl bg-white/25" />

        {/* Level Number */}
        <span
          className={cn(
            "font-display leading-none transition-transform group-hover:scale-105",
            unlocked
              ? isCurrent || record.cleared
                ? "text-2xl text-void-950 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                : "text-2xl text-white [text-shadow:0_0_12px_rgba(255,255,255,0.4)]"
              : "text-xl text-white/30 font-semibold tracking-wider",
          )}
        >
          {level.id}
        </span>
      </button>

      {/* 3-STAR RATING DISPLAY (UNDER NODE) */}
      <div className="mt-1.5 flex flex-col items-center">
        <div className="flex items-center rounded-full border border-void-800/80 bg-void-950/90 px-2 py-0.5 shadow-md backdrop-blur-sm">
          <StarRating stars={record.stars} size="sm" />
        </div>

        {/* High score badge */}
        {record.highScore > 0 && (
          <span className="mt-0.5 whitespace-nowrap font-display text-[9px] tracking-wide text-amber-300">
            {record.highScore.toLocaleString("en-US")} {t?.points ?? "pts"}
          </span>
        )}
      </div>
    </div>
  );
}
