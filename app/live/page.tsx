import type { Metadata } from "next";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export const metadata: Metadata = { title: "Live" };

export default function LivePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl text-primary-900">Live</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Live tournament streams, countdowns and the replay library land in
        Milestone 6, behind a swappable StreamProvider interface.
      </p>
      <PoloPonyLoader
        variant="empty"
        size={150}
        label="Nothing is streaming right now"
        className="mt-12"
      />
    </section>
  );
}
