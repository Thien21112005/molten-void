import { useState, useEffect } from "react";
import { TRANSLATIONS, type Language } from "../game/i18n";
import {
  type GameSettings,
  loadSettings,
  applySettings,
} from "../game/settings";
import { audio, type TrackPreviewId } from "../game/audio";
import {
  IconFlagVN,
  IconFlagUK,
  IconThemeArmageddon,
  IconThemeCyber,
  IconThemeOdyssey,
  IconAutoPause,
  IconSaveDisk,
  IconAlertTriangle,
} from "./Icons";
import { cn } from "../utils/cn";

export interface SettingsModalProps {
  onClose: () => void;
  onResetProgress?: () => void;
  onLanguageChange?: (lang: Language) => void;
}

export function SettingsModal({
  onClose,
  onResetProgress,
  onLanguageChange,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreview, setActivePreview] = useState<TrackPreviewId | null>(null);

  useEffect(() => {
    const unbind = audio.onMuteChange((muted) => {
      setSettings((prev) => ({ ...prev, muted }));
    });
    return () => {
      unbind();
      audio.stopPreview();
    };
  }, []);

  const t = TRANSLATIONS[settings.language];

  const handleTogglePreview = (trackId: TrackPreviewId) => {
    audio.previewTrack(trackId, (active) => {
      setActivePreview(active);
    });
  };

  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    applySettings(next);

    if (key === "language") {
      onLanguageChange?.(value as Language);
    }
  };

  const handleMuteToggle = () => {
    audio.ensure();
    audio.click();
    const nextMuted = !settings.muted;
    let nextMusicVol = settings.musicVolume;
    let nextSfxVol = settings.sfxVolume;
    if (!nextMuted) {
      if (nextMusicVol <= 0) nextMusicVol = 0.8;
      if (nextSfxVol <= 0) nextSfxVol = 0.8;
    }
    const next: GameSettings = {
      ...settings,
      muted: nextMuted,
      musicVolume: nextMusicVol,
      sfxVolume: nextSfxVol,
    };
    setSettings(next);
    applySettings(next);
  };

  const handleMusicSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (settings.muted && val > 0) {
      const next: GameSettings = { ...settings, muted: false, musicVolume: val };
      setSettings(next);
      applySettings(next);
    } else {
      updateSetting("musicVolume", val);
    }
  };

  const handleSfxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (settings.muted && val > 0) {
      const next: GameSettings = { ...settings, muted: false, sfxVolume: val };
      setSettings(next);
      applySettings(next);
    } else {
      updateSetting("sfxVolume", val);
    }
    audio.click();
  };

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem("mv_level_progress_v1");
      setResetSuccess(true);
      setShowResetConfirm(false);
      onResetProgress?.();
      audio.orbEarned();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch {
      /* ignore */
    }
  };

  const handleSaveAndApply = () => {
    audio.ensure();
    audio.orbEarned();
    applySettings(settings);
    onLanguageChange?.(settings.language);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="animate-pop-in relative m-auto flex max-h-[92vh] w-[min(94vw,34rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/90 bg-void-950/95 shadow-[0_0_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-void-800/80 bg-void-900/80 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ember-500/40 bg-ember-500/10 text-ember-400 shadow-[0_0_12px_rgba(255,122,26,0.3)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4.5 w-4.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2 className="font-display text-lg tracking-wider text-white">
            {t.settingsTitle}
          </h2>
        </div>

        <button
          onClick={() => {
            audio.click();
            onClose();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-800 text-white/70 transition hover:bg-void-700 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6 no-scrollbar">
        {/* Language Selection */}
        <div className="rounded-2xl border border-void-800 bg-void-900/60 p-4">
          <label className="mb-2.5 block text-xs font-bold tracking-wider text-ice-400 uppercase">
            {t.languageLabel}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSetting("language", "vi")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold tracking-wide transition active:scale-95 cursor-pointer",
                settings.language === "vi"
                  ? "border-ember-400 bg-ember-500/20 text-ember-300 shadow-[0_0_16px_rgba(255,122,26,0.3)] ring-1 ring-ember-400/40"
                  : "border-void-700 bg-void-800/80 text-white/60 hover:bg-void-800 hover:text-white",
              )}
            >
              <IconFlagVN size={14} />
              <span>Tiếng Việt</span>
            </button>
            <button
              onClick={() => updateSetting("language", "en")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold tracking-wide transition active:scale-95 cursor-pointer",
                settings.language === "en"
                  ? "border-ember-400 bg-ember-500/20 text-ember-300 shadow-[0_0_16px_rgba(255,122,26,0.3)] ring-1 ring-ember-400/40"
                  : "border-void-700 bg-void-800/80 text-white/60 hover:bg-void-800 hover:text-white",
              )}
            >
              <IconFlagUK size={14} />
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Audio & Music */}
        <div className="rounded-2xl border border-void-800 bg-void-900/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-ice-400 uppercase">
              {t.audioCategory}
            </span>
            <button
              onClick={handleMuteToggle}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition cursor-pointer active:scale-95",
                settings.muted
                  ? "border-rose-alert/50 bg-rose-950/40 text-rose-alert shadow-[0_0_12px_rgba(255,77,109,0.3)]"
                  : "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
              )}
            >
              {settings.muted ? t.off : t.on}
            </button>
          </div>

          <div className="space-y-4">
            {/* Music Volume (BGM) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-purple-400">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  {t.musicVolume}
                </span>
                <span className={cn("font-display transition-colors", settings.muted ? "font-bold text-rose-alert" : "text-amber-300")}>
                  {settings.muted ? `0% (${t.off})` : `${Math.round(settings.musicVolume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.muted ? 0 : settings.musicVolume}
                onChange={handleMusicSlider}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-lg bg-void-950 accent-ember-400 transition-opacity",
                  settings.muted && "opacity-50 accent-rose-alert",
                )}
              />

              {/* BGM Soundtracks: 3 Dedicated Themes with Independent Previews */}
              <div className="mt-3.5 space-y-3">
                {/* 1. Main Menu BGM: Armageddon */}
                <div className="rounded-xl border border-void-700/80 bg-void-950/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
                      <IconThemeArmageddon size={16} />
                      <span>{t.menuBgmLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePreview("armageddon")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition active:scale-95 cursor-pointer",
                        activePreview === "armageddon"
                          ? "border-amber-400 bg-amber-950/80 text-amber-300 shadow-[0_0_12px_rgba(255,180,40,0.4)]"
                          : "border-void-700 bg-void-800 text-white/80 hover:border-void-600 hover:text-white",
                      )}
                    >
                      <span>{activePreview === "armageddon" ? t.previewStop : t.previewPlay}</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {t.musicTrackArmageddon}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {t.menuTrackArmageddonDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. In-Game Battle Music: Cyber Pulse */}
                <div className="rounded-xl border border-void-700/80 bg-void-950/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
                      <IconThemeCyber size={16} />
                      <span>{t.battleBgmLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePreview("cyber")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition active:scale-95 cursor-pointer",
                        activePreview === "cyber"
                          ? "border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(46,230,201,0.4)]"
                          : "border-void-700 bg-void-800 text-white/80 hover:border-void-600 hover:text-white",
                      )}
                    >
                      <span>{activePreview === "cyber" ? t.previewStop : t.previewPlay}</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {t.battleTrackName}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {t.battleTrackDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Cosmic Roadmap Music: Cosmic Odyssey */}
                <div className="rounded-xl border border-void-700/80 bg-void-950/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-purple-300 uppercase flex items-center gap-1.5">
                      <IconThemeOdyssey size={16} />
                      <span>{t.roadmapBgmLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePreview("odyssey")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition active:scale-95 cursor-pointer",
                        activePreview === "odyssey"
                          ? "border-purple-400 bg-purple-950/80 text-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.4)]"
                          : "border-void-700 bg-void-800 text-white/80 hover:border-void-600 hover:text-white",
                      )}
                    >
                      <span>{activePreview === "odyssey" ? t.previewStop : t.previewPlay}</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {t.roadmapTrackName}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {t.roadmapTrackDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Auto Mute Notice */}
                <div className="flex items-center gap-2 rounded-xl border border-void-800 bg-void-950/50 px-2.5 py-1.5 text-[11px] font-medium text-white/50">
                  <IconAutoPause size={15} />
                  <span className="leading-tight">{t.pauseAutoMuteDesc}</span>
                </div>
              </div>
            </div>

            {/* SFX Volume */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-cyan-400">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  {t.sfxVolume}
                </span>
                <span className={cn("font-display transition-colors", settings.muted ? "font-bold text-rose-alert" : "text-cyan-300")}>
                  {settings.muted ? `0% (${t.off})` : `${Math.round(settings.sfxVolume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.muted ? 0 : settings.sfxVolume}
                onChange={handleSfxSlider}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-lg bg-void-950 accent-cyan-400 transition-opacity",
                  settings.muted && "opacity-50 accent-rose-alert",
                )}
              />
            </div>
          </div>
        </div>

        {/* Graphics & Performance */}
        <div className="rounded-2xl border border-void-800 bg-void-900/60 p-4">
          <span className="mb-4 block text-xs font-bold tracking-wider text-ice-400 uppercase">
            {t.gameplayCategory}
          </span>

          <div className="space-y-4">
            {/* Screen Shake Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/90">{t.screenShake}</p>
                <p className="text-[11px] text-white/50">{t.screenShakeDesc}</p>
              </div>
              <button
                onClick={() => {
                  audio.click();
                  updateSetting("screenShake", !settings.screenShake);
                }}
                className={cn(
                  "rounded-lg border px-3 py-1 font-display text-xs font-bold transition",
                  settings.screenShake
                    ? "border-ice-400/80 bg-ice-500/20 text-ice-300"
                    : "border-void-700 bg-void-800 text-white/40",
                )}
              >
                {settings.screenShake ? t.on : t.off}
              </button>
            </div>

            {/* Particle Density */}
            <div className="flex items-center justify-between border-t border-void-800/80 pt-3">
              <p className="text-xs font-bold text-white/90">{t.particleDensity}</p>
              <div className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-950 p-1">
                <button
                  onClick={() => {
                    audio.click();
                    updateSetting("particleDensity", "full");
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    settings.particleDensity === "full"
                      ? "bg-ember-500 text-void-950 font-bold"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  {t.particleFull}
                </button>
                <button
                  onClick={() => {
                    audio.click();
                    updateSetting("particleDensity", "reduced");
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    settings.particleDensity === "reduced"
                      ? "bg-ember-500 text-void-950 font-bold"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  {t.particleReduced}
                </button>
              </div>
            </div>

            {/* Trajectory Guide */}
            <div className="flex items-center justify-between border-t border-void-800/80 pt-3">
              <p className="text-xs font-bold text-white/90">{t.trajectoryGuide}</p>
              <div className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-950 p-1">
                <button
                  onClick={() => {
                    audio.click();
                    updateSetting("trajectoryGuide", "full");
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    settings.trajectoryGuide === "full"
                      ? "bg-ice-400 text-void-950 font-bold"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  {t.trajectoryFull}
                </button>
                <button
                  onClick={() => {
                    audio.click();
                    updateSetting("trajectoryGuide", "minimal");
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    settings.trajectoryGuide === "minimal"
                      ? "bg-ice-400 text-void-950 font-bold"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  {t.trajectoryMinimal}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Progress */}
        <div className="rounded-2xl border border-void-800 bg-void-900/60 p-4">
          <span className="mb-3 block text-xs font-bold tracking-wider text-ice-400 uppercase">
            {t.dataCategory}
          </span>

          {resetSuccess ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center text-xs font-bold text-emerald-300">
              ✓ {t.resetSuccessMsg}
            </div>
          ) : showResetConfirm ? (
            <div className="rounded-xl border border-rose-alert/50 bg-rose-950/50 p-3.5 space-y-3">
              <p className="font-display text-xs tracking-wider text-rose-alert flex items-center gap-1.5">
                <IconAlertTriangle size={15} />
                <span>{t.resetConfirmTitle}</span>
              </p>
              <p className="text-[11px] leading-relaxed text-white/70">
                {t.resetConfirmMsg}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 rounded-lg border border-rose-alert bg-rose-alert/20 py-2 text-xs font-bold text-rose-alert hover:bg-rose-alert/30"
                >
                  {t.confirm}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-lg border border-void-700 bg-void-800 py-2 text-xs font-bold text-white/80 hover:bg-void-700"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/90">{t.resetProgress}</p>
                <p className="text-[11px] text-white/50">{t.resetProgressDesc}</p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="rounded-lg border border-rose-alert/40 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-alert transition hover:bg-rose-950/60 hover:border-rose-alert"
              >
                {t.resetProgress}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions: Save & Apply */}
      <div className="flex items-center justify-between border-t border-void-800/80 bg-void-900/90 px-5 sm:px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-pop-in">
              <span>✓</span> {t.settingsSaved}
            </span>
          ) : (
            <span className="text-[11px] text-white/40 hidden sm:inline">
              Molten Void &bull; v1.3.0
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              audio.click();
              onClose();
            }}
            className="rounded-xl border border-void-700 bg-void-800/80 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-void-700 hover:text-white active:scale-95 cursor-pointer"
          >
            {t.close}
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-ember-400 to-amber-400 px-4 sm:px-5 py-2 text-xs font-black uppercase tracking-wider text-void-950 shadow-[0_3px_0_#8f2f0c,0_0_16px_rgba(255,122,26,0.35)] transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <IconSaveDisk size={14} />
            <span>{t.saveAndApply}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
