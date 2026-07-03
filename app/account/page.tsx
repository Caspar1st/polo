import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/account/ProfileForm";
import SignOutButton from "@/components/account/SignOutButton";
import DangerZone from "@/components/account/DangerZone";
import SupabaseSetupNotice from "@/components/account/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { MEMBERSHIP_LABELS } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl text-primary-900">Account</h1>
        <SupabaseSetupNotice />
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const membership = profile?.membership ?? "guest";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl text-primary-900">
            {profile?.full_name || "Your account"}
          </h1>
          <p className="mt-2 text-ink-muted">{user.email}</p>
          <p className="mt-3 inline-block rounded-sm bg-primary-800 px-3 py-1 text-xs tracking-[0.2em] uppercase text-accent-200">
            {MEMBERSHIP_LABELS[membership]}
            {profile?.member_since &&
              ` · since ${new Date(profile.member_since).getFullYear()}`}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-md border border-primary-900/10 bg-surface-raised p-6">
          <h2 className="text-2xl text-primary-900">Profile</h2>
          <div className="mt-5">
            {profile ? (
              <ProfileForm profile={profile} />
            ) : (
              <p className="text-sm text-ink-muted">
                Your profile is still being created — refresh in a moment. If
                this persists, the database migration hasn&apos;t been run
                yet (see supabase/migrations/).
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-md border border-primary-900/10 bg-surface-raised p-6">
            <h2 className="text-2xl text-primary-900">Payment methods</h2>
            <p className="mt-3 text-sm text-ink-muted">
              Saved cards and SEPA mandates appear here once payments launch
              (Milestone 4).
            </p>
          </div>

          <div className="rounded-md border border-primary-900/10 bg-surface-raised p-6">
            <h2 className="text-2xl text-primary-900">Privacy (DSGVO)</h2>
            <div className="mt-5">
              <DangerZone />
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              {/* TODO: point at the exact Datenschutzerklärung URL once the
                  club confirms it */}
              Details on how we handle your data:{" "}
              <a
                href="https://frankfurterpoloclub.de/"
                className="text-accent-600 hover:text-accent-500"
              >
                Datenschutzerklärung
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
