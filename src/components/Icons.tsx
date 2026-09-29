import React from "react";
import { cn } from "../utils/cn";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/* ==========================================================================
   1. SECTOR / CAMPAIGN ICONS (Replaces 🪐, ⚡, 🌀)
   ========================================================================== */

/** Sector 1: Asteroid Belt — Ringed celestial sphere with orbital debris */
export function IconSectorAsteroid({ className, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <radialGradient id="astPlanet" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffd23e" />
          <stop offset="60%" stopColor="#ff7a1a" />
          <stop offset="100%" stopColor="#681600" />
        </radialGradient>
        <linearGradient id="astRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd866" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ff9f43" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ee5253" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Back half of planetary ring */}
      <ellipse
        cx="12"
        cy="12"
        rx="10.5"
        ry="3.6"
        transform="rotate(-22 12 12)"
        stroke="url(#astRing)"
        strokeWidth="1.8"
        strokeDasharray="20 40"
        strokeDashoffset="12"
        opacity="0.5"
      />
      {/* Planet sphere */}
      <circle cx="12" cy="12" r="6" fill="url(#astPlanet)" />
      {/* Surface crater / atmosphere bands */}
      <path
        d="M8.5 10c1.5.8 4.5.8 6.5-.2M7.5 13.5c1.8.9 5.5.9 8.2-.2"
        stroke="#ffd23e"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Front half of planetary ring with stardust beads */}
      <ellipse
        cx="12"
        cy="12"
        rx="10.5"
        ry="3.6"
        transform="rotate(-22 12 12)"
        stroke="url(#astRing)"
        strokeWidth="1.8"
        strokeDasharray="36 30"
        strokeDashoffset="-2"
      />
      {/* Tiny asteroid satellites */}
      <circle cx="20" cy="8" r="1" fill="#ffd23e" />
      <circle cx="4" cy="16.5" r="0.8" fill="#ff7a1a" />
    </svg>
  );
}

