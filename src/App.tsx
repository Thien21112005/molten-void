import { useEffect, useMemo, useRef, useState } from "react";
import { Engine, type UIState, type HighScore } from "./game/engine";
import { cn } from "./utils/cn";
import { VictoryModal } from "./components/VictoryModal";
import { RoadmapModal } from "./components/RoadmapModal";
import { SettingsModal } from "./components/SettingsModal";
import { CampaignIntel } from "./components/CampaignIntel";
import { loadProgress, getTotalStars, MAX_POSSIBLE_STARS } from "./game/levels/progress";
import { TRANSLATIONS, loadLanguage, type Language, type Translations } from "./game/i18n";
import { audio } from "./game/audio";
import { IconTacticalTarget, IconStar } from "./components/Icons";
import { VietnameseSpaceship } from "./components/VietnameseSpaceship";
import { CosmicDecorations } from "./components/CosmicDecorations";

const initialUI: UIState = {
  screen: "menu",
  score: 0,
  level: 1,
  orbs: 4,
  maxOrbs: 9,
  gems: 0,
  best: 0,
  newBest: false,
  hs: [],
  muted: false,
  firstShot: false,
};

/* ---------- inline SVG icons (no emoji) ---------- */

function IconMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      {/* Outer cosmic starmap folding panels */}
      <polygon points="2 6 8 3 16 6 22 3 22 18 16 21 8 18 2 21" />
      <line x1="8" y1="3" x2="8" y2="18" strokeDasharray="1.5 2" opacity="0.6" />
      <line x1="16" y1="6" x2="16" y2="21" strokeDasharray="1.5 2" opacity="0.6" />
      {/* Route waypoints & constellation trail */}
      <circle cx="5" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1.8" fill="#ffd23e" stroke="#ff7a1a" strokeWidth="0.8" />
      <circle cx="19" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M5 13.5 Q8.5 7 12 10 T19 11.5" stroke="#7dfce7" strokeWidth="1.8" opacity="0.9" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

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
function IconSound({ muted, className }: { muted: boolean; className?: string }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function IconCore({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <radialGradient id="icg" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffd23e" />
          <stop offset="55%" stopColor="#ff7a1a" />
          <stop offset="100%" stopColor="#8f2000" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="url(#icg)" />
      <circle cx="9" cy="9" r="3" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/* ---------- UI primitives ---------- */

function ChunkBtn({
  children,
  onClick,
  primary = false,
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
        audio.ensure();
        audio.click();
        onClick();
      }}
      className={cn(
        "btn-chunk flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer transition active:scale-95",
        primary
          ? "bg-gradient-to-b from-ember-400 to-ember-600 text-void-950 shadow-[0_4px_0_#8f2f0c,0_8px_20px_rgba(255,110,30,0.35)] hover:brightness-110"
          : "border-2 border-void-700/90 bg-void-800/90 text-ice-300 shadow-[0_4px_0_#0a0716] hover:border-ice-400/70 hover:text-white hover:bg-void-800",
        className,
      )}
    >
      {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}
      <span className="whitespace-nowrap flex items-center justify-center">{children}</span>
    </button>
  );
}


function Controls({ compact, t }: { compact?: boolean; t: Translations }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-[13px] font-semibold text-white/65", compact && "text-xs")}>
      <div className="flex items-center gap-2">
        <span className="kbd">DRAG</span>
        <span className="text-white/50">{t.dragHint}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="kbd">&#8593;</span>
        <span className="kbd">&#8595;</span>
        <span className="text-white/50">{t.aimAngleHint}</span>
        <span className="kbd">SPACE</span>
        <span className="text-white/50">{t.chargeHint}</span>
      </div>
      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="kbd">P</span>
          <span className="text-white/50">{t.paused.toLowerCase()}</span>
          <span className="kbd">R</span>
          <span className="text-white/50">{t.quickRestartHint}</span>
          <span className="kbd">M</span>
          <span className="text-white/50">{t.masterSound.toLowerCase()}</span>
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

  // Settings & Localization state
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<Language>(() => loadLanguage());
  const [refreshKey, setRefreshKey] = useState(0);
  const t = TRANSLATIONS[lang];

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

  const campaignProgress = useMemo(() => loadProgress(), [refreshKey, ui.screen]);
  const totalCampaignStars = getTotalStars(campaignProgress);
  const clearedSectorsCount = Object.values(campaignProgress.levels).filter((l) => l.cleared).length;

  return (
    <div className="game-root relative h-dvh w-full overflow-hidden bg-void-950 font-ui text-white">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" />

      {/* ---- HUD (during a run) ---- */}
      {inRun && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-3 sm:px-5"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          {/* Left Block: Score Terminal Panel */}
          <div className="flex flex-col rounded-2xl border border-void-700/80 bg-void-950/85 px-3.5 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] text-ember-400 uppercase leading-none mb-1">
              {t.score}
            </span>
            <span
              key={ui.score}
              className="animate-pop-in inline-block font-display text-2xl sm:text-3xl font-black leading-tight text-white [text-shadow:0_0_20px_rgba(255,160,46,0.55)]"
            >
              {ui.score.toLocaleString("en-US")}
            </span>
          </div>

          {/* Center Block: Illuminated Sector / Level Badge */}
          <div className="flex items-center gap-2 rounded-2xl border-2 border-ice-400/50 bg-void-950/90 px-4 py-2 shadow-[0_0_24px_rgba(46,230,201,0.22)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ice-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ice-300" />
            </span>
            <span className="text-xs font-black tracking-[0.22em] text-ice-300 uppercase">
              {t.level}
            </span>
            <span className="font-display text-2xl sm:text-3xl font-black leading-none text-white [text-shadow:0_0_16px_rgba(46,230,201,0.5)]">
              {ui.level}
            </span>
            <span className="text-[10px] font-bold text-ice-400/60">/ 15</span>
          </div>

          {/* Right Block: Cores / Orbs Capsule + Action Buttons */}
          <div className="pointer-events-auto flex flex-col items-end gap-2.5">
            {/* Orbs / Cores Tactical Capsule */}
            <div className="flex items-center gap-2 rounded-2xl border-2 border-ember-500/50 bg-void-950/90 px-3.5 py-2 shadow-[0_0_22px_rgba(255,122,26,0.25)] backdrop-blur-md">
              <IconCore className={cn("h-6 w-6 shrink-0 transition", ui.orbs === 0 && "opacity-30 grayscale")} />
              <div className="flex items-center gap-1.5">
                {Array.from({ length: ui.orbs }).map((_, i) => (
                  <span
                    key={i}
                    className="h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-ember-500 to-amber-300 shadow-[0_0_10px_rgba(255,180,40,0.85)] ring-1 ring-amber-300/40 animate-pulse-soft"
                  />
                ))}
              </div>
              <span
                className={cn(
                  "ml-1 font-display text-xl sm:text-2xl font-black leading-none",
                  ui.orbs === 0 ? "text-rose-alert [text-shadow:0_0_14px_rgba(255,77,109,0.7)]" : "text-amber-300 [text-shadow:0_0_16px_rgba(255,210,62,0.6)]",
                )}
              >
                {ui.orbs}
              </span>
            </div>

            {/* Quick Action Controls: Sound Toggle + Settings + Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => eng()?.toggleMute()}
                aria-label={ui.muted ? "Unmute" : "Mute"}
                className={cn(
                  "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border bg-void-950/90 shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer",
                  ui.muted
                    ? "border-rose-alert/60 text-rose-alert shadow-[0_0_12px_rgba(255,77,109,0.3)]"
                    : "border-void-700/80 text-white/80 hover:border-ice-400/60 hover:text-ice-300",
                )}
              >
                <IconSound muted={ui.muted} className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  audio.ensure();
                  audio.click();
                  setShowSettings(true);
                }}
                aria-label={t.settings}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-void-700/80 bg-void-950/90 text-white/80 shadow-md backdrop-blur-md transition hover:border-ice-400/60 hover:text-ice-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <IconGear className="h-5 w-5" />
              </button>

              {ui.screen === "playing" && (
                <button
                  onClick={() => eng()?.pause()}
                  aria-label="Pause"
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-void-700/80 bg-void-950/90 text-white/80 shadow-md backdrop-blur-md transition hover:border-ember-400/60 hover:text-ember-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <IconPause className="h-5 w-5" />
                </button>
              )}
            </div>
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
            <p className="font-display text-[13px] tracking-wide text-ember-300">{t.firstShotHint}</p>
            <p className="mt-0.5 text-xs font-semibold text-white/55">
              {t.firstShotSubHint} <span className="text-ice-300">&#8593; &#8595; + hold SPACE</span>
            </p>
          </div>
        </div>
      )}

      {/* ---- persistent sound & settings buttons (outside run) ---- */}
      {!inRun && (
        <div
          className="absolute z-50 flex items-center gap-2"
          style={{ top: "max(0.75rem, env(safe-area-inset-top))", right: "0.75rem" }}
        >
          <button
            onClick={() => eng()?.toggleMute()}
            aria-label={ui.muted ? "Unmute" : "Mute"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border bg-void-900/85 transition hover:text-ice-300 active:translate-y-0.5",
              ui.muted ? "border-rose-alert/50 text-rose-alert" : "border-void-700/80 text-white/80",
            )}
          >
            <IconSound muted={ui.muted} className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              audio.ensure();
              audio.click();
              setShowSettings(true);
            }}
            aria-label={t.settings}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-void-700/80 bg-void-900/85 text-white/80 transition hover:border-ice-400/60 hover:text-ice-300 active:translate-y-0.5"
          >
            <IconGear className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ---- MENU ---- */}
      {ui.screen === "menu" && (
        <Overlay dim={true}>
          {/* Cosmic Solar System Planets & Streaking Comets Environment */}
          <CosmicDecorations />

          {/* Vietnamese Astronaut Exploratory Spaceship Patrolling the Menu */}
          <VietnameseSpaceship lang={lang} />

          <div className="animate-rise-in relative m-auto flex w-[min(95vw,56rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/80 bg-void-950/90 p-5 sm:p-7 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            {/* Cosmic Ambient Background Blurs */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-ember-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

            {/* Responsive Dual Column Dashboard */}
            <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
              {/* Left Column: Command & Slingshot Launchpad */}
              <div className="flex flex-col justify-center gap-4 sm:gap-5">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ice-500/40 bg-ice-950/50 px-3 py-1 text-[10px] font-bold tracking-[0.25em] text-ice-300 shadow-[0_0_12px_rgba(46,230,201,0.2)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-ice-400 animate-pulse" />
                    {t.deepSpaceExpedition}
                  </div>

                  <h1 className="animate-float-slow font-display leading-[0.9] tracking-tight">
                    <span className="block text-5xl sm:text-6xl text-ember-400 [text-shadow:0_0_34px_rgba(255,122,26,0.65),0_4px_0_rgba(90,25,0,0.8)]">
                      MOLTEN
                    </span>
                    <span className="block text-5xl sm:text-6xl text-ice-400 [text-shadow:0_0_34px_rgba(46,230,201,0.6),0_4px_0_rgba(0,70,60,0.8)]">
                      VOID
                    </span>
                  </h1>

                  <p className="mt-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white/70">
                    {t.tagline}
                  </p>
                </div>

                {/* Campaign Progress Stats Bar */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-void-700/80 bg-void-900/80 p-3 shadow-inner">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold tracking-wider text-white/40">{t.campaignStars}</span>
                    <span className="flex items-center justify-center gap-1 font-display text-sm sm:text-base text-amber-300">
                      <IconStar size={12} className="text-amber-300" />
                      <span>{totalCampaignStars}</span>
                      <span className="text-[10px] text-white/40">/ {MAX_POSSIBLE_STARS}</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-x border-void-800 text-center">
                    <span className="text-[10px] font-bold tracking-wider text-white/40">{t.bestRun}</span>
                    <span className="font-display text-sm sm:text-base text-ember-400">
                      {ui.best > 0 ? ui.best.toLocaleString("en-US") : "0"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold tracking-wider text-white/40">{t.sectorsWon}</span>
                    <span className="font-display text-sm sm:text-base text-ice-300">
                      {clearedSectorsCount} <span className="text-[10px] text-white/40">/ 15</span>
                    </span>
                  </div>
                </div>

                {/* Primary Launch Actions */}
                <div className="flex flex-col gap-3.5 sm:gap-4 pt-1">
                  <ChunkBtn
                    primary
                    onClick={() => eng()?.play()}
                    className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold shadow-[0_5px_0_#8f2f0c,0_10px_22px_rgba(255,110,30,0.38)]"
                    icon={<IconPlay className="h-5 w-5" />}
                  >
                    {t.playCampaign}
                  </ChunkBtn>

                  <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                    <ChunkBtn
                      onClick={() => eng()?.openRoadmap()}
                      className="py-2.5 sm:py-3 text-xs sm:text-sm"
                      icon={<IconMap className="h-4.5 w-4.5" />}
                    >
                      {t.cosmicRoadmap}
                    </ChunkBtn>

                    <ChunkBtn
                      onClick={() => setShowSettings(true)}
                      className="py-2.5 sm:py-3 text-xs sm:text-sm"
                      icon={<IconGear className="h-4.5 w-4.5" />}
                    >
                      {t.settings}
                    </ChunkBtn>
                  </div>
                </div>
              </div>

              {/* Right Column: Campaign Intel & Flight Controls */}
              <div className="flex flex-col gap-3">
                {/* Campaign Progress & Sector Intel */}
                <CampaignIntel
                  progress={campaignProgress}
                  t={t}
                  onOpenRoadmap={() => eng()?.openRoadmap()}
                  bestScore={ui.best}
                />

                {/* Flight & Slingshot Controls Guide */}
                <div className="rounded-xl border border-void-700/80 bg-void-950/80 p-3 shadow-md backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-[0.25em] text-ice-400/90">
                    <span>{t.controlsTitle}</span>
                    <span className="text-white/40">{t.tactical}</span>
                  </div>
                  <Controls compact t={t} />
                </div>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* ---- ROADMAP ---- */}
      {ui.screen === "roadmap" && (
        <Overlay>
          <RoadmapModal
            currentLevel={ui.level}
            t={t}
            onSelectLevel={(lvl) => eng()?.startLevel(lvl)}
            onBackToMenu={() => eng()?.toMenu()}
          />
        </Overlay>
      )}

      {/* ---- VICTORY ---- */}
      {ui.screen === "victory" && ui.victoryData && (
        <Overlay>
          <VictoryModal
            data={ui.victoryData}
            t={t}
            hasNextLevel={ui.victoryData.level < 15}
            onNextLevel={() => eng()?.nextLevel()}
            onRetry={() => eng()?.restart()}
            onOpenRoadmap={() => eng()?.openRoadmap()}
          />
        </Overlay>
      )}

      {/* ---- PAUSED ---- */}
      {ui.screen === "paused" && (
        <Overlay>
          <div className="animate-pop-in m-auto flex w-[min(94vw,28rem)] flex-col items-center rounded-3xl border-2 border-void-700/90 bg-void-950/95 p-6 sm:p-8 shadow-[0_0_70px_rgba(0,0,0,0.88)] backdrop-blur-2xl">
            <h2 className="font-display text-3xl sm:text-4xl text-ice-400 [text-shadow:0_0_26px_rgba(46,230,201,0.55)] tracking-wide">
              {t.paused}
            </h2>
            
            {/* Mission Stats Badge */}
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-void-700/80 bg-void-900/90 px-4 py-1.5 text-xs font-bold tracking-wider shadow-inner">
              <span className="text-ember-400 font-display">{t.score} {ui.score.toLocaleString("en-US")}</span>
              <span className="text-white/30">•</span>
              <span className="text-ice-300 font-display">LV {ui.level}</span>
            </div>

            {/* Action Command Launchpad */}
            <div className="mt-6 sm:mt-7 flex w-full flex-col gap-3 sm:gap-3.5">
              {/* Primary Resume Action */}
              <ChunkBtn
                primary
                onClick={() => eng()?.resume()}
                className="w-full py-3.5 sm:py-4 text-base sm:text-lg font-black shadow-[0_5px_0_#8f2f0c,0_10px_22px_rgba(255,110,30,0.38)]"
                icon={<IconPlay className="h-5 w-5" />}
              >
                {t.resume}
              </ChunkBtn>

              {/* 2x2 Tactical Navigation Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pt-0.5">
                <ChunkBtn
                  onClick={() => eng()?.restart()}
                  className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wider"
                  icon={<IconRestart className="h-4.5 w-4.5" />}
                >
                  {t.restart}
                </ChunkBtn>

                <ChunkBtn
                  onClick={() => eng()?.openRoadmap()}
                  className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wider"
                  icon={<IconMap className="h-4.5 w-4.5" />}
                >
                  {t.roadmap}
                </ChunkBtn>

                <ChunkBtn
                  onClick={() => setShowSettings(true)}
                  className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wider"
                  icon={<IconGear className="h-4.5 w-4.5" />}
                >
                  {t.settings}
                </ChunkBtn>

                <ChunkBtn
                  onClick={() => eng()?.toMenu()}
                  className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wider"
                  icon={<IconHome className="h-4.5 w-4.5" />}
                >
                  {t.menu}
                </ChunkBtn>
              </div>
            </div>

            {/* Flight & Slingshot Tactical Controls Card */}
            <div className="mt-6 w-full rounded-2xl border border-void-700/80 bg-void-900/60 p-3.5 sm:p-4 shadow-inner backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold tracking-[0.22em] text-ice-400/90 uppercase">
                <span>{t.controlsTitle}</span>
                <span className="text-white/40">{t.tactical}</span>
              </div>
              <Controls compact t={t} />
            </div>
          </div>
        </Overlay>
      )}

      {/* ---- GAME OVER ---- */}
      {ui.screen === "gameover" && (
        <Overlay>
          <div className="animate-pop-in m-auto flex w-[min(94vw,28rem)] flex-col items-center rounded-3xl border-2 border-void-700 bg-void-950/95 p-6 sm:p-8 shadow-[0_0_70px_rgba(0,0,0,0.88)] backdrop-blur-2xl">
            <p className="text-[11px] font-bold tracking-[0.4em] text-rose-alert">{t.coresDepleted}</p>
            <h2 className="mt-1 font-display text-4xl text-ember-400 [text-shadow:0_0_28px_rgba(255,122,26,0.6)]">{t.gameOver}</h2>

            <div className="mt-4 flex items-end gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/50">{t.score}</p>
                <p className="font-display text-4xl text-white [text-shadow:0_0_20px_rgba(255,160,46,0.5)]">
                  {ui.score.toLocaleString("en-US")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/50">{t.level}</p>
                <p className="font-display text-4xl text-ice-400">{ui.level}</p>
              </div>
              {ui.newBest && (
                <div className="animate-shake-x mb-1 rounded-md border-2 border-ember-300 bg-ember-500/20 px-2.5 py-1 font-display text-xs text-ember-300">
                  {t.newBest}
                </div>
              )}
            </div>

            {/* Tactical Level Debrief Card */}
            <div className="mt-5 w-full rounded-2xl border border-void-700/80 bg-void-900/60 p-3.5 text-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                <IconTacticalTarget size={15} className="text-amber-300" />
                <span className="uppercase tracking-wider">{t.levelTarget} {ui.level}</span>
              </div>
              <p className="mt-1 text-xs text-white/70">
                {t.levelTargetDesc}
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-white/50 border-t border-void-800/80 pt-2">
                <span>{t.campaignStars}: <strong className="text-amber-300">★ {totalCampaignStars}/{MAX_POSSIBLE_STARS}</strong></span>
                <span>&bull;</span>
                <span>{t.sectorsWon}: <strong className="text-ice-300">{clearedSectorsCount}/15</strong></span>
              </div>
            </div>

            {/* Action Command Launchpad */}
            <div className="mt-6 flex w-full flex-col gap-3 sm:gap-3.5">
              <ChunkBtn primary onClick={() => eng()?.restart()} className="w-full py-3.5 sm:py-4 text-base sm:text-lg font-bold" icon={<IconRestart className="h-5 w-5" />}>
                {t.restart}
              </ChunkBtn>
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                <ChunkBtn onClick={() => eng()?.openRoadmap()} className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold" icon={<IconMap className="h-4.5 w-4.5" />}>
                  {t.roadmap}
                </ChunkBtn>
                <ChunkBtn onClick={() => setShowSettings(true)} className="py-3 sm:py-3.5 text-xs sm:text-sm font-bold" icon={<IconGear className="h-4.5 w-4.5" />}>
                  {t.settings}
                </ChunkBtn>
              </div>
              <ChunkBtn onClick={() => eng()?.toMenu()} className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold" icon={<IconHome className="h-4.5 w-4.5" />}>
                {t.menu}
              </ChunkBtn>
            </div>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.2em] text-white/40">
              {t.instantRestartHint}
            </p>
          </div>
        </Overlay>
      )}

      {/* ---- SETTINGS MODAL ---- */}
      {showSettings && (
        <Overlay dim={true}>
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onLanguageChange={(newLang) => setLang(newLang)}
            onResetProgress={() => {
              setRefreshKey((k) => k + 1);
              eng()?.toMenu();
            }}
          />
        </Overlay>
      )}
    </div>
  );
}
