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
  x: number;
  y: number;
}

// 15 Level Nodes arranged horizontally from Left (Level 1) to Right (Level 15)
// in a rolling cosmic wave / S-curve (width = 2540px, height = 520px)
const LEVEL_NODES: NodeCoord[] = [
  { id: 1, x: 140, y: 260 },   // Start Station (Left Center)
  { id: 2, x: 290, y: 370 },   // Dip down
  { id: 3, x: 450, y: 400 },   // Valley
  { id: 4, x: 610, y: 310 },   // Rise
  { id: 5, x: 770, y: 170 },   // Peak
  { id: 6, x: 930, y: 130 },   // High Summit
  { id: 7, x: 1090, y: 240 },  // Center crossover
  { id: 8, x: 1250, y: 380 },  // Valley
  { id: 9, x: 1410, y: 400 },  // Deep curve
  { id: 10, x: 1570, y: 280 }, // Rise
  { id: 11, x: 1730, y: 160 }, // Peak
  { id: 12, x: 1890, y: 130 }, // High Summit
  { id: 13, x: 2050, y: 250 }, // Center crossover
  { id: 14, x: 2210, y: 370 }, // Dip
  { id: 15, x: 2390, y: 260 }, // Apex Final Station (Right Center)
];

const MAP_WIDTH = 2560;
const MAP_HEIGHT = 520;

export function CosmicRoadmap({
  onSelectLevel,
  onBackToMenu,
  currentLevel = 1,
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
  const { fullPath, completedPath, steppingDots } = useMemo(() => {
    let d = `M ${LEVEL_NODES[0].x} ${LEVEL_NODES[0].y}`;
    let compD = `M ${LEVEL_NODES[0].x} ${LEVEL_NODES[0].y}`;

    // Collect stepping star beads along each curve
    const dots: { x: number; y: number; active: boolean }[] = [];

    for (let i = 0; i < LEVEL_NODES.length - 1; i++) {
      const p0 = LEVEL_NODES[i];
      const p1 = LEVEL_NODES[i + 1];
      const midX = (p0.x + p1.x) / 2;

      // Smooth horizontal tangents at both nodes
      const segment = ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
      d += segment;

      const isCompleted = isLevelUnlocked(progress, p1.id);
      if (isCompleted) {
        compD += segment;
      }

      // Add 3 decorative stepping stardust beads along each segment
      for (const t of [0.25, 0.5, 0.75]) {
        // Cubic bezier interpolation formula
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const bx = uuu * p0.x + 3 * uu * t * midX + 3 * u * tt * midX + ttt * p1.x;
        const by = uuu * p0.y + 3 * uu * t * p0.y + 3 * u * tt * p1.y + ttt * p1.y;

        dots.push({
          x: Math.round(bx),
          y: Math.round(by),
          active: isCompleted,
        });
      }
    }

    return { fullPath: d, completedPath: compD, steppingDots: dots };
  }, [progress]);

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

  // Mouse Drag-to-Scroll Handlers (Horizontal)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.clientX);
    setScrollStartX(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 5) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollStartX - deltaX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStartX(touch.clientX);
    setScrollStartX(containerRef.current?.scrollLeft || 0);
    setHasDragged(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartX;
    if (Math.abs(deltaX) > 6) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollStartX - deltaX;
  };

  return (
    <div className="animate-rise-in m-auto flex h-[min(94vh,44rem)] w-[min(96vw,62rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/80 bg-void-950/95 shadow-[0_0_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {/* Top Floating Glass Header */}
      <div className="z-30 flex items-center justify-between border-b border-void-800/80 bg-void-950/85 px-4 py-3 backdrop-blur-md sm:px-6">
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
            COSMIC CAMPAIGN ROADMAP
          </h2>
          <p className="text-[10px] font-bold tracking-[0.25em] text-ice-400/90">
            WEST TO EAST &bull; 15 EXPEDITIONS
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

      {/* Horizontal Draggable Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={cn(
          "relative flex-1 select-none overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-thin scrollbar-thumb-void-700/60",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* Full Width Map Space Canvas */}
        <div
          className="relative"
          style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}
        >
          {/* Cosmic Nebula Cloud Backgrounds */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[20%] left-[8%] h-64 w-80 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute top-[40%] left-[40%] h-72 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute top-[15%] left-[75%] h-64 w-80 rounded-full bg-violet-600/15 blur-3xl" />
          </div>

          {/* SVG Radiant Cosmic Energy Road */}
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
              opacity="0.8"
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
                    opacity="0.3"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Floating Space Crystals & Asteroids along the wave */}
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
                      "h-7 w-7",
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

          {/* 15 Level Station Nodes */}
          {LEVEL_NODES.map((pos) => {
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
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                }}
              >
                {/* START FLAG (Level 1) */}
                {isStart && (
                  <div className="animate-bounce-subtle pointer-events-none absolute -top-11 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/80 bg-emerald-500/95 px-2.5 py-0.5 font-display text-[9px] font-bold tracking-widest text-void-950 shadow-[0_0_14px_rgba(52,211,153,0.8)]">
                      🚩 START
                    </span>
                    <div className="h-2.5 w-0.5 bg-emerald-400" />
                  </div>
                )}

                {/* APEX FINISH CROWN (Level 15) */}
                {isApex && (
                  <div className="animate-float-slow pointer-events-none absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 font-display text-[10px] font-bold tracking-widest text-void-950 shadow-[0_0_22px_rgba(255,200,50,0.9)]">
                      🏆 APEX
                    </span>
                    <div className="h-2.5 w-0.5 bg-amber-400" />
                  </div>
                )}

                {/* CURRENT ACTIVE BEACON */}
                {isCurrent && unlocked && !isStart && !isApex && (
                  <div className="animate-pulse-soft pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2">
                    <span className="whitespace-nowrap rounded-full border border-ember-400/90 bg-ember-500 px-2.5 py-0.5 font-display text-[8px] font-bold tracking-widest text-void-950 shadow-[0_0_16px_rgba(255,122,26,0.9)]">
                      PLAY
                    </span>
                  </div>
                )}

                {/* 3D CHUNKY LEVEL NODE BUTTON */}
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

                  {/* Level Number or Lock Icon */}
                  {unlocked ? (
                    <span
                      className={cn(
                        "font-display text-2xl leading-none transition-transform group-hover:scale-105",
                        isCurrent || record.cleared
                          ? "text-void-950 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                          : "text-white [text-shadow:0_0_12px_rgba(255,255,255,0.4)]",
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
                <div className="mt-1.5 flex flex-col items-center">
                  <div className="flex items-center rounded-full border border-void-800/80 bg-void-950/90 px-2 py-0.5 shadow-md backdrop-blur-sm">
                    <StarRating stars={record.stars} size="sm" />
                  </div>

                  {/* High score badge */}
                  {record.highScore > 0 && (
                    <span className="mt-0.5 whitespace-nowrap font-display text-[9px] tracking-wide text-amber-300">
                      {record.highScore.toLocaleString("en-US")} pts
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
          className="flex items-center gap-1.5 rounded-lg border border-ice-500/50 bg-ice-950/40 px-3 py-1 font-semibold text-ice-300 transition hover:bg-ice-900/50 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          Current Station
        </button>

        <span className="text-[11px] font-semibold text-white/50">
          ↔ Drag horizontally to explore &bull; Tap to sling
        </span>
      </div>
    </div>
  );
}
