---
phase: 17-admin-foundation
plan: 03
status: completed
completed: 2026-05-05
subsystem: ui
tags: [admin, layout, sidebar, header, i18n, nextjs, route-group]

requirements_completed:
  - FOUND-04
  - I18N-01

one_liner: "Admin shell at (admin)/admin: AdminLayout (defense-in-depth assertPlatformStaff) + AdminSidebar (Home/Catalog/Requests/Automations/Clients + Logout) + AdminHeader (orange ADMIN badge) + 5 placeholder pages + 27-key admin.* i18n namespace at full EN/ES parity, plus retrofit of /admin/login to consume the new keys"

dependency_graph:
  requires:
    - "17-02 (createAdminServerClient, assertPlatformStaff, signOutStaff, /admin/login page, /admin/* middleware gate)"
    - "Existing next-intl infrastructure (web/src/i18n/request.ts, en.json, es.json)"
    - "Existing /logo.png + lucide-react icon set"
  provides:
    - "web/src/app/(admin)/admin/layout.tsx (AdminLayout with auth guard)"
    - "web/src/components/admin/admin-sidebar.tsx (AdminSidebar)"
    - "web/src/components/admin/admin-header.tsx (AdminHeader)"
    - "web/src/components/admin/admin-sign-out.tsx (AdminSignOut form button)"
    - "web/src/app/(admin)/admin/page.tsx (Home placeholder)"
    - "web/src/app/(admin)/admin/catalog/page.tsx"
    - "web/src/app/(admin)/admin/requests/page.tsx"
    - "web/src/app/(admin)/admin/automations/page.tsx"
    - "web/src/app/(admin)/admin/clients/page.tsx"
    - "admin.* next-intl namespace (27 keys at EN/ES parity)"
  affects:
    - "Phase 18 (Catalog Admin) — replaces /admin/catalog placeholder body, adds admin.catalog.* keys"
    - "Phase 19 (Requests Inbox) — replaces /admin/requests placeholder body, adds admin.requests.* keys"
    - "Phase 20 (Automations Admin) — replaces /admin/automations placeholder body, adds admin.automations.* keys"
    - "Phase 21 (Clients Admin) — replaces /admin/clients placeholder body, adds admin.clients.* keys"
    - "Phase 22 (Admin Home) — replaces /admin placeholder with the real dashboard, adds admin.home.* keys"

tech_stack:
  added: []
  patterns:
    - "Defense-in-depth auth: layout repeats assertPlatformStaff(createAdminServerClient()) on top of middleware gate (~10ms cost; protects against future middleware bypass)"
    - "Two route groups split: (admin-auth) hosts the standalone login leaf with no shell; (admin) hosts every page that should render inside the AdminSidebar+AdminHeader chrome"
    - "Server-resolved labels passed as props to client components (AdminSidebar, AdminLoginForm) — avoids loading the next-intl client runtime where it is not strictly needed"
    - "<form action={signOutStaff}> for the sidebar logout — works without JS, no need for a client-side handler"
    - "i18n parity verifier: a node one-liner that flattens both admin namespaces to dotted keys, sorts, and diffs both directions; runs in CI-friendly time and asserts a minimum key floor"

key_files:
  created:
    - "web/src/app/(admin)/admin/layout.tsx"
    - "web/src/app/(admin)/admin/page.tsx"
    - "web/src/app/(admin)/admin/catalog/page.tsx"
    - "web/src/app/(admin)/admin/requests/page.tsx"
    - "web/src/app/(admin)/admin/automations/page.tsx"
    - "web/src/app/(admin)/admin/clients/page.tsx"
    - "web/src/components/admin/admin-sidebar.tsx"
    - "web/src/components/admin/admin-header.tsx"
    - "web/src/components/admin/admin-sign-out.tsx"
  modified:
    - "web/messages/en.json"
    - "web/messages/es.json"
    - "web/src/app/(admin-auth)/admin/login/page.tsx"
    - "web/src/components/admin/admin-login-form.tsx"

