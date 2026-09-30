import { useState } from "react";
import { SKINS, loadEquippedSkin, saveEquippedSkin, isSkinUnlocked } from "../game/skins/skinsData";
import type { SkinDef, SkinId } from "../game/skins/types";
import { audio } from "../game/audio";
import type { Language, Translations } from "../game/i18n";
import { cn } from "../utils/cn";
import { IconStar } from "./Icons";
import { VietnameseAstronaut } from "./VietnameseAstronaut";

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
                    : "border-void-800/80 bg-void-950/40 opacity-60 grayscale",
              )}
            >
              {/* Top Row: Preview Orb & Meta */}
              <div className="flex items-start gap-3.5">
                {/* Visual Orb Preview */}
                <div
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-inner overflow-hidden"
                  style={{ backgroundColor: "rgba(10, 6, 24, 0.9)" }}
                >
                  <CometPreviewOrb skin={skin} />
                  {isEquipped && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-void-950 font-black shadow">
                      ★
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-display text-base font-bold text-white tracking-wide truncate">
                      {name}
                    </h3>
                    {skin.requiredStars > 0 && (
                      <span className="flex items-center gap-0.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        <IconStar size={10} className="text-amber-300" />
                        {skin.requiredStars}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/65 line-clamp-2 leading-relaxed">
                    {desc}
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
                      : "Khóa"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-void-800/90 bg-void-950 px-5 py-3 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <VietnameseAstronaut lang={lang} className="h-8 w-8 shrink-0" reaction="cheer" />
          <span>Thu thập thêm sao để mở khóa các vệt bụi sao huyền thoại.</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-void-700 bg-void-900 px-4 py-1.5 font-bold text-white transition hover:bg-void-800 cursor-pointer active:scale-95"
        >
          {t?.close ?? "Đóng"}
        </button>
      </div>
    </div>
  );
}

function CometPreviewOrb({ skin }: { skin: SkinDef }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow */}
      <div
        className="absolute h-10 w-10 rounded-full animate-ping opacity-35"
        style={{ backgroundColor: skin.glowColor }}
      />
      {/* Core orb */}
      <div
        className="h-8 w-8 rounded-full shadow-lg transition-transform hover:scale-110"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${skin.palette.core} 0%, ${skin.palette.mid} 40%, ${skin.palette.outer} 75%, ${skin.palette.ambient} 100%)`,
          boxShadow: `0 0 15px ${skin.glowColor}`,
        }}
      />
    </div>
  );
}
