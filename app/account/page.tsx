import type { Metadata } from "next";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl text-primary-900">Account</h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Sign in with Apple and email, membership status, payment methods and
        newsletter preferences arrive in Milestone 2.
      </p>
      <PoloPonyLoader
        variant="empty"
        size={150}
        label="You are not signed in yet"
        className="mt-12"
      />
    </section>
  );
}