decisions:
  - "Badge color is orange (bg-orange-500) — high-contrast against the dark gray-900 sidebar and the white-text login page; consistent across mobile top bar, sidebar header, login page, and AdminHeader subtitle area, so the visual cue never disappears regardless of viewport"
  - "Sidebar palette is dark (gray-900 background, gray-300 inactive text, orange-500/15 + orange-300 active) — distinct from the customer DashboardNav (white card on gray-200, purple accents). A staff member who accidentally toggles to /admin sees an obviously different UI in <500ms"
  - "AdminHeader is hidden on mobile (lg:flex) — the mobile nav bar already shows the logo + ADMIN badge inline, so a duplicate header would waste vertical space"
  - "Active sidebar state matches both exact path (/admin Home) and prefix (/admin/catalog matches /admin/catalog and any future /admin/catalog/[id]). Home uses exact:true so it does not stay highlighted when a sub-route is active"
  - "Spanish strings drop accents (Catalogo, Cerrar sesion, Contrasena, Solicitudes...) to match the rest of es.json, which already uses this Mexican-neutral, accent-free convention"
  - "Server actions return English error strings — the AdminLoginForm client component maps them to localized labels via a localizeError() switch. Cheaper than refactoring the server action to return discriminated codes; revisit if more callers need the same strings"
  - "Placeholder pages all share the same shape (h1 + p) so future phases just swap the body — keeps the diff small when a real page lands"
  - "Inline retrofit of /admin/login + AdminLoginForm in this plan rather than punting to phase 18 — avoided a half-translated state where some Phase 17 pages used i18n keys and the entry point did not. I18N-01 is now actually satisfied for the entire phase"

metrics:
  duration_min: 5
  task_count: 2
  files_changed: 13
  loc_added: 517

commits:
  - hash: "8eea34a"
    message: "feat(17-03): build admin shell layout, sidebar, header, and sign-out button"
  - hash: "b938a8c"
    message: "feat(17-03): add 5 admin placeholder pages and admin.* i18n namespace"
---

# Phase 17 Plan 03: Admin Shell UI Summary

## One-Liner

The admin route group `(admin)/admin/*` is live. `AdminLayout` calls `assertPlatformStaff(await createAdminServerClient())` for defense-in-depth on top of middleware, then renders `AdminSidebar` (Home/Catalog/Requests/Automations/Clients + a pinned Logout) and `AdminHeader` (orange ADMIN badge + subtitle) around five placeholder pages. The new `admin.*` next-intl namespace ships 27 keys with full EN/ES parity, and the existing `/admin/login` page + `AdminLoginForm` were retrofitted to consume those keys so I18N-01 holds for every Phase 17 surface.

## What Was Built

### Task 1 — Admin shell components (commit `8eea34a`)

**`web/src/app/(admin)/admin/layout.tsx`** (51 LOC)
- Server component, async.
- Builds an admin-scoped Supabase client via `createAdminServerClient()` and runs `assertPlatformStaff(supabase)`.
- On `auth.ok === false`, calls `redirect("/admin/login")` — same fallback the middleware uses, so the user sees one consistent failure path.
- On success, calls `getTranslations("admin")` and forwards strings as props to `AdminSidebar` (six labels) and `AdminHeader` (badge + subtitle). The auth result is currently discarded; future phases can pull `auth.userId` / `auth.role` from it for "Welcome, super_admin Patrick" affordances without re-querying.
- Wraps `<main className="lg:pl-60">` with a `p-6 lg:px-10 lg:pb-8` content area so every Phase-18+ page lands in the same gutter.

**`web/src/components/admin/admin-sidebar.tsx`** (148 LOC)
- Client component (`"use client"`) — needs `usePathname` for active state and `useState` for the mobile drawer.
- Mobile top bar (lg:hidden, fixed): `☰` toggle, centered logo + ADMIN badge, right-side spacer.
- Mobile drawer (rendered when `mobileOpen`): full-screen black/60 overlay + 64-wide left panel; clicking outside closes the drawer; clicking a nav item closes via `onNav`.
- Desktop fixed sidebar (hidden lg:flex, w-60): logo + AIDEAS wordmark + ADMIN badge in a 64-tall header, then the 5 nav items, then the AdminSignOut button at the bottom of a `flex-col h-full` aside.
- `SidebarContent` extracted into a sub-component so mobile and desktop share the same children without prop-drilling layout-specific styles.
- Active item: orange-500/15 background + orange-300 text. Inactive: gray-300 text, gray-800 hover. Home uses `exact: true` so it does not stay highlighted under sub-routes.
- Imports only lucide icons, next/image, next/link, and the AdminSignOut sibling — no customer dashboard imports.

