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
        "h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-44 lg:w-44",
        className,
      )}
    >
      <style>{`
        /* Authentic Wandering 2D Zero-G Orbit Drift (Quỹ Đạo Lơ Lửng Bất Ổn - Không Bị Lên Xuống) */
        @keyframes vnErraticOrbitDrift {
          0% {
            transform: translate3d(0px, 0px, 0) rotate(-1.5deg);
          }
          16% {
            transform: translate3d(9px, -3px, 0) rotate(1.8deg);
          }
          32% {
            transform: translate3d(14px, 3px, 0) rotate(3deg);
          }
          48% {
            transform: translate3d(4px, 6px, 0) rotate(0.8deg);
          }
          63% {
            transform: translate3d(-7px, 3px, 0) rotate(-2deg);
          }
          77% {
            transform: translate3d(-14px, -2px, 0) rotate(-4.2deg);
          }
          90% {
            transform: translate3d(-6px, -5px, 0) rotate(-3deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) rotate(-1.5deg);
          }
        }
        @keyframes vnLegsZeroG {
          0%, 100% {
            transform: rotate(0deg);
          }
          32% {
            transform: rotate(-1.8deg);
          }
          77% {
            transform: rotate(1.6deg);
          }
        }
        @keyframes vnArmSway {
          0%, 100% {
            transform: rotate(0deg);
          }
          40% {
            transform: rotate(2deg);
          }
          80% {
            transform: rotate(-1.6deg);
          }
        }
        @keyframes vnFlagClothWave {
          0%, 100% {
            transform: scaleX(1) skewY(0deg);
          }
          25% {
            transform: scaleX(0.97) skewY(1.8deg);
          }
          50% {
            transform: scaleX(1.03) skewY(-1.2deg);
          }
          75% {
            transform: scaleX(0.98) skewY(0.9deg);
          }
        }
        @keyframes vnIonFlamePulse {
          0%, 100% {
            opacity: 0.75;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.3) scaleX(1.1);
          }
        }
        @keyframes vnVisorGlint {
          0%, 70%, 100% {
            opacity: 0.45;
            transform: translateX(0);
          }
          85% {
            opacity: 0.95;
            transform: translateX(3px);
          }
        }
        @keyframes vnStarSparkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        @keyframes vnFloatingParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-12px, 18px) scale(0.3);
            opacity: 0;
          }
        }
        .vn-zero-g-float {
          animation: vnErraticOrbitDrift 9.6s ease-in-out infinite;
        }
        .vn-legs-sway {
          transform-origin: 145px 141px;
          animation: vnLegsZeroG 8.2s ease-in-out infinite;
        }
        .vn-arm-sway {
          transform-origin: 158px 100px;
          animation: vnArmSway 7.4s ease-in-out infinite;
        }
        .vn-flag-wave {
          transform-origin: 86px 55px;
          animation: vnFlagClothWave 3.2s ease-in-out infinite;
        }
        .vn-ion-flame {
          transform-origin: center top;
          animation: vnIonFlamePulse 0.35s ease-in-out infinite alternate;
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
        .vn-drifting-particle-1 {
          animation: vnFloatingParticle 2.2s linear infinite;
        }
        .vn-drifting-particle-2 {
          animation: vnFloatingParticle 2.6s linear infinite 0.8s;
        }
      `}</style>

      {/* Cyber Radio Speech Bubble */}
      {showQuote && (
        <div className="animate-pop-in pointer-events-none absolute -top-16 left-1/2 z-40 w-52 -translate-x-1/2 sm:-top-20 sm:w-60 md:w-64">
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
          {/* Bubble tail indicator */}
          <div className="mx-auto h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-void-950/95" />
        </div>
      )}

      {/* Hover Information Tooltip */}
      {!showQuote && (
        <div className="pointer-events-none absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-ice-500/40 bg-void-950/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-ice-300 opacity-0 shadow-[0_0_12px_rgba(46,230,201,0.3)] backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 sm:text-[10px]">
          🇻🇳 {lang === "vi" ? "Phi Hành Gia Việt Nam • Không Trọng Lực" : "Vietnamese Astronaut • Zero-G Float"}
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
        <g className="vn-zero-g-float">
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
          <g id="vn-zero-g-legs" className="vn-legs-sway" transform="rotate(-5 145 120)">
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

          {/* ================= RIGHT ARM (RELAXED WEIGHTLESS FLOAT) ================= */}
          <g id="vn-right-arm" className="vn-arm-sway">
            {/* Soft Puffy Arm Floating Gently in Zero-G */}
            <path
              d="M 158 100 C 172 105, 178 114, 172 126"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fabric Wrinkle at Elbow */}
            <path
              d="M 171 112 C 173 115, 172 118, 169 120"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* 🇻🇳 VIETNAMESE NATIONAL MISSION PATCH ON SHOULDER */}
            <rect x="165" y="102" width="11" height="7.5" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" />
            <polygon
              points="170.5,103.5 171.2,105 172.8,105 171.5,106 172,107.5 170.5,106.5 169,107.5 169.5,106 168.2,105 169.8,105"
              fill="#ffd23e"
            />

            {/* Soft Rounded Astronaut Glove (Floating Relaxed) */}
            <circle cx="170" cy="130" r="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
            <path d="M 168 128 C 170 126, 173 127, 174 130" stroke="#94a3b8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>

          {/* ================= HELMET & GLOSSY VISOR (SLIGHT ZERO-G TILT) ================= */}
          <g id="vn-helmet" transform="rotate(-4 145 68)">
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

            {/* Vocoder Chin Vent */}
            <rect x="139" y="86" width="12" height="5" rx="2.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <line x1="142" y1="88.5" x2="148" y2="88.5" stroke="#2ee6c9" strokeWidth="0.8" strokeLinecap="round" />
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
