---
phase: 17-admin-foundation
plan: 02
status: completed
completed: 2026-05-05
subsystem: auth
tags: [auth, middleware, admin, supabase, ssr, cookies, sessions]

requirements_completed:
  - FOUND-03
  - FOUND-05

one_liner: "Two-cookie session scheme (sb-* customer + sb-admin-* staff coexisting), middleware /admin/* gate with platform_staff verification + cross-redirect of staff away from /dashboard, /admin/login standalone page, and assertPlatformStaff helper returning a typed discriminated union for server actions"

dependency_graph:
  requires:
    - "17-01 (platform_staff table, is_platform_staff RPC, super_admin seed)"
    - "@supabase/ssr createServerClient with cookieOptions.name (built-in Supabase feature)"
    - "Existing customer middleware gates (/dashboard, /app/, /verify-email, /login, /signup, /)"
  provides:
    - "createAdminServerClient() — server Supabase client with sb-admin cookie scope"
    - "createAdminBrowserClient() — browser Supabase client with sb-admin cookie scope"
    - "ADMIN_SUPABASE_COOKIE_PREFIX constant ('sb-admin') exported from admin-server.ts"
    - "assertPlatformStaff(supabase, role?) returning { ok: true, userId, role } | { ok: false, error: ... }"
    - "StaffRole type alias ('super_admin' | 'operator')"
    - "AssertPlatformStaffResult discriminated-union type"
    - "Middleware /admin/* gate (unauthenticated → /admin/login; non-staff bounce → /admin/login?error=not_staff; staff on /admin/login → /admin)"
    - "Middleware /dashboard cross-redirect for staff users (customerUser is platform_staff → /admin)"
    - "/admin/login page (standalone, no admin shell, branded with ADMIN badge)"
    - "AdminLoginForm client component (email + password only)"
    - "signInStaff(formData) and signOutStaff() server actions writing only sb-admin-* cookies"
  affects:
    - "Phase 17-03 (admin shell UI) — the layout calls assertPlatformStaff or trusts the middleware gate; the sidebar logout button wires signOutStaff"
    - "Phases 18-22 (Catalog, Requests, Automations, Clients, Admin Home) — every admin server action is expected to call assertPlatformStaff(createAdminServerClient()) before executing cross-org mutations"
    - "Customer side unchanged: /login still works, /dashboard still gated, root rewrite to landing preserved"

tech_stack:
  added: []
  patterns:
    - "Dual-cookie Supabase SSR clients: customer (sb-*) and admin (sb-admin-*) coexist in one browser via filtered getAll() and Supabase's cookieOptions.name"
    - "Discriminated-union return type from auth helpers (instead of nullable error) so callers narrow to ok-branch with typed userId+role"
    - "Route group (admin-auth) for the login page — keeps it outside the future admin shell layout that 17-03 introduces"
    - "Server-action sign-out double-checks staff membership and revokes session if non-staff slipped through (defense in depth on top of middleware)"

key_files:
  created:
    - "web/src/lib/supabase/admin-server.ts"
    - "web/src/lib/supabase/admin-client.ts"
    - "web/src/lib/auth/assert-platform-staff.ts"
    - "web/src/app/(admin-auth)/admin/login/page.tsx"
    - "web/src/components/admin/admin-login-form.tsx"
    - "web/src/lib/actions/admin-auth.ts"
  modified:
    - "web/src/lib/supabase/middleware.ts"

