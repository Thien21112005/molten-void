import React from "react";
import { ACHIEVEMENTS, loadAchievements } from "../game/achievements/achievementsData";
import type { AchievementDef, AchievementTier } from "../game/achievements/types";
import type { Language, Translations } from "../game/i18n";
import { cn } from "../utils/cn";
import { VietnameseAstronaut } from "./VietnameseAstronaut";

interface AchievementsModalProps {
  onClose: () => void;
  lang?: Language;
  t?: Translations;
}

export function AchievementsModal({ onClose, lang = "vi", t }: AchievementsModalProps) {
  const records = loadAchievements();
  const unlockedCount = ACHIEVEMENTS.filter((a) => records[a.id]?.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="animate-pop-in relative m-auto flex max-h-[92dvh] w-[min(94vw,44rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/90 bg-void-950/95 shadow-[0_0_80px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
      {/* Header */}
      <div className="relative border-b border-void-800/90 p-5 sm:p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/40 shadow-[0_0_18px_rgba(255,210,62,0.25)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#ffd23e"
                  stroke="#ff7a1a"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
                {t?.achievements ?? "Danh Hiệu & Huy Hiệu"}
              </h2>
              <p className="text-xs text-white/50">
                {unlockedCount}/{totalCount} {t?.achievementsUnlocked ?? "đã mở khóa"} ({progressPercent}%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-void-700/80 bg-void-900/80 text-white/70 transition hover:border-ice-400 hover:text-white cursor-pointer active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-void-700/80 bg-void-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-500 via-amber-400 to-ice-400 transition-all duration-500 shadow-[0_0_12px_rgba(255,210,62,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-display text-xs font-bold text-amber-300">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Badges Grid (Scrollable) */}
      <div className="grid flex-1 grid-cols-1 gap-2.5 overflow-y-auto p-4 sm:p-6 sm:grid-cols-2">
        {ACHIEVEMENTS.map((ach) => {
          const rec = records[ach.id];
          const isUnlocked = rec?.unlocked ?? false;
          const title = lang === "vi" ? ach.titleVi : ach.titleEn;
          const desc = lang === "vi" ? ach.descVi : ach.descEn;

          return (
            <div
              key={ach.id}
              className={cn(
                "relative flex items-center gap-3.5 rounded-2xl border p-3 sm:p-3.5 transition-all select-none",
                isUnlocked
                  ? getTierCardStyle(ach.tier)
                  : "border-void-800 bg-void-950/40 text-white/40 grayscale opacity-60",
              )}
            >
              {/* Badge Medal Emblem */}
              <div
                className={cn(
                  "relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border shadow-md",
                  isUnlocked
                    ? getTierBadgeStyle(ach.tier)
                    : "border-void-800 bg-void-900/60",
                )}
              >
                <BadgeIcon iconType={ach.iconType} unlocked={isUnlocked} />
                {isUnlocked && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-void-950 font-black shadow">
                    ✓
                  </span>
                )}
              </div>

              {/* Info Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-display text-sm font-bold tracking-wide truncate",
                      isUnlocked ? "text-white" : "text-white/60",
                    )}
                  >
                    {title}
                  </h3>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                      getTierLabelStyle(ach.tier, isUnlocked),
                    )}
                  >
                    {ach.tier}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/70 line-clamp-2 leading-relaxed">
                  {desc}
                </p>
                {isUnlocked && rec?.unlockedAt && (
                  <span className="mt-1 block text-[10px] font-mono text-emerald-400/80">
                    {new Date(rec.unlockedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer debrief with Astronaut Mascot */}
      <div className="flex items-center justify-between border-t border-void-800/90 bg-void-950 px-5 py-3 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <VietnameseAstronaut lang={lang} className="h-8 w-8" reaction="cheer" />
          <span>
            {unlockedCount === totalCount
              ? (t?.allBadgesCollected ?? "Đại Sư Vũ Trụ! Đã sưu tập trọn bộ huy hiệu!")
              : "Hoàn thành các chiến dịch để giải phóng huy hiệu danh dự."}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-void-700 bg-void-900 px-4 py-1.5 font-bold text-white transition hover:bg-void-800 cursor-pointer active:scale-95"
        >
          {t?.close ?? "Đóng"}
        </button>
      </div>
    </div>
  );
}

function getTierCardStyle(tier: AchievementTier): string {
  switch (tier) {
    case "bronze":
      return "border-amber-700/60 bg-gradient-to-r from-amber-950/40 to-void-900/60 shadow-[0_2px_15px_rgba(180,83,9,0.15)]";
    case "silver":
      return "border-slate-400/60 bg-gradient-to-r from-slate-900/40 to-void-900/60 shadow-[0_2px_15px_rgba(203,213,225,0.15)]";
    case "gold":
      return "border-amber-400/70 bg-gradient-to-r from-amber-950/50 to-void-900/60 shadow-[0_2px_20px_rgba(251,191,36,0.2)]";
    case "cosmic":
      return "border-purple-400/80 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-void-900/60 shadow-[0_2px_25px_rgba(168,85,247,0.3)]";
  }
}

function getTierBadgeStyle(tier: AchievementTier): string {
  switch (tier) {
    case "bronze":
      return "border-amber-600/80 bg-gradient-to-b from-amber-700 to-amber-900 shadow-[0_0_12px_rgba(217,119,6,0.4)]";
    case "silver":
      return "border-cyan-300/80 bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 shadow-[0_0_12px_rgba(148,163,184,0.4)]";
    case "gold":
      return "border-amber-300/90 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_16px_rgba(251,191,36,0.6)]";
    case "cosmic":
      return "border-purple-300 bg-gradient-to-b from-fuchsia-400 via-purple-600 to-indigo-900 shadow-[0_0_20px_rgba(192,132,252,0.7)] animate-pulse-soft";
  }
}

function getTierLabelStyle(tier: AchievementTier, unlocked: boolean): string {
  if (!unlocked) return "bg-void-900 text-white/40 border border-void-800";
  switch (tier) {
    case "bronze":
      return "bg-amber-900/60 text-amber-300 border border-amber-600/60";
    case "silver":
      return "bg-slate-800 text-slate-200 border border-slate-400/60";
    case "gold":
      return "bg-amber-500/20 text-amber-300 border border-amber-400/60";
    case "cosmic":
      return "bg-purple-900/80 text-fuchsia-300 border border-purple-400/80 shadow-[0_0_8px_rgba(192,132,252,0.4)]";
  }
}

function BadgeIcon({
  iconType,
  unlocked,
}: {
  iconType: AchievementDef["iconType"];
  unlocked: boolean;
}) {
  const stroke = unlocked ? "#ffffff" : "#64748b";
  switch (iconType) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill={unlocked ? "#ffd23e" : "none"} stroke={stroke} strokeWidth="1.5" className="h-6 w-6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "bounce":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
          <path d="M4 4v16h16" />
          <path d="M4 14l6-6 4 4 6-6" />
        </svg>
      );
    case "blast":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className="h-6 w-6">
          <circle cx="12" cy="12" r="5" fill={unlocked ? "#ff4d6d" : "none"} />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      );
    case "cluster":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className="h-6 w-6">
          <circle cx="12" cy="6" r="3" fill={unlocked ? "#7dfce7" : "none"} />
          <circle cx="6" cy="18" r="3" fill={unlocked ? "#2ee6c9" : "none"} />
          <circle cx="18" cy="18" r="3" fill={unlocked ? "#2ee6c9" : "none"} />
        </svg>
      );
    case "heavy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6">
          <path d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5l-8-3z" fill={unlocked ? "#0284c7" : "none"} />
          <line x1="12" y1="7" x2="12" y2="17" stroke="#ffffff" strokeWidth="2.2" />
        </svg>
      );
    case "gravity":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className="h-6 w-6">
          <circle cx="12" cy="12" r="3" fill={unlocked ? "#000000" : "none"} />
          <circle cx="12" cy="12" r="7" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="10" strokeDasharray="2 4" />
        </svg>
      );
    case "wormhole":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
          <ellipse cx="8" cy="12" rx="4" ry="7" />
          <ellipse cx="16" cy="12" rx="4" ry="7" />
          <path d="M8 8c4 0 4 8 8 8" strokeDasharray="2 2" />
        </svg>
      );
    case "crown":
      return (
        <svg viewBox="0 0 24 24" fill={unlocked ? "#ffd23e" : "none"} stroke={stroke} strokeWidth="1.8" className="h-6 w-6">
          <path d="M2 4l3 12h14l3-12-5 4-5-6-5 6-5-4z" />
          <circle cx="12" cy="3" r="1.5" />
          <circle cx="2" cy="4" r="1.5" />
          <circle cx="22" cy="4" r="1.5" />
        </svg>
      );
  }
}