/** Sector 2: Plasma Nebula — Ionized lightning blade with energy diamond */
export function IconSectorPlasma({ className, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="plasmaGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#7dfce7" />
          <stop offset="50%" stopColor="#2ee6c9" />
          <stop offset="100%" stopColor="#00838f" />
        </linearGradient>
      </defs>
      {/* Ionized energy halo */}
      <path
        d="M13 2 4 13.5h7L9.5 22 20 10h-7.5L13 2z"
        stroke="#2ee6c9"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.25"
      />
      {/* Core plasma bolt */}
      <path
        d="M13 2 4 13.5h7L9.5 22 20 10h-7.5L13 2z"
        fill="url(#plasmaGrad)"
        stroke="#e0ffff"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* High-voltage center glint */}
      <polygon points="12.5,5 8.5,12.5 12,12.5 10.5,17 16,11 13,11" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/** Sector 3: Cosmic Abyss — Gravitational singularity / black hole accretion disk */
export function IconSectorVoid({ className, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <radialGradient id="voidCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#05030c" />
          <stop offset="65%" stopColor="#2e0854" />
          <stop offset="100%" stopColor="#c084fc" />
        </radialGradient>
        <linearGradient id="voidSpiral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>
      {/* Outer spiral accretion arms */}
      <path
        d="M12 2a10 10 0 0 1 9.8 8c-.6-3.8-3.4-6.8-7.8-6.8-5 0-8 3.5-8 7.8 0 4.2 3.2 7 7.5 7 3.5 0 6.2-2 6.5-5"
        stroke="url(#voidSpiral)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M12 22a10 10 0 0 1-9.8-8c.6 3.8 3.4 6.8 7.8 6.8 5 0 8-3.5 8-7.8 0-4.2-3.2-7-7.5-7-3.5 0-6.2 2-6.5 5"
        stroke="url(#voidSpiral)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Event horizon singularity */}
      <circle cx="12" cy="12" r="4.2" fill="url(#voidCore)" stroke="#c084fc" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.8" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/* ==========================================================================
   2. NATIONAL FLAGS (Replaces 🇻🇳 & 🇬🇧, fully cross-platform)
   ========================================================================== */

/** Vietnam Flag (Vector SVG) */
export function IconFlagVN({ className, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 30 20"
      width={typeof size === "number" ? Math.round(size * 1.5) : size}
      height={size}
      className={cn("rounded-sm overflow-hidden shadow-sm shrink-0 border border-white/10", className)}
      {...props}
    >
      <rect width="30" height="20" fill="#da251d" />
      {/* 5-pointed gold star */}
      <polygon
        points="15,4 16.54,8.75 21.53,8.75 17.5,11.69 19.04,16.44 15,13.5 10.96,16.44 12.5,11.69 8.47,8.75 13.46,8.75"
        fill="#ff0"
      />
    </svg>
  );
}

/** United Kingdom / English Flag (Vector SVG) */
export function IconFlagUK({ className, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 30 20"
      width={typeof size === "number" ? Math.round(size * 1.5) : size}
      height={size}
      className={cn("rounded-sm overflow-hidden shadow-sm shrink-0 border border-white/10", className)}
      {...props}
    >
      <clipPath id="ukClip">
        <rect width="30" height="20" />
      </clipPath>
      <g clipPath="url(#ukClip)">
        <rect width="30" height="20" fill="#012169" />
        {/* White saltire */}
        <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" strokeWidth="4" />
        {/* Red saltire */}
        <path d="M0 0 L30 20 M30 0 L0 20" stroke="#c8102e" strokeWidth="2.2" />
        {/* White cross */}
        <path d="M15 0 V20 M0 10 H30" stroke="#fff" strokeWidth="6" />
        {/* Red cross */}
        <path d="M15 0 V20 M0 10 H30" stroke="#c8102e" strokeWidth="3.6" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   3. SOUNDTRACK THEME ICONS (Replaces 🏰, ⚔️, 🗺️)
   ========================================================================== */

/** Armageddon Soundtrack: Citadel fortress crest / heroic shield */
export function IconThemeArmageddon({ className, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-amber-400", className)}
      {...props}
    >
      <path d="M12 2 3 7v6c0 5.5 3.8 10 9 11 5.2-1 9-5.5 9-11V7l-9-5z" fill="rgba(255,180,40,0.15)" />
      <path d="M12 6v6m0 0 3.5 3.5M12 12l-3.5 3.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Cyber Pulse Soundtrack: Dual neon laser blades crossed in combat */
export function IconThemeCyber({ className, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-cyan-400", className)}
      {...props}
    >
      {/* Blade 1 (top-left to bottom-right) */}
      <path d="M14.5 4 20 9.5 9.5 20 4 14.5 14.5 4z" fill="rgba(46,230,201,0.12)" />
      <line x1="14.5" y1="4" x2="6.5" y2="12" stroke="#2ee6c9" strokeWidth="2.2" />
      <line x1="3" y1="21" x2="7" y2="17" stroke="#7dfce7" strokeWidth="2.5" />
      {/* Blade 2 (top-right to bottom-left) */}
      <line x1="9.5" y1="4" x2="17.5" y2="12" stroke="#2ee6c9" strokeWidth="2.2" />
      <line x1="21" y1="21" x2="17" y2="17" stroke="#7dfce7" strokeWidth="2.5" />
    </svg>
  );
}

/** Cosmic Odyssey Soundtrack: Holographic orbital galaxy astrolabe */
export function IconThemeOdyssey({ className, size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-purple-400", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" opacity="0.3" strokeDasharray="3 3" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" stroke="#c084fc" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" stroke="#e879f9" opacity="0.7" />
      <circle cx="12" cy="12" r="2.2" fill="#ffd23e" stroke="none" />
    </svg>
  );
}

/* ==========================================================================
   4. NAVIGATION, MILESTONE & TACTICAL ICONS (Replaces 🚩, 🏆, 🎯, 💾, ⏸️, ✦)
   ========================================================================== */

/** Start Flag: Sci-fi waypoint launch beacon */
export function IconFlagStart({ className, size = 14, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" opacity="0.8" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

/** Apex Crown / Trophy: Radiant gold celestial conqueror crown */
export function IconApexCrown({ className, size = 14, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M2 19h20M4 19l2-12 5 6 5-6 2 12H4z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="6" cy="7" r="1.2" fill="#fff" stroke="none" />
      <circle cx="12" cy="13" r="1.2" fill="#fff" stroke="none" />
      <circle cx="18" cy="7" r="1.2" fill="#fff" stroke="none" />
    </svg>
  );
}

/** Tactical Crosshair Target: Futuristic HUD reticle */
export function IconTacticalTarget({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="8" opacity="0.4" />
      <circle cx="12" cy="12" r="3.5" />
      <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2.2" />
      <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2.2" />
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth="2.2" />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth="2.2" />
    </svg>
  );
}

/** Save Cartridge: Sci-fi holographic data drive with LED */
export function IconSaveDisk({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

/** Auto Pause Notice: Shield with twin pause bars */
export function IconAutoPause({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-ice-400", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" opacity="0.35" />
      <line x1="10" y1="8.5" x2="10" y2="15.5" strokeWidth="2.4" />
      <line x1="14" y1="8.5" x2="14" y2="15.5" strokeWidth="2.4" />
    </svg>
  );
}

/** Warning Alert: Glowing hazard triangle */
export function IconAlertTriangle({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-amber-400", className)}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" fill="rgba(255,180,40,0.15)" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.6" />
    </svg>
  );
}

/** 4-Point Radiant Sparkle (Replaces ✦) */
export function IconSparkle({ className, size = 14, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={cn("shrink-0 text-ice-300", className)}
      {...props}
    >
      <path d="M12 0C12 7.5 7.5 12 0 12c7.5 0 12 4.5 12 12 0-7.5 4.5-12 12-12-7.5 0-12-4.5-12-12z" />
    </svg>
  );
}

/** Crisp 5-point Star (Replaces ★) */
export function IconStar({ className, size = 14, filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "1" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
