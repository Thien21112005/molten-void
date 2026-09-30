import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  loadProgress,
  getTotalStars,
  MAX_POSSIBLE_STARS,
} from "../game/levels/progress";
import type { Translations } from "../game/i18n";
import { audio } from "../game/audio";
import { cn } from "../utils/cn";
import {
  LEVEL_NODES,
  MAP_WIDTH,
  MAP_HEIGHT,
  ROADMAP_STARS,
  ROADMAP_CONSTELLATIONS,
  calculateRoadmapPaths,
} from "./roadmap/roadmapData";
import { RoadmapNode } from "./roadmap/RoadmapNode";

export interface CosmicRoadmapProps {
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
  currentLevel?: number;
  t?: Translations;
  isFromPaused?: boolean;
  onResumeGame?: () => void;
  onClose?: () => void;
}

export function CosmicRoadmap({
  onSelectLevel,
  onBackToMenu,
  currentLevel = 1,
  t,
  isFromPaused = false,
  onResumeGame,
  onClose,
}: CosmicRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const progress = useMemo(() => loadProgress(), []);
  const totalStars = useMemo(() => getTotalStars(progress), [progress]);

  // Generate smooth SVG S-curve path string with purely numerical pixel coordinates
  const { fullPath, completedPath, steppingDots } = useMemo(
    () => calculateRoadmapPaths(progress),
    [progress]
  );

  // Auto-scroll on mount to center the active level node
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNodeRef.current && containerRef.current) {
        currentNodeRef.current.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentLevel]);

  // Smooth scroll to current player station
  const scrollToCurrentLevel = () => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Immediate, buttery-smooth mouse drag with window event listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault(); // Stop native drag ghosting & text selection
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.clientX);
    setScrollStartX(containerRef.current?.scrollLeft || 0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const deltaX = e.clientX - dragStartX;
      if (Math.abs(deltaX) > 4) {
        setHasDragged(true);
      }
      containerRef.current.scrollLeft = scrollStartX - deltaX;
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging, dragStartX, scrollStartX]);

  // Mobile Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setScrollStartX(containerRef.current?.scrollLeft || 0);
    setHasDragged(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartX;
    if (Math.abs(deltaX) > 4) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollStartX - deltaX;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="animate-rise-in m-auto flex h-[min(94vh,44rem)] w-[min(96vw,62rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/80 bg-void-950/95 shadow-[0_0_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {/* Top Floating Glass Header */}
      <div className="z-30 flex items-center justify-between border-b border-void-800/80 bg-void-950/85 px-4 py-3 backdrop-blur-md sm:px-6">
        {/* Left Action: Back / Menu */}
        <div className="flex items-center gap-2">
          {isFromPaused ? (
            <button
              onClick={() => {
                audio.ensure();
                audio.click();
                if (onClose) onClose();
                else onBackToMenu();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white/80 transition hover:bg-void-800 hover:text-white active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {t?.back ?? "Quay Lại"}
            </button>
          ) : (
            <button
              onClick={() => {
                audio.ensure();
                audio.click();
                onBackToMenu();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white/80 transition hover:bg-void-800 hover:text-white active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {t?.menu ?? "Menu"}
            </button>
          )}
        </div>

        <div className="text-center">
          <h2 className="font-display text-base tracking-wider text-white sm:text-lg">
            {t?.roadmapTitle ?? "COSMIC CAMPAIGN ROADMAP"}
          </h2>
          <p className="text-[10px] font-bold tracking-[0.25em] text-ice-400/90">
            {t?.roadmapSubtitle ?? "WEST TO EAST • 15 EXPEDITIONS"}
          </p>
        </div>

        {/* Right Action: Resume / Stars Counter / Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isFromPaused && onResumeGame && (
            <button
              onClick={() => {
                audio.ensure();
                audio.click();
                onResumeGame();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/70 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{t?.resume ?? "Tiếp Tục"}</span>
            </button>
          )}

          {/* Total Stars Counter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-2.5 sm:px-3 py-1.5 shadow-[0_0_15px_rgba(255,179,38,0.2)]">
            <svg viewBox="0 0 24 24" fill="#ffb326" className="h-4 w-4 overflow-visible drop-shadow-[0_0_6px_rgba(255,179,38,0.8)]">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-display text-xs tracking-wide text-amber-300 sm:text-sm">
              {totalStars} <span className="text-[10px] text-white/40">/ {MAX_POSSIBLE_STARS}</span>
            </span>
          </div>

          {/* Direct Close Button */}
          {onClose && (
            <button
              onClick={() => {
                audio.ensure();
                audio.click();
                onClose();
              }}
              aria-label={t?.close ?? "Đóng"}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-void-700/80 bg-void-900/80 text-white/70 hover:border-ice-400 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Draggable Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "relative flex-1 select-none overflow-x-auto overflow-y-hidden no-scrollbar",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab scroll-smooth",
        )}
      >
        {/* Full Width Map Space Canvas */}
        <div
          className="relative"
          style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}
        >
          {/* Cosmic Nebula Cloud Backgrounds */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[18%] left-[6%] h-72 w-88 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute top-[38%] left-[38%] h-80 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute top-[14%] left-[68%] h-72 w-96 rounded-full bg-violet-600/15 blur-3xl" />
            <div className="absolute top-[28%] left-[88%] h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />
          </div>

          {/* ================= RICH COSMIC STARFIELD & CONSTELLATIONS ================= */}
          <style>{`
            @keyframes roadmapStarTwinkle {
              0%, 100% {
                opacity: 0.25;
                transform: scale(0.75);
              }
              50% {
                opacity: 1;
                transform: scale(1.25);
              }
            }
            @keyframes roadmapSparkleSpin {
              0%, 100% {
                opacity: 0.35;
                transform: scale(0.7) rotate(0deg);
              }
              50% {
                opacity: 1;
                transform: scale(1.3) rotate(45deg);
              }
            }
            @keyframes roadmapCometStreak1 {
              0% {
                transform: translate(0, 0);
                opacity: 0;
              }
              10% {
                opacity: 0.95;
              }
              28% {
                transform: translate(160px, 90px);
                opacity: 0;
              }
              100% {
                transform: translate(160px, 90px);
                opacity: 0;
              }
            }
            @keyframes roadmapCometStreak2 {
              0% {
                transform: translate(0, 0);
                opacity: 0;
              }
              10% {
                opacity: 0.95;
              }
              28% {
                transform: translate(180px, 100px);
                opacity: 0;
              }
              100% {
                transform: translate(180px, 100px);
                opacity: 0;
              }
            }
          `}</style>

          {/* Starlight Constellations */}
          <svg className="pointer-events-none absolute inset-0" width={MAP_WIDTH} height={MAP_HEIGHT}>
            {ROADMAP_CONSTELLATIONS.map((c, cIdx) => (
              <g key={`const-${cIdx}`} opacity="0.6">
                {c.lines.map((l, lIdx) => (
                  <line
                    key={`line-${lIdx}`}
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke="rgba(125,252,231,0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
                {c.stars.map((s, sIdx) => (
                  <circle
                    key={`star-${sIdx}`}
                    cx={s.x}
                    cy={s.y}
                    r="2.5"
                    fill={s.color}
                    className="animate-pulse"
                  />
                ))}
              </g>
            ))}
          </svg>

          {/* Shooting Stars / Cosmic Comets */}
          <div className="pointer-events-none absolute" style={{ left: "200px", top: "35px" }}>
            <svg width="180" height="80" className="overflow-visible" style={{ animation: "roadmapCometStreak1 8s ease-in-out infinite" }}>
              <defs>
                <linearGradient id="cometRoad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7dfce7" stopOpacity="0" />
                  <stop offset="80%" stopColor="#7dfce7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="80" y2="45" stroke="url(#cometRoad1)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="80" cy="45" r="2.8" fill="#ffffff" />
            </svg>
          </div>

          <div className="pointer-events-none absolute" style={{ left: "1150px", top: "25px" }}>
            <svg width="180" height="80" className="overflow-visible" style={{ animation: "roadmapCometStreak2 9s ease-in-out infinite 3.5s" }}>
              <defs>
                <linearGradient id="cometRoad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd23e" stopOpacity="0" />
                  <stop offset="80%" stopColor="#ffd23e" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="85" y2="48" stroke="url(#cometRoad2)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="85" cy="48" r="2.8" fill="#ffffff" />
            </svg>
          </div>

          <div className="pointer-events-none absolute" style={{ left: "2050px", top: "35px" }}>
            <svg width="180" height="80" className="overflow-visible" style={{ animation: "roadmapCometStreak1 8.5s ease-in-out infinite 1.8s" }}>
              <defs>
                <linearGradient id="cometRoad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
                  <stop offset="80%" stopColor="#c084fc" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="80" y2="45" stroke="url(#cometRoad3)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="80" cy="45" r="2.8" fill="#ffffff" />
            </svg>
          </div>

          {/* Cosmic Sparkling Starfield (140+ Stars across the 2560px Map) */}
          <div className="pointer-events-none absolute inset-0">
            {ROADMAP_STARS.map((star, idx) => {
              if (star.type === "sparkle") {
                return (
                  <div
                    key={`star-${idx}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
                    style={{
                      left: `${star.x}px`,
                      top: `${star.y}px`,
                      animation: `roadmapSparkleSpin ${star.dur} ease-in-out infinite ${star.delay}`,
                    }}
                  >
                    <svg viewBox="-8 -8 16 16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 overflow-visible" style={{ filter: `drop-shadow(0 0 4px ${star.color})` }}>
                      <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill={star.color} />
                      <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                    </svg>
                  </div>
                );
              }
              if (star.type === "sparkleSm") {
                return (
                  <div
                    key={`star-${idx}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
                    style={{
                      left: `${star.x}px`,
                      top: `${star.y}px`,
                      animation: `roadmapSparkleSpin ${star.dur} ease-in-out infinite ${star.delay}`,
                    }}
                  >
                    <svg viewBox="-6 -6 12 12" className="w-2.5 h-2.5 sm:w-3 sm:h-3 overflow-visible" style={{ filter: `drop-shadow(0 0 3px ${star.color})` }}>
                      <path d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z" fill={star.color} />
                      <circle cx="0" cy="0" r="1" fill="#ffffff" />
                    </svg>
                  </div>
                );
              }
              if (star.type === "medium") {
                return (
                  <div
                    key={`star-${idx}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full will-change-transform"
                    style={{
                      left: `${star.x}px`,
                      top: `${star.y}px`,
                      width: `${star.size || 2.5}px`,
                      height: `${star.size || 2.5}px`,
                      backgroundColor: star.color,
                      boxShadow: `0 0 6px ${star.color}`,
                      animation: `roadmapStarTwinkle ${star.dur} ease-in-out infinite ${star.delay}`,
                    }}
                  />
                );
              }
              return (
                <div
                  key={`star-${idx}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
                  style={{
                    left: `${star.x}px`,
                    top: `${star.y}px`,
                    width: `${star.size || 1.5}px`,
                    height: `${star.size || 1.5}px`,
                    backgroundColor: star.color,
                    opacity: star.opacity || 0.6,
                    animation: `roadmapStarTwinkle ${star.dur} ease-in-out infinite ${star.delay}`,
                  }}
                />
              );
            })}
          </div>

          {/* ================= RICH COSMIC DECORATIONS ================= */}

          {/* 1. Gas Giant Planet (Saturn-like with glowing rings) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "500px", top: "90px", animationDuration: "6s" }}
          >
            <svg width="140" height="110" viewBox="0 0 140 110" className="overflow-visible">
              <defs>
                <radialGradient id="gasGiantAtmosphere" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="rgba(168,85,247,0.35)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                </radialGradient>
                <radialGradient id="gasGiantGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="40%" stopColor="#8b5cf6" />
                  <stop offset="80%" stopColor="#312e81" />
                  <stop offset="100%" stopColor="#0f0c29" />
                </radialGradient>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(46,230,201,0)" />
                  <stop offset="25%" stopColor="rgba(46,230,201,0.85)" />
                  <stop offset="50%" stopColor="rgba(255,210,62,0.9)" />
                  <stop offset="75%" stopColor="rgba(46,230,201,0.85)" />
                  <stop offset="100%" stopColor="rgba(46,230,201,0)" />
                </linearGradient>
              </defs>
              {/* Pure SVG circular atmospheric glow - zero square clipping */}
              <circle cx="70" cy="55" r="44" fill="url(#gasGiantAtmosphere)" />
              {/* Back half of ring */}
              <ellipse cx="70" cy="55" rx="58" ry="15" fill="none" stroke="url(#ringGrad)" strokeWidth="6" transform="rotate(-18 70 55)" opacity="0.65" strokeDasharray="100 220" strokeDashoffset="45" />
              {/* Planet sphere */}
              <circle cx="70" cy="55" r="28" fill="url(#gasGiantGrad)" />
              {/* Surface bands */}
              <ellipse cx="70" cy="53" rx="27.5" ry="13" fill="none" stroke="#e9d5ff" strokeWidth="1.5" opacity="0.25" />
              <ellipse cx="70" cy="58" rx="27" ry="8" fill="none" stroke="#f472b6" strokeWidth="1.2" opacity="0.3" />
              {/* Front half of ring */}
              <ellipse cx="70" cy="55" rx="58" ry="15" fill="none" stroke="url(#ringGrad)" strokeWidth="6.5" transform="rotate(-18 70 55)" strokeDasharray="180 220" strokeDashoffset="150" />
              <ellipse cx="70" cy="55" rx="50" ry="11" fill="none" stroke="#2ee6c9" strokeWidth="1.6" transform="rotate(-18 70 55)" opacity="0.45" />
            </svg>
            <span className="block text-center font-display text-[9px] tracking-widest text-purple-300/80">
              AETHON GAS GIANT
            </span>
          </div>

          {/* 2. Recon Fighter Spaceship (Near Level 1-2) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "220px", top: "120px", animationDelay: "1.2s", animationDuration: "5s" }}
          >
            <svg width="84" height="52" viewBox="0 0 84 52" className="overflow-visible">
              <defs>
                <radialGradient id="scoutAura" cx="50%" cy="50%" r="50%">
                  <stop offset="40%" stopColor="rgba(46,230,201,0.22)" />
                  <stop offset="100%" stopColor="rgba(46,230,201,0)" />
                </radialGradient>
                <linearGradient id="scoutHull" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="thrusterFire" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#2ee6c9" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <ellipse cx="42" cy="26" rx="42" ry="24" fill="url(#scoutAura)" />
              {/* Thruster exhaust jet */}
              <polygon points="22,26 2,22 0,26 2,30" fill="url(#thrusterFire)" />
              {/* Wings */}
              <polygon points="24,11 50,23 40,27 22,22" fill="#090d16" stroke="#2ee6c9" strokeWidth="1.5" />
              <polygon points="24,41 50,29 40,25 22,30" fill="#090d16" stroke="#2ee6c9" strokeWidth="1.5" />
              {/* Fuselage */}
              <polygon points="22,22 72,26 22,30 18,26" fill="url(#scoutHull)" stroke="#94a3b8" strokeWidth="1.6" />
              {/* Canopy */}
              <polygon points="42,24 60,26 42,28" fill="#38bdf8" opacity="0.95" />
              {/* Beacon lights */}
              <circle cx="24" cy="11" r="2.2" fill="#ff4d6d" />
              <circle cx="24" cy="41" r="2.2" fill="#2ee6c9" />
            </svg>
            <span className="block text-center font-display text-[8px] tracking-widest text-ice-400/90">
              EXPEDITION SCOUT
            </span>
          </div>

          {/* 3. Deep Space Orbital Relay Station (Above Level 7) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "1100px", top: "85px", animationDelay: "2.4s", animationDuration: "5.5s" }}
          >
            <svg width="88" height="54" viewBox="0 0 88 54" className="overflow-visible">
              <defs>
                <radialGradient id="relayAura" cx="50%" cy="50%" r="50%">
                  <stop offset="35%" stopColor="rgba(56,189,248,0.22)" />
                  <stop offset="100%" stopColor="rgba(56,189,248,0)" />
                </radialGradient>
              </defs>
              <ellipse cx="44" cy="27" rx="44" ry="26" fill="url(#relayAura)" />
              {/* Left Solar Panel */}
              <rect x="4" y="17" width="24" height="20" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
              <line x1="16" y1="17" x2="16" y2="37" stroke="#60a5fa" strokeWidth="1" />
              <line x1="4" y1="27" x2="28" y2="27" stroke="#60a5fa" strokeWidth="1" />
              {/* Center Core */}
              <rect x="36" y="19" width="16" height="16" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.8" />
              {/* Radar Dish & Antenna */}
              <path d="M44 19 L44 8 M37 10 Q44 4 51 10" fill="none" stroke="#ffd23e" strokeWidth="1.6" />
              <circle cx="44" cy="6" r="1.8" fill="#ff4d6d" />
              {/* Right Solar Panel */}
              <rect x="60" y="17" width="24" height="20" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
              <line x1="72" y1="17" x2="72" y2="37" stroke="#60a5fa" strokeWidth="1" />
              <line x1="60" y1="27" x2="84" y2="27" stroke="#60a5fa" strokeWidth="1" />
              {/* Solar struts */}
              <line x1="28" y1="27" x2="36" y2="27" stroke="#94a3b8" strokeWidth="2.4" />
              <line x1="52" y1="27" x2="60" y2="27" stroke="#94a3b8" strokeWidth="2.4" />
            </svg>
            <span className="block text-center font-display text-[8px] tracking-wider text-cyan-300/80">
              ORBITAL RELAY IX
            </span>
          </div>

          {/* 4. Heavy Cruiser Exploration Ship (Between Level 8 & 10) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "1420px", top: "190px", animationDelay: "0.8s", animationDuration: "6.2s" }}
          >
            <svg width="100" height="54" viewBox="0 0 100 54" className="overflow-visible">
              <defs>
                <radialGradient id="cruiserAura" cx="50%" cy="50%" r="50%">
                  <stop offset="35%" stopColor="rgba(255,160,46,0.22)" />
                  <stop offset="100%" stopColor="rgba(255,160,46,0)" />
                </radialGradient>
                <linearGradient id="cruiserPlume" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="60%" stopColor="#f05423" />
                  <stop offset="100%" stopColor="#ffd23e" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="27" rx="50" ry="26" fill="url(#cruiserAura)" />
              {/* Twin Thrusters */}
              <polygon points="14,19 2,17 0,19 2,21" fill="url(#cruiserPlume)" />
              <polygon points="14,35 2,33 0,35 2,37" fill="url(#cruiserPlume)" />
              {/* Cruiser Hull */}
              <path d="M14 17 L36 12 L78 21 L94 27 L78 33 L36 42 L14 37 L20 27 Z" fill="#171230" stroke="#ffa02e" strokeWidth="1.8" />
              <polygon points="40,18 72,23 72,31 40,36" fill="#241c46" stroke="#818cf8" strokeWidth="1" />
              {/* Command Deck Bridge */}
              <rect x="48" y="24" width="16" height="6" rx="2" fill="#38bdf8" />
              {/* Plasma Array */}
              <circle cx="78" cy="19" r="1.8" fill="#f43f5e" />
              <circle cx="78" cy="35" r="1.8" fill="#f43f5e" />
            </svg>
            <span className="block text-center font-display text-[8px] tracking-wider text-ember-400/90">
              VOID CRUISER V-II
            </span>
          </div>

          {/* 5. Cratered Volcanic Moon (Beneath Level 5-6 Summit) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "800px", top: "420px", animationDelay: "1.8s", animationDuration: "5.8s" }}
          >
            <svg width="90" height="90" viewBox="0 0 90 90" className="overflow-visible">
              <defs>
                <radialGradient id="moonAtmosphere" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="rgba(148,163,184,0.3)" />
                  <stop offset="100%" stopColor="rgba(148,163,184,0)" />
                </radialGradient>
                <radialGradient id="moonGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="45%" stopColor="#94a3b8" />
                  <stop offset="85%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
              </defs>
              {/* Pure SVG circular atmospheric glow - zero square clipping */}
              <circle cx="45" cy="45" r="40" fill="url(#moonAtmosphere)" />
              {/* Moon body */}
              <circle cx="45" cy="45" r="28" fill="url(#moonGrad)" />
              {/* Craters */}
              <ellipse cx="35" cy="35" rx="6" ry="4.5" fill="#475569" stroke="#1e293b" strokeWidth="1" opacity="0.85" />
              <ellipse cx="55" cy="42" rx="7.5" ry="6" fill="#475569" stroke="#1e293b" strokeWidth="1" opacity="0.8" />
              <ellipse cx="41" cy="55" rx="4.5" ry="3.5" fill="#475569" stroke="#1e293b" strokeWidth="0.8" opacity="0.75" />
              <circle cx="31" cy="51" r="2.5" fill="#334155" opacity="0.6" />
              <circle cx="53" cy="27" r="2.8" fill="#334155" opacity="0.6" />
            </svg>
            <span className="block text-center font-display text-[8px] tracking-wider text-slate-400/80">
              LUNA PRIME
            </span>
          </div>

          {/* 6. Molten Void Accretion Disk / Singularity Core (Near Level 15) */}
          <div
            className="animate-float-slow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "2480px", top: "115px", animationDelay: "0.5s", animationDuration: "7s" }}
          >
            <svg width="140" height="140" viewBox="0 0 140 140" className="overflow-visible">
              <defs>
                <radialGradient id="vortexGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="25%" stopColor="rgba(255,122,26,0.45)" />
                  <stop offset="60%" stopColor="rgba(240,84,35,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,122,26,0)" />
                </radialGradient>
              </defs>
              {/* Pure SVG circular accretion glow - zero square clipping */}
              <circle cx="70" cy="70" r="68" fill="url(#vortexGlowGrad)" />
              {/* Swirling accretion disk rings */}
              <ellipse cx="70" cy="70" rx="58" ry="25" fill="none" stroke="#ff7a1a" strokeWidth="4.5" transform="rotate(-25 70 70)" opacity="0.85" />
              <ellipse cx="70" cy="70" rx="47" ry="17" fill="none" stroke="#ffd23e" strokeWidth="2.8" transform="rotate(-25 70 70)" opacity="0.9" />
              {/* Event Horizon Dark Core */}
              <circle cx="70" cy="70" r="24" fill="#000000" stroke="#ff4d6d" strokeWidth="2.4" />
              <circle cx="70" cy="70" r="29" fill="none" stroke="#ffa02e" strokeWidth="1.2" opacity="0.6" />
            </svg>
            <span className="block text-center font-display text-[9px] font-bold tracking-widest text-ember-300">
              SINGULARITY CORE
            </span>
          </div>

          {/* 7. Asteroid Clusters */}
          {/* Cluster A (Near Level 2-3) */}
          <div className="pointer-events-none absolute" style={{ left: "360px", top: "190px" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" className="overflow-visible opacity-80">
              <polygon points="12,4 24,10 20,22 8,18 4,10" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
              <polygon points="32,24 44,28 40,40 28,38 24,30" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <polygon points="10,34 18,36 16,44 8,42" fill="#475569" stroke="#64748b" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Cluster B (Near Level 11-12) */}
          <div className="pointer-events-none absolute" style={{ left: "1720px", top: "420px" }}>
            <svg width="52" height="48" viewBox="0 0 52 48" className="opacity-80">
              <polygon points="16,6 30,12 26,26 12,22 6,12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
              <polygon points="36,28 48,32 44,44 32,42 28,34" fill="#312e81" stroke="#a78bfa" strokeWidth="1" />
            </svg>
          </div>

          {/* Cluster C (Near Level 13-14) */}
          <div className="pointer-events-none absolute" style={{ left: "2160px", top: "110px" }}>
            <svg width="44" height="44" viewBox="0 0 44 44" className="opacity-75">
              <polygon points="10,4 22,8 18,20 6,16 2,8" fill="#241c46" stroke="#c084fc" strokeWidth="1.2" />
              <polygon points="26,24 38,26 34,36 24,34 20,28" fill="#171230" stroke="#7c3aed" strokeWidth="1" />
            </svg>
          </div>

          {/* ================= SVG RADIANT COSMIC ENERGY ROAD ================= */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          >
            <defs>
              <linearGradient id="cosmicRoadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff7a1a" />
                <stop offset="35%" stopColor="#2ee6c9" />
                <stop offset="70%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ffd166" />
              </linearGradient>

              <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Deep solid trench beneath road */}
            <path
              d={fullPath}
              fill="none"
              stroke="#0a0717"
              strokeWidth="42"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Outer glowing radiant nebula beam */}
            <path
              d={fullPath}
              fill="none"
              stroke="url(#cosmicRoadGrad)"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.38"
              filter="url(#roadGlow)"
            />

            {/* 3. Solid cosmic dark track bed */}
            <path
              d={fullPath}
              fill="none"
              stroke="#16102e"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 4. Active completed energy track (illuminated) */}
            <path
              d={completedPath}
              fill="none"
              stroke="url(#cosmicRoadGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* 5. Center pulsating celestial dashed guidance line */}
            <path
              d={fullPath}
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="8 14"
              opacity="0.75"
            />

            {/* 6. Stepping star beads along the highway */}
            {steppingDots.map((dot, i) => (
              <g key={`bead-${i}`}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="5"
                  fill={dot.active ? "#2ee6c9" : "#241b44"}
                  stroke={dot.active ? "#a7f3d0" : "#3b2d6a"}
                  strokeWidth="1.5"
                  opacity={dot.active ? "0.9" : "0.5"}
                />
                {dot.active && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="9"
                    fill="none"
                    stroke="#2ee6c9"
                    strokeWidth="1"
                    opacity="0.35"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Floating Space Crystals along the wave */}
          <div className="pointer-events-none absolute inset-0">
            {LEVEL_NODES.map((node, i) => {
              if (i % 2 !== 0) return null;
              const decorY = node.y > 260 ? node.y - 85 : node.y + 85;
              const isGold = i % 4 === 0;
              return (
                <div
                  key={`decor-${node.id}`}
                  className="animate-float-slow absolute -translate-x-1/2 -translate-y-1/2 opacity-75"
                  style={{
                    left: `${node.x + 35}px`,
                    top: `${decorY}px`,
                    animationDelay: `${i * 240}ms`,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-7 w-7 overflow-visible",
                      isGold
                        ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                        : "text-ice-400 drop-shadow-[0_0_12px_rgba(46,230,201,0.6)]",
                    )}
                  >
                    <path d="M12 2.5 20 9l-8 12.5L4 9l8-6.5z" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* ================= 15 LEVEL STATION NODES ================= */}
          {LEVEL_NODES.map((pos) => {
            const isCurrent = pos.id === currentLevel;
            return (
              <RoadmapNode
                key={pos.id}
                pos={pos}
                progress={progress}
                currentLevel={currentLevel}
                hasDragged={hasDragged}
                t={t}
                onSelectLevel={onSelectLevel}
                nodeRef={isCurrent ? currentNodeRef : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="z-30 flex items-center justify-between border-t border-void-800/80 bg-void-950/90 px-4 py-2.5 text-xs backdrop-blur-md sm:px-6">
        <button
          onClick={() => {
            audio.click();
            scrollToCurrentLevel();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-ice-500/50 bg-ice-950/40 px-3 py-1 font-semibold text-ice-300 transition hover:bg-ice-900/50 active:scale-95 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          {t?.currentStationBtn ?? "Current Station"}
        </button>

        <span className="text-[11px] font-semibold text-white/50">
          {t?.starmapExploreHint ?? "↔ Drag horizontally to explore • Tap to sling"}
        </span>
      </div>
    </div>
  );
}
