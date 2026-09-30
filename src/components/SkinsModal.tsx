import { useState } from "react";
import { SKINS, loadEquippedSkin, saveEquippedSkin, isSkinUnlocked } from "../game/skins/skinsData";
import type { SkinDef, SkinId } from "../game/skins/types";
import { audio } from "../game/audio";
import type { Language, Translations } from "../game/i18n";
import { cn } from "../utils/cn";
import { IconStar } from "./Icons";

interface SkinsModalProps {
  totalStars: number;
  onClose: () => void;
  onSkinSelect: (skinId: SkinId) => void;
  lang?: Language;
  t?: Translations;
}

export function SkinsModal({
  totalStars,
  onClose,
  onSkinSelect,
  lang = "vi",
  t,
}: SkinsModalProps) {
  const [equipped, setEquipped] = useState<SkinId>(() => loadEquippedSkin());

  const handleEquip = (skin: SkinDef) => {
    if (!isSkinUnlocked(skin.id, totalStars)) return;
    audio.ensure();
    audio.spaceChime();
    saveEquippedSkin(skin.id);
    setEquipped(skin.id);
    onSkinSelect(skin.id);
  };

  return (
    <div className="animate-pop-in relative m-auto flex max-h-[92dvh] w-[min(94vw,44rem)] flex-col overflow-hidden rounded-3xl border-2 border-void-700/90 bg-void-950/95 shadow-[0_0_80px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
      {/* Header */}
      <div className="relative border-b border-void-800/90 p-5 sm:p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/40 shadow-[0_0_18px_rgba(255,210,62,0.25)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <circle cx="12" cy="12" r="8" fill="url(#skinGlowModal)" />
                <defs>
                  <radialGradient id="skinGlowModal" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffd23e" />
                    <stop offset="60%" stopColor="#ff7a1a" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
                {t?.skinsTitle ?? t?.skins ?? "Trang Phục Sao Chổi"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <span>{t?.stardustTrails ?? "Vệt Bụi Sao & Hiệu Ứng Hào Quang"}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <IconStar size={12} className="text-amber-300" />
                  {totalStars}/45⭐
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-void-700/80 bg-void-900/80 text-white/70 transition hover:border-ice-400 hover:text-white cursor-pointer active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Skins Wardrobe Grid */}
      <div className="grid flex-1 grid-cols-1 gap-3.5 overflow-y-auto p-4 sm:p-6 sm:grid-cols-2">
        {SKINS.map((skin) => {
          const unlocked = isSkinUnlocked(skin.id, totalStars);
          const isEquipped = equipped === skin.id;
          const name = lang === "vi" ? skin.nameVi : skin.nameEn;
          const desc = lang === "vi" ? skin.descVi : skin.descEn;

          return (
            <div
              key={skin.id}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl border p-4 transition-all select-none",
                isEquipped
                  ? "border-amber-400 bg-gradient-to-b from-amber-950/40 via-void-900/80 to-void-950 shadow-[0_0_25px_rgba(251,191,36,0.3)]"
                  : unlocked
                    ? "border-void-700/80 bg-void-900/60 hover:border-void-500 hover:bg-void-900/90"
                    : "border-void-800/80 bg-void-950/60 hover:border-void-700 hover:bg-void-950/80",
              )}
            >
              {/* Top Row: Preview Orb & Meta */}
              <div className="flex items-start gap-3.5">
                {/* Visual Custom Celestial Orb Preview */}
                <div
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-inner overflow-hidden"
                  style={{ backgroundColor: "rgba(10, 6, 24, 0.9)" }}
                >
                  <CometPreviewOrb skin={skin} unlocked={unlocked} />
                  {isEquipped && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-void-950 font-black shadow">
                      ★
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={cn(
                        "font-display text-base font-bold tracking-wide truncate",
                        unlocked ? "text-white" : "text-white/70",
                      )}
                    >
                      {name}
                    </h3>
                    {skin.requiredStars > 0 && (
                      <span className="flex items-center gap-0.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        <IconStar size={10} className="text-amber-300" />
                        {skin.requiredStars}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs line-clamp-2 leading-relaxed",
                      unlocked ? "text-white/65" : "text-white/45 italic",
                    )}
                  >
                    {unlocked
                      ? desc
                      : (lang === "vi"
                          ? "Bí ẩn chưa giải mã. Đạt mốc sao để kích hoạt hiệu ứng lõi và vệt bụi sao độc quyền."
                          : "Unrevealed enigma. Reach star milestone to unleash unique celestial core & trail fx.")}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2 border-t border-void-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/40">
                  {unlocked
                    ? "✓ Đã sở hữu"
                    : (t?.unlockAtStars?.replace("{stars}", String(skin.requiredStars)) ?? `Cần ${skin.requiredStars}⭐`)}
                </span>

                <button
                  disabled={!unlocked || isEquipped}
                  onClick={() => handleEquip(skin)}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                    isEquipped
                      ? "bg-amber-400 text-void-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-default font-black"
                      : unlocked
                        ? "border border-void-600 bg-void-800 text-white hover:border-amber-400 hover:text-amber-300 hover:bg-void-700"
                        : "border border-void-800 bg-void-900/40 text-white/30 cursor-not-allowed",
                  )}
                >
                  {isEquipped
                    ? (t?.equipped ?? "Đang Dùng")
                    : unlocked
                      ? (t?.equip ?? "Trang Bị")
                      : (lang === "vi" ? "Chưa Mở" : "Locked")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-void-800/90 bg-void-950/80 px-5 py-3.5 text-xs text-white/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/40 text-amber-400">
            <IconStar size={14} className="text-amber-400" />
          </div>
          <span className="font-medium text-white/75">
            {lang === "vi"
              ? "Chinh phục thêm nhiều sao để mở khóa toàn bộ trang phục sao chổi huyền thoại."
              : "Collect more stars to unlock all legendary celestial skins."}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-void-700/80 bg-void-900/90 px-5 py-2 font-display text-xs font-bold text-white transition hover:border-ice-400 hover:bg-void-800 cursor-pointer active:scale-95 shadow-sm"
        >
          {t?.close ?? "Đóng"}
        </button>
      </div>
    </div>
  );
}

function CometPreviewOrb({ skin, unlocked }: { skin: SkinDef; unlocked: boolean }) {
  const shape = skin.coreShape;

  // Render locked state: Mysterious glowing neon contour of that SPECIFIC celestial shape, with stardust and center glowing question mark!
  if (!unlocked) {
    return (
      <div className="relative flex h-12 w-12 items-center justify-center">
        {/* Mysterious Ambient Aura */}
        <div
          className="absolute h-10 w-10 rounded-full animate-pulse opacity-30 blur-md"
          style={{ backgroundColor: skin.glowColor }}
        />

        {/* Custom Shape Silhouette Outline with Neon Glow */}
        <svg
          viewBox="0 0 48 48"
          className="h-12 w-12 drop-shadow-[0_0_8px_var(--glow)]"
          style={{ "--glow": skin.glowColor } as React.CSSProperties}
        >
          {shape === "molten_flame" && (
            <g opacity="0.9">
              {/* Fiery Corona Flare Lobes */}
              <path
                d="M 24 5 C 29 11, 29 16, 24 18 C 19 16, 19 11, 24 5 Z"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="2.5 2"
              />
              <path
                d="M 43 24 C 37 29, 32 29, 30 24 C 32 19, 37 19, 43 24 Z"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="2.5 2"
              />
              <path
                d="M 24 43 C 19 37, 19 32, 24 30 C 29 32, 29 37, 24 43 Z"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="2.5 2"
              />
              <path
                d="M 5 24 C 11 19, 16 19, 18 24 C 16 29, 11 29, 5 24 Z"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="2.5 2"
              />
              {/* Volcanic Magma Core Outline */}
              <circle
                cx="24"
                cy="24"
                r="12"
                fill="rgba(20, 10, 5, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.6"
                strokeDasharray="3 2"
              />
            </g>
          )}

          {shape === "spiral_galaxy" && (
            <g opacity="0.9">
              {/* Tilted Orbital Ion Ellipse Ring */}
              <ellipse
                cx="24"
                cy="24"
                rx="21"
                ry="7.5"
                transform="rotate(-25 24 24)"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              {/* Central Galaxy Vortex Disc */}
              <circle
                cx="24"
                cy="24"
                r="11"
                fill="rgba(5, 20, 18, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.6"
                strokeDasharray="2.5 2"
              />
            </g>
          )}

          {shape === "pulsar_rings" && (
            <g opacity="0.9">
              {/* Dual Intersecting Planetary Rings */}
              <ellipse
                cx="24"
                cy="24"
                rx="21"
                ry="7.5"
                transform="rotate(-30 24 24)"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              <ellipse
                cx="24"
                cy="24"
                rx="21"
                ry="7.5"
                transform="rotate(30 24 24)"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              {/* Diamond Pulsar Core */}
              <polygon
                points="24,13 35,24 24,35 13,24"
                fill="rgba(18, 8, 30, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.6"
                strokeDasharray="2.5 2"
              />
            </g>
          )}

          {shape === "ice_crystal" && (
            <g opacity="0.9">
              {/* 6 Radiating Outer Cryo Shards */}
              <line x1="24" y1="2" x2="24" y2="10" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="43" y1="13" x2="36" y2="17" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="43" y1="35" x2="36" y2="31" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="24" y1="46" x2="24" y2="38" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="5" y1="35" x2="12" y2="31" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="5" y1="13" x2="12" y2="17" stroke={skin.glowColor} strokeWidth="1.6" strokeLinecap="round" />
              {/* Hexagonal Glacial Prism */}
              <polygon
                points="24,11 35,17.5 35,30.5 24,37 13,30.5 13,17.5"
                fill="rgba(8, 20, 32, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.6"
                strokeDasharray="2.5 2"
              />
            </g>
          )}

          {shape === "void_singularity" && (
            <g opacity="0.9">
              {/* Relativistic Accretion Disc */}
              <ellipse
                cx="24"
                cy="24"
                rx="22"
                ry="8.5"
                transform="rotate(22 24 24)"
                fill="none"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              {/* Spacetime Distortion Warping Ring */}
              <ellipse
                cx="24"
                cy="24"
                rx="15"
                ry="15"
                fill="rgba(5, 2, 12, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.6"
                strokeDasharray="2.5 2"
              />
            </g>
          )}

          {shape === "solar_crown" && (
            <g opacity="0.9">
              {/* 8-Pointed Solar Star Crown Rays */}
              <polygon
                points="24,4 27,17 38,10 31,21 44,24 31,27 38,38 27,31 24,44 21,31 10,38 17,27 4,24 17,21 10,10 21,17"
                fill="rgba(25, 18, 5, 0.95)"
                stroke={skin.glowColor}
                strokeWidth="1.5"
                strokeDasharray="2.5 2"
              />
            </g>
          )}

          {/* Central Glowing Holographic Question Mark */}
          <text
            x="24"
            y="28.5"
            textAnchor="middle"
            fill={skin.glowColor}
            fontSize="14"
            fontWeight="900"
            fontFamily="monospace"
            filter={`drop-shadow(0 0 6px ${skin.glowColor})`}
          >
            ?
          </text>
        </svg>

        {/* Orbiting Stardust Sparkle */}
        <div
          className="absolute -top-0.5 right-1.5 h-1.5 w-1.5 rounded-full animate-ping"
          style={{ backgroundColor: skin.glowColor }}
        />
      </div>
    );
  }

  // Render UNLOCKED state: Rich, vibrant, full-detail custom celestial vector artwork!
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      {/* Outer ambient radiant aura */}
      <div
        className="absolute h-10 w-10 rounded-full animate-pulse opacity-45 blur-md"
        style={{ backgroundColor: skin.glowColor }}
      />

      <svg viewBox="0 0 48 48" className="h-12 w-12 drop-shadow-md">
        <defs>
          {/* Gradients tailored to each skin */}
          <radialGradient id={`core-grad-${skin.id}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={skin.palette.core} />
            <stop offset="45%" stopColor={skin.palette.mid} />
            <stop offset="80%" stopColor={skin.palette.outer} />
            <stop offset="100%" stopColor={skin.palette.ambient} />
          </radialGradient>
        </defs>

        {shape === "molten_flame" && (
          <g>
            {/* Blazing Coronal Flame Tongues */}
            <path d="M 24 4 C 29 11, 28 17, 24 18 C 20 17, 19 11, 24 4 Z" fill="#ff4d1a" opacity="0.9" />
            <path d="M 44 24 C 37 29, 31 28, 30 24 C 31 20, 37 19, 44 24 Z" fill="#ff4d1a" opacity="0.9" />
            <path d="M 24 44 C 19 37, 20 31, 24 30 C 28 31, 29 37, 24 44 Z" fill="#ff4d1a" opacity="0.9" />
            <path d="M 4 24 C 11 19, 17 20, 18 24 C 17 28, 11 29, 4 24 Z" fill="#ff4d1a" opacity="0.9" />
            {/* Secondary fire embers */}
            <circle cx="35" cy="13" r="2.5" fill="#ffd23e" className="animate-ping" />
            <circle cx="13" cy="35" r="2.2" fill="#ff7a1a" />
            {/* Main Molten Sphere */}
            <circle cx="24" cy="24" r="13" fill={`url(#core-grad-${skin.id})`} stroke="#ff9f43" strokeWidth="1.2" />
            {/* Magma Fissures */}
            <path d="M 17 19 L 22 23 L 28 18 M 22 23 L 26 29" stroke="#fff3b0" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="20" cy="20" r="1.8" fill="#ffffff" />
          </g>
        )}

        {shape === "spiral_galaxy" && (
          <g>
            {/* Outer Emerald Ion Orbital Ring */}
            <ellipse
              cx="24"
              cy="24"
              rx="21"
              ry="8"
              transform="rotate(-25 24 24)"
              fill="none"
              stroke="#2ee6c9"
              strokeWidth="2.2"
              opacity="0.85"
            />
            <ellipse
              cx="24"
              cy="24"
              rx="21"
              ry="8"
              transform="rotate(-25 24 24)"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeDasharray="5 15"
              opacity="0.9"
            />
            {/* Orbiting Stardust Beads */}
            <circle cx="7" cy="16" r="2" fill="#7dfce7" />
            <circle cx="41" cy="32" r="2.2" fill="#ffd23e" />
            {/* Central Galaxy Vortex Core */}
            <circle cx="24" cy="24" r="12" fill={`url(#core-grad-${skin.id})`} stroke="#2ee6c9" strokeWidth="1.4" />
            {/* Spiral Vortex Arms */}
            <path
              d="M 24 16 C 29 18, 30 24, 26 28 C 22 30, 18 26, 20 22 C 22 19, 26 20, 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="24" r="2.5" fill="#ffffff" />
          </g>
        )}

        {shape === "pulsar_rings" && (
          <g>
            {/* Dual Crossing Planetary Plasma Rings */}
            <ellipse
              cx="24"
              cy="24"
              rx="21"
              ry="7.5"
              transform="rotate(-30 24 24)"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.2"
              opacity="0.85"
            />
            <ellipse
              cx="24"
              cy="24"
              rx="21"
              ry="7.5"
              transform="rotate(30 24 24)"
              fill="none"
              stroke="#e879f9"
              strokeWidth="2.2"
              opacity="0.8"
            />
            {/* Energy Beads on Rings */}
            <circle cx="6" cy="14" r="1.8" fill="#ffffff" />
            <circle cx="42" cy="14" r="1.8" fill="#ffffff" />
            {/* Diamond Hyper-Charged Pulsar Core */}
            <polygon
              points="24,11 36,24 24,37 12,24"
              fill={`url(#core-grad-${skin.id})`}
              stroke="#f0abfc"
              strokeWidth="1.4"
            />
            {/* Electric Lightning Arcs */}
            <path d="M 20 18 L 24 24 L 21 26 L 27 30" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2.5" fill="#ffffff" />
          </g>
        )}

        {shape === "ice_crystal" && (
          <g>
            {/* 6 Radiating Outer Glacial Shards */}
            <polygon points="24,1 26,9 22,9" fill="#7dd3fc" />
            <polygon points="44,12 36,16 38,20" fill="#38bdf8" />
            <polygon points="44,36 38,28 36,32" fill="#38bdf8" />
            <polygon points="24,47 22,39 26,39" fill="#7dd3fc" />
            <polygon points="4,36 12,32 10,28" fill="#38bdf8" />
            <polygon points="4,12 10,20 12,16" fill="#38bdf8" />
            {/* Hexagonal Glacial Prism Body */}
            <polygon
              points="24,10 36,17 36,31 24,38 12,31 12,17"
              fill={`url(#core-grad-${skin.id})`}
              stroke="#bae6fd"
              strokeWidth="1.5"
            />
            {/* Crystal Facet Refraction Lines */}
            <path d="M 24 10 L 24 38 M 12 17 L 36 31 M 12 31 L 36 17" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <circle cx="21" cy="17" r="1.8" fill="#ffffff" />
          </g>
        )}

        {shape === "void_singularity" && (
          <g>
            {/* Relativistic Accretion Disc */}
            <ellipse
              cx="24"
              cy="24"
              rx="22"
              ry="9"
              transform="rotate(22 24 24)"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3.2"
              opacity="0.85"
            />
            <ellipse
              cx="24"
              cy="24"
              rx="22"
              ry="9"
              transform="rotate(22 24 24)"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="4 8"
              opacity="0.9"
            />
            {/* Pure Black Event Horizon Core */}
            <circle cx="24" cy="24" r="12" fill="#04020a" stroke="#a855f7" strokeWidth="1.8" />
            {/* Radiant Photon Ring */}
            <circle cx="24" cy="24" r="9" fill="none" stroke="#e879f9" strokeWidth="1.3" opacity="0.85" />
            <circle cx="24" cy="24" r="4.5" fill="#000000" />
            <circle cx="21" cy="21" r="1.2" fill="#38bdf8" />
          </g>
        )}

        {shape === "solar_crown" && (
          <g>
            {/* Divine 8-Pointed Solar Star Crown Rays */}
            <polygon
              points="24,3 27,16 39,9 32,21 45,24 32,27 39,39 27,32 24,45 21,32 9,39 16,27 3,24 16,21 9,9 21,16"
              fill={`url(#core-grad-${skin.id})`}
              stroke="#fef08a"
              strokeWidth="1.2"
            />
            {/* Sacred Concentric Sun Halo */}
            <circle cx="24" cy="24" r="10" fill="#facc15" stroke="#ffffff" strokeWidth="1.4" />
            {/* Thermonuclear Pure White Core */}
            <circle cx="24" cy="24" r="5.5" fill="#ffffff" />
            <circle cx="22" cy="22" r="1.8" fill="#fef9c3" />
          </g>
        )}
      </svg>
    </div>
  );
}
