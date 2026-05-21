import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Fallback for `/` when middleware doesn't intercept.
 *
 * Authenticated users → /dashboard (handled by middleware too, but a hard
 * fallback here protects against middleware misconfiguration in production).
 *
 * Unauthenticated users → the landing module at NEXT_PUBLIC_LANDING_URL.
 * In the three-module v1.3 architecture, the landing site is a separate
 * Vite app (`landing/`) deployed at https://aideas.ca; this Next.js app
 * (`web/`) lives at https://app.aideas.ca and serves only authenticated
 * surfaces. The middleware in `src/lib/supabase/middleware.ts` does the
 * same redirect — this is belt-and-suspenders.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const landingUrl =
    process.env.NEXT_PUBLIC_LANDING_URL ?? "https://aideas.ca";
  redirect(landingUrl);
}
