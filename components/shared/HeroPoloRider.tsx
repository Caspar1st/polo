"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * HeroPoloRider — a mounted polo player on a cantering pony, in the same
 * minimalist single-color silhouette language as PoloPonyLoader (whose pony
 * paths and CSS leg-swing keyframes it reuses; see app/globals.css). This is
 * a separate component — PoloPonyLoader remains the app-wide loading motif.
 *
 * The viewBox is raised 54 units (0 -54 220 194) to make headroom for the
 * rider, so the transform origins from the shared .pony-* classes are
 * re-based inline (+54 in y, measured from the viewBox top-left corner).
 *
 * Motion (framer): a linear canter sweep across the parent's width and a
 * mallet half-swing about the shoulder. Both stop under reduced motion —
 * the CSS gallop cycle already freezes itself via the global media query.
 */
export interface HeroPoloRiderProps {
  className?: string;
  /** Gait speed multiplier — 1 is the default canter. */
  speed?: number;
  /** Seconds for one full crossing of the parent container. */
  crossingDuration?: number;
}

const BASE_DURATION_S = 0.85;

export function HeroPoloRider({
  className = "",
  speed = 1,
  crossingDuration = 18,
}: HeroPoloRiderProps) {
  const reduced = useReducedMotion();
  const svgStyle: CSSProperties = {
    ["--pony-duration" as string]: `${BASE_DURATION_S / Math.max(speed, 0.1)}s`,
  };

  return (
    <motion.div
      className={className}
      aria-hidden
      style={reduced ? { x: "180%" } : undefined}
      animate={reduced ? undefined : { x: ["-130%", "760%"] }}
      transition={
        reduced
          ? undefined
          : { duration: crossingDuration, ease: "linear", repeat: Infinity }
      }
    >
      <svg viewBox="0 -54 220 194" className="h-auto w-full" style={svgStyle}>
        {/* Ground shadow (outside the bob so it stays planted) */}
        <ellipse cx="120" cy="128" rx="55" ry="6" fill="currentColor" opacity="0.12" />

        <g
          className="pony-bob"
          style={{ transformOrigin: "110px 124px" }}
          fill="currentColor"
        >
          {/* Pony — identical paths to PoloPonyLoader */}
          <path
            className="pony-tail"
            style={{ transformOrigin: "58px 112px" }}
            d="M60 56 C 48 52, 38 44, 33 32 C 32 30, 35 28, 37 30 C 43 40, 52 48, 63 51 Z"
          />
          <path d="M199 51 C 206 54, 207 62, 200 64 L 187 62 C 178 74, 167 80, 153 83 C 149 92, 141 96, 133 94 L 98 92 C 90 98, 80 98, 75 90 C 63 88, 56 78, 58 65 C 58 56, 62 49, 70 46 C 84 41, 102 40, 116 44 C 130 48, 145 44, 158 39 C 169 35, 178 33, 184 37 C 192 34, 197 43, 199 51 Z" />
          <path d="M179 34 L 184 22 L 189 33 Z" />
          <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none">
            <path
              className="pony-leg pony-leg-fore"
              style={{ transformOrigin: "142px 140px" }}
              d="M142 86 C 152 96, 164 103, 177 106"
            />
            <path
              className="pony-leg pony-leg-fore-b"
              style={{ transformOrigin: "132px 142px" }}
              d="M132 88 C 135 101, 130 112, 121 119"
            />
            <path
              className="pony-leg pony-leg-hind"
              style={{ transformOrigin: "78px 138px" }}
              d="M78 84 C 67 95, 55 102, 43 105"
            />
            <path
              className="pony-leg pony-leg-hind-b"
              style={{ transformOrigin: "86px 140px" }}
              d="M86 86 C 87 100, 93 111, 102 118"
            />
          </g>

          {/* Rider — forward-leaning torso, helmeted head, rein hand */}
          <path d="M101 47 C 102 32, 107 18, 116 10 C 121 6, 127 10, 123 17 C 116 25, 112 36, 111 47 Z" />
          <circle cx="124.5" cy="3" r="6.5" />
          {/* Helmet brim */}
          <line x1="117" y1="1.5" x2="135" y2="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rein arm and rein */}
          <path d="M120 16 C 126 20, 128 25, 127 30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M127 30 C 148 34, 170 40, 190 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />

          {/* Mallet arm — half-swing about the shoulder (119, 14) */}
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: "119px 68px" }}
            animate={reduced ? undefined : { rotate: [-26, 16, -26] }}
            transition={
              reduced
                ? undefined
                : {
                    duration: 1.7 / Math.max(speed, 0.1),
                    ease: "easeInOut",
                    repeat: Infinity,
                  }
            }
          >
            <path d="M119 14 C 126 18, 132 24, 137 31" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
            <line x1="137" y1="31" x2="148" y2="62" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="143" y1="64.5" x2="154" y2="60.5" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          </motion.g>
        </g>
      </svg>
    </motion.div>
  );
}

export default HeroPoloRider;
