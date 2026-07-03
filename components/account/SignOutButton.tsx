"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-sm border border-primary-900/20 px-5 py-2.5 text-sm text-ink-muted transition-colors hover:border-accent-500 hover:text-primary-900"
    >
      Sign out
    </button>
  );
}

export default SignOutButton;
