import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  FALLBACK_RATES,
  FALLBACK_TRAINERS,
} from "@/lib/bookings/constants";

/**
 * Everything the calendar needs for a visible range, in one request:
 * busy slots (anonymised), club events, trainers, and rates.
 * Public — browsing the calendar requires no login.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to || isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
    return NextResponse.json({ error: "from/to required (ISO dates)" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      busy: [],
      events: [],
      trainers: FALLBACK_TRAINERS,
      rates: FALLBACK_RATES,
    });
  }

  const supabase = await createClient();

  const [busyRes, eventsRes, trainersRes, ratesRes] = await Promise.all([
    supabase
      .from("busy_slots")
      .select("*")
      .lt("starts_at", to)
      .gt("ends_at", from),
    supabase
      .from("club_events")
      .select("*")
      .lt("starts_at", to)
      .gt("ends_at", from)
      .order("starts_at"),
    supabase.from("trainers").select("*").eq("active", true),
    supabase.from("rates").select("*"),
  ]);

  const rates: Record<string, number> = { ...FALLBACK_RATES };
  for (const r of ratesRes.data ?? []) rates[r.key] = r.per_hour_cents;

  return NextResponse.json({
    configured: true,
    busy: busyRes.data ?? [],
    events: eventsRes.data ?? [],
    trainers: trainersRes.data?.length ? trainersRes.data : FALLBACK_TRAINERS,
    rates,
  });
}