decisions:
  - "Cookie naming scheme: customer uses default sb-* (Supabase's built-in name with project ref); admin uses sb-admin-* via cookieOptions.name='sb-admin'. Independent namespaces guarantee neither session evicts the other in the same browser. Pattern mirrors how Stripe / Supabase / Vercel let you stay logged into multiple workspaces at once (per CONTEXT.md 'la versión más profesional')."
  - "Two getUser() calls per request (customer + admin) instead of one — the cost is ~30ms of duplicated network IO but the tradeoff is correctness: a single Supabase client cannot read two different cookie scopes in one pass. Promise.all keeps it parallel."
  - "Filter cookies in getAll() rather than rely solely on cookieOptions.name — Supabase only writes cookies under the configured name, but we still defensively filter on read so a stray cross-scope cookie cannot bleed across clients."
  - "/admin/* gate wins over customer logic — the path branch is checked first; if isAdminPath, customer logic does not run. This keeps the two flows from interfering when a customer accidentally hits /admin or vice versa."
  - "Non-staff users who somehow obtain an admin session are SIGNED OUT (not just redirected) before bouncing to /admin/login?error=not_staff. Prevents a stale admin cookie sitting in the browser after a removed staff member returns."
  - "Sign-in server action queries platform_staff a second time (after signInWithPassword) and signs out if the user is not staff. Defense in depth: even if RLS policy on platform_staff is loosened in the future, the server action enforces the check at the server boundary."
  - "No Google OAuth on /admin/login — staff are seeded by SQL/migration (per CONTEXT.md, no UI to add staff in v1.2). Email/password only. OAuth would create a route for non-staff to spawn admin sessions before being bounced."
  - "/admin/login does NOT use next-intl yet — admin i18n keys are 17-03's job. Hardcoded English for now keeps the surface area minimal and avoids cross-plan dependency on a key namespace that does not exist yet. 17-03 will rewrite the page with i18n."
  - "Staff-on-/dashboard cross-redirect uses the customer Supabase client to read platform_staff — a staff member who is signed in via the customer (sb-*) scope to the customer login page would otherwise see the customer dashboard. Per CONTEXT.md, staff have no client org, so they cannot operate there; we route them to /admin."
  - "(admin-auth) route group used for /admin/login so it does NOT inherit the admin shell layout 17-03 will introduce. /admin/login is a leaf with no sidebar, no header, no auth-gate (the page itself is the gate)."

metrics:
  duration_min: 3
  task_count: 3
  files_changed: 7
  loc_added: 442

commits:
  - hash: "4614b61"
    message: "feat(17-02): add admin-scoped Supabase clients and assertPlatformStaff helper"
  - hash: "f0cac2a"
    message: "feat(17-02): extend middleware with /admin/* gate and dual-cookie sessions"
  - hash: "163186b"
    message: "feat(17-02): add /admin/login page, form, and staff sign-in/out actions"
---

# Phase 17 Plan 02: Admin Auth Boundary Summary

## One-Liner

Two new Supabase client factories (admin-server, admin-client) using the `sb-admin` cookie scope; an extended middleware that gates `/admin/*` behind `platform_staff` membership, redirects unauthenticated visitors to `/admin/login`, signs out non-staff who slip through, and cross-redirects staff away from `/dashboard`; the `assertPlatformStaff(supabase, role?)` helper returning a typed discriminated union for downstream server actions; a standalone `/admin/login` page (no admin shell yet), a minimal email/password client form, and `signInStaff` / `signOutStaff` server actions that operate only on the admin cookie scope. Customer login at `/login` and customer middleware behavior remain untouched.

## What Was Built

### Task 1 — Admin Supabase clients + assertPlatformStaff helper (commit `4614b61`)

**`web/src/lib/supabase/admin-server.ts`** (40 LOC)
- `createAdminServerClient()` returns a `createServerClient(...)` configured with `cookieOptions: { name: "sb-admin" }`.
- `getAll()` filters `cookieStore` to entries whose name starts with `sb-admin`, so the admin client never sees customer cookies even if both sets are present.
- `setAll()` wrapped in try/catch so server-component callers (read-only context) do not throw — middleware refreshes the session.
- Exports `ADMIN_SUPABASE_COOKIE_PREFIX = "sb-admin"` for any downstream consumer that needs the prefix literal.

**`web/src/lib/supabase/admin-client.ts`** (12 LOC)
- `createAdminBrowserClient()` returns `createBrowserClient(...)` with the same `cookieOptions: { name: "sb-admin" }`.
- Used only inside admin client components. Currently no client component fetches via Supabase directly (the login form posts through a server action), but the factory is in place for future admin features (live counters, realtime chat, etc.).

**`web/src/lib/auth/assert-platform-staff.ts`** (60 LOC)
- Discriminated-union return type:
  - `{ ok: true; userId: string; role: StaffRole }` on success
  - `{ ok: false; error: "not_authenticated" | "not_staff" | "insufficient_role" }` otherwise
