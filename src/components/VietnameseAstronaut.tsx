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
        @keyframes vnAstroZeroG {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1.2deg);
          }
        }
        @keyframes vnFlagClothWave {
          0%, 100% {
            transform: scaleX(1) skewY(0deg);
          }
          25% {
            transform: scaleX(0.97) skewY(1.5deg);
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
            transform: scaleY(1.25) scaleX(1.1);
          }
        }
        @keyframes vnVisorGlint {
          0%, 75%, 100% {
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
            transform: scale(1.25);
          }
        }
        .vn-astro-float {
          animation: vnAstroZeroG 4.4s ease-in-out infinite;
        }
        .vn-flag-wave {
          transform-origin: 95px 55px;
          animation: vnFlagClothWave 3s ease-in-out infinite;
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
          🇻🇳 {lang === "vi" ? "Phi Hành Gia Việt Nam" : "Vietnamese Astronaut"}
        </div>
      )}

      {/* Main Astronaut SVG Artwork (Proper Proportions, Natural Arms, Balanced Legs, Solid Star Flag) */}
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

          {/* Golden Star Luminous Gradient (Pure solid yellow star) */}
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

        {/* Ambient Zero-G Floating Group */}
        <g className="vn-astro-float">
          {/* ================= BACKGROUND STARDUST & SPARKS ================= */}
          <g opacity="0.85">
            <circle cx="14" cy="160" r="1.5" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="205" cy="112" r="1.4" fill="#ffd23e" className="vn-sparkle-2" />
            <circle cx="190" cy="195" r="1.6" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="28" cy="22" r="1.3" fill="#ffffff" className="vn-sparkle-2" />
          </g>

          {/* ================= BACKPACK (PLSS - LIFE SUPPORT) ================= */}
          <g id="vn-backpack">
            {/* Soft Rounded Backpack Chassis */}
            <rect x="168" y="72" width="20" height="54" rx="9" fill="#334155" stroke="#475569" strokeWidth="1.3" />
            {/* Rounded Oxygen Cylinder Tank */}
            <rect x="173" y="78" width="10" height="32" rx="5" fill="#475569" stroke="#64748b" strokeWidth="0.9" />
            <line x1="175" y1="88" x2="181" y2="88" stroke="#2ee6c9" strokeWidth="1.1" opacity="0.85" />
            <line x1="175" y1="98" x2="181" y2="98" stroke="#2ee6c9" strokeWidth="1.1" opacity="0.85" />

            {/* High-gain Comm Antenna with Pulsing Beacon */}
            <line x1="180" y1="72" x2="194" y2="44" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="194" cy="44" r="3" fill="#ffd23e" />
            <circle cx="194" cy="44" r="1.7" fill="#ff4d6d" className="animate-ping" style={{ transformOrigin: "194px 44px" }} />

            {/* Thruster Nozzle & Soft Ion Plasma Flame */}
            <polygon points="172,126 169,133 178,133 176,126" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <path d="M 170 133 C 173 154, 174 154, 177 133 Z" fill="url(#vnIonFlame)" className="vn-ion-flame" />
          </g>

          {/* ================= SOFT BALANCED LEGS & MOON BOOTS (IDENTICAL SIZE) ================= */}
          <g id="vn-legs">
            {/* Left Leg (Soft zero-G bend, balanced width 12.5px) */}
            <path
              d="M 135 142 C 128 154, 124 168, 126 186"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12.5"
              strokeLinecap="round"
            />
            {/* Left Rounded Knee Pad */}
            <ellipse cx="126" cy="168" rx="6" ry="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Left Moon Boot Body */}
            <path
              d="M 121 188 C 118 196, 114 200, 116 205 C 120 208, 132 208, 134 204 C 135 199, 130 190, 128 188 Z"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1.1"
            />
            {/* Left Glowing Boot Sole Cushion */}
            <path d="M 115 205 C 121 208, 129 208, 134 204" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Right Leg (Soft zero-G bend, IDENTICAL width 12.5px) */}
            <path
              d="M 155 142 C 162 154, 166 168, 164 186"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12.5"
              strokeLinecap="round"
            />
            {/* Right Rounded Knee Pad (Identical size) */}
            <ellipse cx="164" cy="168" rx="6" ry="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Right Moon Boot Body (Identical size) */}
            <path
              d="M 159 188 C 157 196, 156 200, 158 205 C 162 208, 174 208, 176 204 C 177 199, 172 190, 170 188 Z"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1.1"
            />
            {/* Right Glowing Boot Sole Cushion */}
            <path d="M 157 205 C 163 208, 171 208, 176 204" stroke="#2ee6c9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>

          {/* ================= PUFFY SPACESUIT TORSO ================= */}
          <g id="vn-torso">
            {/* Soft Rounded Body Shape */}
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
            {/* Heartbeat / Arc-Reactor Pulse Core */}
            <circle cx="145" cy="112" r="4" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1.1" />
            <circle cx="145" cy="112" r="2.2" fill="#7dfce7" className="animate-pulse" />
            <circle cx="145" cy="112" r="1" fill="#ffffff" />
            {/* Mini Telemetry Status Indicators */}
            <line x1="138" y1="119" x2="152" y2="119" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

            {/* Soft Padded Utility Belt */}
            <rect x="129" y="137" width="32" height="6.5" rx="3" fill="#475569" stroke="#334155" strokeWidth="0.9" />
            <rect x="140" y="138" width="10" height="4.5" rx="1.5" fill="#2ee6c9" opacity="0.9" />
          </g>

          {/* ================= FLEXIBLE CORRUGATED OXYGEN HOSES ================= */}
          <g id="vn-oxygen-hoses">
            <path
              d="M 172 90 C 182 106, 166 120, 154 114"
              fill="none"
              stroke="#475569"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            <path
              d="M 172 90 C 182 106, 166 120, 154 114"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3.8"
              strokeDasharray="2 2.5"
              strokeLinecap="round"
            />
          </g>

          {/* ================= RIGHT ARM (VIEWER'S RIGHT: NATURAL BALANCED LENGTH) ================= */}
          <g id="vn-right-arm">
            {/* Soft Puffy Arm with Natural Bend (Balanced length ~30px) */}
            <path
              d="M 160 102 C 172 108, 178 116, 172 128"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fabric Wrinkle Shading at the Elbow */}
            <path
              d="M 172 114 C 174 117, 173 120, 170 122"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* 🇻🇳 VIETNAMESE NATIONAL MISSION PATCH ON SHOULDER */}
            <rect x="166" y="104" width="11" height="7.5" rx="1.5" fill="#da251d" stroke="#ffd23e" strokeWidth="0.7" />
            <polygon
              points="171.5,105.5 172.2,107 173.8,107 172.5,108 173,109.5 171.5,108.5 170,109.5 170.5,108 169.2,107 170.8,107"
              fill="#ffd23e"
            />

            {/* Soft Rounded Astronaut Glove (Relaxed Wave in Space) */}
            <circle cx="170" cy="132" r="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.1" />
            <path d="M 168 130 C 170 128, 173 129, 174 132" stroke="#94a3b8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>

          {/* ================= HELMET & GLOSSY SUN VISOR ================= */}
          <g id="vn-helmet">
            {/* Padded Neck Cushion Ring */}
            <ellipse cx="145" cy="94" rx="20" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.3" />

            {/* Soft Perfectly Rounded Helmet Dome */}
            <ellipse cx="145" cy="68" rx="29" ry="29" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Rounded Ear Communication Cushions */}
            <rect x="114" y="61" width="5.5" height="14" rx="2.5" fill="#64748b" stroke="#475569" strokeWidth="1" />
            <circle cx="117" cy="66" r="1.2" fill="#2ee6c9" />
            <rect x="171" y="61" width="5.5" height="14" rx="2.5" fill="#64748b" stroke="#475569" strokeWidth="1" />

            {/* Big Glossy Panoramic Gold Visor */}
            <path
              d="M 122 66 C 122 52, 164 52, 164 66 C 164 82, 122 82, 122 66 Z"
              fill="url(#vnGlossyVisor)"
              stroke="#f59e0b"
              strokeWidth="1.3"
            />

            {/* Visor Glossy Specular Arc Reflections */}
            <path
              d="M 128 60 C 136 55, 152 55, 160 60 C 152 57, 136 57, 128 60 Z"
              fill="#ffffff"
              opacity="0.8"
              className="vn-visor-glint"
            />
            {/* Cute Rounded Star Gleam in the Visor */}
            <circle cx="130" cy="67" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="155" cy="71" r="1.5" fill="#ffffff" opacity="0.65" />

            {/* Chin Vocoder & Oxygen Intake Vent */}
            <rect x="139" y="86" width="12" height="5" rx="2.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <line x1="142" y1="88.5" x2="148" y2="88.5" stroke="#2ee6c9" strokeWidth="0.8" strokeLinecap="round" />
          </g>

          {/* ================= PROMINENT METALLIC FLAGPOLE (CỘT CỜ KIM LOẠI RÕ NÉT) ================= */}
          <g id="vn-flagpole">
            {/* Solid Polished Titanium Staff with High Contrast */}
            <rect x="93" y="12" width="4.5" height="198" rx="2.2" fill="url(#vnPoleMetallic)" stroke="#64748b" strokeWidth="1" />
            {/* Center Specular Highlight Line */}
            <line x1="94.2" y1="14" x2="94.2" y2="208" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

            {/* Radiant Golden Sphere Finial on Top of Flagpole */}
            <circle cx="95" cy="12" r="7" fill="url(#vnGoldSphere)" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="92.5" cy="9.5" r="2" fill="#ffffff" opacity="0.85" />
            {/* Gold Star Tip Finial */}
            <polygon
              points="95,1 96.2,4 99.5,4 97,5.8 98,9 95,7.2 92,9 93,5.8 90.5,4 93.8,4"
              fill="#ffd23e"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />

            {/* Visible Metal Flag Rings / Grommets Clamping the Flag onto the Pole */}
            <rect x="91" y="25" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" />
            <rect x="91" y="53" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" />
            <rect x="91" y="82" width="8" height="3.5" rx="1.7" fill="#ffd23e" stroke="#d97706" strokeWidth="0.7" />
          </g>

          {/* ================= THE NATIONAL FLAG OF VIETNAM (CỜ ĐỎ SAO VÀNG NGUYÊN BẢN) ================= */}
          <g id="vn-national-flag" className="vn-flag-wave">
            {/* Silky Aerodynamic Flag Fabric (Waving to the Left from the Pole) */}
            <path
              d="M 95 26 
                 C 75 32, 45 20, 22 28 
                 C 20 46, 25 66, 22 84 
                 C 45 78, 75 90, 95 84 Z"
              fill="url(#vnFlagSilkRed)"
              stroke="#da251d"
              strokeWidth="0.8"
            />

            {/* Silky Wave Shading Sheen Overlay */}
            <path
              d="M 95 26 
                 C 75 32, 45 20, 22 28 
                 C 20 46, 25 66, 22 84 
                 C 45 78, 75 90, 95 84 Z"
              fill="url(#vnWaveSheen)"
            />

            {/* PURE SOLID GOLDEN 5-POINT STAR (KHÔNG CÓ CHẤM TRÒN - CHUẨN CỜ TỔ QUỐC) */}
            <polygon
              points="
                58.5,39
                62.1,50.0
                73.7,50.1
                64.4,56.9
                67.9,67.9
                58.5,61.2
                49.1,67.9
                52.6,56.9
                43.3,50.1
                54.9,50.0
              "
              fill="url(#vnGoldStar)"
              stroke="#ffd23e"
              strokeWidth="0.8"
            />
          </g>

          {/* ================= LEFT ARM HOLDING FLAGPOLE (NATURAL HUMAN REACH ~35px) ================= */}
          <g id="vn-left-arm-holding">
            {/* Soft Puffy Arm Reaching Comfortably to the Flagpole (Natural human length!) */}
            <path
              d="M 130 102 C 120 108, 112 114, 110 120 C 106 126, 98 122, 95 110"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fabric Wrinkle Shading at the Elbow */}
            <path
              d="M 112 116 C 110 119, 111 122, 114 124"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Puffy Glove Cuff */}
            <ellipse cx="101" cy="112" rx="3.5" ry="6" fill="#64748b" stroke="#475569" strokeWidth="0.8" />

            {/* Puffy Hand Firmly Gripping Around the Pole (Drawn OVER the Flagpole) */}
            <rect x="90" y="104" width="11" height="14" rx="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.1" />

            {/* Defined Puffy Fingers Curled Around Front of the Pole */}
            <rect x="90" y="106" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" />
            <rect x="90" y="109.5" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" />
            <rect x="90" y="113" width="7" height="2.5" rx="1.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.7" />

            {/* Thumb Wrapping Around */}
            <path d="M 94 108 C 97 108, 98 111, 96 114" fill="#f8fafc" stroke="#64748b" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
export default VietnameseAstronaut;
