---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Admin Dashboard
status: in_progress
last_updated: "2026-05-06T17:59:14Z"
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 20
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-04 after v1.2 milestone start)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single bilingual dashboard — paired with an operations team who can fulfill what they request.
**Current focus:** v1.2 Admin Dashboard — Phase 17 Admin Foundation complete (3/3 plans); Phase 18 Catalog Admin complete (3/3 plans); next is Phase 19 Requests Inbox.

## Current Position

Phase: Phase 18 — Catalog Admin — Complete (3/3 plans). Ready for `/gsd:verify-work 18` and merge.
Plan: 18-03 complete (admin create/edit form). All Phase 18 plans shipped.
Status: /admin/catalog/new and /admin/catalog/[slug]/edit pages alive with single-page grouped form (5 sections: Basic info, Categorization, Pricing, Metrics, Translations). Slug auto-generates from name_en via NFKD slugify; locked on edit. Industries render as 6 togglable chips; connected_apps as multi-select with chips + 12-app datalist. Strict Zod validation: adminCatalogTemplateActiveSchema (when is_active=true) requires all 8 translations + 4 numerics + at least one industry; adminCatalogTemplateBaseSchema (when is_active=false) skips activation gates so partial work can be saved as draft. Custom RHF resolver bridges form-layer USD strings + blank-as-null numerics to Zod-layer cents + integers + nullables. createTemplate inserts the template row + 8 translation rows atomically (rollback on partial failure); updateTemplate UPDATEs the templates row + UPSERTs 8 translation rows on (template_id, locale, field). Both revalidate /admin/catalog AND /dashboard/catalog. admin.catalog.form.* i18n namespace added (47 keys per locale, 729 total parity). 28 routes built (up from 26).
Last activity: 2026-05-06 — Plan 18-03 executed (2 tasks, 8 files; create/edit form + actions + schemas + i18n form keys).

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
| 18-03      | 12             | 2     | 8             |

## Accumulated Context

### Decisions (Phase 18-03 execution, 2026-05-06)

- **Pricing input layer is USD, schema layer is cents.** The form's price fields accept dollars with `step=0.01` and `inputMode=decimal`; submit calls `dollarsToCents` to round to integer cents; edit pre-fills via `centsToDollarString` so the operator sees what they typed (or close to it). Zod only ever validates cents, so server-side validation matches what gets persisted. Pattern reusable for any future price-input form (Phase 19+).
- **Custom RHF resolver instead of `zodResolver`.** `zodResolver` from `@hookform/resolvers/zod` expects 1:1 form-to-schema mapping; this form has different shapes (USD strings, blank-as-null numerics, snake_case price field rename). The custom resolver runs `formToZodInput` first, then `safeParse`, then maps `setup_price` -> `setup_price_dollars` and `monthly_price` -> `monthly_price_dollars` paths back onto form fields. Pattern reusable when form values diverge from schema values.
- **Schema selection inside the resolver, not via prop swap.** The resolver reads `is_active` from values on each invocation and picks `adminCatalogTemplateActiveSchema` vs `adminCatalogTemplateBaseSchema` accordingly. After `is_active` toggles, an effect calls `form.trigger()` (only when the form has been submitted at least once) so existing errors update without remounting. Cheaper than swapping resolvers via props.
- **Slug auto-gen on EN-name keystroke + sticky manual-edit flag.** A `slugManuallyEdited` ref starts `false` on create / `true` on edit. As long as the user has not typed in the slug field directly, name_en changes auto-rewrite the slug via NFKD-normalize-and-strip-accents slugify (capped at 100 chars). On edit pages the ref starts `true` so the slug is treated as immutable; the input is also visually disabled with a lock icon.
- **Slug input disabled (not hidden) on edit pages.** Communicates the lock-after-creation constraint without removing the value from view. CONTEXT.md prescribed lock-after-creation; this is the visual treatment.
- **Connected apps as multi-select with datalist, NOT chips.** Industries are a fixed 6-element enum and chip-toggle scales fine; connected_apps grows over time so chip-toggle would explode. Multi-select with chips-as-selected and a datalist of 12 common suggestions (Slack, HubSpot, Salesforce, Zapier, Notion, Airtable, Stripe, Google Workspace, WhatsApp, Mailchimp, Zoho, Pipedrive) is the planner's prescribed shape — and free-text additions via Enter remain possible.
- **Industries chips reuse the customer catalog visual pattern** (border-purple when selected). Operators flipping between admin and customer catalog see the same toggle pattern.
- **Atomic create with best-effort rollback.** Supabase JS does not expose transactions across multiple `.from(...)` calls. Strategy: INSERT template -> INSERT 8 translations -> on translation failure DELETE the template. If both fail, log the orphan templateId for manual cleanup. In practice the only way both fail is the DB going offline mid-write.
- **Update path uses UPSERT on `(template_id, locale, field)` instead of DELETE + INSERT.** Idempotent re-saves; partial saves don't clear other locales' rows. The PK on the table makes the UPSERT a single round trip.
- **Legacy text columns kept and synced to EN.** `automation_templates.{name, description, typical_impact_text, activity_metric_label}` written with EN translation values on every create/update so any unmigrated reader still sees sane strings. Drop only when no consumer remains.
- **Active toggle as HTML checkbox, not a Switch.** shadcn/ui in this project does not ship a Switch primitive (only Button, Card, Form, Input, Label). A checkbox + label hint communicates draft-vs-active at zero new-component cost.
- **Spanish translations stay accent-free** ("Informacion basica", "Categorizacion", "Categoria", "Metricas", "Traducciones"). Matches existing es.json convention.
- **Form pattern with conditional refinement for draft mode** (base schema = always-required structural; superRefine = activation gates) is reusable for any future "save as draft / publish" workflow (Phase 19 request templates, Phase 22 marketing campaigns).

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

(none — Phase 18 complete, ready for `/gsd:verify-work 18` then merge `feature/phase-18-catalog-admin` back to `main`; next is `/gsd:plan-phase 19` for Requests Inbox)

## Session Continuity

**Last session:** 2026-05-06 — Executed Plan 18-03 (admin catalog create/edit form). Stopped at: Completed 18-03-PLAN.md.
**Next action:** Phase 18 (Catalog Admin) is complete (3/3 plans). Run `/gsd:verify-work 18` to UAT the full admin catalog flow (list + filters + toggles + warn modal + create + edit + draft mode + bilingual + customer-side reflection). After verification passes, merge `feature/phase-18-catalog-admin` back to `main`. Then start Phase 19 (Requests Inbox) with `/gsd:discuss-phase 19` -> `/gsd:plan-phase 19` -> `/gsd:execute-phase 19`.
