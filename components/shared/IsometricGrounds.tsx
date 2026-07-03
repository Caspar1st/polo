"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";

/**
 * IsometricGrounds — original illustrated 2.5D plan of the club grounds at
 * Georgshof, Oeserstraße 80, Frankfurt am Main: indoor hall, three polo
 * fields, clubhouse with entrance drive, boundary hedge and tree line.
 *
 * This is deliberately artwork rather than a photorealistic render, so it
 * sidesteps the Google Photorealistic 3D Tiles limitation documented in
 * README §3a (real-world imagery can't have power poles/lines masked at
 * runtime). Hard rule from the project brief: the scene contains NO
 * electricity poles, power lines, telephone poles, or overhead wiring —
 * the skyline is trees and open air only. Do not add any.
 *
 * Entrance: staggered layer reveal. Scroll: gentle per-layer parallax.
 * Both are skipped when the user prefers reduced motion.
 */

/** Iso grid → SVG coords: 2:1 isometric projection, 1 grid unit = 40×20px. */
const pt = (i: number, j: number): [number, number] => [
  480 + 40 * (i - j),
  90 + 20 * (i + j),
];

const lift = ([x, y]: [number, number], d: number): [number, number] => [x, y - d];

const poly = (...pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");

/** Parallelogram spanning the iso-grid rectangle (i1,j1)–(i2,j2). */
const quad = (i1: number, j1: number, i2: number, j2: number) =>
  poly(pt(i1, j1), pt(i2, j1), pt(i2, j2), pt(i1, j2));

/** Visible faces of a gable-roofed iso box (long axis along i). */
function building(
  i1: number,
  j1: number,
  i2: number,
  j2: number,
  wallH: number,
  ridgeH: number,
) {
  const a = pt(i1, j1);
  const b = pt(i2, j1);
  const c = pt(i2, j2);
  const d = pt(i1, j2);
  const jm = (j1 + j2) / 2;
  const r1 = lift(pt(i1, jm), wallH + ridgeH);
  const r2 = lift(pt(i2, jm), wallH + ridgeH);
  return {
    roofBack: poly(lift(a, wallH), lift(b, wallH), r2, r1),
    gableRight: poly(lift(c, wallH), lift(b, wallH), r2),
    wallLeft: poly(d, c, lift(c, wallH), lift(d, wallH)),
    wallRight: poly(c, b, lift(b, wallH), lift(c, wallH)),
    roofFront: poly(lift(d, wallH), lift(c, wallH), r2, r1),
    ridgeRight: r2,
  };
}

interface Field {
  i1: number;
  j1: number;
  i2: number;
  j2: number;
  goals: boolean;
}

const FIELDS: Field[] = [
  { i1: 4.2, j1: 0.8, i2: 9.4, j2: 3.8, goals: true },
  { i1: 4.2, j1: 4.4, i2: 9.4, j2: 7.4, goals: true },
  { i1: 0.6, j1: 4.2, i2: 3.6, j2: 8.6, goals: false },
];

const STRIPES = 8;

const TREES: { i: number; j: number; r: number }[] = [
  { i: -0.5, j: 1.0, r: 15 },
  { i: -0.5, j: 2.6, r: 12 },
  { i: -0.5, j: 4.2, r: 17 },
  { i: -0.5, j: 5.8, r: 13 },
  { i: -0.5, j: 7.4, r: 16 },
  { i: -0.55, j: 9.0, r: 12 },
  { i: 10.1, j: -0.7, r: 14 },
  { i: 9.2, j: -0.9, r: 11 },
];

const HALL = building(0.6, 0.9, 3.6, 2.9, 58, 26);
const CLUBHOUSE = building(6.4, 8, 8.2, 9.2, 36, 16);

const reveal: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

function GoalPosts({ field }: { field: Field }) {
  const jm = (field.j1 + field.j2) / 2;
  const posts = [
    pt(field.i1 - 0.05, jm - 0.35),
    pt(field.i1 - 0.05, jm + 0.35),
    pt(field.i2 + 0.05, jm - 0.35),
    pt(field.i2 + 0.05, jm + 0.35),
  ];
  return (
    <g className="stroke-accent-50" strokeWidth="2" strokeLinecap="round">
      {posts.map(([x, y], k) => (
        <line key={k} x1={x} y1={y} x2={x} y2={y - 13} />
      ))}
    </g>
  );
}

function PoloField({ field }: { field: Field }) {
  const step = (field.i2 - field.i1) / STRIPES;
  const im = (field.i1 + field.i2) / 2;
  const [cx1, cy1] = pt(im, field.j1);
  const [cx2, cy2] = pt(im, field.j2);
  return (
    <g>
      <polygon points={quad(field.i1, field.j1, field.i2, field.j2)} className="fill-primary-500" />
      {Array.from({ length: STRIPES }, (_, m) => m)
        .filter((m) => m % 2 === 0)
        .map((m) => (
          <polygon
            key={m}
            points={quad(field.i1 + m * step, field.j1, field.i1 + (m + 1) * step, field.j2)}
            className="fill-primary-400"
            opacity="0.55"
          />
        ))}
      <polygon
        points={quad(field.i1, field.j1, field.i2, field.j2)}
        fill="none"
        className="stroke-accent-100"
        strokeWidth="1.5"
        opacity="0.7"
      />
      {field.goals && (
        <>
          <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} className="stroke-accent-100" strokeWidth="1" strokeDasharray="4 6" opacity="0.55" />
          <GoalPosts field={field} />
        </>
      )}
    </g>
  );
}

