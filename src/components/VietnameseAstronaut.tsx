import React, { useState, useRef, useCallback } from "react";
import { audio } from "../game/audio";
import type { Language } from "../game/i18n";
import { cn } from "../utils/cn";

interface VietnameseAstronautProps {
  lang: Language;
  className?: string;
}

const RADIO_QUOTES_VI = [
  "🇻🇳 'Cờ đỏ sao vàng tung bay kiêu hãnh giữa không gian sâu!'",
  "🚀 'Trạm VNSC sẵn sàng! Chinh phục hố đen Molten Void!'",
  "⭐ 'Tự hào người Việt Nam vươn tầm các vì sao!'",
  "⚡ 'Động cơ ion kích hoạt 100%, sẵn sàng xuất kích!'",
  "✨ 'Một bước chân nhỏ giữa hư vô, một niềm tự hào lớn!'",
];

const RADIO_QUOTES_EN = [
  "🇻🇳 'Proudly raising the Vietnam flag across the deep cosmos!'",
  "🚀 'VNSC Mission Control ready! Conquering the Molten Void!'",
  "⭐ 'Proudly carrying the Vietnamese spirit to the stars!'",
  "⚡ 'Ion thrusters at 100%, all systems green!'",
  "✨ 'A brave leap into the void, a great pride for Vietnam!'",
];

