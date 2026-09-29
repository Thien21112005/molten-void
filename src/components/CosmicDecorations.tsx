import React from "react";

/* Orbit calculation helpers for continuous Keplerian planetary revolution */
function formatCalc(pct: number, val: number, unit: string): string {
  if (val >= 0) {
    return `calc(${pct}% + ${val.toFixed(2)}${unit})`;
  }
  return `calc(${pct}% - ${Math.abs(val).toFixed(2)}${unit})`;
}

function generateOrbitKeyframes(
  animName: string,
  rxVw: number,
  ryVh: number,
  startAngleDeg: number,
  steps = 72
): string {
  let css = `        @keyframes ${animName} {\n`;
  for (let i = 0; i <= steps; i++) {
    const pct = ((i / steps) * 100).toFixed(2);
    // Clockwise revolution: angle increases steadily across 360 degrees
    const angleDeg = (startAngleDeg + (i / steps) * 360) % 360;
    const rad = (angleDeg * Math.PI) / 180;
    const x = Math.cos(rad) * rxVw;
    const y = Math.sin(rad) * ryVh;
    css += `          ${pct}% { left: ${formatCalc(50, x, "vw")}; top: ${formatCalc(50, y, "vh")}; }\n`;
  }
  css += `        }\n`;
  return css;
}

// 4 Mathematical Keplerian Elliptical Orbits matching the SVG background paths exactly
const ORBIT_KEYFRAMES_CSS = [
  generateOrbitKeyframes("orbitMagma", 36, 34, 205),
  generateOrbitKeyframes("orbitTerra", 44, 41, 15),
  generateOrbitKeyframes("orbitSaturn", 52, 48, 145),
  generateOrbitKeyframes("orbitIce", 60, 55, 315),
].join("\n");

interface CosmicStar {
  x: string;
  y: string;
  type: "sparkle" | "sparkleSm" | "medium" | "dot";
  color: string;
  dur: string;
  delay: string;
  size?: number;
  opacity?: number;
}

