import { useState, useRef, useCallback } from "react";
import { audio } from "../game/audio";
import type { Language } from "../game/i18n";
import { cn } from "../utils/cn";
import "./VietnameseAstronaut.css";

export type AstronautReaction = "idle" | "aiming" | "tracking" | "cheer" | "sad" | "victory" | "angry" | "drag" | "drop";

interface VietnameseAstronautProps {
  lang: Language;
  className?: string;
  reaction?: AstronautReaction;
  reactionText?: string;
  showReactionBadge?: boolean;
  quotePlacement?: "top" | "bottom";
  dialogAlign?: "center" | "left" | "right";
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (pos: { x: number; y: number }) => void;
}

const REACTION_TEXTS = {
  vi: {
    aiming: "🎯 Khóa tọa độ...",
    tracking: "👀 Theo dõi đường đạn...",
    cheer: "⭐ Tuyệt đỉnh!",
    sad: "⚡ Cố lên nào!",
    victory: "🇻🇳 Vẻ vang!",
    angry: "💢 Tập trung cao độ!",
    drag: "🛸 Bay lượn không trọng lực!",
    drop: "✨ Tiếp đất an toàn!",
  },
  en: {
    aiming: "🎯 Locking coords...",
    tracking: "👀 Tracking comet...",
    cheer: "⭐ Splendid shot!",
    sad: "⚡ You got this!",
    victory: "🇻🇳 Victorious!",
    angry: "💢 Super focused!",
    drag: "🛸 Zero-G soaring!",
    drop: "✨ Safe landing!",
  },
};

const RADIO_QUOTES_VI = [
  "🇻🇳 'Cờ đỏ sao vàng tung bay kiêu hãnh giữa không gian sâu!'",
  "🚀 'Trạm VNSC sẵn sàng! Chinh phục hố đen Molten Void!'",
  "⭐ 'Tự hào người Việt Nam vươn tầm các vì sao!'",
  "⚡ 'Động cơ ion kích hoạt 100%, sẵn sàng xuất kích!'",
  "✨ 'Một bước chân nhỏ giữa hư vô, một niềm tự hào lớn!'",
];

const RADIO_QUOTES_ANGRY_VI = [
  "💢 'Đừng chọc nữa cơ trưởng ơi! Tập trung căn góc bắn đi!'",
  "😤 'Cảnh báo: Áp suất buồng lái tăng vọt vì bị chọc lét!'",
  "⚡ 'Năng lượng cực đại! Phóng đạn ngay thôi nào!'",
];

const RADIO_QUOTES_DRAG_VI = [
  "🛸 'Oa oa! Lực hấp dẫn bằng 0, trôi bồng bềnh thích quá cơ trưởng ơi!'",
  "🚀 'Đang di chuyển tọa độ chiến lược! Giữ chắc tay lái!'",
  "🌀 'Chóng mặt quá nha haha... Cơ trưởng dắt em đi đâu đó?!'",
];

const RADIO_QUOTES_DROP_VI = [
  "✨ 'Hạ cánh êm ái! Tọa độ mới đã thiết lập cực kỳ vững chắc!'",
  "🎯 'Vị trí này ngắm bắn quá chuẩn! Cháy hết mình thôi!'",
  "⭐ 'Tiếp đất thành công! Trạm VNSC sẵn sàng khai hỏa!'",
];

const RADIO_QUOTES_EN = [
  "🇻🇳 'Proudly raising the Vietnam flag across the deep cosmos!'",
  "🚀 'VNSC Mission Control ready! Conquering the Molten Void!'",
  "⭐ 'Proudly carrying the Vietnamese spirit to the stars!'",
  "⚡ 'Ion thrusters at 100%, all systems green!'",
  "✨ 'A brave leap into the void, a great pride for Vietnam!'",
];

const RADIO_QUOTES_ANGRY_EN = [
  "💢 'Stop poking me, Commander! Focus on your shot!'",
  "😤 'Warning: Cabin pressure spike from excessive tickling!'",
  "⚡ 'Full capacitor charge! Fire the orb already!'",
];

const RADIO_QUOTES_DRAG_EN = [
  "🛸 'Whoa! Zero gravity drift feels unreal, Commander!'",
  "🚀 'Repositioning tactical base! Hold on tight!'",
  "🌀 'Spinning around in orbit... Where are we flying to?!'",
];

const RADIO_QUOTES_DROP_EN = [
  "✨ 'Smooth touchdown! New tactical coords secured!'",
  "🎯 'Prime angle spotted! Time to unleash a star shot!'",
  "⭐ 'Landed safely! VNSC station ready for launch!'",
];

