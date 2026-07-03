import type { Metadata } from "next";
import ResetRequestForm from "@/components/account/ResetRequestForm";
import SupabaseSetupNotice from "@/components/account/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl text-primary-900">Reset your password</h1>
        <p className="mt-3 text-ink-muted">
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
      </div>
      <div className="mt-10">
        {isSupabaseConfigured() ? <ResetRequestForm /> : <SupabaseSetupNotice />}
      </div>
    </section>
  );
}
