import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // 'recovery' | 'signup' | null

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Handle password recovery type — redirect to reset-password with active session
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Handle email verification type — redirect to login with verified banner
      if (type === "signup") {
        return NextResponse.redirect(`${origin}/login?verified=true`);
      }

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

    // Exchange failed — handle by type with appropriate error redirects
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
    }
    if (type === "signup") {
      return NextResponse.redirect(`${origin}/verify-email?error=invalid`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
