import React, { useRef, useEffect, useState, useMemo } from "react";
import { LEVELS } from "../game/levels/levelsData";
import {
  loadProgress,
  getTotalStars,
  isLevelUnlocked,
  MAX_POSSIBLE_STARS,
} from "../game/levels/progress";
import { StarRating } from "./StarRating";
import { cn } from "../utils/cn";

export interface CosmicRoadmapProps {
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
  currentLevel?: number;
}

interface NodeCoord {
  id: number;
  xPercent: number; // 0 to 100
  y: number; // in pixels
}

// Handcrafted S-curve coordinates winding from Level 1 (bottom) to Level 15 (top)
const NODE_COORDS: { id: number; x: number }[] = [
  { id: 1, x: 34 },  // Start (Bottom-left)
  { id: 2, x: 66 },  // Sweep right
  { id: 3, x: 80 },  // Peak right
  { id: 4, x: 50 },  // Curve center
  { id: 5, x: 22 },  // Peak left
  { id: 6, x: 18 },  // Turn up-left
  { id: 7, x: 50 },  // Center crossover
  { id: 8, x: 82 },  // Peak right
  { id: 9, x: 78 },  // Turn up-right
  { id: 10, x: 50 }, // Center crossover
  { id: 11, x: 20 }, // Peak left
  { id: 12, x: 26 }, // Turn up-left
  { id: 13, x: 56 }, // Sweep right
  { id: 14, x: 78 }, // High peak right
  { id: 15, x: 50 }, // Summit / Apex (Top-center)
];

const ROW_HEIGHT = 140;
const PADDING_TOP = 140;
const PADDING_BOTTOM = 140;
const TOTAL_HEIGHT = (NODE_COORDS.length - 1) * ROW_HEIGHT + PADDING_TOP + PADDING_BOTTOM;