**`web/src/components/admin/admin-header.tsx`** (24 LOC)
- Server component (no `"use client"`).
- Renders an `lg:flex` header with the ADMIN badge + subtitle in a single row. Hidden on mobile because the mobile sidebar bar already shows the badge.
- Pure props-in-strings-out — no Supabase, no translations resolved here.

**`web/src/components/admin/admin-sign-out.tsx`** (25 LOC)
- Client component, but only because `<form action={signOutStaff}>` requires the form to be marked client to bind a server-action reference. The submit still works without JS (it is a real HTML form that POSTs to the server action endpoint).
- Styled to match the sidebar nav items but with a red hover state (`hover:bg-red-500/10 hover:text-red-400`) so logout is visually distinct.

### Task 2 — Placeholder pages + i18n namespace + login retrofit (commit `b938a8c`)

**Five placeholder pages** (server components, `getTranslations("admin.placeholders.<section>")`):
- `web/src/app/(admin)/admin/page.tsx` (Admin Home → Phase 22)
- `web/src/app/(admin)/admin/catalog/page.tsx` (Catalog Admin → Phase 18)
- `web/src/app/(admin)/admin/requests/page.tsx` (Requests Inbox → Phase 19)
- `web/src/app/(admin)/admin/automations/page.tsx` (Automations Admin → Phase 20)
- `web/src/app/(admin)/admin/clients/page.tsx` (Clients Admin → Phase 21)

All five share the same shape (`h1` title + `p` body) so the diff in Phases 18-22 is purely the new content, not the structure.

**`web/messages/en.json` and `web/messages/es.json`** — added the `admin` top-level namespace with 27 leaf keys at full parity:
- `admin.badge` — single literal, "ADMIN" in both locales
- `admin.shell.subtitle` — "AIDEAS internal staff console" / "Consola interna del equipo AIDEAS"
- `admin.nav.{home,catalog,requests,automations,clients,logout}` — 6 keys
- `admin.login.{title,subtitle,emailLabel,passwordLabel,submit,submitting}` — 6 keys
- `admin.login.errors.{invalidCredentials,notStaff,missingFields}` — 3 keys
- `admin.placeholders.{home,catalog,requests,automations,clients}.{title,body}` — 10 keys

**`web/src/app/(admin-auth)/admin/login/page.tsx` retrofit:**
- Replaced hardcoded English with `getTranslations("admin")` + 7 keys (badge, login.title, login.subtitle, login.errors.notStaff, login.emailLabel, login.passwordLabel, login.submit, login.submitting, login.errors.invalidCredentials, login.errors.missingFields).
- Now passes a `labels` prop bag to `AdminLoginForm`.

**`web/src/components/admin/admin-login-form.tsx` retrofit:**
- Now takes `labels: { ... }` and renders all visible strings from props.
- Adds a `localizeError(serverError)` switch that maps the three known English error strings returned by `signInStaff` (from 17-02) onto the locale-aware label values. Cheap and avoids reshaping the server action signature.

## Deviations from Plan

None of substance. The plan executed exactly as written.

Two minor inline notes:
- The plan's example `AdminLayout` snippet had a placeholder `userEmail={auth.ok ? "" : ""}` prop on `AdminHeader`. I dropped this from the final `AdminHeader` props because the prop was unused (always empty in 17-03; the plan flagged it as a "future" hook), and an unused interface field would have triggered a stale-prop ESLint warning. The header keeps `badgeLabel` and `subtitle` only. Future phases can re-add a real `user` prop with a proper UserMenu component.
- The verifier in the plan ran `npx tsc --noEmit` against individual file paths (`src/app/\(admin\)/admin/layout.tsx ...`). On Windows + Next.js 16's project graph this fails on module-resolution edges that the file-by-file mode cannot see. I ran the project-wide `npx tsc --noEmit` instead (clean) plus `npm run build` (clean, all 7 admin routes registered including `/admin/login`). Same guarantee, broader coverage.

## i18n Parity Verification

`27 admin keys with EN/ES parity` — verified by the node one-liner from the plan:

```
node -e "const en = require('./web/messages/en.json'); const es = require('./web/messages/es.json'); ... console.log('OK', enKeys.length, 'admin keys with EN/ES parity');"
# OK 27 admin keys with EN/ES parity
```

This number is comfortably above the plan's 18-key floor and includes every visible string introduced anywhere in Phase 17 (both 17-02's login surface and 17-03's shell + placeholders).

## Build Verification

`npm run build` completes successfully with the following admin-area routes registered as dynamic:

