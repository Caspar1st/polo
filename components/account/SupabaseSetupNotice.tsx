import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

/** Shown wherever auth is needed but the Supabase env vars are not set. */
export function SupabaseSetupNotice() {
  return (
    <div className="mt-10 rounded-md border border-primary-900/10 bg-surface-raised p-8">
      <PoloPonyLoader
        variant="empty"
        size={140}
        label="Member accounts are almost ready"
      />
      <div className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
        <p>
          The Supabase project isn&apos;t connected yet. To enable sign-in:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Create a project at supabase.com</li>
          <li>
            Run <code>supabase/migrations/0001_profiles.sql</code> in its SQL
            editor
          </li>
          <li>
            Copy the project URL and anon key into <code>.env.local</code>{" "}
            (see <code>.env.example</code>)
          </li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}

export default SupabaseSetupNotice;
