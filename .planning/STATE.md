---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Admin Dashboard
status: in_progress
last_updated: "2026-05-06T17:41:00Z"
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 20
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-04 after v1.2 milestone start)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single bilingual dashboard — paired with an operations team who can fulfill what they request.
**Current focus:** v1.2 Admin Dashboard — Phase 17 Admin Foundation complete (3/3 plans); next is Phase 18 Catalog Admin

## Current Position

Phase: Phase 18 — Catalog Admin — In progress (2/3 plans)
Plan: 18-01 + 18-02 complete; next is 18-03 (admin create/edit form + Zod validation with draft mode + grouped sections + bilingual translation inputs).
Status: /admin/catalog hybrid list (table default + grid toggle) shipped with URL-synced search + category/industry filters and inline is_active / is_featured switches. CatalogToggleCell flips optimistically, reverts on server-action failure, and opens a warn-but-allow modal when deactivating a template with active|in_setup|paused|pending_review automations. fetchAdminCatalogTemplates(locale) returns ALL templates (including inactive) plus has_active_automations counts; toggleTemplateActive / toggleTemplateFeatured server actions are gated by assertPlatformStaff and revalidate both /admin/catalog and /dashboard/catalog so customer side updates without redeploy. admin.catalog.* i18n namespace added (40 keys per locale, 682 total parity).
Last activity: 2026-05-06 — Plan 18-02 executed (2 tasks, 9 files; admin catalog list + toggle actions + i18n).

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 (target) |
|--------|------|------|---------------|
| Phases | 6 | 9 | 7 |
| Plans | 16 | 28 | ~20 |
| Requirements | 54/54 | 38/38 | 31 (planned) |
| Timeline | 70 days | 21 days | TBD |

### Per-plan execution metrics (v1.2)

| Phase-Plan | Duration (min) | Tasks | Files changed |
|------------|----------------|-------|---------------|
| 17-01      | 10             | 2     | 1             |
| 17-02      | 3              | 3     | 7             |
| 17-03      | 5              | 2     | 13            |
| 18-01      | 16             | 2     | 5             |
| 18-02      | 10             | 2     | 9             |

## Accumulated Context

### Decisions (Phase 18-02 execution, 2026-05-06)

- **Toggle translations packaged together** — `deactivateModal` is nested under `translations.toggle` rather than living as a sibling. The table/grid components forward a single `toggle` prop into `CatalogToggleCell`. The original PLAN sketch placed `deactivateModal` as a sibling and failed type-check; nesting it under `toggle` is the cleaner shape and is now the canonical layout for any future toggle-with-modal cell.
- **Search filters by name OR slug** (admin-specific). Customer-facing search-by-name is unchanged. Admin operators routinely need to find a template by its slug when debugging URLs (e.g., the customer reported a 404 on `/dashboard/catalog/audience-segmentation`).
- **View toggle defaults to `table`.** URL only carries `?view=grid` when explicitly chosen, so a refresh on default-table is a no-op and a refresh after switching to grid stays on grid. Operators get table density by default; grid is opt-in.
- **Warn-modal is purely client-side.** Server action accepts the deactivation either direction. CONTEXT.md prescribed warn-but-allow over hard-block; if a determined attacker bypasses the warning the only consequence is that the template is deactivated, which is the action they asked for. Server-side enforcement adds zero security and would just make the action less reusable.
- **Two queries instead of one with a count subquery.** `fetchAdminCatalogTemplates` issues a templates SELECT + an automations SELECT and reduces the latter into a Map keyed by `template_id`. Simple, readable, well under 50ms in practice. Single-query alternatives with a Postgres count aggregate forced awkward Supabase typings.
- **Inactive rows still render their toggle** so an operator can flip them back on. Opacity-60 is the only visual cue. Hiding inactive rows behind a separate tab would break the muscle memory of "find any template, click switch".
- **Pricing-tier badge tones** — gray (starter) / purple-50 (pro) / purple-100 (business). Subtle escalation reused from Phase 11's billing card; no new design tokens.
- **Server-action skeleton established for the rest of v1.2:** `createAdminServerClient -> assertPlatformStaff -> Zod parse -> Supabase mutation -> revalidatePath(admin) + revalidatePath(customer)`. Phase 19/20/21 server actions will clone this shape verbatim.
- **Translation-prop pattern established:** server resolves `t('foo')` and `t.raw('templateString')` into a plain object, then passes the object as `translations` to a `'use client'` component. No `useTranslations()` in the client tree. Keeps the client component framework-agnostic and easy to test.

### Decisions (Phase 18-01 execution, 2026-05-06)

