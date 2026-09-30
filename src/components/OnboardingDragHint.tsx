import type { Translations } from "../game/i18n";

interface OnboardingDragHintProps {
  launcherPos: { x: number; y: number };
  landscape: boolean;
  t?: Translations;
}

export function OnboardingDragHint({
  launcherPos,
  landscape,
  t,
}: OnboardingDragHintProps) {
  // Direction vectors for pull-back demonstration:
  // In landscape: launcher is at bottom-left (~12% W, ~84% H), so drag backward is down-left or left
  // In portrait: launcher is at bottom-center (~50% W, ~86% H), so drag backward is down
  const pullDx = landscape ? -60 : 0;
  const pullDy = landscape ? 45 : 65;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none overflow-hidden">
      <style>{`
        @keyframes hintHandGesture {
          0% {
            transform: translate(0px, 0px) scale(0.9);
            opacity: 0;
          }
          15% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.95;
          }
          25% {
            transform: translate(0px, 0px) scale(0.92);
            opacity: 1;
          }
          65% {
            transform: translate(${pullDx}px, ${pullDy}px) scale(1.05);
            opacity: 1;
          }
          80% {
            transform: translate(${pullDx}px, ${pullDy}px) scale(0.85);
            opacity: 0.3;
          }
          100% {
            transform: translate(0px, 0px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes hintTrajectoryStretch {
          0%, 15% {
            stroke-dashoffset: 80;
            opacity: 0;
          }
          25% {
            stroke-dashoffset: 60;
            opacity: 0.4;
          }
          65% {
            stroke-dashoffset: 0;
            opacity: 0.9;
          }
          80%, 100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes hintForwardArrow {
          0%, 30% {
            opacity: 0;
            transform: translate(0, 0);
          }
          65% {
            opacity: 1;
            transform: translate(${-pullDx * 0.7}px, ${-pullDy * 0.7}px);
          }
          85%, 100% {
            opacity: 0;
            transform: translate(${-pullDx * 1.1}px, ${-pullDy * 1.1}px);
          }
        }

        @keyframes hintTouchPulse {
          0%, 15% {
            transform: scale(0.6);
            opacity: 0;
          }
          20% {
            transform: scale(1);
            opacity: 0.9;
          }
          35% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Origin Point: Anchored right at the Slingshot Launcher */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${launcherPos.x}px`, top: `${launcherPos.y}px` }}
      >
        {/* Touch Ripple at origin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full border-2 border-amber-400 bg-amber-400/20"
          style={{ animation: "hintTouchPulse 2.4s ease-out infinite" }}
        />

        {/* Dynamic Slingshot Pull Vector line */}
        <svg
          className="overflow-visible pointer-events-none"
          width="200"
          height="200"
          style={{
            position: "absolute",
            left: "-100px",
            top: "-100px",
          }}
        >
          <defs>
            <linearGradient id="hintPullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd23e" />
              <stop offset="100%" stopColor="#ff5722" />
            </linearGradient>
            <linearGradient id="hintAimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2ee6c9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Dotted line showing reverse pull */}
          <line
            x1="100"
            y1="100"
            x2={100 + pullDx}
            y2={100 + pullDy}
            stroke="url(#hintPullGrad)"
            strokeWidth="3"
            strokeDasharray="6 4"
            style={{ animation: "hintTrajectoryStretch 2.4s ease-in-out infinite" }}
          />

          {/* Forward Projection Arrow (opposite direction to pull) */}
          <g style={{ animation: "hintForwardArrow 2.4s ease-out infinite" }}>
            <line
              x1="100"
              y1="100"
              x2={100 - pullDx * 0.8}
              y2={100 - pullDy * 0.8}
              stroke="url(#hintAimGrad)"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            <circle
              cx={100 - pullDx * 0.8}
              cy={100 - pullDy * 0.8}
              r="4"
              fill="#2ee6c9"
              className="drop-shadow-[0_0_8px_rgba(46,230,201,0.9)]"
            />
          </g>
        </svg>

        {/* Animated Hand / Finger Cursor */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
          style={{
            animation: "hintHandGesture 2.4s cubic-bezier(0.25, 1, 0.5, 1) infinite",
          }}
        >
          {/* Hand / Finger Pointing SVG */}
          <svg
            viewBox="0 0 48 48"
            className="w-12 h-12 -rotate-12 filter drop-shadow-[0_0_10px_rgba(255,210,62,0.7)]"
            fill="none"
          >
            {/* Hand Silhouette */}
            <path
              d="M18 10 C18 7.8 19.8 6 22 6 C24.2 6 26 7.8 26 10 L26 22 L27.5 22 C29.4 22 31 23.6 31 25.5 L31 27 C31 27.6 31.4 28 32 28 C33.7 28 35 29.3 35 31 L35 34 C35 39.5 30.5 44 25 44 L21 44 C15.5 44 11 39.5 11 34 L11 25 C11 23.9 11.9 23 13 23 C14.1 23 15 23.9 15 25 L15 10 C15 7.8 16.8 6 19 6"
              fill="#1e293b"
              stroke="#ffd23e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Finger Nail & Joint detail */}
            <rect x="20" y="8" width="4" height="6" rx="2" fill="#ffd23e" opacity="0.8" />
            <circle cx="22" cy="7" r="8" fill="#ffd23e" opacity="0.25" className="animate-ping" />
          </svg>
        </div>

        {/* Floating Instruction Badge */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
          style={{
            top: landscape ? "-4.2rem" : "-4.8rem",
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-400/80 bg-void-950/95 px-3.5 py-2 shadow-[0_0_25px_rgba(255,180,40,0.5)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            <span className="font-display text-xs sm:text-sm font-black tracking-wider text-amber-300">
              {t?.dragToAimHint ?? "KÉO NGƯỢC ĐỂ CĂN LỰC • THẢ TAY ĐỂ BẮN"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
