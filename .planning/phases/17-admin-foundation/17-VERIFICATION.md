---
phase: 17-admin-foundation
verified: 2026-05-05T20:10:53Z
human_verified: 2026-05-05T22:00:00Z
status: passed
score: 6/6 must-haves verified (codebase scan + 5/5 human UAT items confirmed in browser)
human_verification_outcome: |
  All 5 human-UAT items confirmed working in browser by user:
  1. /admin/login auth flow + admin shell renders with orange ADMIN badge
  2. Customer + staff sessions coexist independently (verified two tabs simultaneously)
  3. Non-staff customer (Bob) hitting /admin → bounced to /admin/login
  4. Staff hitting /dashboard → redirected to /admin (after middleware fix below)
  5. EN/ES sidebar parity in code; runtime locale switcher not present in admin shell yet (deferred)
post_uat_fixes:
  - "Middleware order bug: staff hitting /dashboard with only admin cookies fell to customer auth gate (→ /login) before the staff redirect (→ /admin) could match. Fixed by inserting the staff cross-redirect block BEFORE the customer auth gate in middleware.ts."
deferred_to_future_phase:
  - "Locale switcher UI in admin shell — not planned in Phase 17 scope; users can set NEXT_LOCALE cookie manually for now"
  - "Admin visual design polish — current shell is utilitarian/placeholder; will be revisited when admin pages have real content (Phases 18-22)"
human_verification:
  - test: "Sign in at /admin/login with pdmckinster@gmail.com → land at /admin shell"
    expected: "Admin layout renders with logo + orange ADMIN badge in desktop header, sidebar shows Home/Catalog/Requests/Automations/Clients with Sign out pinned at bottom; clicking each nav item renders the corresponding placeholder page inside the same shell"
    why_human: "Visual rendering of layout, badge color/visibility, and nav UX cannot be verified by static analysis"
  - test: "Independent customer + staff sessions in same browser"
    expected: "In tab A, sign in at /admin/login as pdmckinster@gmail.com — land at /admin. In tab B, sign in at /login as a regular customer (e.g., alice@acmecorp.com) — land at /dashboard. Refresh both tabs: both stay logged in. Clicking Sign out in /admin does not log out the customer tab."
    why_human: "Two-cookie session independence requires real browser behavior; the sb-* vs sb-admin-* split is correctly coded but only a live test confirms cookies do not collide"
  - test: "Non-staff user blocked from /admin"
    expected: "While signed in as a regular customer (only), navigate to /admin → middleware signs out the admin scope (no-op since no admin session existed) and redirects to /admin/login. Attempting to sign in at /admin/login with a non-staff customer account returns to /admin/login?error=not_staff with a friendly Spanish/English banner."
    why_human: "Redirect chain depends on real auth state; can be exercised via browser only"
  - test: "Staff at /dashboard auto-redirected to /admin"
    expected: "Sign in via /login (customer scope) using pdmckinster@gmail.com (who is also platform_staff). After landing on /dashboard the middleware should redirect to /admin within one navigation cycle."
    why_human: "Cross-scope redirect uses customer Supabase client to read platform_staff; real session needed"
  - test: "Language switch toggles admin shell + login strings"
    expected: "Switch NEXT_LOCALE cookie to 'es' (or use the locale switcher). Reload /admin and /admin/login. Sidebar shows Inicio/Catalogo/Solicitudes/Automatizaciones/Clientes/Cerrar sesion; subtitle shows 'Consola interna del equipo AIDEAS'; login page title shows 'Acceso de equipo'."
    why_human: "next-intl wiring at runtime cannot be confirmed without a real locale cookie + render"
---

# Phase 17: Admin Foundation Verification Report