export function CosmicRoadmap({
  onSelectLevel,
  onBackToMenu,
  currentLevel = 1,
}: CosmicRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [scrollStartY, setScrollStartY] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const progress = useMemo(() => loadProgress(), []);
  const totalStars = useMemo(() => getTotalStars(progress), [progress]);

  // Compute absolute Y coordinates (Level 1 at bottom, Level 15 at top)
  const nodePositions: NodeCoord[] = useMemo(() => {
    return NODE_COORDS.map((item, idx) => {
      // Invert index so level 1 is at bottom, level 15 is at top
      const invertedIdx = NODE_COORDS.length - 1 - idx;
      const y = PADDING_TOP + invertedIdx * ROW_HEIGHT;
      return {
        id: item.id,
        xPercent: item.x,
        y,
      };
    });
  }, []);

  // Generate smooth SVG S-curve path string
  const svgPathData = useMemo(() => {
    // Sort from level 1 up to level 15 (bottom to top)
    const sorted = [...nodePositions].sort((a, b) => a.id - b.id);
    if (sorted.length === 0) return "";

    let d = `M ${sorted[0].xPercent}% ${sorted[0].y}`;
    for (let i = 0; i < sorted.length - 1; i++) {
      const p0 = sorted[i];
      const p1 = sorted[i + 1];
      const midY = (p0.y + p1.y) / 2;
      // Smooth cubic bezier S-curve
      d += ` C ${p0.xPercent}% ${midY}, ${p1.xPercent}% ${midY}, ${p1.xPercent}% ${p1.y}`;
    }
    return d;
  }, [nodePositions]);

  // Auto-scroll on mount to center the player's active level
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNodeRef.current && containerRef.current) {
        currentNodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else if (containerRef.current) {
        // Default scroll toward bottom (Level 1)
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentLevel]);

  // Jump smoothly to current unlocked level
  const scrollToCurrentLevel = () => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click and not directly clicking on a button
    if (e.button !== 0) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartY(e.clientY);
    setScrollStartY(containerRef.current?.scrollTop || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const deltaY = e.clientY - dragStartY;
    if (Math.abs(deltaY) > 5) {
      setHasDragged(true);
    }
    containerRef.current.scrollTop = scrollStartY - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="animate-rise-in m-auto flex h-[min(94vh,48rem)] w-[min(96vw,38rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/80 bg-void-950/95 shadow-[0_0_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {/* Top Floating Glass Header */}
      <div className="z-30 flex items-center justify-between border-b border-void-800/80 bg-void-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white/80 transition hover:bg-void-800 hover:text-white active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Menu
        </button>

        <div className="text-center">
          <h2 className="font-display text-base tracking-wider text-white sm:text-lg">
            EXPEDITION MAP
          </h2>
          <p className="text-[10px] font-bold tracking-[0.25em] text-ice-400/90">
            SECTOR 1 &bull; 15 STATIONS
          </p>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 shadow-[0_0_15px_rgba(255,179,38,0.2)]">
          <svg viewBox="0 0 24 24" fill="#ffb326" className="h-4 w-4 drop-shadow-[0_0_6px_rgba(255,179,38,0.8)]">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-display text-xs tracking-wide text-amber-300 sm:text-sm">
            {totalStars} <span className="text-[10px] text-white/40">/ {MAX_POSSIBLE_STARS}</span>
          </span>
        </div>
      </div>

      {/* Scrollable / Draggable Map Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "relative flex-1 select-none overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* Full Height Map World */}
        <div
          className="relative w-full"
          style={{ height: `${TOTAL_HEIGHT}px` }}
        >
          {/* Cosmic Starfield & Nebula Background */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[10%] left-[20%] h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
            <div className="absolute top-[45%] right-[15%] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute top-[75%] left-[25%] h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          </div>

          {/* SVG Connecting Cosmic Energy Road */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cosmicRoadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ff7a1a" />
                <stop offset="45%" stopColor="#2ee6c9" />
                <stop offset="80%" stopColor="#9d4edd" />
                <stop offset="100%" stopColor="#ffd166" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Deep road bed */}
            <path
              d={svgPathData}
              fill="none"
              stroke="#0f0b24"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 2. Outer glowing aura */}
            <path
              d={svgPathData}
              fill="none"
              stroke="url(#cosmicRoadGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
              filter="url(#glowEffect)"
            />
            {/* 3. Core energetic highway */}
            <path
              d={svgPathData}
              fill="none"
              stroke="#1a1438"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 4. Dashed celestial center line */}
            <path
              d={svgPathData}
              fill="none"
              stroke="url(#cosmicRoadGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 12"
              opacity="0.9"
            />
          </svg>

          {/* Floating Atmospheric Floating Crystals & Debris along the road */}
          <div className="pointer-events-none absolute inset-0">
            {nodePositions.map((node, i) => {
              // Alternate decorative crystals alongside the path
              if (i % 2 !== 0) return null;
              const isLeft = node.xPercent > 50;
              const decorX = isLeft ? node.xPercent - 24 : node.xPercent + 24;
              return (
                <div
                  key={`decor-${node.id}`}
                  className="animate-float-slow absolute -translate-x-1/2 -translate-y-1/2 opacity-70"
                  style={{
                    left: `${decorX}%`,
                    top: `${node.y - 20}px`,
                    animationDelay: `${i * 300}ms`,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-ice-400 drop-shadow-[0_0_10px_rgba(46,230,201,0.5)]">
                    <path d="M12 2.5 20 9l-8 12.5L4 9l8-6.5z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Level Nodes */}
          {nodePositions.map((pos) => {
            const level = LEVELS.find((l) => l.id === pos.id)!;
            const unlocked = isLevelUnlocked(progress, level.id);
            const record = progress.levels[level.id] || { stars: 0, highScore: 0, cleared: false };
            const isCurrent = level.id === currentLevel;
            const isStart = level.id === 1;
            const isApex = level.id === 15;

            return (
              <div
                key={level.id}
                ref={isCurrent ? currentNodeRef : undefined}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.xPercent}%`,
                  top: `${pos.y}px`,
                }}
              >
                {/* START FLAG (Level 1) */}
                {isStart && (
                  <div className="animate-bounce-subtle pointer-events-none absolute -top-10 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className="flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/90 px-2 py-0.5 font-display text-[9px] font-bold tracking-widest text-void-950 shadow-[0_0_12px_rgba(52,211,153,0.7)]">
                      🚩 START
                    </span>
                    <div className="h-2 w-0.5 bg-emerald-400" />
                  </div>
                )}

                {/* APEX TROPHY / FINISH PORTAL (Level 15) */}
                {isApex && (
                  <div className="animate-float-slow pointer-events-none absolute -top-11 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-0.5 font-display text-[9px] font-bold tracking-widest text-void-950 shadow-[0_0_18px_rgba(255,200,50,0.8)]">
                      🏆 APEX
                    </span>
                    <div className="h-2.5 w-0.5 bg-amber-400" />
                  </div>
                )}

                {/* CURRENT BEACON INDICATOR */}
                {isCurrent && unlocked && !isStart && !isApex && (
                  <div className="animate-pulse-soft pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-ember-400/80 bg-ember-500 px-2 py-0.5 font-display text-[8px] font-bold tracking-widest text-void-950 shadow-[0_0_14px_rgba(255,122,26,0.8)]">
                      PLAY
                    </span>
                  </div>
                )}

                {/* NODE CHUNKY BUTTON */}
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    if (!hasDragged && unlocked) {
                      onSelectLevel(level.id);
                    }
                  }}
                  className={cn(
                    "group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-200 sm:h-18 sm:w-18",
                    unlocked
                      ? "cursor-pointer active:translate-y-1 active:shadow-none"
                      : "cursor-not-allowed border-void-800/80 bg-void-950/80 opacity-55",
                    isCurrent && unlocked
                      ? "border-ember-400 bg-gradient-to-b from-ember-400 to-amber-600 shadow-[0_8px_0_rgba(150,50,0,0.9),0_0_28px_rgba(255,122,26,0.6)]"
                      : record.cleared
                        ? "border-ice-400 bg-gradient-to-b from-ice-400 to-teal-700 shadow-[0_8px_0_rgba(0,70,60,0.9),0_0_18px_rgba(46,230,201,0.4)]"
                        : unlocked
                          ? "border-amber-400/80 bg-gradient-to-b from-void-800 to-void-900 shadow-[0_8px_0_rgba(20,15,35,0.9)] hover:border-amber-300"
                          : "shadow-[0_6px_0_rgba(10,8,20,0.9)]",
                  )}
                >
                  {/* Subtle top bevel shine */}
                  <div className="pointer-events-none absolute inset-x-1.5 top-1 h-2 rounded-t-xl bg-white/20" />

                  {/* Level Number or Lock Icon */}
                  {unlocked ? (
                    <span
                      className={cn(
                        "font-display text-2xl leading-none transition-transform group-hover:scale-105",
                        isCurrent || record.cleared
                          ? "text-void-950 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                          : "text-white [text-shadow:0_0_10px_rgba(255,255,255,0.3)]",
                      )}
                    >
                      {level.id}
                    </span>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6 text-white/30">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  )}
                </button>

                {/* 3-STAR RATING DISPLAY (UNDER NODE) */}
                <div className="mt-1 flex flex-col items-center">
                  <div className="flex items-center rounded-full border border-void-800/80 bg-void-950/85 px-2 py-0.5 shadow-md backdrop-blur-sm">
                    <StarRating stars={record.stars} size="sm" />
                  </div>

                  {/* High score badge */}
                  {record.highScore > 0 && (
                    <span className="mt-0.5 font-display text-[9px] tracking-wide text-amber-300/90">
                      {record.highScore.toLocaleString("en-US")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="z-30 flex items-center justify-between border-t border-void-800/80 bg-void-950/90 px-4 py-2.5 text-xs backdrop-blur-md sm:px-6">
        <button
          onClick={scrollToCurrentLevel}
          className="flex items-center gap-1.5 rounded-lg border border-ice-500/50 bg-ice-950/40 px-3 py-1 font-semibold text-ice-300 transition hover:bg-ice-900/50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          Current Station
        </button>

        <span className="text-[11px] font-semibold text-white/40">
          Drag to scroll &bull; Tap to sling
        </span>
      </div>
    </div>
  );
}
