import { useState, useEffect } from "react";
import type { VictoryData } from "../game/engine";
import type { Translations } from "../game/i18n";
import { audio } from "../game/audio";
import { VietnameseAstronaut } from "./VietnameseAstronaut";
import { cn } from "../utils/cn";

export interface VictoryModalProps {
  data: VictoryData;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenRoadmap: () => void;
  t?: Translations;
}

function useCountUp(target: number, durationMs = 1000, delayMs = 200, playTicks = false) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let animId: number;
    let startTimestamp: number | null = null;
    let lastTickTime = 0;

    const timer = setTimeout(() => {
      const step = (now: number) => {
        if (!startTimestamp) startTimestamp = now;
        const elapsed = now - startTimestamp;
        const progress = Math.min(elapsed / durationMs, 1);
        
        // Fast cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * target);
        setVal(current);

        if (playTicks && progress < 1 && now - lastTickTime > 65) {
          audio.scoreTick();
          lastTickTime = now;
        }

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          setVal(target);
        }
      };
      animId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [target, durationMs, delayMs, playTicks]);

  return val;
}

export function VictoryModal({
  data,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onOpenRoadmap,
  t,
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [revealedStars, setRevealedStars] = useState(0);

  const baseScore = Math.max(0, data.levelScore - data.coresBonus);
  const displayLevelScore = useCountUp(baseScore, 850, 150, false);
  const displayBonus = useCountUp(data.coresBonus, 950, 300, false);
  const displayTotalScore = useCountUp(data.score, 1200, 450, true);

  // Sequential Star Reveal Animation
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (data.stars >= 1) {
        setRevealedStars(1);
        audio.starPop(0);
      }
    }, 350);

    const t2 = setTimeout(() => {
      if (data.stars >= 2) {
        setRevealedStars(2);
        audio.starPop(1);
      }
    }, 750);

    const t3 = setTimeout(() => {
      if (data.stars >= 3) {
        setRevealedStars(3);
        audio.starPop(2);
      }
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [data.stars]);

  const handleShare = async () => {
    audio.ensure();
    audio.click();
    const template =
      t?.shareTextTemplate ??
      "🌌 Tôi vừa chinh phục Molten Void màn {level} với {stars}⭐ (Tổng {totalStars}/45⭐)! Bạn có phá được kỷ lục này không? https://thien21112005.github.io/molten-void/";
    const text = template
      .replace("{level}", String(data.level))
      .replace("{stars}", String(data.stars))
      .replace("{totalStars}", String(data.totalStars));

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    }
  };

  return (
    <div className="animate-pop-in m-auto flex w-[min(92vw,24rem)] flex-col items-center rounded-2xl border-2 border-ember-500/50 bg-void-950/95 p-6 shadow-[0_0_50px_rgba(255,122,26,0.25)] backdrop-blur-md">
      <style>{`
        @keyframes victoryStarPop {
          0% { transform: scale(0) rotate(-35deg); opacity: 0; }
          60% { transform: scale(1.4) rotate(8deg); opacity: 1; }
          80% { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>

      <p className="text-[11px] font-bold tracking-[0.4em] text-ember-300/80 uppercase">
        {t?.levelClearedHeader ?? "LEVEL CLEARED"} {data.level}
      </p>

      <h2 className="mt-1 font-display text-2xl sm:text-3xl tracking-wide text-ember-300 [text-shadow:0_0_24px_rgba(255,179,38,0.6)] text-center">
        {data.levelName}
      </h2>

      {/* Celebrating Astronaut Mascot */}
      <div className="relative my-2 sm:my-2.5 flex items-center justify-center">
        <VietnameseAstronaut
          lang={t?.menu === "Menu" ? "vi" : "en"}
          className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-[0_0_25px_rgba(255,210,62,0.45)]"
          reaction="victory"
          showReactionBadge={false}
          quotePlacement="bottom"
        />
      </div>

      {/* 3 Stars display with sequential pop */}
      <div className="my-3 flex flex-col items-center">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((starNum) => {
            const isRevealed = starNum <= revealedStars;

            return (
              <div
                key={starNum}
                className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  isRevealed && "animate-[victoryStarPop_0.45s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={isRevealed ? "#ffb326" : "rgba(255, 255, 255, 0.12)"}
                  stroke={isRevealed ? "#ffe480" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth="1.2"
                  className={cn(
                    "h-11 w-11 transition-all duration-300",
                    isRevealed
                      ? "drop-shadow-[0_0_14px_rgba(255,179,38,0.9)] scale-105"
                      : "opacity-30 scale-95"
                  )}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>

                {/* Stardust sparkle flash when revealed */}
                {isRevealed && (
                  <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-200 animate-ping opacity-75" />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-xs font-bold tracking-widest text-ice-300 transition-opacity duration-300">
          {revealedStars >= data.stars
            ? data.stars === 3
              ? (t?.perfectRun3Stars ?? "PERFECT RUN — 3 STARS!")
              : data.stars === 2
                ? (t?.greatShot2Stars ?? "GREAT SHOT — 2 STARS")
                : (t?.cleared1Star ?? "CLEARED — 1 STAR")
            : "..."}
        </p>
      </div>

      {/* Score Summary Box with rapid counting */}
      <div className="w-full space-y-2 rounded-xl border border-void-700/80 bg-void-900/80 p-3.5 text-xs font-semibold">
        <div className="flex justify-between text-white/70">
          <span>{t?.levelScore ?? "Level Score"}</span>
          <span className="font-display tracking-wider text-white">
            {displayLevelScore.toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>{t?.coreReserveBonus ?? "Core Reserve Bonus"}</span>
          <span className="font-display tracking-wider text-ice-300">
            +{displayBonus.toLocaleString("en-US")}
          </span>
        </div>
        <div className="my-1 border-t border-void-700/60" />
        <div className="flex items-center justify-between text-sm font-bold text-ember-300">
          <span>{t?.totalRunScore ?? "Total Run Score"}</span>
          <span className="font-display text-lg tracking-wide text-ember-400">
            {displayTotalScore.toLocaleString("en-US")}
          </span>
        </div>
        {data.isNewBestScore && (
          <div className="mt-1 text-center font-display text-[11px] tracking-widest text-emerald-400">
            ★ {t?.newBest ?? "NEW HIGH SCORE RECORD"} ★
          </div>
        )}
      </div>

      {/* Share to Clipboard Button */}
      <div className="mt-4 w-full">
        <button
          onClick={handleShare}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold tracking-wider transition active:scale-95 cursor-pointer ${
            copied
              ? "border-emerald-400/80 bg-emerald-950/70 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.35)]"
              : "border-cyan-500/50 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 hover:text-white shadow-[0_0_12px_rgba(46,230,201,0.15)]"
          }`}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{t?.shareCopied ?? "Đã sao chép vào bộ nhớ tạm!"}</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{t?.shareResult ?? "Chia Sẻ Thành Tích"}</span>
            </>
          )}
        </button>
      </div>

      {/* Buttons */}
      <div className="mt-3 flex w-full flex-col gap-2">
        {hasNextLevel ? (
          <button
            onClick={onNextLevel}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ember-400/80 bg-gradient-to-r from-ember-500 to-amber-500 py-3 font-display text-base tracking-wider text-void-950 shadow-[0_5px_0_rgba(160,60,0,0.9)] transition hover:brightness-110 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M7 4.5c0-1.2 1.3-1.9 2.3-1.3l11 6.9c1 .6 1 2 0 2.6l-11 6.9c-1 .6-2.3-.1-2.3-1.3V4.5z" />
            </svg>
            {t?.nextSector ?? "Next Level"}
          </button>
        ) : (
          <div className="py-2 text-center font-display text-sm text-ice-300">
            {t?.victory ?? "All Levels Completed! You are a Void Master!"}
          </div>
        )}

        <div className="flex w-full gap-2">
          <button
            onClick={onRetry}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-void-600 bg-void-900/90 py-2.5 text-xs font-bold tracking-wider text-white/90 transition hover:bg-void-800 hover:text-white cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
              <path d="M20 12a8 8 0 1 1-2.34-5.66" />
              <path d="M20 3v4h-4" />
            </svg>
            {t?.restart ?? "Replay"}
          </button>

          <button
            onClick={onOpenRoadmap}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-ice-500/50 bg-ice-950/40 py-2.5 text-xs font-bold tracking-wider text-ice-300 transition hover:bg-ice-900/50 hover:text-white cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            {t?.roadmap ?? "Roadmap"}
          </button>
        </div>
      </div>
    </div>
  );
}
