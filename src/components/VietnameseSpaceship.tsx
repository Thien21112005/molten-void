import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../utils/cn";
import { audio } from "../game/audio";
import type { Language } from "../game/i18n";

interface VietnameseSpaceshipProps {
  lang: Language;
}

const RADIO_MESSAGES_VI = [
  "Cơ trưởng VN-01: 'Động cơ ion kích hoạt 100%! Tự hào cờ đỏ sao vàng giữa ngân hà!'",
  "Trạm kiểm soát VNSC: 'Quỹ đạo ổn định, chúc cơ trưởng chinh phục trọn vẹn 15 khu vực!'",
  "Phi hành gia Việt Nam: 'Đã định vị tinh thể năng lượng tại khu vực tiếp theo!'",
  "Tàu thám hiểm VN-01: 'Hệ thống radar và giàn phóng Molten Void đã khóa mục tiêu!'",
  "VNSC Command: 'Toàn bộ hệ thống sẵn sàng. Chúc cơ trưởng bách chiến bách thắng!'",
];

const RADIO_MESSAGES_EN = [
  "Commander VN-01: 'Ion thrusters at 100%! Proudly flying the Vietnam flag in deep space!'",
  "VNSC Mission Control: 'Orbit stable, wishing commander full victory across all 15 sectors!'",
  "Vietnamese Astronaut: 'Energy crystals detected in the upcoming cosmic zone!'",
  "Explorer Shuttle VN-01: 'Molten Void slingshot and radar targeting systems primed!'",
  "VNSC Command: 'All systems green. Clear skies and good fortune, Commander!'",
];

// 12 Organic Catmull-Rom Waypoints [x%, y%] around the main menu and planets
// Creates a sweeping, undulating cosmic patrol ("lượn lượn các kiểu")
const WAYPOINTS: [number, number][] = [
  [18, 7],   // 1. Cruising past Terra exoplanet in top-left
  [44, 11],  // 2. Swooping down toward Molten Void header
  [74, 7],   // 3. Ascending wave towards Ice Planet in top-right
  [91, 18],  // 4. Slingshot around Ice Planet, banking down
  [95, 45],  // 5. Wide sweeping arc down right flank
  [88, 68],  // 6. Inward dive towards Saturn Gas Giant
  [92, 85],  // 7. Slingshot around Saturn, banking hard left
  [68, 92],  // 8. Scooping under launchpad buttons
  [42, 85],  // 9. Wave crest under menu modal
  [18, 93],  // 10. Swooping past Magma Planet in bottom-left
  [7, 65],   // 11. Banking climb up left flank
  [12, 30],  // 12. Inward roll, climbing back to top-left
];

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

function catmullRomDerivative(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  return 0.5 * (
    (-p0 + p2) +
    2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * t +
    3 * (-p0 + 3 * p1 - 3 * p2 + p3) * t2
  );
}

function evaluateSpline(progress: number): { x: number; y: number; angle: number } {
  const n = WAYPOINTS.length;
  const p = ((progress % 1) + 1) % 1;
  const rawIdx = p * n;
  const i = Math.floor(rawIdx);
  const u = rawIdx - i;

  const p0 = WAYPOINTS[(i - 1 + n) % n];
  const p1 = WAYPOINTS[i];
  const p2 = WAYPOINTS[(i + 1) % n];
  const p3 = WAYPOINTS[(i + 2) % n];

  const x = catmullRom(p0[0], p1[0], p2[0], p3[0], u);
  const y = catmullRom(p0[1], p1[1], p2[1], p3[1], u);

  const dx = catmullRomDerivative(p0[0], p1[0], p2[0], p3[0], u);
  const dy = catmullRomDerivative(p0[1], p1[1], p2[1], p3[1], u);

  // Aspect ratio compensation so heading angle matches visual screen ratio (~16:9)
  const aspect = typeof window !== "undefined" && window.innerHeight > 0
    ? window.innerWidth / window.innerHeight
    : 16 / 9;
  
  const angle = Math.atan2(dy, dx * (aspect / 1.777)) * (180 / Math.PI);

  return { x, y, angle };
}

