import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client — for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth cookies via Next.js `cookies()`.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  const client = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: any) => {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  // ── Test session bypass for MVP ───────────────────────────────────────────
  const isTestAdmin = cookieStore.get("test-session")?.value === "admin";
  if (isTestAdmin) {
    const mockUser = { id: "00000000-0000-0000-0000-000000000000", email: "admin@test.local" };
    
    // Patch the client's auth.getUser to return the mock user
    client.auth.getUser = async () => ({
      data: { user: mockUser as any },
      error: null,
    });
  }

  return client;
}
