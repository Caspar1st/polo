"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setPending(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-ink-muted">New password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-primary-900/20 bg-surface-raised px-4 py-2.5 outline-none focus:border-accent-500"
        />
      </label>
      {message && (
        <p role="status" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-sm bg-accent-500 px-6 py-3 text-primary-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
      >
        {pending ? <PoloPonyLoader variant="inline" size={34} /> : "Save new password"}
      </button>
    </form>
  );
}

export default UpdatePasswordForm;