const COSMIC_STARS: CosmicStar[] = [
  // --- 1. Large 4-Point Sparkling Diamond Stars (20 stars) ---
  { x: "5%", y: "7%", type: "sparkle", color: "#7dfce7", dur: "3.2s", delay: "0.2s" },
  { x: "16%", y: "12%", type: "sparkleSm", color: "#ffd23e", dur: "2.8s", delay: "1.4s" },
  { x: "28%", y: "6%", type: "sparkle", color: "#ffffff", dur: "3.6s", delay: "2.5s" },
  { x: "45%", y: "8%", type: "sparkleSm", color: "#c084fc", dur: "3.0s", delay: "0.9s" },
  { x: "63%", y: "5%", type: "sparkle", color: "#7dfce7", dur: "3.4s", delay: "1.8s" },
  { x: "78%", y: "11%", type: "sparkleSm", color: "#ffd23e", dur: "2.9s", delay: "0.4s" },
  { x: "88%", y: "7%", type: "sparkle", color: "#ffffff", dur: "3.5s", delay: "2.1s" },
  { x: "95%", y: "15%", type: "sparkleSm", color: "#7dfce7", dur: "3.1s", delay: "1.1s" },
  { x: "96%", y: "38%", type: "sparkle", color: "#ffd23e", dur: "3.8s", delay: "0.7s" },
  { x: "93%", y: "62%", type: "sparkleSm", color: "#c084fc", dur: "2.7s", delay: "2.3s" },
  { x: "95%", y: "84%", type: "sparkle", color: "#7dfce7", dur: "3.3s", delay: "1.5s" },
  { x: "82%", y: "93%", type: "sparkleSm", color: "#ffffff", dur: "3.0s", delay: "0.5s" },
  { x: "65%", y: "95%", type: "sparkle", color: "#ffd23e", dur: "3.7s", delay: "2.8s" },
  { x: "48%", y: "93%", type: "sparkleSm", color: "#7dfce7", dur: "2.9s", delay: "1.2s" },
  { x: "32%", y: "96%", type: "sparkle", color: "#ffffff", dur: "3.4s", delay: "0.3s" },
  { x: "18%", y: "92%", type: "sparkleSm", color: "#c084fc", dur: "3.1s", delay: "2.0s" },
  { x: "6%", y: "86%", type: "sparkle", color: "#ffd23e", dur: "3.6s", delay: "1.6s" },
  { x: "4%", y: "60%", type: "sparkleSm", color: "#7dfce7", dur: "2.8s", delay: "0.8s" },
  { x: "3%", y: "35%", type: "sparkle", color: "#ffffff", dur: "3.5s", delay: "2.4s" },
  { x: "9%", y: "24%", type: "sparkleSm", color: "#ffd23e", dur: "3.0s", delay: "1.0s" },

  // --- 2. Medium Glowing Star Orbs (30 stars) ---
  { x: "8%", y: "15%", type: "medium", color: "#38bdf8", dur: "2.6s", delay: "0.4s", size: 2.5 },
  { x: "12%", y: "5%", type: "medium", color: "#ffffff", dur: "3.2s", delay: "1.8s", size: 2.2 },
  { x: "22%", y: "10%", type: "medium", color: "#fde047", dur: "2.9s", delay: "0.8s", size: 2.5 },
  { x: "35%", y: "5%", type: "medium", color: "#7dfce7", dur: "3.5s", delay: "2.2s", size: 2 },
  { x: "40%", y: "13%", type: "medium", color: "#ffffff", dur: "2.4s", delay: "1.1s", size: 2.8 },
  { x: "53%", y: "7%", type: "medium", color: "#c084fc", dur: "3.1s", delay: "0.6s", size: 2.2 },
  { x: "58%", y: "14%", type: "medium", color: "#38bdf8", dur: "2.7s", delay: "2.5s", size: 2.5 },
  { x: "70%", y: "7%", type: "medium", color: "#ffffff", dur: "3.3s", delay: "1.3s", size: 2 },
  { x: "83%", y: "5%", type: "medium", color: "#ffd23e", dur: "2.8s", delay: "0.2s", size: 2.5 },
  { x: "91%", y: "11%", type: "medium", color: "#7dfce7", dur: "3.0s", delay: "2.7s", size: 2.2 },

  { x: "89%", y: "22%", type: "medium", color: "#ffffff", dur: "2.5s", delay: "1.5s", size: 2.5 },
  { x: "97%", y: "27%", type: "medium", color: "#fde047", dur: "3.4s", delay: "0.9s", size: 2 },
  { x: "87%", y: "45%", type: "medium", color: "#c084fc", dur: "2.9s", delay: "2.1s", size: 2.5 },
  { x: "94%", y: "50%", type: "medium", color: "#38bdf8", dur: "3.2s", delay: "0.5s", size: 2.2 },
  { x: "90%", y: "68%", type: "medium", color: "#ffffff", dur: "2.7s", delay: "1.7s", size: 2.8 },
  { x: "97%", y: "75%", type: "medium", color: "#7dfce7", dur: "3.6s", delay: "0.3s", size: 2 },
  { x: "86%", y: "85%", type: "medium", color: "#ffd23e", dur: "2.8s", delay: "2.4s", size: 2.5 },
  { x: "90%", y: "94%", type: "medium", color: "#ffffff", dur: "3.1s", delay: "1.0s", size: 2.2 },

  { x: "74%", y: "91%", type: "medium", color: "#38bdf8", dur: "2.6s", delay: "1.9s", size: 2.5 },
  { x: "60%", y: "93%", type: "medium", color: "#c084fc", dur: "3.5s", delay: "0.7s", size: 2.2 },
  { x: "42%", y: "96%", type: "medium", color: "#fde047", dur: "2.9s", delay: "2.6s", size: 2.5 },
  { x: "26%", y: "91%", type: "medium", color: "#7dfce7", dur: "3.3s", delay: "1.2s", size: 2 },
  { x: "14%", y: "96%", type: "medium", color: "#ffffff", dur: "2.5s", delay: "0.6s", size: 2.8 },

  { x: "10%", y: "76%", type: "medium", color: "#ffd23e", dur: "3.0s", delay: "2.0s", size: 2.5 },
  { x: "2%", y: "72%", type: "medium", color: "#38bdf8", dur: "3.4s", delay: "0.8s", size: 2.2 },
  { x: "7%", y: "52%", type: "medium", color: "#ffffff", dur: "2.8s", delay: "1.6s", size: 2.5 },
  { x: "2%", y: "48%", type: "medium", color: "#7dfce7", dur: "3.2s", delay: "2.8s", size: 2 },
  { x: "6%", y: "30%", type: "medium", color: "#c084fc", dur: "2.6s", delay: "0.3s", size: 2.5 },
  { x: "11%", y: "38%", type: "medium", color: "#ffffff", dur: "3.5s", delay: "1.4s", size: 2.2 },
  { x: "2%", y: "18%", type: "medium", color: "#fde047", dur: "2.9s", delay: "2.2s", size: 2.5 },

  // --- 3. Micro Stardust Specks (36 stars) ---
  { x: "3%", y: "11%", type: "dot", color: "#ffffff", dur: "4.2s", delay: "0.5s", size: 1.5 },
  { x: "10%", y: "8%", type: "dot", color: "#bae6fd", dur: "5.0s", delay: "1.8s", size: 1.2 },
  { x: "18%", y: "4%", type: "dot", color: "#fef08a", dur: "4.5s", delay: "2.6s", size: 1.5 },
  { x: "24%", y: "14%", type: "dot", color: "#a5f3fc", dur: "3.8s", delay: "0.9s", size: 1.2 },
  { x: "31%", y: "9%", type: "dot", color: "#ffffff", dur: "5.2s", delay: "3.1s", size: 1.4 },
  { x: "38%", y: "4%", type: "dot", color: "#e9d5ff", dur: "4.1s", delay: "1.3s", size: 1.5 },
  { x: "49%", y: "4%", type: "dot", color: "#bae6fd", dur: "4.8s", delay: "2.4s", size: 1.2 },
  { x: "55%", y: "11%", type: "dot", color: "#ffffff", dur: "3.9s", delay: "0.4s", size: 1.5 },
  { x: "67%", y: "3%", type: "dot", color: "#fef08a", dur: "4.7s", delay: "1.7s", size: 1.3 },
  { x: "74%", y: "14%", type: "dot", color: "#a5f3fc", dur: "5.1s", delay: "2.9s", size: 1.5 },
  { x: "81%", y: "8%", type: "dot", color: "#ffffff", dur: "4.3s", delay: "0.8s", size: 1.2 },
  { x: "86%", y: "16%", type: "dot", color: "#e9d5ff", dur: "4.6s", delay: "3.4s", size: 1.4 },

  { x: "93%", y: "21%", type: "dot", color: "#bae6fd", dur: "4.4s", delay: "1.2s", size: 1.5 },
  { x: "98%", y: "34%", type: "dot", color: "#ffffff", dur: "5.3s", delay: "2.5s", size: 1.2 },
  { x: "89%", y: "35%", type: "dot", color: "#fef08a", dur: "4.0s", delay: "0.3s", size: 1.4 },
  { x: "94%", y: "43%", type: "dot", color: "#a5f3fc", dur: "4.9s", delay: "1.9s", size: 1.3 },
  { x: "98%", y: "58%", type: "dot", color: "#ffffff", dur: "4.2s", delay: "3.0s", size: 1.5 },
  { x: "88%", y: "60%", type: "dot", color: "#e9d5ff", dur: "5.0s", delay: "0.7s", size: 1.2 },
  { x: "92%", y: "70%", type: "dot", color: "#bae6fd", dur: "4.6s", delay: "2.2s", size: 1.4 },
  { x: "97%", y: "81%", type: "dot", color: "#ffffff", dur: "3.8s", delay: "1.5s", size: 1.5 },
  { x: "89%", y: "88%", type: "dot", color: "#fef08a", dur: "5.4s", delay: "3.3s", size: 1.3 },
  { x: "94%", y: "96%", type: "dot", color: "#a5f3fc", dur: "4.3s", delay: "0.6s", size: 1.5 },

  { x: "85%", y: "97%", type: "dot", color: "#ffffff", dur: "4.7s", delay: "2.1s", size: 1.2 },
  { x: "77%", y: "94%", type: "dot", color: "#e9d5ff", dur: "4.1s", delay: "1.0s", size: 1.4 },
  { x: "69%", y: "97%", type: "dot", color: "#bae6fd", dur: "5.2s", delay: "2.8s", size: 1.3 },
  { x: "57%", y: "96%", type: "dot", color: "#ffffff", dur: "3.9s", delay: "0.2s", size: 1.5 },
  { x: "51%", y: "91%", type: "dot", color: "#fef08a", dur: "4.8s", delay: "1.6s", size: 1.2 },
  { x: "39%", y: "94%", type: "dot", color: "#a5f3fc", dur: "4.4s", delay: "3.2s", size: 1.4 },
  { x: "27%", y: "97%", type: "dot", color: "#ffffff", dur: "5.1s", delay: "0.9s", size: 1.5 },
  { x: "21%", y: "89%", type: "dot", color: "#e9d5ff", dur: "4.3s", delay: "2.3s", size: 1.2 },
  { x: "13%", y: "93%", type: "dot", color: "#bae6fd", dur: "4.9s", delay: "1.4s", size: 1.4 },
  { x: "5%", y: "95%", type: "dot", color: "#ffffff", dur: "3.7s", delay: "0.4s", size: 1.5 },

  { x: "1%", y: "83%", type: "dot", color: "#fef08a", dur: "4.5s", delay: "2.0s", size: 1.2 },
  { x: "5%", y: "74%", type: "dot", color: "#a5f3fc", dur: "5.3s", delay: "3.5s", size: 1.4 },
  { x: "2%", y: "63%", type: "dot", color: "#ffffff", dur: "4.0s", delay: "1.1s", size: 1.3 },
  { x: "8%", y: "56%", type: "dot", color: "#e9d5ff", dur: "4.6s", delay: "2.7s", size: 1.5 },
];

