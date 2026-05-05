import { createBrowserClient } from "@supabase/ssr";

/**
 * Admin-scoped Supabase browser client.
 *
 * Reads/writes cookies under the `sb-admin` namespace. Use only inside
 * /admin/* client components (e.g., the admin login form).
 */
export function createAdminBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: "sb-admin" },
    }
  );
}