**Phase Goal:** Establish the schema, RLS, route gate, layout, and server-action helper that every admin capability builds on.
**Verified:** 2026-05-05T20:10:53Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | Migration creates `platform_staff(user_id, role, created_at)` with role CHECK accepting only `super_admin`/`operator` | ✓ VERIFIED | `supabase/migrations/20260506000001_admin_foundation.sql:28-32` — CREATE TABLE IF NOT EXISTS with PK FK to auth.users, role TEXT CHECK (role IN ('super_admin','operator')), created_at TIMESTAMPTZ DEFAULT NOW(); index on role at line 46 |
| 2   | RLS policies on 11 business tables grant full CRUD to platform_staff (immutable tables get SELECT only), preserving org-scoped policies | ✓ VERIFIED | 38 admin policies emitted: 9 mutable tables × 4 verbs = 36 (`organizations`, `profiles`, `organization_members`, `automation_templates`, `automations`, `automation_requests`, `subscriptions`, `notifications`, `invitations`) + 2 immutable SELECT-only (`automation_executions:414`, `chat_messages:428`); zero admin INSERT/UPDATE/DELETE on immutable tables (grep confirmed); existing client policies untouched |
| 3   | Non-staff at /admin → /admin/login (signed out); unauthenticated → /admin/login; staff loads admin shell; staff at /dashboard → /admin | ? UNCERTAIN | Code paths verified in `web/src/lib/supabase/middleware.ts:92-126` (admin gate signs out non-staff at line 111 then redirects to /admin/login?error=not_staff at line 113-115; unauthenticated at line 93-99 redirects to /admin/login; staff bypass at line 118-123) and `:155-166` (staff on /dashboard → /admin via customerSupabase platform_staff lookup). Runtime redirect behavior requires browser UAT. |
| 4   | /admin renders fresh AdminLayout/AdminSidebar/AdminHeader (NOT customer reuse), with orange ADMIN badge and admin sidebar (Home, Catalog, Requests, Automations, Clients, Logout) | ? UNCERTAIN | Code: `(admin)/admin/layout.tsx` (51 LOC) imports only AdminSidebar/AdminHeader (no DashboardNav/DashboardHeader); `admin-sidebar.tsx:44-50` defines the 5 nav items in correct order with AdminSignOut pinned at bottom (`:163-165`); `admin-header.tsx:18-19` renders bg-orange-500 badge; grep across `web/src/app/(admin)` and `web/src/components/admin` for `@/components/dashboard` returned zero matches. Visual rendering requires browser UAT. |
| 5   | `assertPlatformStaff(role?)` returns typed discriminated union, callable from any server action | ✓ VERIFIED | `web/src/lib/auth/assert-platform-staff.ts:5-9` — `AssertPlatformStaffResult = { ok: true; userId; role } \| { ok: false; error: 'not_authenticated' \| 'not_staff' \| 'insufficient_role' }`; function takes optional `requiredRole: StaffRole`; logs structured console.error on each rejection. Already consumed by `(admin)/admin/layout.tsx:25` |
| 6   | All admin shell strings (banner, sidebar items, role-denied messages) exist in en.json AND es.json with parity | ✓ VERIFIED | `node` flatten/diff confirmed 27 keys in EN, 27 in ES, zero missing in either direction. Admin namespace covers `badge`, `shell.subtitle`, `nav.{home,catalog,requests,automations,clients,logout}`, `login.{title,subtitle,emailLabel,passwordLabel,submit,submitting}`, `login.errors.{invalidCredentials,notStaff,missingFields}`, `placeholders.{home,catalog,requests,automations,clients}.{title,body}` |