export function VietnameseAstronaut({ lang, className }: VietnameseAstronautProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [boostEffect, setBoostEffect] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  const handleClick = useCallback(() => {
    // Sound effect
    audio.ensure();
    if (boostEffect) {
      audio.thrusterBoost();
    } else {
      audio.spaceChime();
    }

    // Toggle boost animation and cycle through heroic radio quotes
    setBoostEffect(true);
    setShowQuote(true);
    setQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES_VI.length);

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowQuote(false);
      setBoostEffect(false);
    }, 4500);
  }, [boostEffect]);

  const activeQuote = (lang === "vi" ? RADIO_QUOTES_VI : RADIO_QUOTES_EN)[quoteIndex];

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={lang === "vi" ? "Phi hành gia Việt Nam" : "Vietnamese Astronaut"}
      className={cn(
        "group relative flex shrink-0 cursor-pointer select-none items-center justify-center transition-transform duration-300 active:scale-95",
        "h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40",
        className,
      )}
    >
      <style>{`
        @keyframes vnAstroZeroG {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-7px) rotate(1.5deg);
          }
        }
        @keyframes vnFlagClothWave {
          0%, 100% {
            transform: scaleX(1) skewY(0deg);
          }
          25% {
            transform: scaleX(0.97) skewY(1.4deg);
          }
          50% {
            transform: scaleX(1.02) skewY(-1deg);
          }
          75% {
            transform: scaleX(0.98) skewY(0.8deg);
          }
        }
        @keyframes vnIonFlamePulse {
          0%, 100% {
            opacity: 0.75;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.22) scaleX(1.08);
          }
        }
        @keyframes vnVisorGlint {
          0%, 75%, 100% {
            opacity: 0.35;
            transform: translateX(0);
          }
          85% {
            opacity: 0.9;
            transform: translateX(3px);
          }
        }
        @keyframes vnStarSparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .vn-astro-float {
          animation: vnAstroZeroG 4.6s ease-in-out infinite;
        }
        .vn-flag-wave {
          transform-origin: 42px 56px;
          animation: vnFlagClothWave 3.2s ease-in-out infinite;
        }
        .vn-ion-flame {
          transform-origin: center top;
          animation: vnIonFlamePulse 0.4s ease-in-out infinite alternate;
        }
        .vn-visor-glint {
          animation: vnVisorGlint 4s ease-in-out infinite;
        }
        .vn-sparkle-1 {
          animation: vnStarSparkle 1.8s ease-in-out infinite;
        }
        .vn-sparkle-2 {
          animation: vnStarSparkle 2.4s ease-in-out infinite 0.7s;
        }
      `}</style>

      {/* Cyber Radio Speech Bubble */}
      {showQuote && (
        <div className="animate-pop-in pointer-events-none absolute -top-16 left-1/2 z-40 w-52 -translate-x-1/2 sm:-top-20 sm:w-60 md:w-64">
          <div className="rounded-xl border border-ember-400/60 bg-void-950/95 p-2.5 shadow-[0_0_24px_rgba(255,160,46,0.4)] backdrop-blur-md">
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
          {/* Bubble tail indicator */}
          <div className="mx-auto h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-void-950/95" />
        </div>
      )}

      {/* Hover Information Tooltip */}
      {!showQuote && (
        <div className="pointer-events-none absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-ice-500/40 bg-void-950/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-ice-300 opacity-0 shadow-[0_0_12px_rgba(46,230,201,0.3)] backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 sm:text-[10px]">
          🇻🇳 {lang === "vi" ? "Phi Hành Gia Việt Nam" : "Vietnamese Astronaut"}
        </div>
      )}

      {/* Main Astronaut SVG Artwork */}
      <svg
        viewBox="0 0 220 220"
        className={cn(
          "h-full w-full overflow-visible transition-transform duration-300 group-hover:scale-105",
          boostEffect && "scale-110",
        )}
      >
        <defs>
          {/* Vietnam Flag Crimson & Silk Waves */}
          <linearGradient id="vnAstroFlagRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#da251d" />
            <stop offset="45%" stopColor="#ef362d" />
            <stop offset="70%" stopColor="#d21d15" />
            <stop offset="100%" stopColor="#ba150d" />
          </linearGradient>

          {/* Golden Star Luminous Gradient */}
          <linearGradient id="vnAstroGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9a6" />
            <stop offset="40%" stopColor="#ffd23e" />
            <stop offset="100%" stopColor="#ff9f1a" />
          </linearGradient>

          {/* Flag Fabric Light & Shadow Ripple */}
          <linearGradient id="vnFlagRippleOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="28%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="74%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>

          {/* Polarized Gold Solar Visor */}
          <linearGradient id="vnAstroVisor" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#fff9c4" />
            <stop offset="22%" stopColor="#ffd23e" />
            <stop offset="55%" stopColor="#ff7a1a" />
            <stop offset="85%" stopColor="#c62828" />
            <stop offset="100%" stopColor="#311111" />
          </linearGradient>

          {/* High-Tech EVA Armor Titanium Whites */}
          <linearGradient id="vnArmorWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Obsidian Exoskeleton & Joint Shading */}
          <linearGradient id="vnArmorDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Carbon Fiber Flagpole Metallic Rod */}
          <linearGradient id="vnFlagPole" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="65%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Cyber Ion Thruster Plasma Jet */}
          <linearGradient id="vnIonFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#7dfce7" />
            <stop offset="65%" stopColor="#2ee6c9" />
            <stop offset="100%" stopColor="#00b4d8" stopOpacity="0" />
          </linearGradient>

          {/* Chest Reactor Power Core Glow */}
          <radialGradient id="vnReactorCore">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#7dfce7" />
            <stop offset="80%" stopColor="#2ee6c9" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
        </defs>

        {/* Ambient Zero-G Floating Astronaut & Flag Entity */}
        <g className="vn-astro-float">
          {/* ================= BACKGROUND STARDUST & SPARKS ================= */}
          <g opacity="0.85">
            <circle cx="28" cy="165" r="1.5" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="206" cy="112" r="1.3" fill="#ffd23e" className="vn-sparkle-2" />
            <circle cx="198" cy="192" r="1.6" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="68" cy="18" r="1.2" fill="#ffffff" className="vn-sparkle-2" />
          </g>

          {/* ================= BACKPACK / JETPACK LIFE SUPPORT ================= */}
          <g id="vn-jetpack">
            {/* High-gain Comm Antenna */}
            <line x1="178" y1="74" x2="194" y2="44" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="194" cy="44" r="2.8" fill="#ffd23e" />
            <circle cx="194" cy="44" r="1.6" fill="#ff4d6d" className="animate-ping" style={{ transformOrigin: "194px 44px" }} />

            {/* Jetpack Heavy Chassis */}
            <rect x="164" y="74" width="26" height="66" rx="7" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.3" />
            {/* Titanium Oxygen / Reaction Cylinders */}
            <rect x="170" y="80" width="14" height="38" rx="4" fill="#334155" stroke="#64748b" strokeWidth="0.9" />
            <line x1="172" y1="92" x2="182" y2="92" stroke="#2ee6c9" strokeWidth="1" opacity="0.85" />
            <line x1="172" y1="104" x2="182" y2="104" stroke="#2ee6c9" strokeWidth="1" opacity="0.85" />

            {/* Thruster Nozzle Bells */}
            <polygon points="170,140 167,148 177,148 175,140" fill="#1e293b" stroke="#64748b" strokeWidth="0.9" />
            <polygon points="181,140 178,148 188,148 186,140" fill="#1e293b" stroke="#64748b" strokeWidth="0.9" />

            {/* Glowing Blue/Cyan Ion Exhaust Plumes */}
            <polygon points="168,148 172,176 176,148" fill="url(#vnIonFlame)" className="vn-ion-flame" />
            <polygon points="179,148 183,176 187,148" fill="url(#vnIonFlame)" className="vn-ion-flame" style={{ animationDelay: "0.2s" }} />
          </g>

          {/* ================= LEGS & MAGNETIC SPACE BOOTS (ZERO-G DRIFT) ================= */}
          <g id="vn-legs">
            {/* Left Leg (Angled Forward) */}
            <path d="M 130 152 L 126 182 L 138 182 L 142 152 Z" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.1" />
            {/* Knee Armor Guard */}
            <rect x="124" y="180" width="15" height="7" rx="2" fill="#1e293b" stroke="#2ee6c9" strokeWidth="0.9" />
            {/* Shin & Boot */}
            <path d="M 126 186 L 120 210 L 135 212 L 137 186 Z" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.1" />
            {/* Boot Micro-Thruster */}
            <line x1="121" y1="212" x2="134" y2="213" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Leg (Relaxed Zero-G Float) */}
            <path d="M 146 152 L 152 181 L 163 179 L 158 152 Z" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.1" />
            {/* Knee Armor Guard */}
            <rect x="149" y="179" width="15" height="7" rx="2" fill="#1e293b" stroke="#2ee6c9" strokeWidth="0.9" />
            {/* Shin & Boot */}
            <path d="M 151 185 L 157 208 L 171 206 L 163 184 Z" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.1" />
            {/* Boot Micro-Thruster */}
            <line x1="158" y1="208" x2="170" y2="206" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* ================= TORSO & CHESTPLATE ================= */}
          <g id="vn-torso">
            {/* Armored Collar & Oxygen Ring */}
            <path d="M 130 98 Q 144 106 158 98 L 160 106 Q 144 114 128 106 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.1" />
            {/* Heavy Chestplate Armor */}
            <path d="M 124 106 L 164 106 L 160 144 L 128 144 Z" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.2" />

            {/* High-Tech Circuit Traces */}
            <line x1="130" y1="112" x2="138" y2="118" stroke="#2ee6c9" strokeWidth="1" opacity="0.8" />
            <line x1="158" y1="112" x2="150" y2="118" stroke="#2ee6c9" strokeWidth="1" opacity="0.8" />

            {/* Arc-Reactor Core (Glowing Cyan Energy Pulse) */}
            <circle cx="144" cy="124" r="9" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1.6" />
            <circle cx="144" cy="124" r="6" fill="url(#vnReactorCore)" />
            <circle cx="144" cy="124" r="2.2" fill="#ffffff" />

            {/* Utility Belt & Equipment Modules */}
            <rect x="126" y="144" width="36" height="8" rx="2" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.1" />
            <rect x="138" y="145" width="12" height="6" rx="1.5" fill="#334155" stroke="#2ee6c9" strokeWidth="0.9" />
          </g>

          {/* ================= LEFT ARM WITH VIETNAMESE FLAG PATCH ================= */}
          <g id="vn-left-arm">
            {/* Left Shoulder Pauldron */}
            <path d="M 164 106 C 176 106, 184 114, 180 126 L 170 128 L 164 114 Z" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.1" />

            {/* 🇻🇳 VIETNAM NATIONAL MISSION PATCH */}
            <rect x="169" y="112" width="11" height="7.5" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.8" />
            {/* Miniature Golden 5-point Star */}
            <polygon
              points="174.5,113.8 175.2,115.5 177,115.5 175.6,116.6 176.1,118.2 174.5,117.2 172.9,118.2 173.4,116.6 172,115.5 173.8,115.5"
              fill="#ffd23e"
            />

            {/* Forearm & Gauntlet Floating in Zero-G */}
            <path d="M 172 128 L 181 148 L 175 154 L 166 136 Z" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.1" />
            {/* Wrist Interface Display */}
            <line x1="172" y1="145" x2="179" y2="147" stroke="#2ee6c9" strokeWidth="1.4" strokeLinecap="round" />
            {/* Cybernetic Gauntlet Hand */}
            <circle cx="173" cy="155" r="4.6" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
          </g>

          {/* ================= HELMET & POLARIZED VISOR ================= */}
          <g id="vn-helmet">
            {/* Outer Helmet Dome */}
            <ellipse cx="144" cy="76" rx="28" ry="29" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.4" />

            {/* Ear Sensor Pods & Comms Hubs */}
            <rect x="115" y="70" width="5.5" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />
            <circle cx="118" cy="74" r="1.4" fill="#2ee6c9" />
            <rect x="167" y="70" width="5.5" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />

            {/* Polarized Cosmic Gold Visor */}
            <path
              d="M 124 72 C 124 59, 160 59, 160 72 C 160 88, 124 88, 124 72 Z"
              fill="url(#vnAstroVisor)"
              stroke="#ffa02e"
              strokeWidth="1.3"
            />

            {/* Curved Visor Specular Reflection */}
            <path
              d="M 128 66 C 135 62, 149 62, 156 66 C 149 64, 135 64, 128 66 Z"
              fill="#ffffff"
              opacity="0.65"
              className="vn-visor-glint"
            />

            {/* Futuristic HUD Targeting Reticle */}
            <g opacity="0.65">
              <circle cx="146" cy="74" r="4" fill="none" stroke="#2ee6c9" strokeWidth="0.6" strokeDasharray="2 2" />
              <line x1="146" y1="68" x2="146" y2="80" stroke="#2ee6c9" strokeWidth="0.5" />
              <line x1="140" y1="74" x2="152" y2="74" stroke="#2ee6c9" strokeWidth="0.5" />
            </g>

            {/* Chin Vocoder & Oxygen Intake Vent */}
            <rect x="138" y="93" width="12" height="6.5" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />
            <line x1="141" y1="96.5" x2="147" y2="96.5" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* ================= RIGHT ARM EXTENDING TO FLAGPOLE ================= */}
          <g id="vn-right-arm">
            {/* Shoulder & Bicep */}
            <path d="M 122 105 L 82 116 L 86 126 L 126 117 Z" fill="url(#vnArmorWhite)" stroke="#64748b" strokeWidth="1.1" />
            {/* Forearm & Gauntlet */}
            <path d="M 82 116 L 46 124 L 46 135 L 86 126 Z" fill="url(#vnArmorDark)" stroke="#475569" strokeWidth="1.1" />
            {/* Arm Energy Conduit */}
            <path d="M 122 108 L 84 120 L 48 128" fill="none" stroke="#2ee6c9" strokeWidth="1.2" strokeLinecap="round" />
            {/* Armored Hand firmly grasping the Staff */}
            <rect x="37" y="122" width="12" height="15" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
            <line x1="39" y1="125" x2="47" y2="125" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="39" y1="129" x2="47" y2="129" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="39" y1="133" x2="47" y2="133" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* ================= HIGH-TECH CARBON FLAGPOLE ================= */}
          <g id="vn-flagpole">
            {/* Vertical Carbon-Composite Staff */}
            <line x1="42" y1="18" x2="42" y2="206" stroke="url(#vnFlagPole)" strokeWidth="3.6" strokeLinecap="round" />
            {/* Aerospace Accent Rings */}
            <circle cx="42" cy="18" r="4.8" fill="#ffd23e" stroke="#ff7a1a" strokeWidth="0.8" />
            <circle cx="42" cy="13" r="2.4" fill="#7dfce7" className="animate-ping" style={{ transformOrigin: "42px 13px" }} />
            <circle cx="42" cy="13" r="1.8" fill="#ffffff" />
            <line x1="40" y1="28" x2="44" y2="28" stroke="#2ee6c9" strokeWidth="1.2" />
            <line x1="40" y1="88" x2="44" y2="88" stroke="#2ee6c9" strokeWidth="1.2" />
            <line x1="40" y1="148" x2="44" y2="148" stroke="#2ee6c9" strokeWidth="1.2" />
          </g>

          {/* ================= THE NATIONAL FLAG OF VIETNAM (CỜ ĐỎ SAO VÀNG) ================= */}
          <g id="vn-national-flag" className="vn-flag-wave">
            {/* Silky Aerodynamic Flag Fabric (Waving in Microgravity Solar Wind) */}
            <path
              d="M 42 26 
                 C 64 21, 88 31, 118 25 
                 C 120 46, 116 66, 118 85 
                 C 88 91, 64 81, 42 86 Z"
              fill="url(#vnAstroFlagRed)"
              stroke="#da251d"
              strokeWidth="0.8"
            />

            {/* Fabric Wave Shadow & Silk Shine Overlay */}
            <path
              d="M 42 26 
                 C 64 21, 88 31, 118 25 
                 C 120 46, 116 66, 118 85 
                 C 88 91, 64 81, 42 86 Z"
              fill="url(#vnFlagRippleOverlay)"
            />

            {/* Radiant Golden 5-Point Star (Mathematically Proportioned) */}
            <polygon
              points="
                80,39
                83.9,50.7
                96.2,50.7
                86.3,58.0
                90.0,69.8
                80,62.6
                70.0,69.8
                73.7,58.0
                63.8,50.7
                76.1,50.7
              "
              fill="url(#vnAstroGoldStar)"
              stroke="#ffd23e"
              strokeWidth="0.8"
            />

            {/* Central Star Core Glow */}
            <circle cx="80" cy="56" r="3.5" fill="#ffffff" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
export default VietnameseAstronaut;
