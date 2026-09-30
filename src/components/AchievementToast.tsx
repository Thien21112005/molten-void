import { useEffect, useState } from "react";
import type { AchievementDef } from "../game/achievements/types";
import { subscribeAchievementUnlocked } from "../game/achievements/achievementsData";
import { audio } from "../game/audio";
import type { Language, Translations } from "../game/i18n";

interface AchievementToastProps {
  lang?: Language;
  t?: Translations;
}

export function AchievementToast({ lang = "vi", t }: AchievementToastProps) {
  const [current, setCurrent] = useState<AchievementDef | null>(null);

  useEffect(() => {
    return subscribeAchievementUnlocked((ach) => {
      audio.spaceChime();
      audio.shatter(2, true);
      setCurrent(ach);

      const timer = setTimeout(() => {
        setCurrent(null);
      }, 4200);

      return () => clearTimeout(timer);
    });
  }, []);

  if (!current) return null;

  const title = lang === "vi" ? current.titleVi : current.titleEn;
  const desc = lang === "vi" ? current.descVi : current.descEn;

  return (
    <div className="pointer-events-auto fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="animate-pop-in flex items-center gap-3.5 rounded-2xl border-2 border-amber-400 bg-void-950/95 p-3.5 sm:px-5 sm:py-4 shadow-[0_0_40px_rgba(251,191,36,0.65)] backdrop-blur-xl">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md">
          <svg viewBox="0 0 24 24" fill="#0b0718" className="h-6 w-6">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-300" />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400">
              {t?.achievementUnlockedToast ?? "THÀNH TỰU MỚI MỞ KHÓA!"}
            </span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-300 uppercase">
              {current.tier}
            </span>
          </div>
          <h4 className="font-display text-sm font-bold text-white tracking-wide">
            {title}
          </h4>
          <p className="text-[11px] text-white/70 line-clamp-1">
            {desc}
          </p>
        </div>

        <button
          onClick={() => setCurrent(null)}
          className="ml-2 text-white/50 hover:text-white transition cursor-pointer p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