export function VietnameseAstronaut({
  lang,
  className,
  reaction = "idle",
  reactionText,
  showReactionBadge = false,
  quotePlacement = "top",
  dialogAlign = "center",
  draggable = false,
  onDragStart,
  onDragEnd,
}: VietnameseAstronautProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [angryQuoteIndex, setAngryQuoteIndex] = useState(0);
  const [dragQuoteIndex, setDragQuoteIndex] = useState(0);
  const [dropQuoteIndex, setDropQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [boostEffect, setBoostEffect] = useState(false);
  const [localReaction, setLocalReaction] = useState<AstronautReaction | null>(null);
  
  // Dragging state
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initLeft: number;
    initTop: number;
    hasMoved: boolean;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const hideTimeoutRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);
  const clickResetTimerRef = useRef<number | null>(null);

  const effectiveReaction: AstronautReaction =
    localReaction ?? (reaction !== "idle" ? reaction : "idle");

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const el = rootRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initLeft: rect.left,
        initTop: rect.top,
        hasMoved: false,
      };
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        // Fallback for non-supported targets
      }
    },
    [draggable],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || !dragStartRef.current) return;
      const { startX, startY, initLeft, initTop, hasMoved } = dragStartRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 7) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);
        setLocalReaction("drag");
        setShowQuote(true);
        setDragQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_DRAG_VI.length);
        audio.thrusterBoost();
        onDragStart?.();
      }

      if (dragStartRef.current.hasMoved) {
        const el = rootRef.current;
        const width = el?.offsetWidth ?? 80;
        const height = el?.offsetHeight ?? 80;
        const clampedX = Math.max(10, Math.min(window.innerWidth - width - 10, initLeft + dx));
        const clampedY = Math.max(10, Math.min(window.innerHeight - height - 10, initTop + dy));
        setDragPos({ x: clampedX, y: clampedY });
      }
    },
    [draggable, onDragStart],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || !dragStartRef.current) return;
      const wasMoved = dragStartRef.current.hasMoved;
      dragStartRef.current = null;

      if (wasMoved) {
        setIsDragging(false);
        setLocalReaction("drop");
        setShowQuote(true);
        setDropQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_DROP_VI.length);
        audio.spaceChime();

        if (dragPos) {
          onDragEnd?.(dragPos);
        }

        if (hideTimeoutRef.current) {
          window.clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = window.setTimeout(() => {
          setShowQuote(false);
          setLocalReaction(null);
        }, 3600);
      }
    },
    [draggable, dragPos, onDragEnd],
  );

  const handleClick = useCallback(() => {
    // If was just dragged, ignore regular click trigger
    if (dragStartRef.current?.hasMoved) return;

    audio.ensure();
    clickCountRef.current += 1;

    if (clickResetTimerRef.current) {
      window.clearTimeout(clickResetTimerRef.current);
    }
    clickResetTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    const isRapidPoking = clickCountRef.current >= 3;

    if (isRapidPoking) {
      audio.laser();
      setBoostEffect(true);
      setShowQuote(true);
      setLocalReaction("angry");
      setAngryQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_ANGRY_VI.length);
    } else if (boostEffect) {
      audio.thrusterBoost();
      setBoostEffect(true);
      setShowQuote(true);
      setLocalReaction("cheer");
      setQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_VI.length);
    } else {
      audio.spaceChime();
      setBoostEffect(true);
      setShowQuote(true);
      setLocalReaction("cheer");
      setQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_VI.length);
    }

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowQuote(false);
      setBoostEffect(false);
      setLocalReaction(null);
    }, 4500);
  }, [boostEffect]);

  const activeQuote =
    effectiveReaction === "angry"
      ? (lang === "vi" ? RADIO_QUOTES_ANGRY_VI : RADIO_QUOTES_ANGRY_EN)[angryQuoteIndex]
      : effectiveReaction === "drag"
        ? (lang === "vi" ? RADIO_QUOTES_DRAG_VI : RADIO_QUOTES_DRAG_EN)[dragQuoteIndex]
        : effectiveReaction === "drop"
          ? (lang === "vi" ? RADIO_QUOTES_DROP_VI : RADIO_QUOTES_DROP_EN)[dropQuoteIndex]
          : (lang === "vi" ? RADIO_QUOTES_VI : RADIO_QUOTES_EN)[quoteIndex];

  const computedDialogAlign = dragPos
    ? dragPos.x < window.innerWidth / 2
      ? "left"
      : "right"
    : dialogAlign;

  const computedQuotePlacement = dragPos && dragPos.y < 130 ? "bottom" : quotePlacement;

  const reactionClass =
    effectiveReaction === "aiming"
      ? "vn-astronaut-aiming"
      : effectiveReaction === "tracking"
        ? "vn-astronaut-tracking"
        : effectiveReaction === "cheer"
          ? "vn-astronaut-cheer"
          : effectiveReaction === "sad"
            ? "vn-astronaut-sad"
            : effectiveReaction === "victory"
              ? "vn-astronaut-victory"
              : effectiveReaction === "angry"
                ? "vn-astronaut-angry"
                : effectiveReaction === "drag"
                  ? "vn-astronaut-drag"
                  : effectiveReaction === "drop"
                    ? "vn-astronaut-drop"
                    : "vn-zero-g-float";

  const helmetClass =
    effectiveReaction === "aiming"
      ? "vn-helmet-aiming"
      : effectiveReaction === "tracking"
        ? "vn-helmet-tracking"
        : effectiveReaction === "cheer"
          ? "vn-helmet-cheer"
          : effectiveReaction === "sad"
            ? "vn-helmet-sad"
            : effectiveReaction === "victory"
              ? "vn-helmet-victory"
              : effectiveReaction === "angry"
                ? "vn-helmet-angry"
                : effectiveReaction === "drag"
                  ? "vn-helmet-drag"
                  : effectiveReaction === "drop"
                    ? "vn-helmet-drop"
                    : "vn-helmet-idle";

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={lang === "vi" ? "Phi hành gia Việt Nam" : "Vietnamese Astronaut"}
      style={
        dragPos
          ? {
              position: "fixed",
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              zIndex: 70,
              touchAction: "none",
            }
          : draggable
            ? { touchAction: "none" }
            : undefined
      }
      className={cn(
        "group relative flex shrink-0 select-none items-center justify-center transition-transform",
        draggable
          ? isDragging
            ? "cursor-grabbing scale-105"
            : "cursor-grab hover:scale-105 active:scale-95"
          : "cursor-pointer active:scale-95 duration-300",
        "h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-44 lg:w-44",
        className,
      )}
    >
      {/* Dynamic Floating Reaction Badge */}
      {showReactionBadge && !showQuote && (reactionText || (effectiveReaction !== "idle" && REACTION_TEXTS[lang][effectiveReaction as keyof (typeof REACTION_TEXTS)["vi"]])) && (
        <div
          className={cn(
            "animate-pop-in pointer-events-none absolute -top-8 whitespace-nowrap rounded-full border border-amber-400/80 bg-void-950/95 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-[0_0_16px_rgba(255,180,40,0.55)] backdrop-blur-md z-30 max-w-[min(88vw,16rem)] truncate",
            computedDialogAlign === "right"
              ? "right-0"
              : computedDialogAlign === "left"
                ? "left-0"
                : "left-1/2 -translate-x-1/2"
          )}
        >
          {reactionText ?? (effectiveReaction !== "idle" ? REACTION_TEXTS[lang][effectiveReaction as keyof (typeof REACTION_TEXTS)["vi"]] : "")}
        </div>
      )}

      {/* Cyber Radio Speech Bubble */}
      {showQuote && (
        <div
          className={cn(
            "animate-pop-in pointer-events-none absolute z-40 w-56 sm:w-64 max-w-[calc(100vw-1.5rem)] flex flex-col",
            computedDialogAlign === "right"
              ? "right-0"
              : computedDialogAlign === "left"
                ? "left-0"
                : "left-1/2 -translate-x-1/2",
            computedQuotePlacement === "bottom"
              ? "top-[calc(100%+0.5rem)]"
              : "bottom-[calc(100%+0.5rem)]"
          )}
        >
          {computedQuotePlacement === "bottom" && (
            <div
              className={cn(
                "h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-void-950/95",
                computedDialogAlign === "right"
                  ? "ml-auto mr-5 sm:mr-7"
                  : computedDialogAlign === "left"
                    ? "mr-auto ml-5 sm:ml-7"
                    : "mx-auto"
              )}
            />
          )}
          <div className="rounded-xl border border-ember-400/60 bg-void-950/95 p-2.5 shadow-[0_0_24px_rgba(255,160,46,0.45)] backdrop-blur-md">
            <div className="mb-1 flex items-center justify-between text-[9px] font-bold tracking-widest text-ember-300 uppercase">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ember-400 animate-ping" />
                VNSC COSMIC COMM
              </span>
              <span className="font-mono text-[8px] text-white/50">CH-01</span>
            </div>
            <p className="text-[11px] font-semibold leading-tight text-white/95">
              {activeQuote}
            </p>
          </div>
          {computedQuotePlacement !== "bottom" && (
            <div
              className={cn(
                "h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-void-950/95",
                computedDialogAlign === "right"
                  ? "ml-auto mr-5 sm:mr-7"
                  : computedDialogAlign === "left"
                    ? "mr-auto ml-5 sm:ml-7"
                    : "mx-auto"
              )}
            />
          )}
        </div>
      )}

      {/* Main Astronaut SVG Artwork (Authentic Zero-G Weightless Floating Posture) */}
      <svg
        viewBox="0 0 215 220"
        className={cn(
          "h-full w-full overflow-visible transition-transform duration-300 group-hover:scale-105",
          boostEffect && "scale-110",
        )}
      >
        <defs>
          {/* Vietnam Flag Crimson Silk Gradient */}
          <linearGradient id="vnFlagSilkRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ba150d" />
            <stop offset="35%" stopColor="#d31d14" />
            <stop offset="68%" stopColor="#f0382d" />
            <stop offset="100%" stopColor="#da251d" />
          </linearGradient>

          {/* Golden Star Luminous Gradient (Solid 5-point yellow star) */}
          <linearGradient id="vnGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9a6" />
            <stop offset="45%" stopColor="#ffd23e" />
            <stop offset="100%" stopColor="#ff9f1a" />
          </linearGradient>

          {/* Polished Chrome / Titanium Metallic Flagpole */}
          <linearGradient id="vnPoleMetallic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Golden Finial Sphere Gradient */}
          <radialGradient id="vnGoldSphere" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="40%" stopColor="#ffd23e" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          {/* Soft Puffy Spacesuit White / Slate Shadow */}
          <radialGradient id="vnPuffySuit" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>

          {/* Large Glossy Curved Gold Solar Visor */}
          <linearGradient id="vnGlossyVisor" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="25%" stopColor="#ffd23e" />
            <stop offset="60%" stopColor="#ff7a1a" />
            <stop offset="90%" stopColor="#c62828" />
            <stop offset="100%" stopColor="#3e1111" />
          </linearGradient>

          {/* Waving Fabric Ripple Sheen Overlay */}
          <linearGradient id="vnWaveSheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="26%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="76%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
          </linearGradient>

          {/* Soft Ion Plasma Flame */}
          <linearGradient id="vnIonFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#7dfce7" />
            <stop offset="65%" stopColor="#2ee6c9" />
            <stop offset="100%" stopColor="#00b4d8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ================= ZERO-G WEIGHTLESS FLOATING DRIFT ENTITY ================= */}
        <g className={reactionClass}>
          {/* Stardust Sparks & Drifting Thruster Particles */}
          <g opacity="0.85">
            <circle cx="14" cy="150" r="1.5" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="204" cy="102" r="1.4" fill="#ffd23e" className="vn-sparkle-2" />
            <circle cx="196" cy="188" r="1.6" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="28" cy="22" r="1.3" fill="#ffffff" className="vn-sparkle-2" />
            {/* Zero-G floating particles drifting away from thrusters */}
            <circle cx="168" cy="148" r="1.8" fill="#7dfce7" className="vn-drifting-particle-1" />
            <circle cx="174" cy="156" r="1.4" fill="#ffd23e" className="vn-drifting-particle-2" />
          </g>

          {/* ================= BACKPACK (PLSS - LIFE SUPPORT WITH ANGLE) ================= */}
          <g id="vn-backpack" transform="rotate(-6 174 100)">
            {/* Soft Rounded Backpack Chassis */}
            <rect x="168" y="70" width="20" height="54" rx="9" fill="#334155" stroke="#475569" strokeWidth="1.3" />
            {/* Oxygen Cylinder */}
            <rect x="173" y="76" width="10" height="32" rx="5" fill="#475569" stroke="#64748b" strokeWidth="0.9" />
            <line x1="175" y1="86" x2="181" y2="86" stroke="#2ee6c9" strokeWidth="1.1" opacity="0.85" />
            <line x1="175" y1="96" x2="181" y2="96" stroke="#2ee6c9" strokeWidth="1.1" opacity="0.85" />

            {/* High-gain Comm Antenna with Pulsing Beacon */}
            <line x1="180" y1="70" x2="194" y2="42" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="194" cy="42" r="3" fill="#ffd23e" />
            <circle cx="194" cy="42" r="1.7" fill="#ff4d6d" className="animate-ping" style={{ transformOrigin: "194px 42px" }} />

            {/* Thruster Nozzle & Soft Ion Plasma Flame */}
            <polygon points="172,124 169,131 178,131 176,124" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <path d="M 170 131 C 173 154, 174 154, 177 131 Z" fill="url(#vnIonFlame)" className="vn-ion-flame" />
          </g>

          {/* ================= ZERO-G WEIGHTLESS LEGS & FLOATING MOON BOOTS ================= */}
          {/* Authentic proportional spacesuit legs with knee armor guards, cuffs, and floating moon boots */}
          <g id="vn-zero-g-legs" className={effectiveReaction === "drag" ? "vn-legs-drag" : "vn-legs-sway"} transform="rotate(-5 145 120)">
            {/* Left Leg (Floating relaxed at subtle forward angle) */}
            <g id="vn-leg-left" transform="rotate(2 135 141)">
              {/* Thigh */}
              <rect x="129" y="141" width="13" height="23" rx="5.5" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Knee Armor Guard */}
              <rect x="127" y="161" width="17" height="7.5" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
              <line x1="130" y1="164.5" x2="140" y2="164.5" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
              {/* Calf */}
              <rect x="128.5" y="166" width="13.5" height="21" rx="5.5" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Ankle Cuff */}
              <rect x="126.5" y="184.5" width="17" height="5" rx="2.5" fill="#475569" stroke="#334155" strokeWidth="0.9" />
              {/* Left Moon Boot (Dangling weightlessly) */}
              <path
                d="M 124 187 C 120 193, 117 198, 119 202 C 122 204, 133 204, 139 202 C 142 200, 142 194, 140 187 Z"
                fill="#334155"
                stroke="#1e293b"
                strokeWidth="1.1"
              />
              {/* Glowing Micro-Thruster Sole */}
              <path d="M 120 202 C 125 204, 134 203, 138 201" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>

            {/* Right Leg (Floating slightly behind with depth) */}
            <g id="vn-leg-right" transform="rotate(-3 153 141)">
              {/* Thigh */}
              <rect x="147" y="141" width="13" height="24" rx="5.5" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Knee Armor Guard */}
              <rect x="145" y="162" width="17" height="7.5" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
              <line x1="148" y1="165.5" x2="158" y2="165.5" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
              {/* Calf */}
              <rect x="146.5" y="167" width="13.5" height="21" rx="5.5" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Ankle Cuff */}
              <rect x="144.5" y="185.5" width="17" height="5" rx="2.5" fill="#475569" stroke="#334155" strokeWidth="0.9" />
              {/* Right Moon Boot (Floating weightlessly) */}
              <path
                d="M 147 188 C 146 195, 147 201, 150 204 C 154 206, 164 205, 170 202 C 172 199, 171 194, 167 188 Z"
                fill="#334155"
                stroke="#1e293b"
                strokeWidth="1.1"
              />
              {/* Glowing Micro-Thruster Sole */}
              <path d="M 151 204 C 157 205, 165 204, 169 202" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* ================= PUFFY SPACESUIT TORSO (WEIGHTLESS ANGLE) ================= */}
          <g id="vn-torso" transform="rotate(-5 145 120)">
            {/* Airtight Suit Collar Socket (anchored firmly to torso) */}
            <ellipse cx="145" cy="95" rx="21" ry="6.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="145" cy="94" rx="18" ry="5" fill="#1e293b" />

            {/* Soft Rounded Puffy Body */}
            <path
              d="M 130 96 
                 C 124 108, 122 130, 131 142 
                 C 138 150, 152 150, 159 142 
                 C 168 130, 166 108, 160 96 
                 C 152 100, 138 100, 130 96 Z"
              fill="url(#vnPuffySuit)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Soft Padded Chest Utility Panel */}
            <rect x="134" y="104" width="22" height="20" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
            {/* Arc-Reactor Pulse Core */}
            <circle cx="145" cy="112" r="4" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1.1" />
            <circle cx="145" cy="112" r="2.2" fill="#7dfce7" className="animate-pulse" />
            <circle cx="145" cy="112" r="1" fill="#ffffff" />
            {/* Telemetry Status Line */}
            <line x1="138" y1="119" x2="152" y2="119" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

            {/* Padded Utility Belt */}
            <rect x="129" y="137" width="32" height="6.5" rx="3" fill="#475569" stroke="#334155" strokeWidth="0.9" />
            <rect x="140" y="138" width="10" height="4.5" rx="1.5" fill="#2ee6c9" opacity="0.9" />
          </g>

          {/* ================= FLEXIBLE CORRUGATED OXYGEN HOSES ================= */}
          <g id="vn-oxygen-hoses">
            <path
              d="M 170 88 C 182 104, 166 118, 154 114"
              fill="none"
              stroke="#475569"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            <path
              d="M 170 88 C 182 104, 166 118, 154 114"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3.8"
              strokeDasharray="2 2.5"
              strokeLinecap="round"
            />
          </g>

          {/* ================= DYNAMIC RIGHT ARM GESTURES ================= */}
          {effectiveReaction === "angry" ? (
            /* Clenched Determined Fist with Trembling Anger */
            <g id="vn-right-arm-angry" className="vn-arm-angry">
              <path
                d="M 158 100 C 168 92, 172 82, 168 70"
                fill="none"
                stroke="url(#vnPuffySuit)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <rect x="163" y="85" width="10" height="7" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" transform="rotate(-15 168 88)" />
              <circle cx="168" cy="66" r="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              <rect x="164" y="63" width="8" height="5.5" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="176" cy="64" r="1.5" fill="#ef4444" className="vn-anger-spark" />
            </g>
          ) : (effectiveReaction === "cheer" || effectiveReaction === "victory") ? (
            /* Joyful Raised Fist Pump Arm Celebrating Victory */
            <g id="vn-right-arm-pump" className="vn-fist-pump">
              {/* Puffy Arm Reaching High into the Sky */}
              <path
                d="M 158 100 C 168 86, 172 70, 168 54"
                fill="none"
                stroke="url(#vnPuffySuit)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 166 76 C 168 74, 172 75, 172 78"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Mission Patch */}
              <rect x="163" y="85" width="10" height="7" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" transform="rotate(-15 168 88)" />
              {/* Clenched Victory Fist Glove */}
              <circle cx="168" cy="50" r="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              <rect x="164" y="47" width="8" height="5.5" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <path d="M 165 47 L 171 47" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />
              {/* Golden Victory Sparkle near fist */}
              <polygon points="178,42 179,45 182,45 179.5,47 180.5,50 178,48 175.5,50 176.5,47 174,45 177,45" fill="#ffd23e" className="vn-sparkle-1" />
            </g>
          ) : effectiveReaction === "aiming" ? (
            /* Tactical Pointing Arm Locking Onto Target */
            <g id="vn-right-arm-aim" className="vn-arm-aim">
              {/* Arm Stretched Forward */}
              <path
                d="M 158 100 C 172 96, 186 90, 198 84"
                fill="none"
                stroke="url(#vnPuffySuit)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Mission Patch */}
              <rect x="165" y="94" width="10" height="7" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" transform="rotate(-6 170 97)" />
              {/* Pointing Glove */}
              <circle cx="198" cy="84" r="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
              <path d="M 199 83 L 206 80" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
              <line x1="208" y1="79" x2="228" y2="71" stroke="#ff4d6d" strokeWidth="1.3" strokeDasharray="3 3" opacity="0.85" />
            </g>
          ) : effectiveReaction === "tracking" ? (
            /* Tracking Arm Shading Visor / Reaching Skyward */
            <g id="vn-right-arm-tracking" className="vn-arm-sway">
              <path
                d="M 158 100 C 170 92, 178 84, 175 72"
                fill="none"
                stroke="url(#vnPuffySuit)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <rect x="163" y="90" width="10" height="7" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" transform="rotate(-15 168 93)" />
              <circle cx="174" cy="70" r="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
              <path d="M 170 71 C 172 68, 176 69, 177 72" stroke="#94a3b8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            /* Relaxed Weightless Arm Sway */
            <g id="vn-right-arm" className="vn-arm-sway">
              <path
                d="M 158 100 C 172 105, 178 114, 172 126"
                fill="none"
                stroke="url(#vnPuffySuit)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 171 112 C 173 115, 172 118, 169 120"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Mission Patch */}
              <rect x="165" y="102" width="11" height="7.5" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" />
              <polygon
                points="170.5,103.5 171.2,105 172.8,105 171.5,106 172,107.5 170.5,106.5 169,107.5 169.5,106 168.2,105 169.8,105"
                fill="#ffd23e"
              />
              <circle cx="170" cy="130" r="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
              <path d="M 168 128 C 170 126, 173 127, 174 130" stroke="#94a3b8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* ================= HELMET & GLOSSY VISOR WITH EMOTIONS ================= */}
          <g id="vn-helmet" className={helmetClass}>
            {/* Padded Neck Ring */}
            <ellipse cx="145" cy="94" rx="20" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.3" />

            {/* Rounded Helmet Dome */}
            <ellipse cx="145" cy="68" rx="29" ry="29" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Ear Comms Cushions */}
            <rect x="114" y="61" width="5.5" height="14" rx="2.5" fill="#64748b" stroke="#475569" strokeWidth="1" />
            <circle cx="117" cy="66" r="1.2" fill="#2ee6c9" />
            <rect x="171" y="61" width="5.5" height="14" rx="2.5" fill="#64748b" stroke="#475569" strokeWidth="1" />

            {/* Panoramic Gold Solar Visor */}
            <path
              d="M 122 66 C 122 52, 164 52, 164 66 C 164 82, 122 82, 122 66 Z"
              fill="url(#vnGlossyVisor)"
              stroke="#f59e0b"
              strokeWidth="1.3"
            />

            {/* Visor Glossy Specular Reflection Arc */}
            <path
              d="M 128 60 C 136 55, 152 55, 160 60 C 152 57, 136 57, 128 60 Z"
              fill="#ffffff"
              opacity="0.8"
              className="vn-visor-glint"
            />
            {/* Starlight Reflection in Visor */}
            <circle cx="130" cy="67" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="155" cy="71" r="1.5" fill="#ffffff" opacity="0.65" />

            {/* Dynamic Facial Expressions & Emotion Overlays */}
            <g id="vn-visor-emotions" className="pointer-events-none">
              {/* 1. AIMING: High-tech HUD Targeting Reticle */}
              {effectiveReaction === "aiming" && (
                <g className="vn-visor-hud">
                  <circle
                    cx="143"
                    cy="67"
                    r="8.5"
                    fill="none"
                    stroke="#2ee6c9"
                    strokeWidth="1.2"
                    strokeDasharray="3 2.5"
                    className="vn-reticle-spin"
                    style={{ transformOrigin: "143px 67px" }}
                  />
                  <circle cx="143" cy="67" r="4.2" fill="none" stroke="#ffd23e" strokeWidth="1" />
                  <circle cx="143" cy="67" r="1.6" fill="#ff4d6d" className="animate-ping" style={{ transformOrigin: "143px 67px" }} />
                  <line x1="143" y1="56" x2="143" y2="59" stroke="#2ee6c9" strokeWidth="1.2" />
                  <line x1="143" y1="75" x2="143" y2="78" stroke="#2ee6c9" strokeWidth="1.2" />
                  <line x1="132" y1="67" x2="135" y2="67" stroke="#2ee6c9" strokeWidth="1.2" />
                  <line x1="151" y1="67" x2="154" y2="67" stroke="#2ee6c9" strokeWidth="1.2" />
                  <text x="143" y="61.5" textAnchor="middle" fill="#ffd23e" fontSize="4.2" fontFamily="monospace" fontWeight="bold">LOCK</text>
                </g>
              )}

              {/* 2. TRACKING: Wide Curious Anime Eyes Looking Up-Left */}
              {effectiveReaction === "tracking" && (
                <g className="vn-visor-tracking">
                  {/* Left eye looking up-left */}
                  <ellipse cx="136" cy="65" rx="4.2" ry="5.2" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1" />
                  <ellipse cx="134.5" cy="63.5" rx="2.4" ry="3" fill="#7dfce7" />
                  <circle cx="133.5" cy="62" r="1.1" fill="#ffffff" />
                  {/* Right eye looking up-left */}
                  <ellipse cx="150" cy="65" rx="4.2" ry="5.2" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1" />
                  <ellipse cx="148.5" cy="63.5" rx="2.4" ry="3" fill="#7dfce7" />
                  <circle cx="147.5" cy="62" r="1.1" fill="#ffffff" />
                  {/* Focused determined mouth line */}
                  <path d="M 141 73 Q 143 74.5 145 73" stroke="#2ee6c9" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </g>
              )}

              {/* 3. CHEER: Happy Anime Crescent Eyes ^ ^ & Rosy Blush Cheeks */}
              {effectiveReaction === "cheer" && (
                <g className="vn-visor-cheer">
                  <path d="M 132 67 Q 137 60 142 67" stroke="#ffd23e" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                  <path d="M 144 67 Q 149 60 154 67" stroke="#ffd23e" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                  {/* Rosy blush cheeks */}
                  <ellipse cx="131" cy="72" rx="3.5" ry="1.8" fill="#ff4d6d" opacity="0.8" className="vn-blush-pulse" />
                  <ellipse cx="155" cy="72" rx="3.5" ry="1.8" fill="#ff4d6d" opacity="0.8" className="vn-blush-pulse" />
                  {/* Joyful smile */}
                  <path d="M 140 71 Q 143 75 146 71" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </g>
              )}

              {/* 4. VICTORY: Radiant Golden Star Eyes ★ ★ & Proud Joy */}
              {effectiveReaction === "victory" && (
                <g className="vn-visor-victory">
                  <polygon
                    points="136,60 137.2,63.5 141,63.5 138,65.5 139.2,69 136,67 132.8,69 134,65.5 131,63.5 134.8,63.5"
                    fill="#ffd23e"
                    stroke="#fffde7"
                    strokeWidth="0.6"
                  />
                  <polygon
                    points="150,60 151.2,63.5 155,63.5 152,65.5 153.2,69 150,67 146.8,69 148,65.5 145,63.5 148.8,63.5"
                    fill="#ffd23e"
                    stroke="#fffde7"
                    strokeWidth="0.6"
                  />
                  <path d="M 139 71 Q 143 77 147 71 Z" fill="#ffffff" stroke="#ffd23e" strokeWidth="0.9" />
                  <ellipse cx="131" cy="73" rx="3.5" ry="2" fill="#ff4d6d" opacity="0.85" />
                  <ellipse cx="155" cy="73" rx="3.5" ry="2" fill="#ff4d6d" opacity="0.85" />
                </g>
              )}

              {/* 5. SAD: Downturned Wavy Eyes ⌒ ⌒ & Blue Sweat Drop */}
              {effectiveReaction === "sad" && (
                <g className="vn-visor-sad">
                  <path d="M 133 66 Q 137 72 141 66" stroke="#7dfce7" strokeWidth="2.1" fill="none" strokeLinecap="round" />
                  <path d="M 145 66 Q 149 72 153 66" stroke="#7dfce7" strokeWidth="2.1" fill="none" strokeLinecap="round" />
                  <path d="M 140 75 Q 143 72.5 146 75" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <path
                    d="M 158 55 C 158 55, 161 58, 161 61 C 161 63, 159.5 64.5, 158 64.5 C 156.5 64.5, 155 63, 155 61 C 155 58, 158 55, 158 55 Z"
                    fill="#38bdf8"
                    stroke="#e0f2fe"
                    strokeWidth="0.7"
                    className="vn-sweat-drop"
                  />
                </g>
              )}

              {/* 6. IDLE: Calm Starlight Pupil Gleam */}
              {effectiveReaction === "idle" && (
                <g opacity="0.45">
                  <ellipse cx="136" cy="67" rx="2" ry="3" fill="#ffffff" />
                  <ellipse cx="150" cy="67" rx="2" ry="3" fill="#ffffff" />
                </g>
              )}

              {/* 7. ANGRY: Sharp Angled Eyes \ / & Gritted Teeth */}
              {effectiveReaction === "angry" && (
                <g className="vn-visor-angry">
                  <path d="M 132 62 L 140 68" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M 154 62 L 146 68" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
                  <circle cx="137" cy="66" r="2.2" fill="#ffd23e" />
                  <circle cx="149" cy="66" r="2.2" fill="#ffd23e" />
                  <circle cx="137" cy="66" r="1.1" fill="#fff" />
                  <circle cx="149" cy="66" r="1.1" fill="#fff" />
                  <path d="M 139 74 L 147 74" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="131" cy="73" rx="3.5" ry="2" fill="#ef4444" opacity="0.9" />
                  <ellipse cx="155" cy="73" rx="3.5" ry="2" fill="#ef4444" opacity="0.9" />
                </g>
              )}

              {/* 8. DRAG: Dizzy Spiral Eyes @ @ & Open Surprised Mouth :o */}
              {effectiveReaction === "drag" && (
                <g className="vn-visor-drag">
                  <path
                    d="M 136 66 m -4 0 a 4 4 0 1 0 8 0 a 3 3 0 1 0 -6 0 a 2 2 0 1 0 4 0 a 1 1 0 1 0 -2 0"
                    fill="none"
                    stroke="#2ee6c9"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    className="vn-dizzy-eye-left"
                  />
                  <path
                    d="M 150 66 m -4 0 a 4 4 0 1 0 8 0 a 3 3 0 1 0 -6 0 a 2 2 0 1 0 4 0 a 1 1 0 1 0 -2 0"
                    fill="none"
                    stroke="#2ee6c9"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    className="vn-dizzy-eye-right"
                  />
                  {/* Surprised oval mouth */}
                  <ellipse cx="143" cy="74" rx="3" ry="4" fill="#0f172a" stroke="#ffd23e" strokeWidth="1" />
                  {/* Rosy flustered cheeks */}
                  <ellipse cx="130" cy="73" rx="3" ry="1.6" fill="#ff4d6d" opacity="0.8" />
                  <ellipse cx="156" cy="73" rx="3" ry="1.6" fill="#ff4d6d" opacity="0.8" />
                </g>
              )}

              {/* 9. DROP / LANDING: Cheerful Relaxed Happy Eyes ^ ^ & Victorious Smile */}
              {effectiveReaction === "drop" && (
                <g className="vn-visor-drop">
                  <path d="M 132 67 Q 137 59 142 67" stroke="#34d399" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <path d="M 144 67 Q 149 59 154 67" stroke="#34d399" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <ellipse cx="131" cy="72" rx="3.5" ry="1.8" fill="#ff4d6d" opacity="0.85" />
                  <ellipse cx="155" cy="72" rx="3.5" ry="1.8" fill="#ff4d6d" opacity="0.85" />
                  <path d="M 139 71 Q 143 76 147 71" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* Vocoder Chin Vent */}
            <rect x="139" y="86" width="12" height="5" rx="2.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <line x1="142" y1="88.5" x2="148" y2="88.5" stroke="#2ee6c9" strokeWidth="0.8" strokeLinecap="round" />
          </g>

          {/* ================= FLOATING EMOJIS & MOOD PARTICLES FX ================= */}
          <g id="vn-floating-emotions" className="pointer-events-none">
            {/* CHEER / HAPPY: Floating Stars ⭐, Sparkles ✨ & Joy Badge */}
            {effectiveReaction === "cheer" && (
              <g className="vn-emotions-cheer">
                {/* Floating Star 1 */}
                <polygon
                  points="110,24 111.5,28 116,28 112.5,30.5 114,34.5 110,32 106,34.5 107.5,30.5 104,28 108.5,28"
                  fill="#ffd23e"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  className="vn-mood-star-1"
                />
                {/* Floating Star 2 */}
                <polygon
                  points="176,26 177.5,30 182,30 178.5,32.5 180,36.5 176,34 172,36.5 173.5,32.5 170,30 174.5,30"
                  fill="#ffd23e"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  className="vn-mood-star-2"
                />
                {/* Sparkle Glints */}
                <path
                  d="M 143 14 Q 143 20 149 20 Q 143 20 143 26 Q 143 20 137 20 Q 143 20 143 14 Z"
                  fill="#7dfce7"
                  className="vn-mood-sparkle"
                />
                <circle cx="124" cy="28" r="1.5" fill="#ffd23e" className="vn-mood-sparkle-delayed" />
                <circle cx="162" cy="24" r="1.5" fill="#ffd23e" className="vn-mood-sparkle" />
                {/* Cheerful Emoji Badge */}
                <g className="vn-mood-badge-cheer">
                  <circle cx="143" cy="18" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" filter="drop-shadow(0 0 6px rgba(245,158,11,0.65))" />
                  <text x="143" y="21.5" textAnchor="middle" fontSize="9" fill="#ffffff">⭐</text>
                </g>
              </g>
            )}

            {/* VICTORY: Golden Crown 👑, Celebratory Confetti 🎉 & Trophy Badge */}
            {effectiveReaction === "victory" && (
              <g className="vn-emotions-victory">
                {/* Radiant Golden Victory Crown */}
                <g className="vn-victory-crown">
                  <path
                    d="M 134 22 L 136 13 L 140 17 L 143 11 L 146 17 L 150 13 L 152 22 Z"
                    fill="url(#vnGoldStar)"
                    stroke="#d97706"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                  <circle cx="136" cy="12" r="1.3" fill="#ffffff" />
                  <circle cx="143" cy="10" r="1.5" fill="#ffffff" />
                  <circle cx="150" cy="12" r="1.3" fill="#ffffff" />
                  <circle cx="143" cy="19" r="1.4" fill="#da251d" />
                </g>
                {/* Twin Victory Stars */}
                <polygon
                  points="110,20 111.5,23.5 115,23.5 112,25.5 113.5,29 110,27 106.5,29 108,25.5 105,23.5 108.5,23.5"
                  fill="#ffd23e"
                  className="vn-mood-star-1"
                />
                <polygon
                  points="176,20 177.5,23.5 181,23.5 178,25.5 179.5,29 176,27 172.5,29 174,25.5 171,23.5 174.5,23.5"
                  fill="#ffd23e"
                  className="vn-mood-star-2"
                />
                {/* Confetti & Particle Sparks */}
                <rect x="120" y="14" width="3" height="3" rx="0.6" fill="#da251d" className="vn-confetti-1" />
                <rect x="166" y="16" width="3" height="3" rx="0.6" fill="#2ee6c9" className="vn-confetti-2" />
                <rect x="130" y="7" width="2.5" height="2.5" rx="0.5" fill="#ffd23e" className="vn-confetti-3" />
                <rect x="156" y="9" width="2.5" height="2.5" rx="0.5" fill="#f43f5e" className="vn-confetti-1" />
                {/* Victory Emoji Badge */}
                <g className="vn-mood-badge-victory">
                  <circle cx="143" cy="17" r="8.5" fill="#da251d" stroke="#ffd23e" strokeWidth="1.2" filter="drop-shadow(0 0 8px rgba(218,37,29,0.75))" />
                  <text x="143" y="20.8" textAnchor="middle" fontSize="9" fill="#ffffff">🏆</text>
                </g>
              </g>
            )}

            {/* SAD: Gloom Cloud 🌧️, Dripping Sweat/Tears 💧 & Sad Badge */}
            {effectiveReaction === "sad" && (
              <g className="vn-emotions-sad">
                {/* Mini Melancholy Gloom Cloud */}
                <g className="vn-gloom-cloud">
                  <path
                    d="M 134 22 C 131 22, 129 19, 131 16 C 132 13, 136 12, 138 14 C 140 11, 146 11, 148 14 C 151 13, 155 15, 154 18 C 156 20, 154 22, 151 22 Z"
                    fill="#475569"
                    stroke="#64748b"
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                  <line x1="138" y1="24" x2="137" y2="28" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" className="vn-rain-drop-1" />
                  <line x1="144" y1="25" x2="143" y2="30" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" className="vn-rain-drop-2" />
                  <line x1="149" y1="24" x2="148" y2="28" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" className="vn-rain-drop-1" />
                </g>
                {/* Falling Sweat Tears */}
                <g className="vn-tear-drop-left">
                  <path
                    d="M 116 46 C 116 46, 120 50, 120 54 C 120 56.5, 118 58.5, 116 58.5 C 114 58.5, 112 56.5, 112 54 C 112 50, 116 46, 116 46 Z"
                    fill="#38bdf8"
                    stroke="#bae6fd"
                    strokeWidth="0.7"
                  />
                </g>
                <g className="vn-tear-drop-right">
                  <path
                    d="M 172 44 C 172 44, 176 48, 176 52 C 176 54.5, 174 56.5, 172 56.5 C 170 56.5, 168 54.5, 168 52 C 168 48, 172 44, 172 44 Z"
                    fill="#38bdf8"
                    stroke="#bae6fd"
                    strokeWidth="0.7"
                  />
                </g>
                {/* Sad Mood Badge */}
                <g className="vn-mood-badge-sad">
                  <circle cx="168" cy="22" r="7.5" fill="#0369a1" stroke="#7dd3fc" strokeWidth="0.9" />
                  <text x="168" y="25" textAnchor="middle" fontSize="8" fill="#ffffff">💧</text>
                </g>
              </g>
            )}

            {/* ANGRY / FIERCE DETERMINATION: Anime Anger Mark 💢, Steam Puffs 💨 & Anger Sparks ⚡ */}
            {effectiveReaction === "angry" && (
              <g className="vn-emotions-angry">
                {/* Iconic Anime Anger Vein Mark 💢 */}
                <g className="vn-anger-mark">
                  <path
                    d="M 166 32 Q 170 36 174 32 M 174 32 Q 178 36 174 40 M 174 40 Q 170 36 166 40 M 166 40 Q 162 36 166 32"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="170" cy="36" r="1.3" fill="#f87171" />
                </g>
                {/* Steam Puffs from Helmet Vents */}
                <g className="vn-steam-puff-left">
                  <ellipse cx="108" cy="68" rx="4.5" ry="2.8" fill="#ffffff" opacity="0.8" />
                  <ellipse cx="104" cy="66" rx="2.8" ry="2" fill="#ffffff" opacity="0.6" />
                </g>
                <g className="vn-steam-puff-right">
                  <ellipse cx="180" cy="68" rx="4.5" ry="2.8" fill="#ffffff" opacity="0.8" />
                  <ellipse cx="184" cy="66" rx="2.8" ry="2" fill="#ffffff" opacity="0.6" />
                </g>
                {/* Electric Anger Sparks */}
                <path
                  d="M 120 28 L 116 34 L 120 34 L 117 40"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="vn-anger-spark"
                />
                {/* Anger Emoji Badge */}
                <g className="vn-mood-badge-angry">
                  <circle cx="143" cy="18" r="8" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1" filter="drop-shadow(0 0 6px rgba(185,28,28,0.7))" />
                  <text x="143" y="21.5" textAnchor="middle" fontSize="9" fill="#ffffff">💢</text>
                </g>
              </g>
            )}

            {/* AIMING: Crosshair 🎯 & Tactical Spark */}
            {effectiveReaction === "aiming" && (
              <g className="vn-emotions-aiming">
                {/* Floating Crosshair */}
                <g className="vn-mood-crosshair">
                  <circle cx="176" cy="40" r="6" fill="none" stroke="#2ee6c9" strokeWidth="1.2" strokeDasharray="2 2" className="vn-reticle-spin" style={{ transformOrigin: "176px 40px" }} />
                  <circle cx="176" cy="40" r="2.2" fill="#ff4d6d" />
                  <line x1="176" y1="32" x2="176" y2="35" stroke="#2ee6c9" strokeWidth="1" />
                  <line x1="176" y1="45" x2="176" y2="48" stroke="#2ee6c9" strokeWidth="1" />
                  <line x1="168" y1="40" x2="171" y2="40" stroke="#2ee6c9" strokeWidth="1" />
                  <line x1="181" y1="40" x2="184" y2="40" stroke="#2ee6c9" strokeWidth="1" />
                </g>
                <path d="M 118 24 L 114 30 L 118 30 L 115 36" stroke="#ffd23e" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" className="vn-focus-spark" />
                <g className="vn-mood-badge-aim">
                  <circle cx="143" cy="18" r="7.5" fill="#0f766e" stroke="#2ee6c9" strokeWidth="1" />
                  <text x="143" y="21.2" textAnchor="middle" fontSize="8" fill="#ffffff">🎯</text>
                </g>
              </g>
            )}

            {/* TRACKING: Orbiting Comet Star 💫 & Tracking Badge */}
            {effectiveReaction === "tracking" && (
              <g className="vn-emotions-tracking">
                <g className="vn-orbit-star">
                  <polygon points="172,24 173.5,27.5 177,27.5 174,29.5 175.5,33 172,31 168.5,33 170,29.5 167,27.5 170.5,27.5" fill="#7dfce7" stroke="#2ee6c9" strokeWidth="0.5" />
                </g>
                <g className="vn-mood-badge-track">
                  <circle cx="143" cy="18" r="7.5" fill="#1e293b" stroke="#7dfce7" strokeWidth="1" />
                  <text x="143" y="21.2" textAnchor="middle" fontSize="8" fill="#ffffff">👀</text>
                </g>
              </g>
            )}

            {/* DRAG: Floating UFO 🛸, Speed Lines & Zero-G Particles */}
            {effectiveReaction === "drag" && (
              <g className="vn-emotions-drag">
                <g className="vn-mood-badge-drag">
                  <circle cx="143" cy="18" r="8.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" filter="drop-shadow(0 0 8px rgba(56,189,248,0.8))" />
                  <text x="143" y="21.5" textAnchor="middle" fontSize="9" fill="#ffffff">🛸</text>
                </g>
                {/* Wind swirl paths */}
                <path d="M 112 36 Q 118 32 126 36" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M 160 34 Q 168 30 176 35" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
                <circle cx="120" cy="22" r="1.5" fill="#7dfce7" className="animate-ping" />
                <circle cx="168" cy="24" r="1.5" fill="#ffd23e" className="animate-ping" />
              </g>
            )}

            {/* DROP: Sparkles ✨, Celebration Star & Safe Touchdown Badge */}
            {effectiveReaction === "drop" && (
              <g className="vn-emotions-drop">
                <g className="vn-mood-badge-drop">
                  <circle cx="143" cy="18" r="8.5" fill="#059669" stroke="#34d399" strokeWidth="1.2" filter="drop-shadow(0 0 8px rgba(52,211,153,0.8))" />
                  <text x="143" y="21.5" textAnchor="middle" fontSize="9" fill="#ffffff">✨</text>
                </g>
                <polygon points="112,24 113.5,27.5 117,27.5 114,29.5 115.5,33 112,31 108.5,33 110,29.5 107,27.5 110.5,27.5" fill="#34d399" stroke="#ffffff" strokeWidth="0.5" className="vn-mood-star-1" />
                <polygon points="174,24 175.5,27.5 179,27.5 176,29.5 177.5,33 174,31 170.5,33 172,29.5 169,27.5 172.5,27.5" fill="#ffd23e" stroke="#ffffff" strokeWidth="0.5" className="vn-mood-star-2" />
              </g>
            )}
          </g>

          {/* ================= FLOATING FLAGPOLE (DIAGONALLY ANGLE IN ZERO-G) ================= */}
          <g id="vn-flagpole">
            {/* Solid Polished Titanium Staff (Angled naturally in microgravity) */}
            <line x1="82" y1="12" x2="94" y2="210" stroke="url(#vnPoleMetallic)" strokeWidth="4.5" strokeLinecap="round" />
            {/* Specular Highlight along the Staff */}
            <line x1="82.5" y1="14" x2="93.5" y2="208" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

            {/* Radiant Golden Sphere Finial on Top of Flagpole */}
            <circle cx="82" cy="12" r="7" fill="url(#vnGoldSphere)" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="79.5" cy="9.5" r="2" fill="#ffffff" opacity="0.85" />
            {/* Gold Star Tip Finial */}
            <polygon
              points="82,1 83.2,4 86.5,4 84,5.8 85,9 82,7.2 79,9 80,5.8 77.5,4 80.8,4"
              fill="#ffd23e"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />

            {/* Visible Metal Flag Mounting Grommets */}
            <rect x="80" y="25" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" transform="rotate(3.5 84 26)" />
            <rect x="82.5" y="53" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" transform="rotate(3.5 86.5 54)" />
            <rect x="85" y="82" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" transform="rotate(3.5 89 83)" />
          </g>

          {/* ================= THE NATIONAL FLAG OF VIETNAM (WAVING IN SOLAR WIND) ================= */}
          <g id="vn-national-flag" className="vn-flag-wave">
            {/* Silky Aerodynamic Flag Fabric */}
            <path
              d="M 83 26 
                 C 63 32, 35 20, 14 28 
                 C 12 46, 17 66, 14 84 
                 C 35 78, 65 90, 89 84 Z"
              fill="url(#vnFlagSilkRed)"
              stroke="#da251d"
              strokeWidth="0.8"
            />

            {/* Silky Wave Shading Sheen Overlay */}
            <path
              d="M 83 26 
                 C 63 32, 35 20, 14 28 
                 C 12 46, 17 66, 14 84 
                 C 35 78, 65 90, 89 84 Z"
              fill="url(#vnWaveSheen)"
            />

            {/* PURE SOLID GOLDEN 5-POINT STAR (SOLID ICONIC VIETNAMESE STAR) */}
            <polygon
              points="
                50.5,39
                54.1,50.0
                65.7,50.1
                56.4,56.9
                59.9,67.9
                50.5,61.2
                41.1,67.9
                44.6,56.9
                35.3,50.1
                46.9,50.0
              "
              fill="url(#vnGoldStar)"
              stroke="#ffd23e"
              strokeWidth="0.8"
            />
          </g>

          {/* ================= LEFT ARM HOLDING FLAGPOLE (BENT IN ZERO-G) ================= */}
          <g id="vn-left-arm-holding">
            {/* Arm Reaching Smoothly to the Floating Flagpole */}
            <path
              d="M 128 100 C 116 106, 108 112, 104 118 C 98 124, 92 118, 88 108"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fabric Wrinkle at Elbow */}
            <path
              d="M 106 114 C 104 117, 105 120, 108 122"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Puffy Glove Cuff */}
            <ellipse cx="94" cy="110" rx="3.5" ry="6" fill="#64748b" stroke="#475569" strokeWidth="0.8" transform="rotate(10 94 110)" />

            {/* Puffy Hand Firmly Gripping Around the Angled Pole */}
            <rect x="83" y="102" width="11" height="14" rx="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.1" transform="rotate(3.5 88 109)" />

            {/* Puffy Fingers Curled Around Front of the Pole */}
            <rect x="83" y="104" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" transform="rotate(3.5 86.5 105)" />
            <rect x="83" y="107.5" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" transform="rotate(3.5 86.5 108.5)" />
            <rect x="83" y="111" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" transform="rotate(3.5 86.5 112)" />

            {/* Thumb Wrapping Around */}
            <path d="M 87 106 C 90 106, 91 109, 89 112" fill="#f8fafc" stroke="#64748b" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
export default VietnameseAstronaut;
