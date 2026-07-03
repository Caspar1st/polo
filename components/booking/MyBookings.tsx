"use client";

import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/lib/supabase/types";
import { RESOURCE_LABELS, formatPrice } from "@/lib/bookings/constants";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/bookings");
    if (res.ok) {
      const body = await res.json();
      setBookings(body.bookings ?? []);
    } else {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function cancel(id: string) {
    setError(null);
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
    if (res.ok) {
      void refetch();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Cancellation failed.");
    }
  }

  if (bookings === null) {
    return <PoloPonyLoader variant="inline" size={70} className="text-primary-800" />;
  }

  if (bookings.length === 0) {
    return (
      <PoloPonyLoader
        variant="empty"
        size={130}
        label="No bookings yet — pick a free slot above"
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
          {error}
        </p>
      )}
      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary-900/10 bg-surface-raised px-5 py-4"
        >
          <div>
            <p className="text-primary-900">
              {RESOURCE_LABELS[b.resource]}
              {b.ticket_count ? ` · ${b.ticket_count} ticket${b.ticket_count > 1 ? "s" : ""}` : ""}
            </p>
            <p className="text-sm text-ink-muted">
              {new Date(b.starts_at).toLocaleString("en-GB", {
                weekday: "short", day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              })}
              {" – "}
              {new Date(b.ends_at).toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {b.price_cents > 0 && (
              <span className="text-sm text-ink-muted">{formatPrice(b.price_cents)}</span>
            )}
            <span className="rounded-sm bg-primary-800 px-2 py-0.5 text-[11px] tracking-widest uppercase text-accent-200">
              {b.status}
            </span>
            <a
              href={`/api/bookings/${b.id}/ics`}
              className="rounded-sm border border-primary-900/20 px-3 py-1.5 text-xs hover:border-accent-500"
            >
              .ics
            </a>
            <button
              type="button"
              onClick={() => cancel(b.id)}
              className="rounded-sm border border-primary-900/20 px-3 py-1.5 text-xs text-ink-muted hover:border-primary-900 hover:text-primary-900"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
      <p className="text-xs text-ink-faint">
        Cancellations are free up to the club&apos;s cancellation window
        (24 h by default). To reschedule, cancel and book a new slot.
      </p>
    </div>
  );
}

export default MyBookings;
