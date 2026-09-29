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
          transform-origin: 50px 58px;
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

      {/* Main Astronaut SVG Artwork (Curved, Soft Puffy Spacesuit, Prominent Flagpole) */}
      <svg
        viewBox="0 0 240 240"
        className={cn(
          "h-full w-full overflow-visible transition-transform duration-300 group-hover:scale-105",
          boostEffect && "scale-110",
        )}
      >
        <defs>
          {/* Vietnam Flag Crimson Silk Gradient */}
          <linearGradient id="vnFlagSilkRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#da251d" />
            <stop offset="35%" stopColor="#f0382d" />
            <stop offset="68%" stopColor="#d31d14" />
            <stop offset="100%" stopColor="#ba150d" />
          </linearGradient>

          {/* Golden Star Luminous Gradient */}
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
            <stop offset="26%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="48%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="76%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
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
            <circle cx="24" cy="170" r="1.5" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="218" cy="118" r="1.4" fill="#ffd23e" className="vn-sparkle-2" />
            <circle cx="204" cy="198" r="1.6" fill="#7dfce7" className="vn-sparkle-1" />
            <circle cx="38" cy="22" r="1.3" fill="#ffffff" className="vn-sparkle-2" />
          </g>

          {/* ================= BACKPACK (PLSS - LIFE SUPPORT) ================= */}
          <g id="vn-backpack">
            {/* Soft Rounded Backpack Chassis */}
            <rect x="174" y="76" width="24" height="64" rx="10" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            {/* Rounded Oxygen Cylinder Tank */}
            <rect x="180" y="82" width="13" height="38" rx="6.5" fill="#475569" stroke="#64748b" strokeWidth="1" />
            <line x1="182" y1="94" x2="191" y2="94" stroke="#2ee6c9" strokeWidth="1.2" opacity="0.85" />
            <line x1="182" y1="106" x2="191" y2="106" stroke="#2ee6c9" strokeWidth="1.2" opacity="0.85" />

            {/* High-gain Comm Antenna with Pulsing Beacon */}
            <line x1="188" y1="76" x2="204" y2="44" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="204" cy="44" r="3.5" fill="#ffd23e" />
            <circle cx="204" cy="44" r="2" fill="#ff4d6d" className="animate-ping" style={{ transformOrigin: "204px 44px" }} />

            {/* Thruster Nozzle & Soft Ion Plasma Flame */}
            <polygon points="178,140 175,148 185,148 183,140" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <path d="M 176 148 C 180 176, 181 176, 184 148 Z" fill="url(#vnIonFlame)" className="vn-ion-flame" />
          </g>

          {/* ================= SOFT PUFFY LEGS & MOON BOOTS ================= */}
          <g id="vn-legs">
            {/* Left Fore-Leg (Puffy bent knee in microgravity) */}
            <path
              d="M 138 152 C 130 166, 124 178, 128 190"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="15"
              strokeLinecap="round"
            />
            {/* Rounded Knee Pad */}
            <ellipse cx="127" cy="184" rx="7.5" ry="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Soft Puffy Moon Boot */}
            <path
              d="M 124 192 C 121 204, 114 210, 117 216 C 122 220, 137 219, 140 214 C 142 208, 136 196, 133 192 Z"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Glowing Boot Sole Cushion */}
            <path d="M 116 216 C 123 219, 133 219, 140 214" stroke="#2ee6c9" strokeWidth="2.4" strokeLinecap="round" fill="none" />

            {/* Right Aft-Leg (Softly trailing in zero-G) */}
            <path
              d="M 160 152 C 166 166, 170 178, 168 188"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Rounded Knee Pad */}
            <ellipse cx="168" cy="182" rx="6.5" ry="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Soft Puffy Moon Boot */}
            <path
              d="M 166 190 C 168 200, 172 206, 176 212 C 180 215, 192 213, 192 208 C 192 203, 178 194, 174 190 Z"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Glowing Boot Sole Cushion */}
            <path d="M 174 212 C 180 214, 188 213, 193 208" stroke="#2ee6c9" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>

          {/* ================= PUFFY SPACESUIT TORSO ================= */}
          <g id="vn-torso">
            {/* Soft Rounded Body Shape */}
            <path
              d="M 132 102 
                 C 124 116, 122 140, 132 152 
                 C 142 162, 164 162, 172 152 
                 C 182 140, 180 116, 172 102 
                 C 162 106, 142 106, 132 102 Z"
              fill="url(#vnPuffySuit)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Soft Padded Chest Utility Panel */}
            <rect x="138" y="112" width="28" height="25" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Heartbeat / Arc-Reactor Pulse Core */}
            <circle cx="152" cy="121" r="5" fill="#0f172a" stroke="#2ee6c9" strokeWidth="1.2" />
            <circle cx="152" cy="121" r="2.8" fill="#7dfce7" className="animate-pulse" />
            <circle cx="152" cy="121" r="1.2" fill="#ffffff" />
            {/* Mini Telemetry Status Indicators */}
            <line x1="143" y1="130" x2="161" y2="130" stroke="#2ee6c9" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

            {/* Soft Padded Utility Belt */}
            <rect x="132" y="147" width="40" height="7.5" rx="3.5" fill="#475569" stroke="#334155" strokeWidth="1" />
            <rect x="146" y="148" width="12" height="5.5" rx="2" fill="#2ee6c9" opacity="0.9" />
          </g>

          {/* ================= FLEXIBLE CORRUGATED OXYGEN HOSES ================= */}
          {/* Classic human astronaut life-support breathing hoses! */}
          <g id="vn-oxygen-hoses">
            {/* Main Corrugated Hose from Backpack to Chest */}
            <path
              d="M 180 98 C 196 118, 176 136, 160 128"
              fill="none"
              stroke="#475569"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 180 98 C 196 118, 176 136, 160 128"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="4.5"
              strokeDasharray="2 3"
              strokeLinecap="round"
            />

            {/* Secondary Air Hose from Helmet Base to Backpack */}
            <path
              d="M 170 100 C 182 105, 184 115, 178 122"
              fill="none"
              stroke="#64748b"
              strokeWidth="3.2"
              strokeDasharray="1.5 2.5"
              strokeLinecap="round"
            />
          </g>

          {/* ================= LEFT ARM WITH VIETNAMESE FLAG PATCH ================= */}
          <g id="vn-left-arm">
            {/* Soft Puffy Left Arm Floating in Zero-G */}
            <path
              d="M 170 106 C 186 115, 194 126, 188 142"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* 🇻🇳 VIETNAMESE NATIONAL MISSION PATCH ON SHOULDER */}
            <rect x="176" y="112" width="13" height="9" rx="2" fill="#da251d" stroke="#ffd23e" strokeWidth="0.9" />
            <polygon
              points="182.5,114 183.3,116 185.5,116 183.7,117.3 184.4,119.3 182.5,118 180.6,119.3 181.3,117.3 179.5,116 181.7,116"
              fill="#ffd23e"
            />

            {/* Soft Rounded Astronaut Glove (Relaxed Wave in Space) */}
            <circle cx="186" cy="144" r="6.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <path d="M 184 142 C 186 140, 190 141, 191 144" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>

          {/* ================= HELMET & GLOSSY SUN VISOR ================= */}
          <g id="vn-helmet">
            {/* Padded Neck Cushion Ring */}
            <ellipse cx="152" cy="101" rx="22" ry="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.4" />

            {/* Soft Perfectly Rounded Helmet Dome */}
            <ellipse cx="152" cy="74" rx="33" ry="33" fill="url(#vnPuffySuit)" stroke="#cbd5e1" strokeWidth="1.6" />

            {/* Rounded Ear Communication Cushions */}
            <rect x="117" y="66" width="6" height="16" rx="3" fill="#64748b" stroke="#475569" strokeWidth="1" />
            <circle cx="120" cy="72" r="1.4" fill="#2ee6c9" />
            <rect x="181" y="66" width="6" height="16" rx="3" fill="#64748b" stroke="#475569" strokeWidth="1" />

            {/* Big Glossy Panoramic Gold Visor */}
            <path
              d="M 127 72 C 127 55, 172 55, 172 72 C 172 90, 127 90, 127 72 Z"
              fill="url(#vnGlossyVisor)"
              stroke="#f59e0b"
              strokeWidth="1.4"
            />

            {/* Visor Glossy Specular Arc Reflections */}
            <path
              d="M 134 65 C 142 59, 160 59, 167 65 C 160 62, 142 62, 134 65 Z"
              fill="#ffffff"
              opacity="0.8"
              className="vn-visor-glint"
            />
            {/* Cute Rounded Star Gleam in the Visor */}
            <circle cx="136" cy="72" r="2.8" fill="#ffffff" opacity="0.85" />
            <circle cx="163" cy="76" r="1.6" fill="#ffffff" opacity="0.65" />

            {/* Chin Vocoder & Oxygen Intake Vent */}
            <rect x="145" y="92" width="14" height="6" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />
            <line x1="148" y1="95" x2="156" y2="95" stroke="#2ee6c9" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* ================= PROMINENT METALLIC FLAGPOLE (CỘT CỜ KIM LOẠI RÕ NÉT) ================= */}
          <g id="vn-flagpole">
            {/* Solid Polished Titanium Staff with High Contrast */}
            <rect x="47.5" y="14" width="5" height="210" rx="2.5" fill="url(#vnPoleMetallic)" stroke="#64748b" strokeWidth="1.2" />
            {/* Center Specular Highlight Line */}
            <line x1="49" y1="16" x2="49" y2="222" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

            {/* Radiant Golden Sphere Finial on Top of Flagpole */}
            <circle cx="50" cy="14" r="7.5" fill="url(#vnGoldSphere)" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="47.5" cy="11.5" r="2.2" fill="#ffffff" opacity="0.85" />
            {/* Gold Star Tip Finial */}
            <polygon
              points="50,2 51.4,5.5 55,5.5 52.2,7.5 53.4,11 50,9 46.6,11 47.8,7.5 45,5.5 48.6,5.5"
              fill="#ffd23e"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />

            {/* Visible Metal Flag Rings / Grommets Clamping the Flag onto the Pole */}
            <rect x="45.5" y="27" width="9" height="4" rx="2" fill="#ffd23e" stroke="#d97706" strokeWidth="0.8" />
            <rect x="45.5" y="57" width="9" height="4" rx="2" fill="#ffd23e" stroke="#d97706" strokeWidth="0.8" />
            <rect x="45.5" y="87" width="9" height="4" rx="2" fill="#ffd23e" stroke="#d97706" strokeWidth="0.8" />
          </g>

          {/* ================= THE NATIONAL FLAG OF VIETNAM (CỜ ĐỎ SAO VÀNG) ================= */}
          <g id="vn-national-flag" className="vn-flag-wave">
            {/* Silky Aerodynamic Flag Fabric (Waving Proudly from the Pole) */}
            <path
              d="M 50 28 
                 C 74 22, 104 34, 132 26 
                 C 135 46, 130 68, 132 86 
                 C 104 94, 74 82, 50 88 Z"
              fill="url(#vnFlagSilkRed)"
              stroke="#da251d"
              strokeWidth="0.8"
            />

            {/* Silky Wave Shading Sheen Overlay */}
            <path
              d="M 50 28 
                 C 74 22, 104 34, 132 26 
                 C 135 46, 130 68, 132 86 
                 C 104 94, 74 82, 50 88 Z"
              fill="url(#vnWaveSheen)"
            />

            {/* Radiant Golden 5-Point Star (Centered Exactly on the Flag) */}
            <polygon
              points="
                91,39
                94.9,50.7
                107.2,50.7
                97.3,58.0
                101.0,69.8
                91,62.6
                81.0,69.8
                84.7,58.0
                74.8,50.7
                87.1,50.7
              "
              fill="url(#vnGoldStar)"
              stroke="#ffd23e"
              strokeWidth="0.8"
            />

            {/* Central Star Core Glow */}
            <circle cx="91" cy="56" r="3.5" fill="#ffffff" opacity="0.65" />
          </g>

          {/* ================= RIGHT ARM CURVING TO GRASP FLAGPOLE (NATURAL BENT ELBOW) ================= */}
          <g id="vn-right-arm">
            {/* Soft Puffy Arm Curving with Bent Elbow (NO STIFF ROBOT PIPE!) */}
            <path
              d="M 134 108 C 118 116, 106 126, 100 134 C 92 142, 70 132, 52 118"
              fill="none"
              stroke="url(#vnPuffySuit)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Fabric Wrinkle Shading at the Elbow */}
            <path
              d="M 104 128 C 101 133, 103 138, 107 140"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Puffy Glove Cuff */}
            <ellipse cx="60" cy="122" rx="4.5" ry="7.5" fill="#64748b" stroke="#475569" strokeWidth="1" />

            {/* Puffy Hand Firmly Gripping Around the Pole (Drawn OVER the Flagpole) */}
            <rect x="44" y="110" width="13" height="16" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.3" />

            {/* Defined Puffy Fingers Curled Around Front of the Pole */}
            <rect x="44" y="112" width="8.5" height="3" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
            <rect x="44" y="116" width="8.5" height="3" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
            <rect x="44" y="120" width="8.5" height="3" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />

            {/* Thumb Wrapping Around */}
            <path d="M 48 115 C 53 115, 55 119, 52 123" fill="#f8fafc" stroke="#64748b" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
export default VietnameseAstronaut;
