import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rateKeyFor } from "@/lib/bookings/constants";
import type { LessonType, ResourceType } from "@/lib/supabase/types";

const RESOURCES: ResourceType[] = ["hall", "field1", "field2", "field3", "lesson", "event"];

interface CreateBookingBody {
  resource: ResourceType;
  startsAt: string;
  durationMinutes: number;
  notes?: string;
  trainerId?: string;
  lessonType?: LessonType;
  eventId?: string;
  ticketCount?: number;
}

/** List the signed-in member's bookings (upcoming first). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ bookings: [] });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at");
  return NextResponse.json({ bookings: data ?? [] });
}

/**
 * Create a booking. Auth required; price is computed server-side from the
 * rates table; double-bookings are rejected by the DB exclusion
 * constraints (SQLSTATE 23P01) — never trust the client's availability.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Bookings open once the Supabase project is connected (see README)." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }

  let body: CreateBookingBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { resource, startsAt, durationMinutes } = body;
  if (!RESOURCES.includes(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  }
  if (!startsAt || isNaN(Date.parse(startsAt))) {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }
  if (
    resource !== "event" &&
    (!Number.isFinite(durationMinutes) || durationMinutes < 30 || durationMinutes > 240)
  ) {
    return NextResponse.json({ error: "Duration must be 30–240 minutes" }, { status: 400 });
  }

  const start = new Date(startsAt);
  if (start.getTime() < Date.now()) {
    return NextResponse.json({ error: "Bookings must be in the future" }, { status: 400 });
  }

  let endsAt: string;
  let priceCents = 0;
  let insert: Record<string, unknown> = {
    user_id: user.id,
    resource,
    starts_at: start.toISOString(),
    notes: body.notes?.slice(0, 500) || null,
  };

  if (resource === "event") {
    const ticketCount = Math.floor(body.ticketCount ?? 1);
    if (!body.eventId || ticketCount < 1 || ticketCount > 20) {
      return NextResponse.json({ error: "Event and 1–20 tickets required" }, { status: 400 });
    }
    const { data: event } = await supabase
      .from("club_events")
      .select("*")
      .eq("id", body.eventId)
      .single();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    endsAt = event.ends_at;
    priceCents = event.ticket_price_cents * ticketCount;
    insert = {
      ...insert,
      starts_at: event.starts_at,
      event_id: event.id,
      ticket_count: ticketCount,
    };
  } else {
    endsAt = new Date(start.getTime() + durationMinutes * 60_000).toISOString();
    if (resource === "lesson") {
      if (!body.trainerId || !body.lessonType) {
        return NextResponse.json({ error: "Trainer and lesson type required" }, { status: 400 });
      }
      insert = { ...insert, trainer_id: body.trainerId, lesson_type: body.lessonType };
    }
    const key = rateKeyFor(resource, body.lessonType);
    if (key) {
      const { data: rate } = await supabase
        .from("rates")
        .select("per_hour_cents")
        .eq("key", key)
        .single();
      priceCents = Math.round(((rate?.per_hour_cents ?? 0) * durationMinutes) / 60);
    }
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({ ...insert, ends_at: endsAt, price_cents: priceCents } as never)
    .select()
    .single();

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "That slot has just been taken — pick another time." },
        { status: 409 },
      );
    }
    if (error.message.includes("sold out")) {
      return NextResponse.json({ error: "This event is sold out." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Payment (Milestone 4) will move status pending→confirmed via Stripe.
  return NextResponse.json({ booking }, { status: 201 });
}
