"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * DSGVO/GDPR self-service: export all personal data as JSON, or delete the
 * account permanently (Art. 17 & 20 DSGVO).
 */
export function DangerZone() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Deletion failed — please contact the club office.");
      setPending(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-primary-900">Export my data</p>
          <p className="text-sm text-ink-muted">
            Download everything we store about you as JSON (Art. 20 DSGVO).
          </p>
        </div>
        <a
          href="/api/account/export"
          download
          className="rounded-sm border border-primary-900/20 px-5 py-2.5 text-sm transition-colors hover:border-accent-500"
        >
          Download
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-900/10 pt-4">
        <div>
          <p className="text-primary-900">Delete my account</p>
          <p className="text-sm text-ink-muted">
            Permanently removes your login and profile (Art. 17 DSGVO). This
            cannot be undone.
          </p>
        </div>
        {confirming ? (
          <span className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded-sm bg-primary-900 px-5 py-2.5 text-sm text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Yes, delete forever"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="rounded-sm border border-primary-900/20 px-5 py-2.5 text-sm"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-sm border border-primary-900/30 px-5 py-2.5 text-sm text-primary-900 transition-colors hover:border-primary-900"
          >
            Delete account…
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-sm bg-accent-50 px-4 py-3 text-sm text-primary-900">
          {error}
        </p>
      )}
    </div>
  );
}

export default DangerZone;