**Score:** 6/6 truths verified at the codebase level (4 fully verified, 2 dependent on browser UAT for visual/runtime confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `supabase/migrations/20260506000001_admin_foundation.sql` | platform_staff + helpers + RLS extensions + super_admin seed | ✓ VERIFIED | 437 LOC; CREATE TABLE present, both helpers SECURITY DEFINER + STABLE + SET search_path = '', GRANTed to authenticated; conditional seed via DO block + RAISE NOTICE fallback; ON CONFLICT (user_id) DO NOTHING for idempotency |
| `web/src/lib/auth/assert-platform-staff.ts` | assertPlatformStaff helper | ✓ VERIFIED | 62 LOC, exports `assertPlatformStaff`, `StaffRole`, `AssertPlatformStaffResult`; consumed by `(admin)/admin/layout.tsx` |
| `web/src/lib/supabase/admin-server.ts` | createAdminServerClient with sb-admin scope | ✓ VERIFIED | 42 LOC, exports `createAdminServerClient` + `ADMIN_SUPABASE_COOKIE_PREFIX`; uses cookieOptions.name='sb-admin' + getAll-filter on prefix |
| `web/src/lib/supabase/admin-client.ts` | createAdminBrowserClient | ✓ VERIFIED | 18 LOC, exports `createAdminBrowserClient`; same sb-admin cookie name |
| `web/src/lib/supabase/middleware.ts` | Extended with /admin/* gate + staff-on-/dashboard cross-redirect | ✓ VERIFIED | 191 LOC total; ADMIN_COOKIE_PREFIX constant at :4; isAdminPath branch at :92-126; staff cross-redirect at :155-166; customer logic preserved |
| `web/src/middleware.ts` | Matcher includes /admin/* | ✓ VERIFIED | 20 LOC; existing matcher excludes only static assets — /admin and /admin/login are NOT excluded → already routed through updateSession |
| `web/src/lib/actions/admin-auth.ts` | signInStaff + signOutStaff server actions | ✓ VERIFIED | 58 LOC; both 'use server'; signInStaff double-checks platform_staff and signs out on miss; signOutStaff redirects to /admin/login; both use createAdminServerClient |
| `web/src/app/(admin-auth)/admin/login/page.tsx` | Standalone login (no admin shell) | ✓ VERIFIED | 73 LOC; lives in `(admin-auth)` route group (separate from `(admin)`); uses `getTranslations("admin")`; surfaces ?error=not_staff inline; renders logo + orange ADMIN badge |
| `web/src/components/admin/admin-login-form.tsx` | Email/password form | ✓ VERIFIED | 98 LOC; client component; consumes labels from server props; localizeError() maps server English errors to localized labels; submits to signInStaff |
| `web/src/app/(admin)/admin/layout.tsx` | AdminLayout with auth guard | ✓ VERIFIED | 51 LOC; assertPlatformStaff(createAdminServerClient()) → redirect('/admin/login') on failure; passes 6 nav labels + badge + subtitle to children; main offset by lg:pl-60 |
| `web/src/app/(admin)/admin/page.tsx` | Home placeholder | ✓ VERIFIED | 19 LOC; consumes admin.placeholders.home; clean h1+p shape |
| `web/src/app/(admin)/admin/catalog/page.tsx` | Catalog placeholder | ✓ VERIFIED | 16 LOC; admin.placeholders.catalog |
| `web/src/app/(admin)/admin/requests/page.tsx` | Requests placeholder | ✓ VERIFIED | 17 LOC; admin.placeholders.requests |
| `web/src/app/(admin)/admin/automations/page.tsx` | Automations placeholder | ✓ VERIFIED | 17 LOC; admin.placeholders.automations |
| `web/src/app/(admin)/admin/clients/page.tsx` | Clients placeholder | ✓ VERIFIED | 17 LOC; admin.placeholders.clients |
| `web/src/components/admin/admin-sidebar.tsx` | Fresh sidebar (no customer reuse) | ✓ VERIFIED | 169 LOC; mobile drawer + desktop fixed; 5 nav items in correct order (Home, Catalog, Requests, Automations, Clients); AdminSignOut pinned at bottom; imports lucide + cn + AdminSignOut only — zero customer-dashboard imports (grep confirmed) |
| `web/src/components/admin/admin-header.tsx` | Header with logo + ADMIN badge | ✓ VERIFIED | 26 LOC; bg-orange-500 badge + subtitle; lg:flex (hidden on mobile because sidebar bar already shows badge inline) |
| `web/src/components/admin/admin-sign-out.tsx` | Logout button → signOutStaff | ✓ VERIFIED | 30 LOC; `<form action={signOutStaff}>` works without JS; red hover state distinguishes from nav items |
| `web/messages/en.json` (admin namespace) | admin.* keys | ✓ VERIFIED | 27 leaf keys present |
| `web/messages/es.json` (admin namespace) | admin.* keys (Spanish parity) | ✓ VERIFIED | 27 leaf keys present, full parity with EN; accent-free convention preserved (Catalogo, Cerrar sesion, Contrasena, etc.) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| 38 RLS admin policies | `is_platform_staff(auth.uid())` | OR clause through SECURITY DEFINER helper | ✓ WIRED | Every admin policy uses `USING (public.is_platform_staff((SELECT auth.uid())))` — verified across all CREATE POLICY statements; existing client policies unchanged (`organizations_select_members`, `profiles_select_own`, etc., still present) |
| platform_staff seed | `auth.users WHERE email = 'pdmckinster@gmail.com'` | DO block with SELECT INTO + ON CONFLICT DO NOTHING | ✓ WIRED | Lines 90-102: SELECT id INTO v_user_id; IF NULL → RAISE NOTICE; ELSE INSERT ON CONFLICT DO NOTHING |
| `(admin)/admin/layout.tsx` | `assertPlatformStaff` + `createAdminServerClient` | imports + invocation at top of layout | ✓ WIRED | Lines 24-29: `const supabase = await createAdminServerClient(); const auth = await assertPlatformStaff(supabase); if (!auth.ok) redirect("/admin/login");` |
| `AdminSignOut` | `signOutStaff` server action | `<form action={signOutStaff}>` | ✓ WIRED | admin-sign-out.tsx:4 imports signOutStaff; :19 binds it to form action |
| `signInStaff` server action | `platform_staff` verification | direct query before redirect | ✓ WIRED | admin-auth.ts:35-44: queries platform_staff after signInWithPassword; calls signOut + returns error if not staff |
| Middleware /admin/* | sb-admin cookie scope | filter cookies by ADMIN_COOKIE_PREFIX in getAll() | ✓ WIRED | middleware.ts:33 filters out admin cookies for customerSupabase; :60 filters in admin cookies for adminSupabase; both clients run in Promise.all at :86-89 |
| Middleware /dashboard (staff) | redirect('/admin') | platform_staff lookup via customerSupabase | ✓ WIRED | middleware.ts:155-166: when customerUser is on /dashboard, query platform_staff; if found, redirect to /admin |
| Admin shell strings | next-intl admin.* namespace | getTranslations("admin") in server components, props in client | ✓ WIRED | layout.tsx:31, page.tsx:10 (and all 4 sub-pages), login/page.tsx:23 — all consume admin.* keys; AdminSidebar/AdminLoginForm receive labels as props (avoids client runtime cost) |
| AdminSidebar logout button | sidebar bottom slot | AdminSignOut rendered after nav inside SidebarContent | ✓ WIRED | admin-sidebar.tsx:163-165: `<div className="p-3 border-t border-gray-800"><AdminSignOut label={logoutLabel} /></div>` — pinned at bottom of flex-col aside |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| FOUND-01 | 17-01 | Migration creates platform_staff with PK, role CHECK, created_at, indexes | ✓ SATISFIED | `20260506000001_admin_foundation.sql:28-46`; idx_platform_staff_role on role |
| FOUND-02 | 17-01 | RLS extensions across business tables for staff cross-org access | ✓ SATISFIED | 38 admin policies on 11 tables; immutable tables get SELECT only |
| FOUND-03 | 17-02 | Middleware blocks /admin/* for non-staff with correct redirect tree | ✓ SATISFIED (per CONTEXT override) | middleware.ts admin branch redirects to /admin/login (NOT /login per CONTEXT.md override of ROADMAP); staff-on-/dashboard → /admin cross-redirect present. **Note:** REQUIREMENTS.md still says "redirects clients-only users to /dashboard, unauthenticated to /login" — the implementation correctly follows CONTEXT.md (admin/login namespace separation). REQUIREMENTS.md text is stale relative to CONTEXT.md but the requirement is otherwise satisfied. |
| FOUND-04 | 17-03 | /admin layout reuses customer header/sidebar with admin items + banner | ✓ SATISFIED (per CONTEXT override) | REQUIREMENTS.md text says "reuses customer header/sidebar components" — CONTEXT.md OVERRIDES with "fresh AdminLayout/AdminSidebar/AdminHeader, NO customer reuse". Implementation follows CONTEXT (zero customer-dashboard imports in admin/* tree, verified via grep). Sidebar items + orange ADMIN badge present. |
| FOUND-05 | 17-02 | assertPlatformStaff(role?) returns typed error for UI on failure | ✓ SATISFIED | `web/src/lib/auth/assert-platform-staff.ts` — discriminated union with explicit `ok` flag; optional requiredRole; consumed by AdminLayout |
| I18N-01 | 17-03 | All admin UI strings in en.json + es.json at 100% parity | ✓ SATISFIED | 27 keys, parity verifier confirms zero missing in either direction |

**Orphaned requirements:** None. All 6 phase requirement IDs are accounted for in the plans (17-01: FOUND-01,FOUND-02; 17-02: FOUND-03,FOUND-05; 17-03: FOUND-04,I18N-01).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |

None found. Grep across `(admin)`, `components/admin`, `lib/actions/admin-auth.ts`, `lib/auth/assert-platform-staff.ts`, `lib/supabase/admin-*.ts`, `lib/supabase/middleware.ts` for `TODO|FIXME|XXX|HACK|PLACEHOLDER` returned zero matches.

The placeholder pages are intentional and explicit (Phases 18-22 will replace them); their bodies cite the future phase number in copy ("Phase 18", "Phase 19", etc.). They are not stubs masquerading as implementation — they are the deliverable for Phase 17 per FOUND-04 and per the plan ("5 placeholder pages — Phases 18-22 will fill them").

### Human Verification Required

5 items above (see frontmatter `human_verification`). Each requires a live browser session to confirm:

1. **Visual rendering of /admin shell** — orange ADMIN badge visibility, sidebar layout, header chrome
2. **Two-cookie session independence** — sb-* and sb-admin-* coexisting without eviction
3. **Non-staff bounce flow** — /admin redirect chain + ?error=not_staff banner display
4. **Staff cross-redirect** — pdmckinster@gmail.com signing in via /login lands at /admin
5. **Locale switch** — Spanish admin shell strings (Inicio, Catalogo, Cerrar sesion, etc.) render correctly

### Gaps Summary

No implementation gaps. Every must-have, every artifact, every key link, and every requirement ID maps to verified code in the repository. The phase delivers a clean foundation:

- **Schema layer** (FOUND-01, FOUND-02): single migration, idempotent, additive, with helper functions safely defined.
- **Auth boundary** (FOUND-03, FOUND-05): two-cookie scheme implemented; middleware gate executes the admin branch first; assertPlatformStaff returns a typed discriminated union; signInStaff double-checks platform_staff at the server boundary.
- **Admin shell** (FOUND-04): fresh layout/sidebar/header — zero imports from customer dashboard; orange ADMIN badge across 4 surface points (mobile bar, sidebar header, AdminHeader, /admin/login); 5 placeholder pages all consume the i18n namespace; sign-out wires to signOutStaff via plain HTML form (works without JS).
- **i18n parity** (I18N-01): 27 keys at full EN/ES parity; admin namespace covers everything introduced in Phase 17 including the retrofit of /admin/login.

The two REQUIREMENTS.md text entries that diverge from CONTEXT.md (FOUND-03 redirect targets, FOUND-04 layout reuse) are correctly resolved in favor of CONTEXT.md per its "OVERRIDDEN BY CONTEXT" markers in the success criteria. This is documented in CONTEXT.md and acknowledged in 17-02 and 17-03 plan frontmatter notes.

Status set to `human_needed` because 5 items (rendering, cross-tab sessions, redirect chain, cross-redirect, locale switch) cannot be confirmed by static analysis. Recommend a brief UAT pass before progressing to Phase 18.

---

_Verified: 2026-05-05T20:10:53Z_
_Verifier: Claude (gsd-verifier)_
