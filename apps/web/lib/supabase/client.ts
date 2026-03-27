import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client — for use in Client Components (CSR).
 * Call this once per component, or use a singleton pattern.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