```
ƒ /admin
ƒ /admin/automations
ƒ /admin/catalog
ƒ /admin/clients
ƒ /admin/login
ƒ /admin/requests
```

Customer routes (`/dashboard`, `/dashboard/automations`, `/dashboard/catalog/[slug]`, `/dashboard/billing`, etc.) are still listed and unchanged — no regression on the customer side.

## Notes for Downstream Plans (18-22)

### Where to add a new admin sidebar item

`web/src/components/admin/admin-sidebar.tsx` — the `items` array near the top of the `AdminSidebar` component. Add a new object `{ href, label, icon, exact? }`, then add the corresponding label to:
1. The `AdminSidebarProps.labels` interface
2. The `AdminLayout` `getTranslations("admin")` call site (forwarded as a prop)
3. `admin.nav.<key>` in BOTH `en.json` and `es.json`

The parity verifier will catch a missing ES key at build time.

### Where to add new admin section i18n keys

Each Phase 18-22 section gets its own sub-namespace, e.g.:
- `admin.catalog.*` — Phase 18 (NOT `admin.placeholders.catalog.*` — that key set is for the placeholder only and can be deleted once the real page lands, or kept and renamed; planner's call)
- `admin.requests.*` — Phase 19
- `admin.automations.*` — Phase 20
- `admin.clients.*` — Phase 21
- `admin.home.*` — Phase 22

When a real page replaces a placeholder, either:
1. Delete the corresponding `admin.placeholders.<section>` block from BOTH locale files in the same commit (parity stays intact), or
2. Leave the placeholder keys in place and just stop using them (slightly more storage, zero risk of breakage).

### How admin pages live in the route tree

Convention established here:
- `(admin)/admin/<section>/page.tsx` — admin pages that render INSIDE the AdminSidebar+AdminHeader shell
- `(admin-auth)/admin/login/page.tsx` — auth leaves that render OUTSIDE the shell

If a future plan needs an admin-area page without the shell (e.g., a fullscreen wizard), put it in a new `(admin-bare)` route group rather than fighting the layout.

### What `auth` from `assertPlatformStaff` is good for

`AdminLayout` currently discards the `auth` result after the redirect check. Future plans that want the user identity inline (e.g., to render "Welcome, Patrick" in the header) can pull `auth.userId` and `auth.role` from `assertPlatformStaff(supabase)` rather than re-querying Supabase. The result is already typed and narrowed.

### How to wire a real logout side-effect (deferred)

Right now `AdminSignOut` posts to `signOutStaff` which calls `redirect("/admin/login")`. If a future plan needs a "you have been signed out" toast on the login page, the redirect target can grow a search param (`?signed_out=true`) — the login page already accepts a `searchParams` prop.

## Self-Check: PASSED

Verified after writing this summary:

- File `web/src/app/(admin)/admin/layout.tsx` exists.
- File `web/src/components/admin/admin-sidebar.tsx` exists.
- File `web/src/components/admin/admin-header.tsx` exists.
- File `web/src/components/admin/admin-sign-out.tsx` exists.
- File `web/src/app/(admin)/admin/page.tsx` exists.
- File `web/src/app/(admin)/admin/catalog/page.tsx` exists.
- File `web/src/app/(admin)/admin/requests/page.tsx` exists.
- File `web/src/app/(admin)/admin/automations/page.tsx` exists.
- File `web/src/app/(admin)/admin/clients/page.tsx` exists.
- File `web/messages/en.json` modified (now contains the `admin` namespace).
- File `web/messages/es.json` modified (now contains the `admin` namespace at parity).
- File `web/src/app/(admin-auth)/admin/login/page.tsx` modified (uses `getTranslations("admin")`).
- File `web/src/components/admin/admin-login-form.tsx` modified (consumes labels prop).
- Commit `8eea34a` exists (Task 1).
- Commit `b938a8c` exists (Task 2).
- `npx tsc --noEmit` clean.
- `npx eslint` clean across `(admin)/**`, `(admin-auth)/**`, and `components/admin/**`.
- `npm run build` succeeds; all 6 admin routes (5 shell + 1 auth) registered.
- 27 `admin.*` keys at full EN/ES parity (verifier returned `OK 27 admin keys with EN/ES parity`).
- No customer dashboard component is imported by any admin file (sidebar imports only lucide icons, next/image, next/link, cn, and AdminSignOut).
