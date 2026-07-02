import type { CSSProperties } from "react";

/**
 * PoloPonyLoader — the club's signature motif.
 *
 * A minimalist silhouette pony mid-gallop, animated with pure CSS keyframes
 * (defined in app/globals.css), so this stays a server component with zero
 * client-side JS. Use it instead of ad-hoc spinners/skeletons everywhere:
 *
 *   <PoloPonyLoader />                                   // default loader
 *   <PoloPonyLoader variant="empty" label="No bookings yet" />
 *   <PoloPonyLoader variant="watermark" size={520} />    // static hero watermark
 *   <PoloPonyLoader variant="inline" size={40} />        // button/row spinner
 */

export type PoloPonyVariant = "loader" | "inline" | "empty" | "watermark";

export interface PoloPonyLoaderProps {
  /** Rendered width in px. Height follows the 220:140 viewBox ratio. */
  size?: number;
  /** Gallop speed multiplier — 1 is the default canter, 2 is twice as fast. */
  speed?: number;
  /** Any CSS color. Defaults to currentColor so it inherits text color. */
  color?: string;
  variant?: PoloPonyVariant;
  /** Accessible label; also shown as a caption for loader/empty variants. */
  label?: string;
  className?: string;
}

const BASE_DURATION_S = 0.7;

export function PoloPonyLoader({
  size = 120,
  speed = 1,
  color = "currentColor",
  variant = "loader",
  label,
  className = "",
}: PoloPonyLoaderProps) {
  const isStatic = variant === "watermark";
  const duration = `${BASE_DURATION_S / Math.max(speed, 0.1)}s`;
  const style: CSSProperties = {
    ["--pony-duration" as string]: duration,
    color,
  };

  const caption =
    label ?? (variant === "empty" ? undefined : "Loading…");

  const svg = (
    <svg
      viewBox="0 0 220 140"
      width={size}
      height={(size * 140) / 220}
      style={style}
      aria-hidden={isStatic || undefined}
      role={isStatic ? undefined : "img"}
      aria-label={isStatic ? undefined : (label ?? "Galloping polo pony")}
      className={isStatic ? className : undefined}
    >
      <g className={isStatic ? undefined : "pony-bob"} fill={color}>
        {/* Tail */}
        <path
          className={isStatic ? undefined : "pony-tail"}
          d="M60 56 C 48 52, 38 44, 33 32 C 32 30, 35 28, 37 30 C 43 40, 52 48, 63 51 Z"
        />
        {/* Body, neck and head — gallop stretch pose, facing right */}
        <path d="M199 51 C 206 54, 207 62, 200 64 L 187 62 C 178 74, 167 80, 153 83 C 149 92, 141 96, 133 94 L 98 92 C 90 98, 80 98, 75 90 C 63 88, 56 78, 58 65 C 58 56, 62 49, 70 46 C 84 41, 102 40, 116 44 C 130 48, 145 44, 158 39 C 169 35, 178 33, 184 37 C 192 34, 197 43, 199 51 Z" />
        {/* Ear */}
        <path d="M179 34 L 184 22 L 189 33 Z" />
        {/* Legs — separate shapes so each can swing on its own joint */}
        <g
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        >
          <path
            className={isStatic ? undefined : "pony-leg pony-leg-fore"}
            d="M142 86 C 152 96, 164 103, 177 106"
          />
          <path
            className={isStatic ? undefined : "pony-leg pony-leg-fore-b"}
            d="M132 88 C 135 101, 130 112, 121 119"
          />
          <path
            className={isStatic ? undefined : "pony-leg pony-leg-hind"}
            d="M78 84 C 67 95, 55 102, 43 105"
          />
          <path
            className={isStatic ? undefined : "pony-leg pony-leg-hind-b"}
            d="M86 86 C 87 100, 93 111, 102 118"
          />
        </g>
      </g>
      {/* Ground line — dashes stream backwards to suggest speed */}
      {!isStatic && (
        <line
          className="pony-ground"
          x1="8"
          y1="132"
          x2="212"
          y2="132"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      )}
    </svg>
  );

  if (variant === "inline" || variant === "watermark") {
    return svg;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-10 text-primary-800 ${className}`}
    >
      {svg}
      {caption && (
        <p className="text-sm tracking-widest uppercase text-ink-muted">
          {caption}
        </p>
      )}
    </div>
  );
}

export default PoloPonyLoader;
