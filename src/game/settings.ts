import { audio, type MusicTrack } from "./audio";
import { loadLanguage, saveLanguage, type Language } from "./i18n";

export interface GameSettings {
  language: Language;
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  musicTrack: MusicTrack;
  screenShake: boolean;
  particleDensity: "full" | "reduced";
  trajectoryGuide: "full" | "minimal";
}

const SETTINGS_KEY = "mv_settings_v1";

export function loadSettings(): GameSettings {
  const lang = loadLanguage();
  const def: GameSettings = {
    language: lang,
    muted: audio.muted,
    musicVolume: audio.musicVolume,
    sfxVolume: audio.sfxVolume,
    musicTrack: audio.musicTrack,
    screenShake: true,
    particleDensity: "full",
    trajectoryGuide: "full",
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return def;
    const data = JSON.parse(raw) as Partial<GameSettings>;
    return {
      language: data.language === "en" ? "en" : "vi",
      muted: typeof data.muted === "boolean" ? data.muted : def.muted,
      musicVolume: typeof data.musicVolume === "number" ? data.musicVolume : def.musicVolume,
      sfxVolume: typeof data.sfxVolume === "number" ? data.sfxVolume : def.sfxVolume,
      musicTrack: data.musicTrack === "synth" ? "synth" : "armageddon",
      screenShake: typeof data.screenShake === "boolean" ? data.screenShake : def.screenShake,
      particleDensity: data.particleDensity === "reduced" ? "reduced" : "full",
      trajectoryGuide: data.trajectoryGuide === "minimal" ? "minimal" : "full",
    };
  } catch {
    return def;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    saveLanguage(settings.language);
  } catch {
    /* ignore */
  }
}

export function applySettings(settings: GameSettings) {
  audio.setMuted(settings.muted);
  audio.setMusicVolume(settings.musicVolume);
  audio.setSfxVolume(settings.sfxVolume);
  audio.setMusicTrack(settings.musicTrack);
  saveSettings(settings);
}

