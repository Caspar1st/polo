import type { Metadata } from "next";
import Link from "next/link";
import CalendarView from "@/components/booking/CalendarView";
import MyBookings from "@/components/booking/MyBookings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Book" };

export default async function BookPage() {
  let signedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-primary-900">Book</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            One shared calendar for the indoor hall, Fields 1–3, polo lessons
            and tournament tickets. Browsing is open to everyone — booking
            needs a member sign-in.
          </p>
        </div>
        {!signedIn && (
          <Link
            href="/login?next=/book"
            className="rounded-sm bg-accent-500 px-5 py-2.5 text-sm text-primary-950 transition-colors hover:bg-accent-400"
          >
            Sign in to book
          </Link>
        )}
      </div>

      <div className="mt-8">
        <CalendarView signedIn={signedIn} />
      </div>

      {signedIn && (
        <div className="mt-12">
          <h2 className="text-2xl text-primary-900">My bookings</h2>
          <div className="mt-4">
            <MyBookings />
          </div>
        </div>
      )}
    </section>
  );
}
