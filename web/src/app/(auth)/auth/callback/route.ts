import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // 'recovery' | 'signup' | null

  if (code) {
    const cookieStore = await cookies();

    // Create a Supabase client that tracks cookies set during exchangeCodeForSession
    const cookiesToSet: Array<{
      name: string;
      value: string;
      options: Record<string, unknown>;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            // Collect cookies to forward to the redirect response
            cookiesToSet.push(...cookies);
            cookies.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Will be set on the redirect response below
              }
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Determine redirect destination
      let redirectTo = `${origin}${next}`;

      const isRecovery =
        type === "recovery" ||
        (user?.recovery_sent_at !== undefined &&
          user?.email_confirmed_at !== undefined &&
          new Date(user.recovery_sent_at ?? 0).getTime() >
            Date.now() - 30 * 60 * 1000); // 30 min window

      if (isRecovery) {
        redirectTo = `${origin}/reset-password`;
      } else if (type === "signup") {
        redirectTo = `${origin}/login?verified=true`;
      } else if (user) {
        const isNewOAuthUser =
          !user.user_metadata?.company_name &&
          user.app_metadata?.provider === "google";
        if (isNewOAuthUser) {
          redirectTo = `${origin}/complete-registration`;
        }
      }

      // Create redirect response and forward session cookies
      const response = NextResponse.redirect(redirectTo);
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options as Record<string, string>);
      }
      return response;
    }

    // Exchange failed — redirect with error
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
    }
    if (type === "signup") {
      return NextResponse.redirect(`${origin}/verify-email?error=invalid`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