- `StaffRole = "super_admin" | "operator"`
- Caller passes a Supabase client (admin-scoped) so the same session is reused — does not create a new client.
- Optional `requiredRole` enforces exact-match (e.g., `assertPlatformStaff(supabase, "super_admin")` fails an `operator`).
- Logs structured `console.error` on every rejection so production observability captures denied attempts.

### Task 2 — Middleware /admin/* gate + dual-cookie sessions (commit `f0cac2a`)

**`web/src/lib/supabase/middleware.ts`** (203 LOC, +140 / −36)
- Two Supabase clients built up-front: `customerSupabase` (default cookie scope, `sb-*`) and `adminSupabase` (`sb-admin-*`). Each client's `getAll()` filters cookies by prefix so they never read each other's cookies.
- `Promise.all([customerSupabase.auth.getUser(), adminSupabase.auth.getUser()])` resolves both sessions in parallel.
- `/admin/*` branch (executed first):
  - Unauthenticated → redirect to `/admin/login` (unless already there).
  - Authenticated but NOT in `platform_staff` → `signOut()` + redirect to `/admin/login?error=not_staff`.
  - Authenticated staff visiting `/admin/login` → redirect to `/admin`.
  - Authenticated staff on any other `/admin/*` path → pass through.
- Customer-area logic preserved exactly:
  - `/dashboard` and `/app/*` require authentication.
  - Email-verification gate redirects unverified users to `/verify-email`.
  - `/login` and `/signup` redirect authenticated customers to `/dashboard`.
  - Root `/` rewrites to `/landing/index.html` for unauthenticated visitors, redirects authenticated to `/dashboard`.
- New: when `customerUser` hits `/dashboard`, query `platform_staff` and redirect them to `/admin` if present (catches the case where a staff member signs in via `/login` instead of `/admin/login`).

**`web/src/middleware.ts`** — UNCHANGED. The existing matcher (`/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|...|html)$).*)`) already matches `/admin` and `/admin/login` because they have no excluded extension. Confirmed by reading the file before editing — no write required.

### Task 3 — /admin/login page + form + server actions (commit `163186b`)

**`web/src/app/(admin-auth)/admin/login/page.tsx`** (62 LOC)
- Server component, async, accepts `searchParams: Promise<{ error?: string }>`.
- Renders the AIDEAS logo + a high-contrast orange `ADMIN` badge so a staff member can never confuse where they are (per CONTEXT.md visual-distinction decision).
- Surfaces `?error=not_staff` from the middleware bounce as an inline red banner.
- Standalone layout: `min-h-screen flex items-center justify-center` on a near-black background. No sidebar, no header, no admin-shell layout (the `(admin-auth)` route group keeps it outside the future admin layout from 17-03).

**`web/src/components/admin/admin-login-form.tsx`** (66 LOC)
- Client component (`"use client"`).
- Local state: `error`, `pending`. No react-hook-form, no Zod, no reCAPTCHA — minimal surface for internal users; validation happens server-side in `signInStaff`.
- On submit, builds a `FormData` and awaits `signInStaff(formData)`. If the server action returns `{ error }`, the form re-enables and shows the message; on success, the server action throws `NEXT_REDIRECT`.

**`web/src/lib/actions/admin-auth.ts`** (53 LOC)
- `signInStaff(formData)`:
  1. Trims `email`, reads `password`, returns `{ error: "Email and password are required." }` if missing.
  2. Calls `supabase.auth.signInWithPassword({ email, password })` on the admin-scoped client → on Supabase error returns `{ error: "Invalid credentials." }`.
  3. Queries `platform_staff` by `user_id`. If absent, calls `supabase.auth.signOut()` and returns `{ error: "This account is not registered as platform staff." }`.
  4. Otherwise, `redirect("/admin")`.
- `signOutStaff()`:
  1. Builds an admin-scoped client.
  2. Calls `supabase.auth.signOut()` (only `sb-admin-*` cookies are touched — customer cookies survive untouched).
  3. `redirect("/admin/login")`.

## Deviations from Plan

