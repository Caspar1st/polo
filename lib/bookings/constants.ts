import type { ResourceType } from "@/lib/supabase/types";

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  hall: "Indoor hall",
  field1: "Field 1",
  field2: "Field 2",
  field3: "Field 3",
  lesson: "Lesson",
  event: "Event",
};

/** Chip/block colors per resource — design-token utilities only. */
export const RESOURCE_STYLES: Record<
  ResourceType,
  { chip: string; block: string }
> = {
  hall: { chip: "bg-primary-800 text-accent-200", block: "bg-primary-800" },
  field1: { chip: "bg-primary-600 text-surface", block: "bg-primary-600" },
  field2: { chip: "bg-primary-500 text-surface", block: "bg-primary-500" },
  field3: { chip: "bg-primary-400 text-surface", block: "bg-primary-400" },
  lesson: { chip: "bg-accent-500 text-primary-950", block: "bg-accent-500" },
  event: { chip: "bg-accent-700 text-surface", block: "bg-accent-700" },
};

export const BOOKABLE_RESOURCES: ResourceType[] = [
  "hall",
  "field1",
  "field2",
  "field3",
  "lesson",
  "event",
];

/** Day grid boundaries (club opening hours) and slot granularity. */
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 21;
export const DURATIONS_MIN = [30, 60, 90, 120];

/**
 * Fallback rates (cents/hour) mirroring the seeds in
 * supabase/migrations/0002_bookings.sql — used for client-side price
 * *estimates* and demo mode. The server always recomputes from the DB.
 */
export const FALLBACK_RATES: Record<string, number> = {
  hall: 6000,
  field: 4500,
  lesson_private: 9000,
  lesson_group: 5500,
};

export const FALLBACK_TRAINERS = [
  {
    id: "demo-brad",
    name: "Brad Rainford-Blackett",
    bio: "Head polo trainer at Frankfurter Polo Club.",
    active: true,
  },
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function rateKeyFor(
  resource: ResourceType,
  lessonType?: "private" | "group" | null,
): string | null {
  if (resource === "hall") return "hall";
  if (resource === "field1" || resource === "field2" || resource === "field3")
    return "field";
  if (resource === "lesson")
    return lessonType === "group" ? "lesson_group" : "lesson_private";
  return null; // events price via ticket price
}
