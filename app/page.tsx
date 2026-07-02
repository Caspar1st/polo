import Link from "next/link";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

/*
 * Home — Milestone 1 shell.
 *
 * The hero placeholder below will be replaced by the 3D grounds render
 * (Google Maps Platform Photorealistic 3D Tiles behind a feature flag,
 * with a retouched static aerial as fallback) in a later milestone — see
 * the project brief §3a. Do NOT attempt runtime masking of real-world
 * objects (power poles/lines) in the live tile stream; use a baked,
 * retouched asset or a custom 3D model instead.
 */

const UPCOMING = [
  {
    title: "Carl von Weinberg Cup",
    date: "Summer 2026 · dates TBA",
    blurb: "The club's flagship tournament on the historic Frankfurt grounds.",
  },
  {
    title: "International Polo Cup",
    date: "Season 2026 · dates TBA",
    blurb: "International teams, chukkas all weekend, open to spectators.",
  },
  {
    title: "Jugend Training Camp",
    date: "Ongoing · weekly",
    blurb: "Youth programme sessions in the indoor hall and on Field 2.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 text-surface">
        {/* Pony watermark */}
        <div className="pointer-events-none absolute -right-16 -bottom-8 opacity-[0.07] text-surface">
          <PoloPonyLoader variant="watermark" size={560} />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm tracking-[0.3em] uppercase text-accent-300">
            Est. 1902 · Frankfurt am Main
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-6xl">
            Frankfurter Polo Club
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-surface/80">
            One indoor hall, three polo fields, and over a century of sport.
            Book facilities and lessons, follow tournaments live, and shop the
            club collection.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="rounded-sm bg-accent-500 px-6 py-3 text-primary-950 transition-colors hover:bg-accent-400"
            >
              Book a field or lesson
            </Link>
            <Link
              href="/live"
              className="rounded-sm border border-surface/30 px-6 py-3 text-surface transition-colors hover:border-accent-300 hover:text-accent-200"
            >
              Watch live
            </Link>
          </div>
        </div>
        {/* 3D grounds render placeholder (feature-flagged in a later milestone) */}
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex aspect-[21/9] items-center justify-center rounded-md border border-surface/15 bg-primary-800/60">
            <div className="text-center text-surface/60">
              <PoloPonyLoader variant="inline" size={90} color="currentColor" />
              <p className="mt-2 text-sm tracking-widest uppercase">
                3D grounds view — coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-3xl text-primary-900">Upcoming at the club</h2>
          <Link
            href="/news"
            className="text-sm tracking-widest uppercase text-accent-600 hover:text-accent-500"
          >
            All news →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {UPCOMING.map((event) => (
            <article
              key={event.title}
              className="rounded-md border border-primary-900/10 bg-surface-raised p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs tracking-[0.2em] uppercase text-accent-600">
                {event.date}
              </p>
              <h3 className="mt-2 text-xl text-primary-900">{event.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {event.blurb}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="border-t border-primary-900/10 bg-surface-sunken">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6">
          {[
            {
              href: "/book",
              title: "Facilities & lessons",
              blurb:
                "Indoor hall, three fields, and lessons with club trainers — one shared calendar.",
            },
            {
              href: "/live",
              title: "Tournament streaming",
              blurb:
                "Watch the Carl von Weinberg Cup and more, live and on replay.",
            },
            {
              href: "/shop",
              title: "Club shop",
              blurb:
                "Apparel, polo gear and tournament capsule collections.",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-md border border-primary-900/10 bg-surface-raised p-6 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-md"
            >
              <h3 className="text-xl text-primary-900 group-hover:text-primary-800">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {card.blurb}
              </p>
              <span className="mt-4 inline-block text-sm tracking-widest uppercase text-accent-600">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
