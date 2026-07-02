import type { Metadata } from "next";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl text-primary-900">News &amp; Events</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        The card-based news feed, event deep links and newsletter arrive in
        Milestone 5.
      </p>
      <PoloPonyLoader
        variant="empty"
        size={150}
        label="No news yet — check back after the next chukka"
        className="mt-12"
      />
    </section>
  );
}