None. The plan executed exactly as written. All three task verification commands (`npx tsc --noEmit`) returned clean, the full `npm run build` succeeded with `/admin/login` registered as a dynamic route, and all Plan 17-02 files passed `npx eslint`.

The deprecation warning printed by Next.js 16 (`The "middleware" file convention is deprecated. Please use "proxy" instead.`) is pre-existing and unrelated — it would require a separate dedicated migration phase (rename `middleware.ts` → `proxy.ts` and follow the Next.js 16 docs). Out of scope for 17-02 per the deviation rules' scope-boundary clause.

## Notes for Downstream Plans

### How 17-03 (Admin Shell UI) Consumes This Output

- The new admin layout at `web/src/app/(admin)/admin/layout.tsx` (or wherever 17-03 places it) calls `await assertPlatformStaff(await createAdminServerClient())` at the top — even though middleware already gates the path, the layout doing the same check costs ~10ms and gives downstream server components a typed `userId + role` for rendering ("Welcome, super_admin Patrick").
- The admin sidebar's logout button wires the existing `signOutStaff` server action — no need to write a new logout flow. The sidebar can `import { signOutStaff } from "@/lib/actions/admin-auth"` and bind it to a `<form action={signOutStaff}>`.
- The admin layout uses `(admin)` as its route group — distinct from `(admin-auth)` which contains only the login page. This split is intentional and lets the layout add the sidebar/header without leaking into `/admin/login`.
- i18n: 17-03 introduces the `admin.*` next-intl namespace. The login page should be UPDATED in 17-03 to consume those keys (currently hardcoded English). All other text on /admin/login moves to `admin.login.*`.

### How Phases 18-22 Consume This Output

Every admin server action follows this pattern:

```typescript
"use server";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";

export async function approveRequest(requestId: string) {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) return { error: auth.error };
  // auth.userId and auth.role are now typed and safe to use
  // … perform mutation using `supabase` (RLS already grants admin via 17-01 policies)
}
```

The admin RLS policies from 17-01 use `is_platform_staff(auth.uid())`, so any query made via `createAdminServerClient()` from a confirmed staff session has full cross-org CRUD on the 9 mutable business tables.

### Pitfalls / Things 17-03+ Should Watch For

1. **Do NOT call `createClient` from `lib/supabase/server.ts` inside admin code paths** — that uses the customer cookie scope and will see no auth (or worse, the customer's auth, leaking cross-tenant data). Always use `createAdminServerClient()`.
2. **Do NOT call `signOutStaff` from a customer-side component** — it would be a no-op for the customer cookies (which is correct), but a customer logout flow should call the existing `supabase.auth.signOut()` on the customer-scoped client.
3. **The `/admin/login` page only handles `?error=not_staff`** — other error codes (network failure, etc.) surface inline via the form's local state. If 17-03+ adds more redirect-with-error paths, extend the `errorMessage` switch in the page.
4. **Cookie size**: with both `sb-*` and `sb-admin-*` cookies set simultaneously, total cookie weight roughly doubles for /admin/* requests. Stay under Supabase's default ~4KB refresh-token size — fine for now, but worth flagging if a future plan introduces large session metadata.

## Self-Check: PASSED

Verified after writing this summary:

- `web/src/lib/supabase/admin-server.ts` exists.
- `web/src/lib/supabase/admin-client.ts` exists.
- `web/src/lib/auth/assert-platform-staff.ts` exists.
- `web/src/lib/supabase/middleware.ts` modified (contains `ADMIN_COOKIE_PREFIX`, `isAdminPath`, `/admin/login`, and the `pathname.startsWith("/dashboard")` staff cross-redirect).
- `web/src/app/(admin-auth)/admin/login/page.tsx` exists.
- `web/src/components/admin/admin-login-form.tsx` exists.
- `web/src/lib/actions/admin-auth.ts` exists.
- Commit `4614b61` exists (Task 1).
- Commit `f0cac2a` exists (Task 2).
- Commit `163186b` exists (Task 3).
- `npx tsc --noEmit` clean across all task files.
- `npx eslint` clean across all task files.
- `npm run build` succeeds; `/admin/login` registered as a dynamic route.
- Existing customer routes (`/login`, `/signup`, `/dashboard`, `/dashboard/*`) still listed in build output → no regression.
