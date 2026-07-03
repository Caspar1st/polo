"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BusySlot, ClubEvent, ResourceType, Trainer } from "@/lib/supabase/types";
import {
  BOOKABLE_RESOURCES,
  DAY_END_HOUR,
  DAY_START_HOUR,
  FALLBACK_RATES,
  RESOURCE_LABELS,
  RESOURCE_STYLES,
} from "@/lib/bookings/constants";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";
import BookingDrawer, { type DrawerSeed } from "./BookingDrawer";

/*
 * The one shared calendar. Every bookable resource — hall, three fields,
 * lessons, spectator events — renders through this component; there is no
 * per-resource calendar anywhere in the app.
 */

type ViewMode = "month" | "week" | "day";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const SLOTS_PER_DAY = (DAY_END_HOUR - DAY_START_HOUR) * 2;
const SLOT_H = 22; // px per 30-minute row

interface CalendarData {
  configured: boolean;
  busy: BusySlot[];
  events: ClubEvent[];
  trainers: Trainer[];
  rates: Record<string, number>;
}

export function CalendarView({ signedIn }: { signedIn: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [filters, setFilters] = useState<Set<ResourceType>>(
    () => new Set(BOOKABLE_RESOURCES),
  );
  const [data, setData] = useState<CalendarData>({
    configured: true,
    busy: [],
    events: [],
    trainers: [],
    rates: FALLBACK_RATES,
  });
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<DrawerSeed | null>(null);

  useEffect(() => setMounted(true), []);

  const range = useMemo(() => {
    if (view === "day") {
      const from = startOfDay(cursor);
      return { from, to: addDays(from, 1) };
    }
    if (view === "week") {
      const from = startOfWeek(cursor);
      return { from, to: addDays(from, 7) };
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const from = startOfWeek(first);
    return { from, to: addDays(from, 42) };
  }, [view, cursor]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar?from=${range.from.toISOString()}&to=${range.to.toISOString()}`,
      );
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    if (mounted) void refetch();
  }, [mounted, refetch]);

  const visibleBusy = useMemo(
    () => data.busy.filter((b) => filters.has(b.resource)),
    [data.busy, filters],
  );
  const showEvents = filters.has("event");

  function toggleFilter(r: ResourceType) {
    setFilters((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(r)) nxt.delete(r);
      else nxt.add(r);
      return nxt.size === 0 ? new Set(BOOKABLE_RESOURCES) : nxt;
    });
  }

  function openDrawerAt(day: Date, slotIndex: number) {
    const start = new Date(day);
    start.setHours(DAY_START_HOUR + Math.floor(slotIndex / 2), (slotIndex % 2) * 30, 0, 0);
    const single =
      filters.size === 1 ? [...filters][0] : undefined;
    setDrawer({
      resource: single && single !== "event" ? single : "field1",
      start,
    });
  }

  function step(direction: 1 | -1) {
    if (view === "day") setCursor((c) => addDays(c, direction));
    else if (view === "week") setCursor((c) => addDays(c, 7 * direction));
    else setCursor((c) => new Date(c.getFullYear(), c.getMonth() + direction, 1));
  }

  if (!mounted) {
    return <PoloPonyLoader size={130} label="Saddling up the calendar…" />;
  }

  const heading =
    view === "month"
      ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : view === "week"
        ? `Week of ${startOfWeek(cursor).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
        : cursor.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

  return (
    <div>
      {/* Resource filter chips */}
      <div className="flex flex-wrap gap-2">
        {BOOKABLE_RESOURCES.map((r) => {
          const active = filters.has(r);
          return (
            <button
              key={r}
              type="button"
              onClick={() => toggleFilter(r)}
              aria-pressed={active}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                active
                  ? RESOURCE_STYLES[r].chip
                  : "border border-primary-900/20 text-ink-muted hover:border-accent-500"
              }`}
            >
              {RESOURCE_LABELS[r]}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous"
            className="rounded-sm border border-primary-900/20 px-3 py-1.5 hover:border-accent-500">←</button>
          <button type="button" onClick={() => setCursor(new Date())}
            className="rounded-sm border border-primary-900/20 px-3 py-1.5 text-sm hover:border-accent-500">Today</button>
          <button type="button" onClick={() => step(1)} aria-label="Next"
            className="rounded-sm border border-primary-900/20 px-3 py-1.5 hover:border-accent-500">→</button>
          <span className="ml-2 text-lg text-primary-900">{heading}</span>
        </div>
        <div className="relative flex rounded-sm border border-primary-900/15">
          {(["month", "week", "day"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setView(m)}
              className={`relative px-4 py-1.5 text-sm capitalize ${
                view === m ? "text-primary-900" : "text-ink-muted"
              }`}
            >
              {view === m && (
                <motion.span
                  layoutId="cal-view-tab"
                  className="absolute inset-0 border-b-2 border-accent-500 bg-accent-50/60"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      <div className="relative mt-4 min-h-64">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60">
            <PoloPonyLoader variant="inline" size={90} className="text-primary-800" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${range.from.toISOString()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {view === "month" ? (
              <MonthGrid
                gridStart={range.from}
                cursor={cursor}
                busy={visibleBusy}
                events={showEvents ? data.events : []}
                onPickDay={(d) => {
                  setCursor(d);
                  setView("day");
                }}
              />
            ) : (
              <TimeGrid
                days={
                  view === "week"
                    ? Array.from({ length: 7 }, (_, i) => addDays(range.from, i))
                    : [startOfDay(cursor)]
                }
                busy={visibleBusy}
                events={showEvents ? data.events : []}
                onPickSlot={openDrawerAt}
                onPickEvent={(ev) =>
                  setDrawer({ resource: "event", start: new Date(ev.starts_at), eventId: ev.id })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Click a free slot to book. Coloured blocks are taken.
        {!data.configured && " Demo mode — connect Supabase to enable live availability."}
      </p>

      <BookingDrawer
        seed={drawer}
        trainers={data.trainers}
        events={data.events}
        rates={data.rates}
        signedIn={signedIn}
        onClose={() => setDrawer(null)}
        onBooked={() => void refetch()}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MonthGrid({
  gridStart,
  cursor,
  busy,
  events,
  onPickDay,
}: {
  gridStart: Date;
  cursor: Date;
  busy: BusySlot[];
  events: ClubEvent[];
  onPickDay: (d: Date) => void;
}) {
  const today = new Date();
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs tracking-widest uppercase text-ink-faint">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-md border border-primary-900/10 bg-surface-raised">
        {days.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayBusy = busy.filter((b) => sameDay(new Date(b.starts_at), day));
          const dayEvents = events.filter((e) => sameDay(new Date(e.starts_at), day));
          const shown = dayBusy.slice(0, 4);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onPickDay(day)}
              className={`min-h-20 border-b border-r border-primary-900/5 p-1.5 text-left align-top transition-colors hover:bg-accent-50/70 ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  sameDay(day, today) ? "bg-accent-500 text-primary-950" : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
              <span className="mt-1 flex flex-wrap gap-1">
                {shown.map((b) => (
                  <span
                    key={b.id}
                    className={`h-1.5 w-1.5 rounded-full ${RESOURCE_STYLES[b.resource].block}`}
                  />
                ))}
                {dayBusy.length > 4 && (
                  <span className="text-[10px] text-ink-faint">+{dayBusy.length - 4}</span>
                )}
              </span>
              {dayEvents.map((e) => (
                <span
                  key={e.id}
                  className={`mt-1 block truncate rounded-sm px-1 py-px text-[10px] text-surface ${RESOURCE_STYLES.event.block}`}
                >
                  {e.title}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TimeGrid({
  days,
  busy,
  events,
  onPickSlot,
  onPickEvent,
}: {
  days: Date[];
  busy: BusySlot[];
  events: ClubEvent[];
  onPickSlot: (day: Date, slotIndex: number) => void;
  onPickEvent: (e: ClubEvent) => void;
}) {
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => DAY_START_HOUR + i,
  );

  function blockGeometry(startsAt: string, endsAt: string, day: Date) {
    const dayStart = new Date(day);
    dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
    const startMin = Math.max(0, (new Date(startsAt).getTime() - dayStart.getTime()) / 60_000);
    const endMin = Math.min(
      SLOTS_PER_DAY * 30,
      (new Date(endsAt).getTime() - dayStart.getTime()) / 60_000,
    );
    if (endMin <= 0 || startMin >= SLOTS_PER_DAY * 30) return null;
    return {
      top: (startMin / 30) * SLOT_H,
      height: Math.max(SLOT_H * 0.75, ((endMin - startMin) / 30) * SLOT_H),
    };
  }

  return (
    <div className="overflow-x-auto rounded-md border border-primary-900/10 bg-surface-raised">
      <div className="flex min-w-[640px]">
        {/* Hour gutter */}
        <div className="w-14 shrink-0 border-r border-primary-900/10 pt-8">
          {hours.map((h) => (
            <div key={h} className="pr-2 text-right text-[11px] text-ink-faint" style={{ height: SLOT_H * 2 }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayBusy = busy.filter((b) => blockGeometry(b.starts_at, b.ends_at, day));
          const dayEvents = events.filter((e) => blockGeometry(e.starts_at, e.ends_at, day));
          return (
            <div key={day.toISOString()} className="min-w-0 flex-1 border-r border-primary-900/5 last:border-r-0">
              <div className="flex h-8 items-center justify-center border-b border-primary-900/10 text-sm text-primary-900">
                {day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
              </div>
              <div className="relative">
                {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-label={`Book ${day.toLocaleDateString("en-GB")} at ${String(DAY_START_HOUR + Math.floor(slot / 2)).padStart(2, "0")}:${slot % 2 ? "30" : "00"}`}
                    onClick={() => onPickSlot(day, slot)}
                    className={`block w-full border-b hover:bg-accent-50 ${
                      slot % 2 ? "border-primary-900/10" : "border-primary-900/5 border-dashed"
                    }`}
                    style={{ height: SLOT_H }}
                  />
                ))}

                {dayBusy.map((b) => {
                  const geo = blockGeometry(b.starts_at, b.ends_at, day)!;
                  return (
                    <div
                      key={b.id}
                      title={`${RESOURCE_LABELS[b.resource]} — booked`}
                      className={`absolute inset-x-0.5 cursor-not-allowed rounded-sm px-1 text-[10px] leading-4 text-surface/90 opacity-90 ${RESOURCE_STYLES[b.resource].block}`}
                      style={{ top: geo.top, height: geo.height }}
                    >
                      {RESOURCE_LABELS[b.resource]}
                    </div>
                  );
                })}

                {dayEvents.map((e) => {
                  const geo = blockGeometry(e.starts_at, e.ends_at, day)!;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onPickEvent(e)}
                      className={`absolute inset-x-0.5 truncate rounded-sm px-1 text-left text-[10px] leading-4 text-surface ${RESOURCE_STYLES.event.block} hover:opacity-90`}
                      style={{ top: geo.top, height: geo.height }}
                    >
                      {e.title} · tickets
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarView;
