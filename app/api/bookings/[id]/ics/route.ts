import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildIcs } from "@/lib/bookings/ics";
import { RESOURCE_LABELS } from "@/lib/bookings/constants";

/** "Add to calendar": download the booking as an .ics file. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // RLS restricts this to the member's own bookings.
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let title = `${RESOURCE_LABELS[booking.resource]} — Frankfurter Polo Club`;
  if (booking.resource === "event" && booking.event_id) {
    const { data: event } = await supabase
      .from("club_events")
      .select("title")
      .eq("id", booking.event_id)
      .single();
    if (event) title = `${event.title} — Frankfurter Polo Club`;
  }

  const ics = buildIcs({
    uid: booking.id,
    title,
    description: booking.notes ?? undefined,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="fpc-booking-${id.slice(0, 8)}.ics"`,
    },
  });
}
