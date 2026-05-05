import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "sb-admin";

/**
 * Admin-scoped Supabase server client.
 *
 * Reads/writes cookies under the `sb-admin` namespace so admin sessions are
 * isolated from customer sessions (default `sb-*` cookies). Use from server
 * components, route handlers, and server actions in the /admin/* tree.
 */
export async function createAdminServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore
            .getAll()
            .filter((c) => c.name.startsWith(ADMIN_COOKIE_NAME));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignored when middleware refreshes session.
          }
        },
      },
    }
  );
}

export const ADMIN_SUPABASE_COOKIE_PREFIX = ADMIN_COOKIE_NAME;