export function CosmicDecorations() {
  return (
    <>
      {/* ================= BACKGROUND COSMOS (SAO, QUỸ ĐẠO & HÀNH TINH BAY PHÍA SAU BANNER) ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Dynamic CSS styles for rotating planets, orbiting moons, celestial orbits, and comets */}
      <style>{`
        /* Planetary Surface & Atmosphere Rotations (Hành tinh tự xoay quanh trục) */
        @keyframes terraContinentSpin {
          0% { transform: translateX(0); }
          100% { transform: translateX(-64px); }
        }

        @keyframes terraCloudSpin {
          0% { transform: translateX(0); }
          100% { transform: translateX(-64px); }
        }

        @keyframes magmaCrustSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes saturnBandsSpin {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }

        @keyframes icePlanetSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes asteroidRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          0% { transform: rotate(0deg) translateX(58px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(58px) rotate(-360deg); }
        }

        @keyframes moonOrbitEarth {
          0% { transform: rotate(0deg) translateX(46px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(46px) rotate(-360deg); }
        }

        /* Planetary Celestial Elliptical Orbits (Hành tinh bay theo đúng quỹ đạo elip đồng tâm) */
${ORBIT_KEYFRAMES_CSS}

        /* Streaking Comets (Sao chổi bay) across the cosmos */
        /* Comet 1: Streaking from Top-Left to Bottom-Right (Head leads at 46deg, tail trails behind) */
        @keyframes cometStreak1 {
          0% {
            transform: translate(-15vw, -10vh) rotate(46deg);
            opacity: 0;
          }
          4% {
            opacity: 1;
          }
          28% {
            transform: translate(115vw, 68vh) rotate(46deg);
            opacity: 1;
          }
          32%, 100% {
            transform: translate(115vw, 68vh) rotate(46deg);
            opacity: 0;
          }
        }

        /* Comet 2: Streaking from Top-Right to Bottom-Left (Head leads at 132deg, tail trails up-right) */
        @keyframes cometStreak2 {
          0%, 42% {
            transform: translate(115vw, -10vh) rotate(132deg);
            opacity: 0;
          }
          46% {
            opacity: 1;
          }
          72% {
            transform: translate(-20vw, 75vh) rotate(132deg);
            opacity: 1;
          }
          76%, 100% {
            transform: translate(-20vw, 75vh) rotate(132deg);
            opacity: 0;
          }
        }

        /* Quick Shooting Star (Sao băng vụt sáng chớp nhoáng) */
        @keyframes shootingStar1 {
          0%, 65% {
            transform: translate(15vw, -5vh) rotate(57deg) scaleX(0);
            opacity: 0;
          }
          67% {
            transform: translate(35vw, 15vh) rotate(57deg) scaleX(1);
            opacity: 1;
          }
          70%, 100% {
            transform: translate(55vw, 35vh) rotate(57deg) scaleX(0.2);
            opacity: 0;
          }
        }

        @keyframes celestialOrbitPulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }

        /* Twinkling Star Animations (Ngôi sao lấp lánh giữa vũ trụ) */
        @keyframes sparkleCrossSpin {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.7) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(20deg);
          }
        }

        @keyframes starTwinkleFast {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }

        @keyframes starTwinkleSlow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.25);
          }
        }

        @keyframes stardustDrift {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.15);
          }
        }
      `}</style>

      {/* ================= COSMIC STARFIELD (BẦU TRỜI ĐẦY SAO LẤP LÁNH) ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {COSMIC_STARS.map((star, idx) => {
          if (star.type === "sparkle") {
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
                style={{
                  left: star.x,
                  top: star.y,
                  animation: `sparkleCrossSpin ${star.dur} ease-in-out infinite ${star.delay}`,
                }}
              >
                <svg viewBox="-8 -8 16 16" className="w-3.5 h-3.5 sm:w-4 sm:h-4 overflow-visible" style={{ filter: `drop-shadow(0 0 5px ${star.color})` }}>
                  <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z" fill={star.color} />
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                </svg>
              </div>
            );
          }
          if (star.type === "sparkleSm") {
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
                style={{
                  left: star.x,
                  top: star.y,
                  animation: `sparkleCrossSpin ${star.dur} ease-in-out infinite ${star.delay}`,
                }}
              >
                <svg viewBox="-6 -6 12 12" className="w-2.5 h-2.5 sm:w-3 sm:h-3 overflow-visible" style={{ filter: `drop-shadow(0 0 3px ${star.color})` }}>
                  <path d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z" fill={star.color} />
                  <circle cx="0" cy="0" r="1" fill="#ffffff" />
                </svg>
              </div>
            );
          }
          if (star.type === "medium") {
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full will-change-transform"
                style={{
                  left: star.x,
                  top: star.y,
                  width: `${star.size || 2.5}px`,
                  height: `${star.size || 2.5}px`,
                  backgroundColor: star.color,
                  boxShadow: `0 0 6px ${star.color}`,
                  animation: `starTwinkleFast ${star.dur} ease-in-out infinite ${star.delay}`,
                }}
              />
            );
          }
          return (
            <div
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
              style={{
                left: star.x,
                top: star.y,
                width: `${star.size || 1.5}px`,
                height: `${star.size || 1.5}px`,
                backgroundColor: star.color,
                opacity: star.opacity || 0.6,
                animation: `stardustDrift ${star.dur} ease-in-out infinite ${star.delay}`,
              }}
            />
          );
        })}
      </div>

      {/* ================= FAINT SOLAR SYSTEM ORBIT RINGS ================= */}
      <svg className="absolute inset-0 h-full w-full opacity-25 pointer-events-none" style={{ animation: "celestialOrbitPulse 8s ease-in-out infinite" }}>
        {/* Orbit 1: Magma Inner Elliptical Path (Amber / Lava) */}
        <ellipse cx="50%" cy="50%" rx="36vw" ry="34vh" fill="none" stroke="#ff7a1a" strokeWidth="0.9" strokeDasharray="6 14" opacity="0.85" />
        {/* Orbit 2: Terra Mid-Inner Elliptical Path (Cyan / Ocean) */}
        <ellipse cx="50%" cy="50%" rx="44vw" ry="41vh" fill="none" stroke="#38bdf8" strokeWidth="0.9" strokeDasharray="5 15" opacity="0.8" />
        {/* Orbit 3: Saturn Mid-Outer Elliptical Path (Starlight Gold) */}
        <ellipse cx="50%" cy="50%" rx="52vw" ry="48vh" fill="none" stroke="#ffd23e" strokeWidth="1" strokeDasharray="6 16" opacity="0.85" />
        {/* Orbit 4: Ice Crystal Outer Elliptical Path (Ice Cyan) */}
        <ellipse cx="50%" cy="50%" rx="60vw" ry="55vh" fill="none" stroke="#7dfce7" strokeWidth="0.9" strokeDasharray="5 18" opacity="0.8" />
      </svg>

      {/* ================= PLANETARY BODIES (HỆ HÀNH TINH QUAY QUANH MENU) ================= */}

      {/* 1. PLANET 1: SATURN / RINGED GAS GIANT (Sao Thổ - Chuyển động theo Quỹ Đạo Vàng) */}
      <div
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ left: "50%", top: "50%", animation: "orbitSaturn 135s linear infinite" }}
      >
        <div className="relative flex items-center justify-center">
          {/* Orbiting Moon */}
          <div
            className="absolute z-20 flex h-3 w-3 items-center justify-center"
            style={{ animation: "moonOrbitSaturn 14s linear infinite" }}
          >
            <div className="h-2 w-2 rounded-full bg-ice-300 shadow-[0_0_8px_rgba(46,230,201,0.8)]" />
          </div>

          <svg viewBox="0 0 180 180" className="h-26 w-26 sm:h-34 sm:w-34 md:h-42 md:w-42 overflow-visible filter drop-shadow-[0_0_30px_rgba(255,160,46,0.35)]">
            <defs>
              <linearGradient id="saturnBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="25%" stopColor="#7c2d12" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="90%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

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
              <clipPath id="saturnSphereClip">
                <circle cx="90" cy="90" r="38" />
              </clipPath>
            </defs>

            {/* Back half of the ring (behind the planet) */}
            <g clipPath="url(#saturnBackClip)">
              <ellipse cx="90" cy="90" rx="82" ry="24" fill="none" stroke="url(#ringGrad)" strokeWidth="14" transform="rotate(-25 90 90)" opacity="0.65" />
              <ellipse cx="90" cy="90" rx="88" ry="26" fill="none" stroke="#7dfce7" strokeWidth="1.8" transform="rotate(-25 90 90)" opacity="0.8" />
            </g>

            {/* Planet Sphere with Rotating Gas Storm Bands */}
            <g clipPath="url(#saturnSphereClip)">
              <circle cx="90" cy="90" r="38" fill="url(#saturnBody)" />
              {/* Seamless horizontally drifting cloud bands */}
              <g opacity="0.4" style={{ animation: "saturnBandsSpin 22s linear infinite" }}>
                <g transform="rotate(-15 90 90)">
                  <ellipse cx="90" cy="78" rx="42" ry="6" fill="#ffd23e" />
                  <ellipse cx="90" cy="92" rx="44" ry="7" fill="#ff7a1a" />
                  <ellipse cx="90" cy="106" rx="40" ry="5" fill="#f43f5e" />
                </g>
                <g transform="translate(80, 0) rotate(-15 90 90)">
                  <ellipse cx="90" cy="78" rx="42" ry="6" fill="#ffd23e" />
                  <ellipse cx="90" cy="92" rx="44" ry="7" fill="#ff7a1a" />
                  <ellipse cx="90" cy="106" rx="40" ry="5" fill="#f43f5e" />
                </g>
              </g>
            </g>

            {/* Specular 3D Lighting */}
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

      {/* 2. PLANET 2: TERRA / OCEAN LIFE WORLD (Hành tinh Xanh - Chuyển động theo Quỹ Đạo Lam) */}
      <div
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ left: "50%", top: "50%", animation: "orbitTerra 100s linear infinite" }}
      >
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

            {/* Continents & Landmasses with 3D Globe Rotation */}
            <g clipPath="url(#terraClip)">
              {/* Seamless rotating continents */}
              <g style={{ animation: "terraContinentSpin 20s linear infinite" }} opacity="0.85">
                <g transform="translate(0, 0)">
                  <path d="M 20 30 Q 28 22 38 28 Q 48 35 42 45 Q 32 52 22 45 Z" fill="#10b981" />
                  <path d="M 40 50 Q 52 45 58 55 Q 56 68 46 65 Q 36 62 40 50 Z" fill="#059669" />
                  <path d="M 12 55 Q 22 52 20 68 Q 10 72 11 60 Z" fill="#10b981" />
                </g>
                <g transform="translate(64, 0)">
                  <path d="M 20 30 Q 28 22 38 28 Q 48 35 42 45 Q 32 52 22 45 Z" fill="#10b981" />
                  <path d="M 40 50 Q 52 45 58 55 Q 56 68 46 65 Q 36 62 40 50 Z" fill="#059669" />
                  <path d="M 12 55 Q 22 52 20 68 Q 10 72 11 60 Z" fill="#10b981" />
                </g>
              </g>

              {/* Seamless rotating cloud layers */}
              <g style={{ animation: "terraCloudSpin 14s linear infinite" }}>
                <g transform="translate(0, 0)">
                  <path d="M 10 40 Q 30 35 50 42 Q 70 48 80 40" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round" />
                  <path d="M 20 60 Q 45 58 65 66" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round" />
                </g>
                <g transform="translate(64, 0)">
                  <path d="M 10 40 Q 30 35 50 42 Q 70 48 80 40" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round" />
                  <path d="M 20 60 Q 45 58 65 66" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round" />
                </g>
              </g>
            </g>

            {/* Sunlight Specular Highlight */}
            <circle cx="38" cy="38" r="14" fill="#ffffff" opacity="0.25" />
          </svg>
        </div>
      </div>

      {/* 3. PLANET 3: MOLTEN VOID MAGMA WORLD (Hành tinh Lửa - Chuyển động theo Quỹ Đạo Lửa) */}
      <div
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          left: "50%",
          top: "50%",
          animation: "orbitMagma 75s linear infinite, magmaPulse 4s ease-in-out infinite",
        }}
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

          {/* Molten Surface Fissures with Swirling Crust */}
          <g clipPath="url(#magmaClip)">
            <g style={{ transformOrigin: "50px 50px", animation: "magmaCrustSpin 28s linear infinite" }}>
              <circle cx="32" cy="42" r="12" fill="#1c0707" opacity="0.8" />
              <circle cx="64" cy="36" r="15" fill="#1c0707" opacity="0.8" />
              <circle cx="52" cy="68" r="14" fill="#1c0707" opacity="0.85" />
              <path d="M 20 50 Q 40 45 50 35 Q 60 25 80 30" stroke="#ffd23e" strokeWidth="2" fill="none" opacity="0.95" />
              <path d="M 45 35 Q 55 55 45 75 Q 40 85 30 80" stroke="#ff7a1a" strokeWidth="2" fill="none" opacity="0.9" />
              <path d="M 55 55 Q 75 60 85 70" stroke="#ffd23e" strokeWidth="1.5" fill="none" opacity="0.85" />
            </g>
          </g>

          <circle cx="40" cy="40" r="12" fill="#fff" opacity="0.2" />
        </svg>
      </div>

      {/* 4. PLANET 4: ICE CRYSTAL EXOPLANET (Hành tinh Băng - Chuyển động theo Quỹ Đạo Băng) */}
      <div
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          left: "50%",
          top: "50%",
          animation: "orbitIce 175s linear infinite, iceGlowPulse 4.5s ease-in-out infinite",
        }}
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

          {/* Ice Aura Ring */}
          <circle cx="50" cy="50" r="29" fill="none" stroke="#7dfce7" strokeWidth="1.8" opacity="0.8" />
          {/* Concentric Planet Core Sphere */}
          <circle cx="50" cy="50" r="26" fill="url(#iceCore)" />
          {/* Specular 3D Glare */}
          <circle cx="42" cy="42" r="10" fill="#ffffff" opacity="0.22" />

          {/* Glacial Ridges with Rotating Crystalline Facets */}
          <g clipPath="url(#iceClip)" opacity="0.7">
            <g style={{ transformOrigin: "50px 50px", animation: "icePlanetSpin 24s linear infinite" }}>
              <polygon points="40 28 55 35 48 48 35 42" fill="#ffffff" opacity="0.8" />
              <polygon points="52 45 68 40 65 60 50 56" fill="#a5f3fc" opacity="0.7" />
              <polygon points="32 55 45 62 38 75 26 68" fill="#ffffff" opacity="0.6" />
            </g>
          </g>

          {/* Miniature orbiting asteroid specks revolving around the planet */}
          <g style={{ transformOrigin: "50px 50px", animation: "asteroidRingSpin 14s linear infinite" }}>
            <circle cx="16" cy="46" r="1.6" fill="#7dfce7" />
            <circle cx="84" cy="54" r="1.8" fill="#bae6fd" />
            <circle cx="50" cy="82" r="1.5" fill="#ffffff" />
            <circle cx="50" cy="18" r="1.3" fill="#2ee6c9" />
          </g>
        </svg>
      </div>
    </div>

    {/* ================= FOREGROUND STREAKING COMETS (SAO CHỔI BAY VỤT QUA TRÊN BANNER) ================= */}
    <div className="absolute inset-0 pointer-events-none z-[25] overflow-hidden select-none">
      {/* Comet 1: Cyan Ice Comet streaking from Top-Left to Bottom-Right across the banner */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          transformOrigin: "90% 50%",
          animation: "cometStreak1 13s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
        }}
      >
        <svg viewBox="0 0 200 40" className="w-48 sm:w-64 h-auto overflow-visible filter drop-shadow-[0_0_16px_rgba(46,230,201,0.6)]">
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

      {/* Comet 2: Amber Magma Comet streaking from Top-Right to Bottom-Left across the banner */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          transformOrigin: "90% 50%",
          animation: "cometStreak2 16s cubic-bezier(0.22, 0.1, 0.25, 1) infinite",
        }}
      >
        <svg viewBox="0 0 200 40" className="w-44 sm:w-56 h-auto overflow-visible filter drop-shadow-[0_0_16px_rgba(255,122,26,0.6)]">
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

      {/* Micro Shooting Star Flash across upper deck */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{ animation: "shootingStar1 7s ease-in-out infinite" }}
      >
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-ice-300 to-white shadow-[0_0_12px_#fff]" />
      </div>
    </div>
  </>
);
}
