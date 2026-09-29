import React from "react";
import type { Translations } from "../game/i18n";
import { cn } from "../utils/cn";

export type CoreType = "standard" | "cluster" | "blast" | "heavy";

interface CoreSelectorProps {
  selectedCore: CoreType;
  onSelectCore: (core: CoreType) => void;
  disabled?: boolean;
  t?: Translations;
  compact?: boolean;
}

interface CoreOption {
  id: CoreType;
  name: string;
  desc: string;
  keyLabel: string;
  color: string;
  borderCol: string;
  bgGlow: string;
  icon: React.ReactNode;
}

export function CoreSelector({
  selectedCore,
  onSelectCore,
  disabled = false,
  t,
  compact = false,
}: CoreSelectorProps) {
  const options: CoreOption[] = [
    {
      id: "standard",
      name: t?.coreStandard ?? "Tiêu Chuẩn",
      desc: "Sao chổi cổ điển, dội tường đàn hồi",
      keyLabel: "1",
      color: "text-amber-300",
      borderCol: "border-amber-400/80 shadow-[0_0_15px_rgba(255,180,40,0.4)]",
      bgGlow: "bg-amber-950/60",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 overflow-visible">
          <circle cx="12" cy="12" r="6" fill="#ffd23e" />
          <path d="M6 12 Q8 6 14 6" stroke="#ff7a1a" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="1.8" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: "cluster",
      name: t?.coreCluster ?? "Lõi Chùm",
      desc: t?.coreClusterDesc ?? "Chạm giữa lúc bay để tách 3 mảnh",
      keyLabel: "2",
      color: "text-ice-300",
      borderCol: "border-ice-400/80 shadow-[0_0_15px_rgba(46,230,201,0.4)]",
      bgGlow: "bg-cyan-950/60",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 overflow-visible">
          <circle cx="12" cy="7" r="3.5" fill="#7dfce7" />
          <circle cx="6" cy="17" r="3" fill="#2ee6c9" />
          <circle cx="18" cy="17" r="3" fill="#2ee6c9" />
          <line x1="12" y1="10.5" x2="6" y2="14" stroke="#7dfce7" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="12" y1="10.5" x2="18" y2="14" stroke="#7dfce7" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      id: "blast",
      name: t?.coreBlast ?? "Bom Lửa",
      desc: t?.coreBlastDesc ?? "Nổ tung phá hủy tinh thể xung quanh",
      keyLabel: "3",
      color: "text-rose-400",
      borderCol: "border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.45)]",
      bgGlow: "bg-rose-950/60",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 overflow-visible">
          <circle cx="12" cy="12" r="5" fill="#ff4d6d" />
          <circle cx="12" cy="12" r="7.5" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="12" y1="2" x2="12" y2="4.5" stroke="#ff7a1a" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="19.5" x2="12" y2="22" stroke="#ff7a1a" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="2" y1="12" x2="4.5" y2="12" stroke="#ff7a1a" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="19.5" y1="12" x2="22" y2="12" stroke="#ff7a1a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "heavy",
      name: t?.coreHeavy ?? "Xuyên Phá",
      desc: t?.coreHeavyDesc ?? "Đâm thủng 1 thanh chắn",
      keyLabel: "4",
      color: "text-sky-300",
      borderCol: "border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.4)]",
      bgGlow: "bg-sky-950/60",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 overflow-visible">
          {/* Shield outline */}
          <path d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5l-8-3z" stroke="#38bdf8" strokeWidth="1.5" fill="#0f172a" />
          {/* Piercing arrow */}
          <line x1="12" y1="7" x2="12" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <polyline points="9 13 12 16 15 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const activeOption = options.find((o) => o.id === selectedCore) || options[0];

  return (
    <div className="flex flex-col gap-1.5 select-none">
      {/* Tactical Selector Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-void-700/80 bg-void-950/90 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.65)] backdrop-blur-md">
        {options.map((opt) => {
          const isSelected = selectedCore === opt.id;
          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => onSelectCore(opt.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-all cursor-pointer active:scale-95",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? cn("border-2", opt.borderCol, opt.bgGlow, opt.color)
                  : "border border-void-800 bg-void-900/60 text-white/60 hover:border-void-600 hover:text-white hover:bg-void-800/80",
              )}
            >
              {opt.icon}
              <span className="font-display tracking-wider text-[11px] sm:text-xs">
                {opt.name}
              </span>
              <span className="hidden sm:inline-block rounded bg-black/40 px-1 py-0.5 text-[9px] font-mono opacity-60">
                {opt.keyLabel}
              </span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ability Tooltip Desc */}
      {!compact && (
        <div className="flex items-center justify-between px-2 text-[10px] sm:text-[11px] text-white/60">
          <span className="truncate">{activeOption.desc}</span>
          <span className="hidden sm:inline text-white/40 ml-2 whitespace-nowrap">
            (Phím 1-4)
          </span>
        </div>
      )}
    </div>
  );
}
