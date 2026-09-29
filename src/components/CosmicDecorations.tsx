import React from "react";
import { cn } from "../utils/cn";

export function CosmicDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* Dynamic CSS styles for rotating planets, orbiting moons, and streaking comets */}
      <style>{`
        /* Planet cloud & surface rotations */
        @keyframes planetSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes planetCloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }

        @keyframes magmaPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(255, 90, 20, 0.45)) drop-shadow(0 0 25px rgba(255, 60, 0, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(255, 120, 30, 0.75)) drop-shadow(0 0 45px rgba(255, 80, 0, 0.35));
          }
        }

        @keyframes iceGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 14px rgba(46, 230, 201, 0.4)) drop-shadow(0 0 28px rgba(20, 180, 160, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(77, 252, 231, 0.7)) drop-shadow(0 0 40px rgba(46, 230, 201, 0.35));
          }
        }

        /* Moon orbital revolutions */
        @keyframes moonOrbitSaturn {
          0% {
            transform: rotate(0deg) translateX(58px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(58px) rotate(-360deg);
          }
        }

        @keyframes moonOrbitEarth {
          0% {
            transform: rotate(0deg) translateX(46px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(46px) rotate(-360deg);
          }
        }

        /* Streaking Comets (Sao chổi bay) across the cosmos */
        @keyframes cometStreak1 {
          0% {
            transform: translate(-15vw, -10vh) rotate(28deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translate(115vw, 65vh) rotate(28deg);
            opacity: 1;
          }
          35%, 100% {
            transform: translate(115vw, 65vh) rotate(28deg);
            opacity: 0;
          }
        }

        @keyframes cometStreak2 {
          0%, 45% {
            transform: translate(110vw, 15vh) rotate(-145deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          75% {
            transform: translate(-20vw, 85vh) rotate(-145deg);
            opacity: 1;
          }
          80%, 100% {
            transform: translate(-20vw, 85vh) rotate(-145deg);
            opacity: 0;
          }
        }

        /* Quick Shooting Stars (Sao băng) */
        @keyframes shootingStar1 {
          0%, 65% {
            transform: translate(25vw, -5vh) rotate(40deg) scaleX(0);
            opacity: 0;
          }
          68% {
            transform: translate(45vw, 15vh) rotate(40deg) scaleX(1);
            opacity: 1;
          }
          72%, 100% {
            transform: translate(65vw, 35vh) rotate(40deg) scaleX(0.2);
            opacity: 0;
          }
        }

        @keyframes celestialOrbitPulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
      `}</style>

      {/* ================= FAINT SOLAR SYSTEM ORBIT RINGS ================= */}
      <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" style={{ animation: "celestialOrbitPulse 8s ease-in-out infinite" }}>
        {/* Giant Elliptical Orbit Paths framing the center command deck */}
        <ellipse cx="50%" cy="50%" rx="48vw" ry="46vh" fill="none" stroke="#7dfce7" strokeWidth="1" strokeDasharray="6 12" />
        <ellipse cx="50%" cy="50%" rx="38vw" ry="36vh" fill="none" stroke="#ffd23e" strokeWidth="0.8" strokeDasharray="4 16" />
        <ellipse cx="50%" cy="50%" rx="58vw" ry="54vh" fill="none" stroke="#ff7a1a" strokeWidth="0.8" strokeDasharray="8 20" />
      </svg>

      {/* ================= STREAKING COMETS (SAO CHỔI BAY) ================= */}
      {/* Comet 1: Cyan Ice Comet streaking from Top-Left to Bottom-Right */}
      <div
        className="absolute top-0 left-0 pointer-events-none z-15"
        style={{ animation: "cometStreak1 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite" }}
      >
        <svg viewBox="0 0 200 40" className="w-48 sm:w-64 h-auto overflow-visible">
          <defs>
            <linearGradient id="cometTailCyan" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="20%" stopColor="#7dfce7" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#2ee6c9" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#0891b2" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="cometHeadCyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#7dfce7" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Luminous Tail */}
          <polygon points="180 20 0 10 0 30" fill="url(#cometTailCyan)" />
          {/* Bright Core Nucleus */}
          <circle cx="180" cy="20" r="10" fill="url(#cometHeadCyan)" />
          <circle cx="180" cy="20" r="3.5" fill="#ffffff" />
          {/* Sparks */}
          <circle cx="140" cy="18" r="1.5" fill="#7dfce7" opacity="0.8" />
          <circle cx="100" cy="22" r="1.2" fill="#ffffff" opacity="0.6" />
          <circle cx="60" cy="19" r="1" fill="#2ee6c9" opacity="0.5" />
        </svg>
      </div>

      {/* Comet 2: Amber Magma Comet streaking across the lower cosmos */}
      <div
        className="absolute top-0 left-0 pointer-events-none z-15"
        style={{ animation: "cometStreak2 16s cubic-bezier(0.22, 0.1, 0.25, 1) infinite" }}
      >
        <svg viewBox="0 0 200 40" className="w-44 sm:w-56 h-auto overflow-visible">
          <defs>
            <linearGradient id="cometTailGold" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#ffd23e" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#ff7a1a" stopOpacity="0.4" />
              <stop offset="90%" stopColor="#f05423" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="cometHeadGold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#ffd23e" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon points="180 20 0 12 0 28" fill="url(#cometTailGold)" />
          <circle cx="180" cy="20" r="9" fill="url(#cometHeadGold)" />
          <circle cx="180" cy="20" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Micro Shooting Star Flash */}
      <div
        className="absolute top-0 left-0 pointer-events-none z-15"
        style={{ animation: "shootingStar1 7s ease-in-out infinite" }}
      >
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-ice-300 to-white shadow-[0_0_8px_#fff]" />
      </div>

      {/* ================= PLANETARY BODIES (HỆ HÀNH TINH QUANH MENU) ================= */}

      {/* 1. PLANET 1: SATURN / RINGED GAS GIANT (Sao Thổ Khổng Lồ với Vành Đai Tỏa Sáng) */}
      {/* Positioned at Lower-Right Corner */}
      <div className="absolute -bottom-8 -right-6 sm:bottom-4 sm:right-6 md:bottom-8 md:right-10 pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Orbiting Moon */}
          <div
            className="absolute z-20 flex h-3 w-3 items-center justify-center"
            style={{ animation: "moonOrbitSaturn 14s linear infinite" }}
          >
            <div className="h-2 w-2 rounded-full bg-ice-300 shadow-[0_0_8px_rgba(46,230,201,0.8)]" />
          </div>

          <svg viewBox="0 0 180 180" className="h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 overflow-visible filter drop-shadow-[0_0_30px_rgba(255,160,46,0.35)]">
            <defs>
              {/* Gas giant surface gradient */}
              <linearGradient id="saturnBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="25%" stopColor="#7c2d12" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="90%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              {/* Rings gradient */}
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd23e" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="55%" stopColor="#7dfce7" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#d97706" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ffd23e" stopOpacity="0.8" />
              </linearGradient>

              <clipPath id="saturnBackClip">
                <rect x="0" y="0" width="180" height="90" />
              </clipPath>
              <clipPath id="saturnFrontClip">
                <rect x="0" y="90" width="180" height="90" />
              </clipPath>
            </defs>

            {/* Back half of the ring (behind the planet) */}
            <g clipPath="url(#saturnBackClip)">
              <ellipse cx="90" cy="90" rx="82" ry="24" fill="none" stroke="url(#ringGrad)" strokeWidth="14" transform="rotate(-25 90 90)" opacity="0.65" />
              <ellipse cx="90" cy="90" rx="88" ry="26" fill="none" stroke="#7dfce7" strokeWidth="1.8" transform="rotate(-25 90 90)" opacity="0.8" />
            </g>

            {/* Planet Sphere */}
            <circle cx="90" cy="90" r="38" fill="url(#saturnBody)" />
            {/* Atmospheric cloud bands */}
            <g opacity="0.35" transform="rotate(-15 90 90)">
              <ellipse cx="90" cy="80" rx="36" ry="6" fill="#ffd23e" />
              <ellipse cx="90" cy="95" rx="37" ry="8" fill="#ff7a1a" />
              <ellipse cx="90" cy="110" rx="34" ry="5" fill="#f43f5e" />
            </g>
            {/* Planet Shadow / 3D Specular curve */}
            <ellipse cx="76" cy="76" rx="34" ry="34" fill="#ffffff" opacity="0.1" />
            <circle cx="90" cy="90" r="38" fill="none" stroke="rgba(255,210,62,0.4)" strokeWidth="1" />

            {/* Front half of the ring (in front of the planet) */}
            <g clipPath="url(#saturnFrontClip)">
              <ellipse cx="90" cy="90" rx="82" ry="24" fill="none" stroke="url(#ringGrad)" strokeWidth="14" transform="rotate(-25 90 90)" />
              <ellipse cx="90" cy="90" rx="88" ry="26" fill="none" stroke="#7dfce7" strokeWidth="2.2" transform="rotate(-25 90 90)" opacity="0.9" />
              <ellipse cx="90" cy="90" rx="72" ry="20" fill="none" stroke="#ffd23e" strokeWidth="1.2" transform="rotate(-25 90 90)" opacity="0.75" />
            </g>
          </svg>
        </div>
      </div>

      {/* 2. PLANET 2: TERRA / OCEAN LIFE WORLD (Hành tinh Xanh Sự Sống với Khí Quyển Hào Quang) */}
      {/* Positioned at Upper-Left Corner */}
      <div className="absolute top-4 left-3 sm:top-6 sm:left-8 md:top-8 md:left-12 pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Moon orbiting Terra */}
          <div
            className="absolute z-20 flex h-2.5 w-2.5 items-center justify-center"
            style={{ animation: "moonOrbitEarth 10s linear infinite" }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
          </div>

          <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 overflow-visible filter drop-shadow-[0_0_22px_rgba(46,230,201,0.5)]">
            <defs>
              <radialGradient id="terraOcean" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="85%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>
              <clipPath id="terraClip">
                <circle cx="50" cy="50" r="32" />
              </clipPath>
            </defs>

            {/* Atmosphere Halo Glow */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" className="animate-pulse" />
            <circle cx="50" cy="50" r="32" fill="url(#terraOcean)" />

            {/* Continents & Landmasses (clipped) */}
            <g clipPath="url(#terraClip)" opacity="0.85">
              {/* Green continents */}
              <path d="M 35 30 Q 42 22 52 28 Q 62 35 55 45 Q 45 52 35 45 Z" fill="#10b981" />
              <path d="M 52 50 Q 64 45 70 55 Q 68 68 58 65 Q 48 62 52 50 Z" fill="#059669" />
              <path d="M 28 55 Q 38 52 36 68 Q 25 72 26 60 Z" fill="#10b981" />
              {/* Swirling white cloud layers */}
              <path d="M 20 40 Q 40 35 60 42 Q 80 48 90 40" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round" />
              <path d="M 30 60 Q 55 58 75 66" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round" />
            </g>

            {/* Sunlight Specular Highlight */}
            <circle cx="38" cy="38" r="14" fill="#ffffff" opacity="0.25" />
          </svg>
        </div>
      </div>

      {/* 3. PLANET 3: MOLTEN VOID MAGMA WORLD (Hành tinh Lửa Dung Nham Rực Cháy) */}
      {/* Positioned at Lower-Left Corner */}
      <div
        className="absolute bottom-5 left-3 sm:bottom-8 sm:left-8 md:bottom-12 md:left-14 pointer-events-none"
        style={{ animation: "magmaPulse 4s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 overflow-visible">
          <defs>
            <radialGradient id="magmaCore" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffd23e" />
              <stop offset="35%" stopColor="#ff7a1a" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="95%" stopColor="#450a0a" />
              <stop offset="100%" stopColor="#180303" />
            </radialGradient>
            <clipPath id="magmaClip">
              <circle cx="50" cy="50" r="30" />
            </clipPath>
          </defs>

          {/* Outer Magma Heat Flare */}
          <circle cx="50" cy="50" r="33" fill="none" stroke="#ff7a1a" strokeWidth="2.5" opacity="0.8" />
          <circle cx="50" cy="50" r="30" fill="url(#magmaCore)" />

          {/* Molten Surface Fissures & Lava Veins */}
          <g clipPath="url(#magmaClip)">
            {/* Dark cooling basalt crust plates */}
            <circle cx="32" cy="42" r="12" fill="#1c0707" opacity="0.8" />
            <circle cx="64" cy="36" r="15" fill="#1c0707" opacity="0.8" />
            <circle cx="52" cy="68" r="14" fill="#1c0707" opacity="0.85" />
            {/* Glowing glowing lava rivers */}
            <path d="M 20 50 Q 40 45 50 35 Q 60 25 80 30" stroke="#ffd23e" strokeWidth="2" fill="none" opacity="0.95" />
            <path d="M 45 35 Q 55 55 45 75 Q 40 85 30 80" stroke="#ff7a1a" strokeWidth="2" fill="none" opacity="0.9" />
            <path d="M 55 55 Q 75 60 85 70" stroke="#ffd23e" strokeWidth="1.5" fill="none" opacity="0.85" />
          </g>

          <circle cx="40" cy="40" r="12" fill="#fff" opacity="0.2" />
        </svg>
      </div>

      {/* 4. PLANET 4: ICE CRYSTAL EXOPLANET (Hành tinh Băng Thanh Lam với Đai Tiểu Hành Tinh) */}
      {/* Positioned at Upper-Right Corner */}
      <div
        className="absolute top-14 right-3 sm:top-16 sm:right-8 md:top-20 md:right-12 pointer-events-none"
        style={{ animation: "iceGlowPulse 4.5s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 100 100" className="h-14 w-14 sm:h-18 sm:w-18 md:h-22 md:w-22 overflow-visible">
          <defs>
            <radialGradient id="iceCore" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="35%" stopColor="#7dfce7" />
              <stop offset="70%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </radialGradient>
            <clipPath id="iceClip">
              <circle cx="50" cy="50" r="26" />
            </clipPath>
          </defs>

          {/* Ice Aura */}
          <circle cx="50" cy="50" r="29" fill="none" stroke="#7dfce7" strokeWidth="1.8" opacity="0.8" />
          <circle cx="50" cy="50" r="26" fill="url(#iceCore)" />

          {/* Glacial Ridges & Crystalline Crags */}
          <g clipPath="url(#iceClip)" opacity="0.7">
            <polygon points="40 28 55 35 48 48 35 42" fill="#ffffff" opacity="0.8" />
            <polygon points="52 45 68 40 65 60 50 56" fill="#a5f3fc" opacity="0.7" />
            <polygon points="32 55 45 62 38 75 26 68" fill="#ffffff" opacity="0.6" />
          </g>

          {/* Miniature orbiting asteroid specks */}
          <circle cx="16" cy="46" r="1.5" fill="#7dfce7" className="animate-ping" style={{ animationDuration: "3s" }} />
          <circle cx="82" cy="56" r="1.8" fill="#bae6fd" />
          <circle cx="50" cy="82" r="1.4" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}
