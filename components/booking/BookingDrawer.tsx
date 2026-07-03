"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Booking, ClubEvent, LessonType, ResourceType, Trainer } from "@/lib/supabase/types";
import {
  BOOKABLE_RESOURCES,
  DAY_END_HOUR,
  DAY_START_HOUR,
  DURATIONS_MIN,
  RESOURCE_LABELS,
  formatPrice,
  rateKeyFor,
} from "@/lib/bookings/constants";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export interface DrawerSeed {
  resource: ResourceType;
  start: Date;
  eventId?: string;
}

interface BookingDrawerProps {
  seed: DrawerSeed | null;
  trainers: Trainer[];
  events: ClubEvent[];
  rates: Record<string, number>;
  signedIn: boolean;
  onClose: () => void;
  onBooked: () => void;
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TIME_OPTIONS = Array.from(
  { length: (DAY_END_HOUR - DAY_START_HOUR) * 2 },
  (_, i) => {
    const h = DAY_START_HOUR + Math.floor(i / 2);
    return `${String(h).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
  },
);

export function BookingDrawer({
  seed,
  trainers,
  events,
  rates,
  signedIn,
  onClose,
  onBooked,
}: BookingDrawerProps) {
  const [resource, setResource] = useState<ResourceType>("field1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [trainerId, setTrainerId] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("private");
  const [eventId, setEventId] = useState("");
  const [tickets, setTickets] = useState(1);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Booking | null>(null);

  useEffect(() => {
    if (!seed) return;
    setResource(seed.resource);
    setDate(toDateInput(seed.start));
    setTime(
      `${String(seed.start.getHours()).padStart(2, "0")}:${String(seed.start.getMinutes()).padStart(2, "0")}`,
    );
    setEventId(seed.eventId ?? events[0]?.id ?? "");
    setTrainerId(trainers[0]?.id ?? "");
    setDuration(60);
    setTickets(1);
    setNotes("");
    setError(null);
    setDone(null);
    setPending(false);
  }, [seed, events, trainers]);

  const selectedEvent = events.find((e) => e.id === eventId);

  const estimate = useMemo(() => {
    if (resource === "event") {
      return selectedEvent ? selectedEvent.ticket_price_cents * tickets : 0;
    }
    const key = rateKeyFor(resource, lessonType);
    return key ? Math.round(((rates[key] ?? 0) * duration) / 60) : 0;
  }, [resource, selectedEvent, tickets, lessonType, rates, duration]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const startsAt = new Date(`${date}T${time}:00`);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource,
        startsAt: startsAt.toISOString(),
        durationMinutes: duration,
        notes: notes || undefined,
        trainerId: resource === "lesson" ? trainerId : undefined,
        lessonType: resource === "lesson" ? lessonType : undefined,
        eventId: resource === "event" ? eventId : undefined,
        ticketCount: resource === "event" ? tickets : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 201) {
      setDone(body.booking);
      onBooked();
    } else if (res.status === 401) {
      setError("auth");
    } else {
      setError(body.error ?? "Something went wrong — please try again.");
    }
    setPending(false);
  }

  const inputCls =
    "w-full rounded-sm border border-primary-900/20 bg-surface px-3 py-2 outline-none focus:border-accent-500";

  return (
    <AnimatePresence>
      {seed && (
        <>
          <motion.button
            type="button"
            aria-label="Close booking panel"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-primary-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-label="Book a slot"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-surface-raised shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <div className="flex items-center justify-between border-b border-primary-900/10 px-6 py-4">
              <h2 className="text-2xl text-primary-900">
                {done ? "Booked!" : "New booking"}
              </h2>
              <button type="button" onClick={onClose} aria-label="Close"
                className="rounded-sm px-2 py-1 text-xl text-ink-muted hover:text-primary-900">×</button>
            </div>

            {done ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <PoloPonyLoader variant="inline" size={110} className="text-primary-800" />
                <p className="text-lg text-primary-900">
                  {RESOURCE_LABELS[done.resource]} ·{" "}
                  {new Date(done.starts_at).toLocaleString("en-GB", {
                    weekday: "short", day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                {done.price_cents > 0 && (
                  <p className="text-sm text-ink-muted">
                    {formatPrice(done.price_cents)} — payment at the club until
                    online checkout launches (Milestone 4).
                  </p>
                )}
                <a
                  href={`/api/bookings/${done.id}/ics`}
                  className="rounded-sm bg-accent-500 px-6 py-3 text-primary-950 transition-colors hover:bg-accent-400"
                >
                  Add to calendar (.ics)
                </a>
                <button type="button" onClick={onClose} className="text-sm text-ink-muted hover:text-primary-900">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-1 flex-col gap-4 px-6 py-6">
                <label className="block">
                  <span className="mb-1 block text-sm text-ink-muted">Resource</span>
                  <select value={resource} onChange={(e) => setResource(e.target.value as ResourceType)} className={inputCls}>
                    {BOOKABLE_RESOURCES.map((r) => (
                      <option key={r} value={r}>{RESOURCE_LABELS[r]}</option>
                    ))}
                  </select>
                </label>

                {resource === "event" ? (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink-muted">Event</span>
                      <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputCls} required>
                        {events.length === 0 && <option value="">No upcoming events in view</option>}
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} — {new Date(ev.starts_at).toLocaleDateString("en-GB")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink-muted">Spectator tickets</span>
                      <input type="number" min={1} max={20} value={tickets}
                        onChange={(e) => setTickets(Number(e.target.value))} className={inputCls} />
                    </label>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-sm text-ink-muted">Date</span>
                        <input type="date" required value={date}
                          onChange={(e) => setDate(e.target.value)} className={inputCls} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm text-ink-muted">Start</span>
                        <select value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
                          {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink-muted">Duration</span>
                      <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputCls}>
                        {DURATIONS_MIN.map((d) => (
                          <option key={d} value={d}>{d >= 60 ? `${d / 60} h` : `${d} min`}{d === 90 ? " (1.5 h)" : ""}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                {resource === "lesson" && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink-muted">Trainer</span>
                      <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className={inputCls} required>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </label>
                    <fieldset>
                      <legend className="mb-1 text-sm text-ink-muted">Lesson type</legend>
                      <div className="flex gap-4">
                        {(["private", "group"] as const).map((lt) => (
                          <label key={lt} className="flex items-center gap-2 text-sm">
                            <input type="radio" name="lessonType" checked={lessonType === lt}
                              onChange={() => setLessonType(lt)} />
                            <span className="capitalize">{lt}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </>
                )}

                <label className="block">
                  <span className="mb-1 block text-sm text-ink-muted">Notes (optional)</span>
                  <textarea rows={2} value={notes} maxLength={500}
                    onChange={(e) => setNotes(e.target.value)} className={inputCls} />
                </label>

                <div className="flex items-center justify-between rounded-sm bg-accent-50 px-4 py-3">
                  <span className="text-sm text-ink-muted">Estimated price</span>
                  <span className="text-lg text-primary-900">{formatPrice(estimate)}</span>
                </div>

                {error === "auth" ? (
                  <p role="alert" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
                    Please{" "}
                    <Link href="/login?next=/book" className="text-accent-600 underline">
                      sign in
                    </Link>{" "}
                    to book — browsing the calendar is open to everyone.
                  </p>
                ) : (
                  error && (
                    <p role="alert" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
                      {error}
                    </p>
                  )
                )}

                <button
                  type="submit"
                  disabled={pending || (resource === "event" && !eventId)}
                  className="mt-auto flex items-center justify-center rounded-sm bg-accent-500 px-6 py-3 text-primary-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
                >
                  {pending ? <PoloPonyLoader variant="inline" size={34} /> : "Confirm booking"}
                </button>
                {!signedIn && !error && (
                  <p className="text-center text-xs text-ink-faint">
                    You&apos;ll be asked to sign in when confirming.
                  </p>
                )}
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default BookingDrawer;
