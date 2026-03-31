import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Detect new OAuth user: check if user metadata lacks company_name
      // (set during email signup but not present for first-time Google OAuth users)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isNewOAuthUser =
          !user.user_metadata?.company_name &&
          user.app_metadata?.provider === "google";

        if (isNewOAuthUser) {
          return NextResponse.redirect(`${origin}/complete-registration`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
