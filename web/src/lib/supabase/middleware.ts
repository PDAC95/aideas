import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE_PREFIX = "sb-admin";

/**
 * Unified session middleware for both customer (/dashboard, /app/*) and
 * staff (/admin/*) routes. Customer sessions live under the default `sb-*`
 * cookie scope; staff sessions live under `sb-admin-*`. Both can coexist in
 * the same browser without evicting each other.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  let supabaseResponse = NextResponse.next({ request });

  // Customer remember-me preference (controls customer session cookie maxAge)
  const rememberMe = request.cookies.get("sb-remember-me")?.value;
  const customerCookieMaxAge =
    rememberMe === "false" ? undefined : 60 * 60 * 24 * 30;

  // ---- Customer-scoped Supabase client (default `sb-*` cookies) ----
  const customerSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies
            .getAll()
            .filter((c) => !c.name.startsWith(ADMIN_COOKIE_PREFIX));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: customerCookieMaxAge,
            })
          );
        },
      },
    }
  );

  // ---- Admin-scoped Supabase client (`sb-admin-*` cookies) ----
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_COOKIE_PREFIX },
      cookies: {
        getAll() {
          return request.cookies
            .getAll()
            .filter((c) => c.name.startsWith(ADMIN_COOKIE_PREFIX));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options })
          );
        },
      },
    }
  );

  // Resolve users in both scopes in parallel.
  // Do not run code between createServerClient and getUser() that depends
  // on the user (a simple mistake could make sessions hard to debug).
  const [
    {
      data: { user: customerUser },
    },
    {
      data: { user: adminUser },
    },
  ] = await Promise.all([
    customerSupabase.auth.getUser(),
    adminSupabase.auth.getUser(),
  ]);

  // ---- /admin/* gate ----
  if (isAdminPath) {
    if (!adminUser) {
      if (!isAdminLogin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // adminUser exists — verify they are platform staff
    const { data: staff } = await adminSupabase
      .from("platform_staff")
      .select("user_id")
      .eq("user_id", adminUser.id)
      .single();

    if (!staff) {
      // Logged in via admin scope but not a staff member — sign them out.
      await adminSupabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "not_staff");
      return NextResponse.redirect(url);
    }

    if (isAdminLogin) {
      // Already authenticated staff visiting login → /admin
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ---- Customer-area auth gate (preserved) ----
  if (
    !customerUser &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/app/"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Email verification gate — unverified customers redirected to /verify-email
  if (
    customerUser &&
    !customerUser.email_confirmed_at &&
    !pathname.startsWith("/verify-email") &&
    !pathname.startsWith("/auth/") &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/app/"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/verify-email";
    url.searchParams.set("email", customerUser.email ?? "");
    return NextResponse.redirect(url);
  }

  // ---- Staff on /dashboard → redirect to /admin ----
  // Platform staff are not part of any client org; if they sign into the
  // customer area accidentally, route them to the admin home.
  if (customerUser && pathname.startsWith("/dashboard")) {
    const { data: staff } = await customerSupabase
      .from("platform_staff")
      .select("user_id")
      .eq("user_id", customerUser.id)
      .single();
    if (staff) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in customers away from auth pages
  if (
    customerUser &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Root path: authenticated → dashboard, unauthenticated → static landing
  if (pathname === "/") {
    if (customerUser) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    // Rewrite to static landing page (keeps "/" in URL bar)
    return NextResponse.rewrite(new URL("/landing/index.html", request.url));
  }

  return supabaseResponse;
}
