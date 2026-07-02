import type { Metadata } from "next";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export const metadata: Metadata = { title: "Book" };

export default function BookPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl text-primary-900">Book</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        The shared calendar for the indoor hall, Fields 1–3, polo lessons and
        spectator events arrives in Milestone 3.
      </p>
      <PoloPonyLoader
        variant="empty"
        size={150}
        label="No bookings yet — the calendar is on its way"
        className="mt-12"
      />
    </section>
  );
}