export function VietnameseSpaceship({ lang }: VietnameseSpaceshipProps) {
  const shipRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [boosted, setBoosted] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const boostedRef = useRef(false);
  const speedRef = useRef(1.0);
  const progressRef = useRef(0.08); // Start at pleasant top-left location
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const boostTimeoutRef = useRef<number | null>(null);
  const msgTimeoutRef = useRef<number | null>(null);

  const messages = lang === "vi" ? RADIO_MESSAGES_VI : RADIO_MESSAGES_EN;

  // Frame update loop with continuous progress integration (ZERO TELEPORTATION!)
  const updateMotion = useCallback((now: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = now;
    }
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.08);
    lastTimeRef.current = now;

    // Smoothly interpolate speed with physical inertia
    const targetSpeed = boostedRef.current ? 2.2 : 1.0;
    speedRef.current += (targetSpeed - speedRef.current) * Math.min(dt * 5, 1);

    // Continuous progress integration: 1 full majestic lap every 26 seconds at 1.0x speed
    const LAP_DURATION = 26;
    progressRef.current = (progressRef.current + (speedRef.current * dt) / LAP_DURATION) % 1;

    // Evaluate smooth Catmull-Rom spline position & heading
    const { x, y, angle } = evaluateSpline(progressRef.current);

    // Check if ship is heading left (cos < 0) so we can keep decals and star right-side up!
    const isHeadingLeft = Math.cos(angle * (Math.PI / 180)) < 0;

    // Subtle micro-float weightlessness wobble
    const wobbleY = Math.sin(now * 0.0035) * 4;

    if (shipRef.current) {
      shipRef.current.style.left = `${x}vw`;
      shipRef.current.style.top = `${y}vh`;
      shipRef.current.style.transform = `translate(-50%, -50%) translateY(${wobbleY}px) rotate(${angle}deg)`;

      if (isHeadingLeft) {
        shipRef.current.classList.add("is-heading-left");
      } else {
        shipRef.current.classList.remove("is-heading-left");
      }
    }

    // Counter-rotate the hover tooltip so it is ALWAYS 100% horizontal and right-side up!
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate(-50%, -100%) translateY(-18px) rotate(${-angle}deg)`;
    }

    animFrameRef.current = requestAnimationFrame(updateMotion);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateMotion);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateMotion]);

  const handleInteract = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.ensure();
    audio.spaceChime();
    audio.thrusterBoost();

    // Trigger boost mode without resetting position or phase
    boostedRef.current = true;
    setBoosted(true);
    setShowMessage(true);
    setMessageIndex((prev) => (prev + 1) % messages.length);

    if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
    if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);

    boostTimeoutRef.current = window.setTimeout(() => {
      boostedRef.current = false;
      setBoosted(false);
    }, 4500);

    msgTimeoutRef.current = window.setTimeout(() => {
      setShowMessage(false);
    }, 6000);
  };

  const handleDismissComms = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.ensure();
    audio.click();
    setShowMessage(false);
  };

  useEffect(() => {
    return () => {
      if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Inline styles for pulse, flares, equalizer bars, and upright decal flips */}
      <style>{`
        @keyframes vnFlamePulse {
          0%, 100% {
            transform: scaleX(1) scaleY(1);
            opacity: 0.95;
          }
          50% {
            transform: scaleX(1.35) scaleY(1.15);
            opacity: 1;
          }
        }

        @keyframes vnFlameBoost {
          0%, 100% {
            transform: scaleX(2.4) scaleY(1.35);
            opacity: 1;
          }
          50% {
            transform: scaleX(2.8) scaleY(1.5);
            opacity: 0.95;
          }
        }

        @keyframes vnSparkleDrift {
          0% {
            transform: translateX(0) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateX(-50px) scale(0.15);
            opacity: 0;
          }
        }

        @keyframes eqBarPulse {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }

        /* When ship travels leftward, counter-rotate decals & star so they ALWAYS remain right-side up! */
        .is-heading-left .vn-text-flip {
          transform-box: fill-box;
          transform-origin: center center;
          transform: rotate(180deg);
        }

        .is-heading-left .vn-star-flip {
          transform-box: fill-box;
          transform-origin: center center;
          transform: rotate(180deg);
        }
      `}</style>

      {/* Holographic Tactical Radio Comms Banner (Top-Center HUD) */}
      {showMessage && (
        <div className="pointer-events-auto absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 animate-pop-in flex max-w-[min(94vw,34rem)] items-center gap-3 rounded-2xl border-2 border-ice-400/80 bg-void-950/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_0_35px_rgba(46,230,201,0.45)] backdrop-blur-xl">
          {/* Astronaut Avatar Icon with Vietnam Flag */}
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-ice-400/60 bg-void-900/90 shadow-inner">
            <svg viewBox="0 0 40 40" className="h-8 w-8">
              {/* Mini Astronaut Helmet */}
              <circle cx="20" cy="18" r="11" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
              {/* Golden Polarized Visor */}
              <ellipse cx="20" cy="18" rx="8" ry="6.5" fill="#f59e0b" />
              <path d="M 15 14 Q 20 12 25 14" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
              {/* Space Suit Collar with Vietnam Flag */}
              <path d="M 10 32 C 10 27, 30 27, 30 32 Z" fill="#da251d" />
              <polygon points="20,28 21.2,31 24.5,31 22,32.8 23,35.5 20,34 17,35.5 18,32.8 15.5,31 18.8,31" fill="#ffd23e" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-ice-400">
              <span className="h-1.5 w-1.5 rounded-full bg-void-950 animate-ping" />
            </span>
          </div>

          {/* Comms Audio Message */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black tracking-wider text-amber-300 uppercase">
                <span>🇻🇳 VN-01 [VNSC]</span>
                <span className="text-white/40">•</span>
                <span className="text-ice-400 font-bold">{boosted ? (lang === "vi" ? "ĐANG TĂNG TỐC" : "HYPERBOOST") : "RADIO COMMS"}</span>
              </div>
              {/* Animated Audio Equalizer Bars */}
              <div className="flex items-center gap-0.5">
                <span className="w-1 bg-ice-400 rounded-full" style={{ animation: "eqBarPulse 0.5s ease-in-out infinite" }} />
                <span className="w-1 bg-amber-400 rounded-full" style={{ animation: "eqBarPulse 0.7s ease-in-out infinite 0.15s" }} />
                <span className="w-1 bg-ice-300 rounded-full" style={{ animation: "eqBarPulse 0.4s ease-in-out infinite 0.3s" }} />
                <span className="w-1 bg-rose-alert rounded-full" style={{ animation: "eqBarPulse 0.6s ease-in-out infinite 0.2s" }} />
              </div>
            </div>
            <div className="mt-0.5 text-xs sm:text-[13px] font-semibold text-white/95 leading-snug">
              {messages[messageIndex]}
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismissComms}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-void-700/80 bg-void-800/80 text-white/60 hover:text-white hover:border-ice-400/60 active:scale-95 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Orbiting Vessel Anchor (GPU Accelerated Smooth Vector Motion) */}
      <div
        ref={shipRef}
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer select-none group will-change-transform"
        onClick={handleInteract}
        role="button"
        tabIndex={0}
        title={lang === "vi" ? "Tàu phi hành gia Việt Nam VN-01 (Nhấp để tăng tốc!)" : "Vietnam Astronaut Shuttle VN-01 (Click to boost!)"}
      >
        <div className="relative flex flex-col items-center">
          {/* Interactive Hover Click-Me Indicator (Always strictly horizontal & upright!) */}
          <div
            ref={tooltipRef}
            className="absolute top-0 left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 will-change-transform"
          >
            <span className="rounded-md border border-amber-400/80 bg-void-950/95 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-300 shadow-[0_0_12px_rgba(255,210,62,0.4)] backdrop-blur-md">
              {lang === "vi" ? "🚀 Nhấn để tăng tốc tàu VN-01!" : "🚀 Click to boost VN-01 shuttle!"}
            </span>
          </div>

          {/* The High-Detail Sci-Fi Vietnamese Astronaut Spaceship SVG */}
          <div className="relative filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:scale-108 active:scale-95">
            <svg
              viewBox="0 0 170 80"
              className={cn(
                "h-14 sm:h-16 md:h-18 w-auto overflow-visible transition-all duration-300",
                boosted && "drop-shadow-[0_0_28px_rgba(46,230,201,0.85)]"
              )}
            >
              <defs>
                {/* Plasma exhaust fire gradients */}
                <linearGradient id="vnPlasmaCore" x1="100%" y1="50%" x2="0%" y2="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#7dfce7" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#2ee6c9" stopOpacity="0.8" />
                  <stop offset="85%" stopColor="#ff7a1a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f05423" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="vnBoostFire" x1="100%" y1="50%" x2="0%" y2="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="20%" stopColor="#ffd23e" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#ff5722" stopOpacity="0.85" />
                  <stop offset="85%" stopColor="#7dfce7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2ee6c9" stopOpacity="0" />
                </linearGradient>

                {/* Metallic fuselage & wing gradients */}
                <linearGradient id="vnHullUpper" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e183a" />
                  <stop offset="45%" stopColor="#2b2153" />
                  <stop offset="80%" stopColor="#3d3074" />
                  <stop offset="100%" stopColor="#241b49" />
                </linearGradient>

                <linearGradient id="vnHullWing" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#16122d" />
                  <stop offset="50%" stopColor="#221b44" />
                  <stop offset="100%" stopColor="#2e255a" />
                </linearGradient>

                {/* Golden visor reflection for astronaut helmet */}
                <linearGradient id="vnVisorGold" x1="30%" y1="0%" x2="70%" y2="100%">
                  <stop offset="0%" stopColor="#fff5a6" />
                  <stop offset="35%" stopColor="#ffd23e" />
                  <stop offset="80%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>

                {/* Cockpit canopy glass */}
                <linearGradient id="vnCanopyGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#164e63" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#083344" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity="0.75" />
                </linearGradient>

                {/* Forward sensor radar glow */}
                <radialGradient id="vnRadarBeam" cx="0%" cy="50%" r="100%">
                  <stop offset="0%" stopColor="#7dfce7" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="#2ee6c9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2ee6c9" stopOpacity="0" />
                </radialGradient>

                {/* Glow filter for Vietnam Gold Star */}
                <filter id="vnStarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffd23e" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Forward Sensor Beam / Headlight Cone */}
              <polygon
                points="155 40 215 15 215 65"
                fill="url(#vnRadarBeam)"
                className="opacity-70"
              />

              {/* ================= ION / PLASMA THRUSTER FLAMES ================= */}
              {/* Upper Plasma Engine Flame */}
              <g
                style={{
                  transformOrigin: "26px 31px",
                  animation: boosted
                    ? "vnFlameBoost 0.12s ease-in-out infinite"
                    : "vnFlamePulse 0.25s ease-in-out infinite",
                }}
              >
                <polygon
                  points="26 27 -20 31 26 35"
                  fill={boosted ? "url(#vnBoostFire)" : "url(#vnPlasmaCore)"}
                />
                <polygon
                  points="26 29 -8 31 26 33"
                  fill="#ffffff"
                  opacity="0.85"
                />
              </g>

              {/* Lower Plasma Engine Flame */}
              <g
                style={{
                  transformOrigin: "26px 49px",
                  animation: boosted
                    ? "vnFlameBoost 0.12s ease-in-out infinite"
                    : "vnFlamePulse 0.25s ease-in-out infinite",
                  animationDelay: "0.12s",
                }}
              >
                <polygon
                  points="26 45 -20 49 26 53"
                  fill={boosted ? "url(#vnBoostFire)" : "url(#vnPlasmaCore)"}
                />
                <polygon
                  points="26 47 -8 49 26 51"
                  fill="#ffffff"
                  opacity="0.85"
                />
              </g>

              {/* Trailing Stardust Sparks (when boosted) */}
              {boosted && (
                <g>
                  <circle cx="2" cy="31" r="2" fill="#ffd23e" style={{ animation: "vnSparkleDrift 0.5s linear infinite" }} />
                  <circle cx="-12" cy="49" r="2.5" fill="#7dfce7" style={{ animation: "vnSparkleDrift 0.6s linear infinite 0.1s" }} />
                  <circle cx="-5" cy="40" r="1.8" fill="#ffffff" style={{ animation: "vnSparkleDrift 0.4s linear infinite 0.2s" }} />
                </g>
              )}

              {/* ================= SPACESHIP HULL STRUCTURE ================= */}

              {/* Delta Wings & Tail Stabilizers */}
              <polygon
                points="75 22 28 8 20 14 36 28"
                fill="url(#vnHullWing)"
                stroke="#473b7b"
                strokeWidth="1.2"
              />
              <polygon
                points="75 58 28 72 20 66 36 52"
                fill="url(#vnHullWing)"
                stroke="#473b7b"
                strokeWidth="1.2"
              />

              {/* Engine Bells / Titanium Thruster Cones */}
              <path
                d="M 28 26 L 18 24 L 18 38 L 28 36 Z"
                fill="#120e24"
                stroke="#6b5b95"
                strokeWidth="1.2"
              />
              <path
                d="M 28 44 L 18 42 L 18 56 L 28 54 Z"
                fill="#120e24"
                stroke="#6b5b95"
                strokeWidth="1.2"
              />
              {/* Thruster Rim Glowing Rings */}
              <line x1="20" y1="25" x2="20" y2="37" stroke="#2ee6c9" strokeWidth="1.8" />
              <line x1="20" y1="43" x2="20" y2="55" stroke="#2ee6c9" strokeWidth="1.8" />

              {/* Main Fuselage Body (Aerodynamic Explorer Spacecraft) */}
              <path
                d="M 158 40 
                   C 142 34, 115 26, 75 24 
                   L 30 24 
                   C 26 24, 24 27, 24 32
                   L 24 48
                   C 24 53, 26 56, 30 56
                   L 75 56
                   C 115 54, 142 46, 158 40 Z"
                fill="url(#vnHullUpper)"
                stroke="#5d4d9b"
                strokeWidth="1.5"
              />

              {/* High-tech Hull Seam & Energy Conduit Accents */}
              <path
                d="M 38 28 L 78 28 C 112 30, 134 36, 148 40 C 134 44, 112 50, 78 52 L 38 52"
                fill="none"
                stroke="#2ee6c9"
                strokeWidth="0.9"
                strokeDasharray="18 4"
                opacity="0.85"
              />

              {/* ================= THE VIETNAMESE FLAG (CỜ TỔ QUỐC VIỆT NAM) ================= */}
              <g transform="translate(42, 28)">
                <rect
                  x="0"
                  y="0"
                  width="36"
                  height="24"
                  rx="3"
                  fill="#da251d"
                  stroke="#ffd23e"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 0 4px rgba(218,37,29,0.7))"
                />

                <polygon
                  className="vn-star-flip"
                  points="
                    18,4.8 
                    20.2,10.2 
                    26,10.4 
                    21.4,13.8 
                    23.1,19.2 
                    18,15.8 
                    12.9,19.2 
                    14.6,13.8 
                    10,10.4 
                    15.8,10.2
                  "
                  fill="#ffd23e"
                  filter="url(#vnStarGlow)"
                />
              </g>

              {/* Tactical Aerospace Typography Markings (Auto-flips to stay right-side up!) */}
              <text
                className="vn-text-flip"
                x="60"
                y="21"
                fill="#ffd23e"
                fontSize="6"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="1"
                textAnchor="middle"
              >
                VIỆT NAM
              </text>
              <text
                className="vn-text-flip"
                x="60"
                y="61"
                fill="#7dfce7"
                fontSize="5.5"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="1.2"
                textAnchor="middle"
              >
                VN-01
              </text>

              {/* ================= COCKPIT CANOPY & ASTRONAUT ================= */}
              <path
                d="M 98 40 C 104 31, 128 31, 138 38 C 141 40, 141 40, 138 42 C 128 49, 104 49, 98 40 Z"
                fill="url(#vnCanopyGlass)"
                stroke="#2ee6c9"
                strokeWidth="1.2"
              />

              {/* Astronaut Inside Cockpit */}
              <g transform="translate(108, 40)">
                <path
                  d="M -5 6 C -2 3, 4 3, 7 6 L 6 9 L -4 9 Z"
                  fill="#f1f5f9"
                  stroke="#334155"
                  strokeWidth="0.7"
                />
                <circle
                  cx="1"
                  cy="0"
                  r="6.5"
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="0.8"
                />
                <path
                  d="M 2 -4.5 C 5 -3, 6 -1, 6 0 C 6 1, 5 3, 2 4.5 C 4 2, 4 -2, 2 -4.5 Z"
                  fill="url(#vnVisorGold)"
                  stroke="#b45309"
                  strokeWidth="0.5"
                />
                <path
                  d="M 3 -3 C 5 -1.5, 5 0, 3 1.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </g>

              {/* Glass Specular Glare across Cockpit Canopy */}
              <path
                d="M 104 34 C 114 33, 126 34, 134 38"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Nose Cone Sensor Probe */}
              <circle cx="158" cy="40" r="1.8" fill="#ffd23e" />
              <line x1="158" y1="40" x2="166" y2="40" stroke="#ffd23e" strokeWidth="1.4" strokeLinecap="round" />

              {/* ================= NAVIGATION & STROBE LIGHTS ================= */}
              <circle cx="21" cy="14" r="2.2" fill="#ef4444" className="animate-pulse" />
              <circle cx="21" cy="66" r="2.2" fill="#22c55e" className="animate-pulse" />
              <circle cx="25" cy="40" r="1.8" fill="#ffffff" className="animate-ping" style={{ animationDuration: "1.2s" }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
