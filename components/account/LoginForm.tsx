"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import PoloPonyLoader from "@/components/shared/PoloPonyLoader";

type Mode = "signin" | "signup";

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M17.05 12.54c-.03-2.9 2.37-4.29 2.48-4.36-1.35-1.97-3.45-2.24-4.2-2.27-1.79-.18-3.49 1.05-4.4 1.05-.9 0-2.3-1.03-3.79-1-1.95.03-3.74 1.13-4.74 2.87-2.02 3.5-.52 8.69 1.45 11.53.96 1.39 2.11 2.95 3.62 2.9 1.45-.06 2-.94 3.76-.94s2.25.94 3.79.91c1.56-.03 2.55-1.42 3.51-2.82 1.1-1.62 1.56-3.19 1.58-3.27-.03-.02-3.03-1.16-3.06-4.6zM14.16 4.02c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.23-1.22 3.54 1.29.1 2.6-.65 3.41-1.62z" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(
    callbackError ? "Sign-in link was invalid or expired. Please try again." : null,
  );

  async function handleApple() {
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setMessage(error.message);
      setPending(false);
    }
    // On success the browser navigates to Apple — no state to reset.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setPending(false);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else if (data.user && !data.session) {
      setMessage("Almost there — check your inbox and confirm your email address.");
    } else {
      router.push(next);
      router.refresh();
      return;
    }
    setPending(false);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Sign in with Apple — first-class, parallel to email */}
      <button
        type="button"
        onClick={handleApple}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3 text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <AppleMark />
        Sign in with Apple
      </button>

      <div className="my-6 flex items-center gap-4 text-xs tracking-[0.25em] uppercase text-ink-faint">
        <span className="h-px flex-1 bg-primary-900/15" />
        or with email
        <span className="h-px flex-1 bg-primary-900/15" />
      </div>

      {/* Mode tabs */}
      <div className="relative mb-6 grid grid-cols-2 rounded-sm border border-primary-900/15">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMessage(null);
            }}
            className={`relative px-4 py-2.5 text-sm transition-colors ${
              mode === m ? "text-primary-900" : "text-ink-muted hover:text-primary-800"
            }`}
          >
            {mode === m && (
              <motion.span
                layoutId="login-tab"
                className="absolute inset-0 border-b-2 border-accent-500 bg-accent-50/60"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">
              {m === "signin" ? "Sign in" : "Create account"}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-sm border border-primary-900/20 bg-surface-raised px-4 py-2.5 outline-none focus:border-accent-500"
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm text-ink-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-primary-900/20 bg-surface-raised px-4 py-2.5 outline-none focus:border-accent-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-ink-muted">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
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
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent-500 px-6 py-3 text-primary-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
        >
          {pending ? (
            <PoloPonyLoader variant="inline" size={34} />
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {mode === "signin" && (
        <p className="mt-4 text-center text-sm">
          <Link href="/login/reset" className="text-accent-600 hover:text-accent-500">
            Forgot your password?
          </Link>
        </p>
      )}
    </div>
  );
}

export default LoginForm;