- **Two-source backfill (migration + seed)** — the migration's DO block backfills against the existing 66 templates in prod, and seed.sql gains a 528-INSERT block before COMMIT for local resets (where migrations run before seed and the DO block noops). Both paths are idempotent via `INSERT ... SELECT ... ON CONFLICT DO NOTHING`.
- **Locale-aware embed JOIN** — customer queries pass `locale` to `fetchCatalogTemplates(locale)` and `fetchTemplateBySlug(slug, locale)`, then embed-join `automation_template_translations` filtered by `translations.locale` and (for the list query) `translations.field='name'`. One round trip per page; resolved display strings come back in a single rowset.
- **Keep messages/templates JSON namespace untouched** — backfill seeded the table from those values, no other consumer was identified, and removing keys from a shipped i18n bundle has its own risks. Cleanup deferred until callers are inventoried.
- **Defensive null fallbacks in the query layer** — `displayName` falls back to `slug`; the detail query returns `null` if no translation rows are returned. Cheap safety net for any admin DELETE that orphans translations later.
- **Auto-fixed pre-existing slug corruption** — `seed.sql` shipped two corrupted slugs (`'a0dience-segmentation'` -> `'audience-segmentation'`, `'a0to-response-email'` -> `'auto-response-email'`) that were already user-visible at the URL level. Fixed inline as Rule 1 (Bug). Remaining `a0` typos in `features[]` / `use_cases[]` logged in `.planning/phases/18-catalog-admin/deferred-items.md`.

### Decisions (Phase 17-03 execution, 2026-05-05)

- **Admin badge color is orange (`bg-orange-500`)** — high-contrast against the dark gray-900 sidebar and the white-text login page; consistent across mobile top bar, sidebar header, login page, and AdminHeader subtitle area, so the visual cue never disappears regardless of viewport.
- **Sidebar palette intentionally distinct from customer DashboardNav** — gray-900 background, gray-300 inactive text, orange-500/15 + orange-300 active states. Customer side uses white card + purple accents. A staff member who toggles to /admin sees an obviously different UI in <500ms.
- **AdminHeader hidden on mobile (`lg:flex`)** — the mobile sidebar bar already shows the logo + ADMIN badge inline; a duplicate header would waste vertical space.
- **Active sidebar state matches both exact path AND prefix** — Home uses `exact: true` so it does not stay highlighted under sub-routes; sub-pages match prefix so e.g. `/admin/catalog/[id]` keeps the Catalog item active.
- **Spanish strings drop accents** (Catalogo, Cerrar sesion, Contrasena, Solicitudes...) — matches existing es.json convention; keeps Mexican-neutral phrasing.
- **Server actions return English error strings; client localizes via `localizeError()` switch** — cheaper than refactoring `signInStaff` to return discriminated codes; revisit if more callers need the same strings.
- **Inline retrofit of `/admin/login` + `AdminLoginForm` to consume `admin.*` keys in 17-03** — avoided a half-translated state where some Phase 17 pages used i18n keys and the entry point did not. I18N-01 is now actually satisfied for the entire phase.
- **Convention established for Phase 18-22 pages:** `(admin)/admin/<section>/page.tsx` for shell-wrapped pages; `(admin-auth)/admin/login` already lives outside the shell. Future bare/fullscreen admin pages should use a new `(admin-bare)` route group rather than fight the layout.

### Decisions (Phase 17-02 execution, 2026-05-05)

- **Two-cookie session scheme** — customer (`sb-*`) and admin (`sb-admin-*`) sessions coexist in the same browser via Supabase `cookieOptions.name`. Pattern matches Stripe / Supabase / Vercel where you can be logged into multiple workspaces simultaneously.
- **Two `getUser()` calls per request** (customer + admin in parallel) — extra ~30ms of network IO traded for correctness. A single Supabase client cannot read two cookie scopes in one pass; `Promise.all` keeps it parallel.
- **`/admin/*` branch wins over customer logic** — path is checked first; customer auth gates do not run for admin paths. Keeps the two flows from interfering when a customer accidentally hits `/admin` or vice versa.
- **Non-staff who land in admin scope are SIGNED OUT before bouncing** — defense in depth: prevents a stale admin cookie sitting in a removed staff member's browser.
- **`signInStaff` server action double-checks platform_staff after Supabase auth** — second query and explicit signOut on failure, so an RLS regression on `platform_staff_select_self` cannot leak admin sessions to non-staff.
- **No Google OAuth on /admin/login** — staff are seeded by SQL/migration only in v1.2 (per CONTEXT.md). Email/password keeps the surface area minimal.
- **/admin/login uses hardcoded English (no next-intl yet)** — admin i18n keys are 17-03's job. Cross-plan dependency on a non-existent namespace is avoided.
- **`(admin-auth)` route group for /admin/login** — kept outside the future `(admin)` shell from 17-03 so it has no sidebar, no header, no auth-gate-component.
- **Staff-on-/dashboard cross-redirect** — when `customerUser` (sb-* scope) is in `platform_staff`, middleware redirects them to `/admin`. Catches the case where a staff member signs into the customer login by accident.

### Decisions (Phase 17 execution, 2026-05-05)

