"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [newsletter, setNewsletter] = useState(profile.newsletter_opt_in);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        newsletter_opt_in: newsletter,
      })
      .eq("id", profile.id);
    setMessage(error ? error.message : "Saved.");
    setPending(false);
    if (!error) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-ink-muted">Full name</span>
        <input
          type="text"
          value={fullName}
          autoComplete="name"
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-sm border border-primary-900/20 bg-surface-raised px-4 py-2.5 outline-none focus:border-accent-500"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-ink-muted">Phone</span>
        <input
          type="tel"
          value={phone}
          autoComplete="tel"
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-sm border border-primary-900/20 bg-surface-raised px-4 py-2.5 outline-none focus:border-accent-500"
        />
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
          className="h-4 w-4 accent-[--color-accent-500]"
        />
        <span className="text-sm text-ink-muted">
          Email me the club newsletter (per-category preferences arrive with
          the news section)
        </span>
      </label>

      {message && (
        <p role="status" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center rounded-sm bg-accent-500 px-6 py-2.5 text-primary-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
      >
        {pending ? <PoloPonyLoader variant="inline" size={32} /> : "Save changes"}
      </button>
    </form>
  );
}

export default ProfileForm;
