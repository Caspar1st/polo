import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/account/LoginForm";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";
import SupabaseSetupNotice from "@/components/account/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl text-primary-900">Sign in</h1>
        <SupabaseSetupNotice />
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/account");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl text-primary-900">Welcome back</h1>
        <p className="mt-3 text-ink-muted">
          Sign in to book fields and lessons, manage your membership, and
          follow club events.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<PoloPonyLoader size={120} />}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