function Tree({ i, j, r }: { i: number; j: number; r: number }) {
  const [x, y] = pt(i, j);
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 12} className="stroke-primary-950" strokeWidth="3" />
      <circle cx={x} cy={y - 12 - r * 0.7} r={r} className="fill-primary-700" />
      <circle cx={x - r * 0.35} cy={y - 12 - r * 0.9} r={r * 0.55} className="fill-primary-600" />
    </g>
  );
}

export interface IsometricGroundsProps {
  className?: string;
}

export function IsometricGrounds({ className }: IsometricGroundsProps) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const fieldsY = useTransform(scrollY, [0, 600], [0, -7]);
  const buildingsY = useTransform(scrollY, [0, 600], [0, -14]);
  const treesY = useTransform(scrollY, [0, 600], [0, -24]);

  const flagBase = CLUBHOUSE.ridgeRight;

  return (
    <motion.svg
      viewBox="0 40 960 456"
      className={className}
      aria-hidden
      initial={reduced ? false : "hidden"}
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } } }}
    >
      {/* Ground plane and boundary hedge */}
      <motion.g variants={reveal}>
        <polygon points={quad(0, 0, 10, 10)} className="fill-primary-600" />
        <polygon points={quad(4, -0.45, 9.6, 0.05)} className="fill-primary-700" />
      </motion.g>

      {/* Three polo fields */}
      <motion.g style={reduced ? undefined : { y: fieldsY }}>
        <motion.g variants={reveal}>
          {FIELDS.map((f, k) => (
            <PoloField key={k} field={f} />
          ))}
        </motion.g>

        {/* Driveway and parking apron */}
        <motion.g variants={reveal}>
          <polygon points={quad(6.6, 9.2, 7.4, 10.3)} className="fill-surface-sunken" opacity="0.9" />
          <polygon points={quad(8.4, 8, 9.4, 9.2)} className="fill-surface-sunken" opacity="0.75" />
        </motion.g>
      </motion.g>

      {/* Tree line along the boundary — behind the buildings in iso depth,
          open sky above, no poles or wires */}
      <motion.g style={reduced ? undefined : { y: treesY }}>
        <motion.g variants={reveal}>
          {TREES.map((t, k) => (
            <Tree key={k} {...t} />
          ))}
        </motion.g>
      </motion.g>

      <motion.g style={reduced ? undefined : { y: buildingsY }}>
        {/* Indoor hall (Halle) */}
        <motion.g variants={reveal}>
          <polygon points={HALL.roofBack} className="fill-accent-600" />
          <polygon points={HALL.gableRight} className="fill-surface" />
          <polygon points={HALL.wallLeft} className="fill-primary-800" />
          <polygon points={HALL.wallRight} className="fill-primary-700" />
          <polygon points={HALL.roofFront} className="fill-accent-400" />
          {/* Hall door */}
          <polygon points="440,186 472,202 472,172 440,156" className="fill-primary-950" />
        </motion.g>

        {/* Clubhouse at the entrance */}
        <motion.g variants={reveal}>
          <polygon points={CLUBHOUSE.roofBack} className="fill-accent-700" />
          <polygon points={CLUBHOUSE.gableRight} className="fill-surface-raised" />
          <polygon points={CLUBHOUSE.wallLeft} className="fill-surface" />
          <polygon points={CLUBHOUSE.wallRight} className="fill-surface-sunken" />
          <polygon points={CLUBHOUSE.roofFront} className="fill-accent-500" />
          {/* Lit windows */}
          <polygon points="384,398 400,406 400,386 384,378" className="fill-accent-300" />
          <polygon points="412,412 428,420 428,400 412,392" className="fill-accent-300" />
          {/* Club pennant on the gable (a flag — NOT an electricity pole) */}
          <line
            x1={flagBase[0]}
            y1={flagBase[1]}
            x2={flagBase[0]}
            y2={flagBase[1] - 18}
            className="stroke-accent-200"
            strokeWidth="2"
          />
          <polygon
            points={`${flagBase[0]},${flagBase[1] - 18} ${flagBase[0] + 14},${flagBase[1] - 14.5} ${flagBase[0]},${flagBase[1] - 11}`}
            className="fill-accent-500"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

export default IsometricGrounds;
