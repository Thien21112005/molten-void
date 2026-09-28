import { useEffect, useRef, useState } from "react";
import { Engine, type UIState, type HighScore } from "./game/engine";
import { cn } from "./utils/cn";

const initialUI: UIState = {
  screen: "menu",
  score: 0,
  level: 1,
  orbs: 3,
  maxOrbs: 9,
  gems: 0,
  best: 0,
  newBest: false,
  hs: [],
  muted: false,
  firstShot: false,
};

/* ---------- inline SVG icons (no emoji) ---------- */

function IconPause({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="4" width="4.5" height="16" rx="1.5" />
      <rect x="13.5" y="4" width="4.5" height="16" rx="1.5" />
    </svg>
  );
}
function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 4.5c0-1.2 1.3-1.9 2.3-1.3l11 6.9c1 .6 1 2 0 2.6l-11 6.9c-1 .6-2.3-.1-2.3-1.3V4.5z" />
    </svg>
  );
}
function IconRestart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 3v4h-4" />
    </svg>
  );
}
function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
    </svg>
  );
}
function IconSound({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="M16.5 9l5 6m0-6-5 6" />
      ) : (
        <>
          <path d="M16.5 9.5a4 4 0 0 1 0 5" />
          <path d="M19 7.5a7.5 7.5 0 0 1 0 9" />
        </>
      )}
    </svg>
  );
}
function IconGem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2.5 20 9l-8 12.5L4 9l8-6.5z" fill="currentColor" opacity="0.9" />
      <path d="M4 9h16M12 2.5 8.5 9l3.5 12.5L15.5 9 12 2.5z" stroke="#0b0718" strokeWidth="1.1" fill="none" />
    </svg>
  );
}
function IconCore({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" fill="url(#coreGrad)" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#ff7a1a" strokeWidth="1.4" />
      <defs>
        <radialGradient id="coreGrad">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="#ffd23e" />
          <stop offset="100%" stopColor="#ff6a12" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ---------- UI bits ---------- */

function ChunkBtn({
  children,
  onClick,
  primary,
  className,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.currentTarget.blur();
        onClick();
      }}
      className={cn(
        "btn-chunk flex items-center justify-center gap-2.5 px-6 py-3.5 text-base uppercase tracking-wide",
        primary
          ? "bg-gradient-to-b from-ember-400 to-ember-600 text-void-950 shadow-[0_5px_0_#8f2f0c,0_10px_24px_rgba(255,110,30,0.35)] hover:brightness-110"
          : "border-2 border-void-700 bg-void-800 text-ice-300 shadow-[0_5px_0_#0a0716] hover:border-ice-500/60 hover:text-ice-400",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ScoreTable({ hs, highlight }: { hs: HighScore[]; highlight?: { s: number; nb: boolean } }) {
  return (
    <div className="w-full rounded-xl border-2 border-void-700 bg-void-950/70 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold tracking-[0.28em] text-ember-300/90">
        <span>HIGH SCORES</span>
        <span className="text-ice-400/80">TOP 5</span>
      </div>
      {hs.length === 0 ? (
        <p className="py-3 text-center text-sm font-semibold tracking-wider text-white/40">NO RUNS YET — BE THE FIRST</p>
      ) : (
        <ul className="space-y-1">
          {hs.map((h, i) => {
            const isMe = !!highlight && h.s === highlight.s && highlight.nb;
            return (
              <li
                key={`${h.s}-${i}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1 text-sm",
                  isMe ? "bg-ember-500/15 ring-1 ring-ember-400/50" : i === 0 ? "text-ember-300" : "text-white/70",
                )}
              >
                <span className={cn("w-5 font-display text-xs", i === 0 ? "text-ember-400" : "text-white/40")}>{i + 1}</span>
                <span className="font-display text-[13px] tracking-wide">{h.s.toLocaleString("en-US")}</span>
                <span className="ml-auto text-xs font-bold tracking-wider text-ice-400/80">LV {h.l}</span>
                <span className="w-11 text-right text-[11px] font-semibold text-white/35">{h.d}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Controls({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-[13px] font-semibold text-white/65", compact && "text-xs")}>
      <div className="flex items-center gap-2">
        <span className="kbd">DRAG</span>
        <span className="text-white/50">pull back &amp; release to sling</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="kbd">&#8592;</span>
        <span className="kbd">&#8594;</span>
        <span className="text-white/50">aim</span>
        <span className="kbd">SPACE</span>
        <span className="text-white/50">hold to charge, release to fire</span>
      </div>
      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="kbd">P</span>
          <span className="text-white/50">pause</span>
          <span className="kbd">R</span>
          <span className="text-white/50">instant restart</span>
          <span className="kbd">M</span>
          <span className="text-white/50">sound</span>
        </div>
      )}
    </div>
  );
}

function Overlay({ children, dim = true }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex items-center justify-center overflow-y-auto p-4",
        dim && "bg-void-950/60",
      )}
    >
      {children}
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [ui, setUi] = useState<UIState>(initialUI);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, setUi);
    engineRef.current = engine;
    engine.init();
    return () => engine.destroy();
  }, []);

  const eng = () => engineRef.current;
  const inRun = ui.screen === "playing" || ui.screen === "paused" || ui.screen === "gameover";

  return (
    <div className="game-root relative h-dvh w-full overflow-hidden bg-void-950 font-ui text-white">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" />

      {/* ---- HUD (during a run) ---- */}
      {inRun && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 px-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.34em] text-ember-300/80">SCORE</span>
            <span
              key={ui.score}
              className="animate-pop-in inline-block font-display text-2xl leading-none text-white [text-shadow:0_0_18px_rgba(255,160,46,0.45)] sm:text-3xl"
            >
              {ui.score.toLocaleString("en-US")}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-ember-400/40 bg-void-900/80 px-2 py-0.5 text-[11px] font-bold tracking-[0.18em] text-ember-300">
                LV {ui.level}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-ice-500/40 bg-void-900/80 px-2 py-0.5 text-[11px] font-bold tracking-[0.18em] text-ice-300">
                <IconGem className="h-3 w-3 text-ice-400" />
                {ui.gems}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-void-700/80 bg-void-900/80 px-2.5 py-1.5">
              <IconCore className={cn("h-4 w-4", ui.orbs === 0 && "opacity-30 grayscale")} />
              {Array.from({ length: ui.orbs }).map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-ember-400 shadow-[0_0_8px_rgba(255,160,46,0.9)]"
                />
              ))}
              <span className={cn("ml-1 font-display text-sm", ui.orbs === 0 ? "text-rose-alert" : "text-ember-300")}>
                {ui.orbs}
              </span>
            </div>
            {ui.screen === "playing" && (
              <button
                onClick={() => eng()?.pause()}
                aria-label="Pause"
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-lg border border-void-700/80 bg-void-900/80 text-white/80 transition hover:border-ember-400/60 hover:text-ember-300 active:translate-y-0.5"
              >
                <IconPause className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- first-shot hint ---- */}
      {ui.screen === "playing" && ui.level === 1 && !ui.firstShot && ui.orbs > 0 && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex justify-center"
          style={{ bottom: "max(4.5rem, calc(env(safe-area-inset-bottom) + 3rem))" }}
        >
          <div className="animate-pulse-soft rounded-lg border border-ember-400/40 bg-void-900/85 px-4 py-2 text-center">
            <p className="font-display text-[13px] tracking-wide text-ember-300">PULL BACK &amp; RELEASE</p>
            <p className="mt-0.5 text-xs font-semibold text-white/55">
              drag anywhere, or <span className="text-ice-300">&#8592; &#8594; + hold SPACE</span>
            </p>
          </div>
        </div>
      )}

      {/* ---- persistent sound toggle ---- */}
      <button
        onClick={() => eng()?.toggleMute()}
        aria-label={ui.muted ? "Unmute" : "Mute"}
        className={cn(
          "absolute z-50 flex h-10 w-10 items-center justify-center rounded-lg border bg-void-900/85 transition active:translate-y-0.5",
          ui.muted ? "border-rose-alert/50 text-rose-alert" : "border-void-700/80 text-white/80 hover:text-ice-300",
        )}
        style={{ top: "max(0.75rem, env(safe-area-inset-top))", right: inRun ? "4.75rem" : "0.75rem" }}
      >
        <IconSound muted={ui.muted} className="h-5 w-5" />
      </button>

      {/* ---- MENU ---- */}
      {ui.screen === "menu" && (
        <Overlay dim={true}>
          <div className="animate-rise-in m-auto flex w-[min(92vw,29rem)] flex-col items-center justify-center gap-4 sm:gap-5 py-6">
            <div className="flex flex-col items-center text-center">
              <p className="mb-2 text-[11px] font-bold tracking-[0.5em] text-ice-400/90">A PHYSICS SLINGSHOT PUZZLER</p>
              <h1 className="animate-float-slow font-display leading-[0.95]">
                <span className="block text-5xl text-ember-400 [text-shadow:0_0_34px_rgba(255,122,26,0.65),0_4px_0_rgba(90,25,0,0.8)] sm:text-6xl">
                  MOLTEN
                </span>
                <span className="block text-5xl text-ice-400 [text-shadow:0_0_34px_rgba(46,230,201,0.6),0_4px_0_rgba(0,70,60,0.8)] sm:text-6xl">
                  VOID
                </span>
              </h1>
              <p className="mt-3 text-sm font-semibold tracking-wide text-white/70">
                Sling comet cores. Shatter every crystal. Chain combos.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ChunkBtn primary onClick={() => eng()?.play()} className="w-56 text-xl" icon={<IconPlay className="h-5 w-5" />}>
                Play
              </ChunkBtn>

              {ui.best > 0 && (
                <p className="text-xs font-bold tracking-[0.3em] text-ember-300/80">
                  BEST <span className="font-display text-sm text-ember-300">{ui.best.toLocaleString("en-US")}</span>
                </p>
              )}
            </div>

            <div className="w-full">
              <ScoreTable hs={ui.hs} />
            </div>

            <div className="w-full rounded-xl border border-void-700/80 bg-void-950/75 p-3.5 backdrop-blur-sm">
              <Controls />
            </div>
          </div>
        </Overlay>
      )}

      {/* ---- PAUSED ---- */}
      {ui.screen === "paused" && (
        <Overlay>
          <div className="animate-pop-in m-auto flex w-[min(92vw,22rem)] flex-col items-center rounded-2xl border-2 border-void-700 bg-void-900/95 p-6 shadow-[0_10px_0_rgba(0,0,0,0.45)]">
            <h2 className="font-display text-3xl text-ice-400 [text-shadow:0_0_24px_rgba(46,230,201,0.5)]">PAUSED</h2>
            <p className="mt-1 text-xs font-bold tracking-[0.28em] text-white/50">
              SCORE {ui.score.toLocaleString("en-US")} &middot; LV {ui.level}
            </p>
            <div className="mt-5 flex w-full flex-col gap-3">
              <ChunkBtn primary onClick={() => eng()?.resume()} icon={<IconPlay className="h-4 w-4" />}>
                Resume
              </ChunkBtn>
              <div className="grid grid-cols-2 gap-3">
                <ChunkBtn onClick={() => eng()?.restart()} icon={<IconRestart className="h-4 w-4" />}>
                  Restart
                </ChunkBtn>
                <ChunkBtn onClick={() => eng()?.toMenu()} icon={<IconHome className="h-4 w-4" />}>
                  Menu
                </ChunkBtn>
              </div>
            </div>
            <div className="mt-5">
              <Controls compact />
            </div>
          </div>
        </Overlay>
      )}

      {/* ---- GAME OVER ---- */}
      {ui.screen === "gameover" && (
        <Overlay>
          <div className="animate-pop-in m-auto flex w-[min(94vw,26rem)] flex-col items-center rounded-2xl border-2 border-void-700 bg-void-900/95 p-6 shadow-[0_10px_0_rgba(0,0,0,0.45)]">
            <p className="text-[11px] font-bold tracking-[0.4em] text-rose-alert">CORES DEPLETED</p>
            <h2 className="mt-1 font-display text-4xl text-ember-400 [text-shadow:0_0_28px_rgba(255,122,26,0.6)]">GAME OVER</h2>

            <div className="mt-4 flex items-end gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/50">SCORE</p>
                <p className="font-display text-4xl text-white [text-shadow:0_0_20px_rgba(255,160,46,0.5)]">
                  {ui.score.toLocaleString("en-US")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/50">LEVEL</p>
                <p className="font-display text-4xl text-ice-400">{ui.level}</p>
              </div>
              {ui.newBest && (
                <div className="animate-shake-x mb-1 rounded-md border-2 border-ember-300 bg-ember-500/20 px-2.5 py-1 font-display text-xs text-ember-300">
                  NEW BEST!
                </div>
              )}
            </div>

            <div className="mt-4 w-full">
              <ScoreTable hs={ui.hs} highlight={{ s: ui.score, nb: ui.newBest }} />
            </div>

            <div className="mt-5 flex w-full flex-col gap-3">
              <ChunkBtn primary onClick={() => eng()?.restart()} className="w-full text-lg" icon={<IconRestart className="h-5 w-5" />}>
                Sling Again
              </ChunkBtn>
              <ChunkBtn onClick={() => eng()?.toMenu()} className="w-full" icon={<IconHome className="h-4 w-4" />}>
                Main Menu
              </ChunkBtn>
            </div>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-white/40">
              PRESS <span className="text-ember-300">R</span> FOR INSTANT RESTART
            </p>
          </div>
        </Overlay>
      )}
    </div>
  );
}
