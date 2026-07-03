/**
 * Central env access for Supabase. The app must build and run without a
 * Supabase project configured (Milestone 1 behaviour): pages check
 * `isSupabaseConfigured()` and show a setup notice instead of crashing.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}
