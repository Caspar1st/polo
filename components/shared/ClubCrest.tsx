import { useId } from "react";

/**
 * ClubCrest — heraldic club seal.
 *
 * Circular "old money" crest: brass double ring, curved club name, the
 * galloping-pony silhouette (same drawing as PoloPonyLoader, so the motif
 * is consistent) over crossed polo mallets, MCMII founding year, and the
 * Latin motto "VIRTUS IN EQUIS" — "excellence lies in horses" — on the
 * lower band.
 *
 * Colors read from the design tokens with hardcoded fallbacks so the crest
 * also renders correctly outside the app stylesheet (e.g. in OG images).
 * app/icon.svg carries the same artwork as a static file for the favicon.
 */
export interface ClubCrestProps {
  /** Rendered width/height in px. */
  size?: number;
  className?: string;
  /** Accessible label; the crest is decorative by default. */
  label?: string;
}

const GOLD = "var(--color-accent-500, #b08d3e)";
const GOLD_LIGHT = "var(--color-accent-300, #d7bc74)";
const IVORY = "var(--color-accent-100, #f3ead2)";
const GREEN = "var(--color-primary-800, #1b3626)";

export function ClubCrest({ size = 44, className, label }: ClubCrestProps) {
  const id = useId();
  const topArc = `${id}-top`;
  const bottomArc = `${id}-bottom`;

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        {/* Baselines for the curved band lettering */}
        <path id={topArc} d="M 32 120 A 88 88 0 0 1 208 120" fill="none" />
        <path id={bottomArc} d="M 26 120 A 94 94 0 0 0 214 120" fill="none" />
      </defs>

      {/* Field and rings */}
      <circle cx="120" cy="120" r="116" fill={GREEN} stroke={GOLD} strokeWidth="7" />
      <circle cx="120" cy="120" r="104" fill="none" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="120" cy="120" r="78" fill="none" stroke={GOLD} strokeWidth="1.5" />

      {/* Band lettering */}
      <text
        fontFamily='"Times New Roman", Georgia, serif'
        fontSize="15"
        letterSpacing="2.5"
        fill={GOLD_LIGHT}
      >
        <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
          FRANKFURTER POLO CLUB
        </textPath>
      </text>
      <text
        fontFamily='"Times New Roman", Georgia, serif'
        fontSize="15"
        letterSpacing="3"
        fill={GOLD_LIGHT}
      >
        <textPath href={`#${bottomArc}`} startOffset="50%" textAnchor="middle">
          VIRTUS IN EQUIS
        </textPath>
      </text>

      {/* Band separators */}
      <path d="M 29 115.5 L 31.6 117.4 L 33.5 120 L 31.6 122.6 L 29 124.5 L 26.4 122.6 L 24.5 120 L 26.4 117.4 Z" fill={GOLD} />
      <path d="M 211 115.5 L 213.6 117.4 L 215.5 120 L 213.6 122.6 L 211 124.5 L 208.4 122.6 L 206.5 120 L 208.4 117.4 Z" fill={GOLD} />

      {/* Crossed polo mallets behind the pony */}
      <g stroke={GOLD} strokeWidth="4.5" strokeLinecap="round">
        <g transform="translate(120 112) rotate(26)">
          <line x1="0" y1="-64" x2="0" y2="52" />
          <rect x="-11" y="52" width="22" height="11" rx="5.5" fill={GOLD} stroke="none" />
        </g>
        <g transform="translate(120 112) rotate(-26)">
          <line x1="0" y1="-64" x2="0" y2="52" />
          <rect x="-11" y="52" width="22" height="11" rx="5.5" fill={GOLD} stroke="none" />
        </g>
      </g>

      {/* Galloping pony — same silhouette as PoloPonyLoader */}
      <g transform="translate(120 112) scale(0.63) translate(-120 -70)" fill={IVORY}>
        <path d="M60 56 C 48 52, 38 44, 33 32 C 32 30, 35 28, 37 30 C 43 40, 52 48, 63 51 Z" />
        <path d="M199 51 C 206 54, 207 62, 200 64 L 187 62 C 178 74, 167 80, 153 83 C 149 92, 141 96, 133 94 L 98 92 C 90 98, 80 98, 75 90 C 63 88, 56 78, 58 65 C 58 56, 62 49, 70 46 C 84 41, 102 40, 116 44 C 130 48, 145 44, 158 39 C 169 35, 178 33, 184 37 C 192 34, 197 43, 199 51 Z" />
        <path d="M179 34 L 184 22 L 189 33 Z" />
        <g stroke={IVORY} strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M142 86 C 152 96, 164 103, 177 106" />
          <path d="M132 88 C 135 101, 130 112, 121 119" />
          <path d="M78 84 C 67 95, 55 102, 43 105" />
          <path d="M86 86 C 87 100, 93 111, 102 118" />
        </g>
      </g>

      {/* Founding year */}
      <text
        x="120"
        y="184"
        fontFamily='"Times New Roman", Georgia, serif'
        fontSize="12"
        letterSpacing="4"
        textAnchor="middle"
        fill={GOLD_LIGHT}
      >
        MCMII
      </text>
    </svg>
  );
}

export default ClubCrest;