- **Helper functions are SECURITY DEFINER + STABLE + `SET search_path = ''`** — callers without RLS access to `platform_staff` can still check membership; STABLE lets the planner hoist the call out of per-row evaluation; empty search_path prevents schema-hijack attacks.
- **Admin RLS is additive, not replacing** — 38 new admin policies coexist with existing org-scoped client policies; Postgres OR-combines policies for the same command. Clients keep their access exactly as before.
- **Mutable tables use 4 separate policies (SELECT/INSERT/UPDATE/DELETE)** rather than `FOR ALL` — clearer audit trail, easier to revoke a single verb later.
- **Immutable tables get SELECT only for admins too** — `automation_executions` and `chat_messages` retain their no-INSERT/UPDATE/DELETE-for-authenticated-users posture even for staff. Soft-delete is a deferred option if a real need arises.
- **`chat_messages_insert_clients` preserved untouched** — admin chat sends in the future would use service_role (consistent with existing architecture); this surfaces as a flag for Phase 19.
- **First super_admin seeded inside the migration itself** — idempotent + safe-no-op via `DO $$` block with `RAISE NOTICE` fallback; the moment `pdmckinster@gmail.com` signs up, re-running the migration promotes them.

### Decisions (v1.2 questioning gate, 2026-05-04)

- **Operations-first sequencing** — admin before Stripe. Without admin, the team cannot fulfill orders that Stripe would create. v1.1 shipped customer side; v1.2 ships team side; v1.3 wires Stripe.
- **Admin lives at `/admin/*`** — same Next.js app, role-gated route. No subdomain, no separate repo.
- **`platform_staff` table** — new table with FK to `auth.users`, separate from `organization_members` (which scopes per-org client roles). Bypasses org-scope via RLS `EXISTS (SELECT 1 FROM platform_staff WHERE user_id = auth.uid())`.
- **Two staff roles from day one** — `super_admin | operator` in schema; UI for staff invitation deferred until needed.
- **Visual: same layout, different banner** — reuse customer sidebar/header/components, add "AIDEAS Admin" banner or title. NO redesign of shadcn theme.
- **Bilingual EN/ES** — strict parity, follows project rule.
- **Seed-vs-prod cleanup deferred** — decide at v1.3 deploy time, not now.
- **Carry-over from v1.1 lands first** — Next.js 16 build blocker, AutomationSuccessRate placeholder, assertOrgMembership consolidation, symmetric reCAPTCHA bypass — bundled as Phase 16 to unblock CI before admin work begins.
- **Single-step approval** — approving a request flips it to `approved` AND creates the automation row in `in_setup` in one transaction.
- **Reject requires reason** — non-empty rejection reason enforced via form validation, persisted in request notes.
- **Automation admin detail is read-only** — no field editing in admin; only status transitions via dedicated buttons (in_setup→active, active↔paused, active|paused→archived).

### Roadmap (defined 2026-05-04)

| Phase | Name | Plans | Reqs |
|-------|------|-------|------|
| 16 | Carry-over Cleanup | 3 | CARRY-01..04 |
| 17 | Admin Foundation | 3 | FOUND-01..05, I18N-01 |
| 18 | Catalog Admin | 3 | CTLG-01..05, I18N-01 |
| 19 | Requests Inbox | 3 | REQS-01..04, I18N-01 |
| 20 | Automations Admin | 3 | AUTM-01..05, I18N-01 |
| 21 | Clients Admin | 3 | CLNT-01..05, I18N-01 |
| 22 | Admin Home | 2 | HOME-01..03, I18N-01 |

Coverage: 31/31 v1.2 requirements mapped. I18N-01 cross-cuts every UI-bearing phase.

### Blockers/Concerns

- v1.1 build blocker: `next/dynamic ssr:false` in `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16` breaks `npm run build` under Next.js 16 + Turbopack. Targeted by Phase 16 (CARRY-01) so CI is green before Phase 17 begins.
- Pre-existing `a0` typos in `seed.sql` `features[]` / `use_cases[]` and a few `automation_requests` body strings (~25 occurrences). Customer-visible only as faint copy issues (catalog list does not render `features` / `use_cases`). Logged in `.planning/phases/18-catalog-admin/deferred-items.md` for a separate cleanup commit.

### Pending Todos

(none — Plan 18-03 next)

## Session Continuity

**Last session:** 2026-05-06 — Executed Plan 18-02 (admin catalog list with inline toggles). Stopped at: Completed 18-02-PLAN.md.
**Next action:** Plan 18-03 (admin create/edit form with Zod validation, draft mode, grouped sections, bilingual translation inputs) is up next on the `feature/phase-18-catalog-admin` branch. The /admin/catalog/[slug]/edit and /admin/catalog/new links from 18-02's table/header are dead until 18-03 ships. After 18-03 lands, run `/gsd:verify-work 18` and merge the branch back to main.
