---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-05-04T17:58:25.550Z"
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 28
  completed_plans: 28
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-30T20:34:25.296Z"
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 28
  completed_plans: 28
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-29T20:30:28.992Z"
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 23
  completed_plans: 23
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-29T18:56:32.905Z"
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 23
  completed_plans: 23
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-15T20:45:41.032Z"
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 21
  completed_plans: 21
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-15T20:37:05.736Z"
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 21
  completed_plans: 20
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-15T18:16:38.946Z"
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 18
  completed_plans: 18
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Core Dashboard Experience
status: unknown
last_updated: "2026-04-14T17:09:37.736Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 15
  completed_plans: 15
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Customers can monitor automations, request new ones, and see their ROI from a single dashboard that proves the value of their AIDEAS subscription
**Current focus:** Phase 7 — Schema & Seed Data

## Current Position

Phase: 15 of 15 (Dashboard Home Polish) — Plans 15-01 and 15-02 both complete
Plan: 15-02 complete (Phase 8 SUMMARY frontmatter requirements traceability backfill); 15-01 also complete (placeholder cleanup)
Status: Phase 15 Complete — Plan 15-01 closed Phase 8 placeholder tech-debt; Plan 15-02 closed audit traceability gap by backfilling requirements_completed/requirements-completed into 4 Phase 8 SUMMARY frontmatter blocks (08-01, 08-02, 08-04, 08-05)
Last activity: 2026-04-30 — Plan 15-02 executed in 4 min, 2 tasks, 4 files modified. Snake_case backfill for 08-01/02/05 (matches existing dependency_graph/tech_stack/key_files style); kebab-case backfill for 08-04 (matches minimal-frontmatter Phase 13/14 standard). Per-file YAML style preserved per locked decision; 08-03 untouched (out of audit scope, already had requirements-completed from original ship). Task 1 commit message contaminated by parallel Plan 15-01 agent (commit 93a51a0 carries 08-01/02 frontmatter additions under a 15-01 message); content correct, message misleading. Task 2 clean (b318212).

Progress: [████████████████████] 100% (25/25 plans — v1.0 complete, v1.1 Phases 07-15 done; ready for v1.1 milestone audit re-run)

## Accumulated Context

### Decisions

Key v1.1 decisions (see PROJECT.md for full log):
- **Stripe OUT OF SCOPE for v1.1** — all payment UI uses mock/seed data; Stripe wired in v1.2 (STRP-01–STRP-06 deferred)
- **Data flow: Hybrid C** — reads via Supabase Server Components, writes via FastAPI, Settings writes direct to Supabase (no business logic)
- **Schema changes are ALTERs** — v1.0 already created tables; v1.1 adds columns and expands CHECK constraints
- **I18N-01 applies across all frontend phases** — EN/ES translation keys tracked from Phase 8 through Phase 12
- **Mock billing data** — payment history from seed data in v1.1; Stripe API in v1.2

Phase 07-01 decisions (2026-04-10):
- **Prices as integer cents** — setup_price/monthly_price stored as integer cents (Stripe standard: 9900 = $99.00), not decimals
- **is_featured = true for "Mas populares"** — NOT a new category value; featured flag handles this UI concept
- **in_setup status on automations** — represents automation during onboarding/setup phase after payment
- **payment_pending/payment_failed on automation_requests** — tracks Stripe checkout session lifecycle

Phase 07-02 decisions (2026-04-10):
- **TRUNCATE CASCADE for seed idempotency** — clean-slate replaces ON CONFLICT pattern in seed.sql
- **i18n keys in DB TEXT columns** — templates store keys like `templates.lead_followup_email.name` for bilingual catalog display (phases 8, 10)
- **12 featured templates** — `is_featured=true` distributed across all 8 categories for Top Picks UI section
- **pricing_tier mapping** — starter=simple 1-day, pro=medium 2-3 day, business=complex/AI 5-day templates

Phase 08-02 decisions (2026-04-10):
- **Pre-compute enriched executions in parent page** — formatTimeAgo cannot be passed as function prop across RSC boundaries (not serializable); parent page computes timeAgo strings and passes enriched array to ActivityFeed
- **Automation names rendered directly** — seed stores human-readable names (e.g., "Acme Customer Support Chatbot"), not i18n keys; confirmed from seed.sql
- **Template substitution for i18n count strings** — format with sentinel "99" then replace with "{count}" for runtime substitution pattern

Phase 08-03 decisions (2026-04-10):
- **Notifications fetched once in layout.tsx** — DashboardHeader takes props (not self-fetching) to avoid duplicate DB queries for desktop + mobile
- **Radix Popover via portal** — ensures correct z-index stacking above sidebar (z-50)
- **Bell placement: DashboardHeader (desktop hidden on mobile) + nav mobile header** — single server fetch, two consumers

Phase 08-01 decisions (2026-04-10):
- **Executions query uses .in() not nested .eq()** — fetching automations first then scoping executions by `orgAutomationIds` avoids unreliable PostgREST nested relation filtering
- **daily_execution_count mutated onto automation objects** — avoids extra round-trip; computed from last-24h executions query after initial fetch
- **hoursSavedThisMonth rounded to 1 decimal** — `Math.round(minutes/60 * 10)/10` for clean display

Phase 07-03 decisions (2026-04-10):
- **Growth curve via separate INSERT blocks per time period** — clearer and tunable vs. single calculated generate_series
- **Paused automation has partial execution history** — lead-nurture stops at day 40, explaining why it's paused
- **hourly_cost=25 as integer dollars** — not Stripe cents; human-entered rate for Phase 11 ROI estimates
- **in_setup automation has zero executions** — invoice-processing never activated yet, accurate demo state

Phase 08-05 decisions (2026-04-13):
- **NotificationBell replaces static mobile notification div** — mobile users can now open popover and mark notifications read
- **Mobile CTA button in greeting row** — purple Link to /dashboard/catalog visible at all viewports; compact label on mobile, full text on sm+

Phase 09-01 decisions (2026-04-14):
- **monthly_execution_count computed from success-only executions since month start** — mutated onto automation objects, mirrors daily_execution_count pattern from 08-01
- **STATUS_ORDER map sorts active/in_setup/paused alphabetically within groups** — stable sort for automations list page
- **groupByWeek uses day-offset buckets (0-7 = W4 = most recent)** — predictable 4-bucket chart labels for detail page
- **hoursSaved = monthlyMetricCount * avg_minutes_per_task / 60 rounded to 1 decimal** — consistent with 08-01 KPI pattern

Phase 09-03 decisions (2026-04-14):
- **WeeklyBarChart is "use client" + next/dynamic ssr:false required** — Recharts requires browser APIs; JSDoc documents requirement for Plan 04 consumer
- **ExecutionTimeline is pure display component (no use client)** — parent RSC pre-computes timeAgo and durationLabel strings (extends 08-02 pattern)
- **Purple-500 (#a855f7) bar fill** — matches existing dashboard accent theme
- [Phase 09-02]: AutomationsFilterTabs uses router.push for tab navigation to keep URL-driven state while staying on same page context
- [Phase 09-02]: AutomationCard receives locale from server for Intl.NumberFormat to avoid hydration mismatches

Phase 09-04 decisions (2026-04-14):
- **Server action in separate actions.ts per-route** — client component imports 'use server' functions from dedicated file co-located in [id] directory
- **AlertDialog from 'radix-ui' top-level re-export** — consistent with existing Popover import pattern in notification-bell.tsx
- **Cancel sets status to 'archived'** — redirects to /dashboard/automations after 800ms delay (toast visibility)
- **in_setup shows '---' for all KPIs** — setup message replaces timeline+chart panel entirely
- **Optimistic status rollback** — StatusBadge receives optimisticStatus state; reverts to server status on action error
- [Phase 10-catalog]: fetchTemplateBySlug returns null on error (not throw) — appropriate for 404 handling on detail page
- [Phase 10-catalog]: ES message key uses 'catalog' (same as EN) not 'catalogo' — next-intl uses same key in all locales, only values differ
- [Phase 10-03]: CatalogRequestButton co-located in [slug] directory — single-use component, no shared components needed
- [Phase 10-03]: State-based toast (useState/useEffect) used instead of sonner (not in package.json) or window.alert()
- [Phase 10-03]: APP_COLORS duplicated from automation-card.tsx per plan recommendation — YAGNI, single consumer

Phase 10-02 decisions (2026-04-14):
- **CatalogCard receives pre-formatted strings** — no i18n or Intl calls inside the pure display component; parent CatalogClient handles formatting
- **mas_populares tab maps to is_featured=true** — not a DB category value; consistent with Phase 07 decision
- **Template name key split pattern** — stored key 'templates.{slug_snake}.name' split on '.', index 1 extracted, tTemplates(slugSnake+'.name') called in RSC
- **No Suspense boundary on CatalogClient** — uses useState initialized from RSC props (not useSearchParams), so no async boundary needed

Phase 11-02 decisions (2026-04-15):
- **Translations passed as objects from RSC to client components** — avoids useTranslations in client context; consistent with Phase 09 pattern
- **ReportsWeeklyChart JSDoc documents ssr:false requirement** — same pattern as WeeklyBarChart (Phase 09-03)
- **SortHeader sub-component in breakdown table** — single-file pattern, not shared since only used there
- **Breakdown table returns null when rows.length === 0** — page-level empty state (fetchReportsData returns null) handles no-automations case

Phase 11-03 decisions (2026-04-15):
- **BillingSummaryCard is 'use client'** — toast interactivity requires client state; BillingChargesTable and BillingPaymentHistory are pure display server components
- **Mock history computed at render** — date arithmetic from new Date() produces current-month-pending + 3-prior-months-paid without DB dependency
- **Toast uses gray-900 background** — signals "coming soon" for payment portal vs. green success used in CatalogRequestButton

Phase 11-01 decisions (2026-04-15):
- **groupBy8Weeks always spans last 56 days** — independent of selected report period; period selector controls KPI/breakdown only
- **fetchOrgHourlyCost shared helper** — extracted for reuse by both fetchReportsData and fetchBillingData
- **Null returns signal empty state** — fetchReportsData and fetchBillingData return null (not empty objects) when no automations exist; consistent with fetchTemplateBySlug pattern
- **Breakdown map keyed by automationId** — correct deduplication for multi-execution automations; automationId field in returned row enables Plan 02 detail page linking

Phase 12-01 decisions (2026-04-15):
- **Zod v4 .issues[]** — ZodError in Zod v4 uses `.issues` property not `.errors`; all server actions use `parsed.error.issues[0]?.message`
- **serviceRole for org writes** — organizations table has no authenticated UPDATE policy; saveCompanyName and saveHourlyCost use getAdminClient() pattern from auth.ts
- **switchLocale httpOnly:false** — NEXT_LOCALE cookie must be readable by client-side next-intl for locale switching; httpOnly must be false
- **Role check before service_role write** — always query organization_members first, verify owner/admin before using admin client for org mutations
- [Phase 12]: AlertDialog import from radix-ui root: plan specified subpath 'radix-ui/react-alert-dialog' but project uses '{ AlertDialog } from radix-ui' — auto-fixed to match existing usage pattern

Phase 12-02 decisions (2026-04-15):
- **ProfileFormValues explicit type** — Zod optional().default('') produces lastName?: string | undefined; explicit form type with resolver cast avoids useForm TS2322 type mismatch
- **readLocaleCookie() client helper** — reads NEXT_LOCALE from document.cookie on mount to initialize language select without server round-trip
- **isOAuthOnly commented in settings page** — ESLint no-unused-vars; Plan 03 will restore it when wiring SettingsSecurityCard

Phase 12-05 decisions (2026-04-16, gap closure):
- **Defer browser-only APIs to useEffect** — `navigator.userAgent` and `Intl.DateTimeFormat().resolvedOptions().timeZone` produce different values on server vs client, causing React hydration mismatch. Pattern: `useState<T | null>(null)` + `useEffect(() => setState(...), [])` ensures identical initial server/client markup.
- **Empty initial render over placeholder text** — `deviceLabel` and `timezone` render empty when `deviceInfo` is null; existing `{deviceLabel || 'Current device'}` fallback covers the empty state without extra UI work.
- **Helpers untouched, only call site moved** — `detectBrowser()` / `detectOS()` remain unchanged; only their CALL SITE relocated from component body into useEffect. Defensive `typeof navigator === 'undefined'` guard kept (now effectively dead but no-cost).
- **Build-error scope boundary** — `npm run build` fails on Phase 09's `automations/[id]/page.tsx` (Turbopack rejects `dynamic({ssr:false})` in Server Components). Out of scope for 12-05; logged in `phases/12-settings/deferred-items.md`. Plan-level verification used `npx tsc --noEmit --skipLibCheck` (passes 0 errors).
- [Phase 12-settings]: Plan 12-04 (gap closure): revalidatePath added to all settings server actions; saveProfileName syncs supabase.auth.updateUser; dashboard-header.tsx now reads first_name from profiles table with auth metadata fallback
- [Phase 12-settings]: Plan 12-04: admin-client updates now use .select('id') + zero-row guard; hourly-cost form replaced silently-failing Zod resolver with inline numeric validation in server action

Phase 14-02 decisions (2026-04-30):
- **Structural TimeT type in shared helper** — `type TimeT = (key: string) => string` accepts both `useTranslations` (client) and `getTranslations` (server) translator shapes; util module stays dependency-free of next-intl
- **Full migration of all 4 buckets** — original `buildTimeAgo` only hardcoded `<60s` ('Just now') but Plan 14-02 unifies all 4 buckets (`<60s`, `<3600s`, `<86400s`, `else`) under shared helper for single source of truth
- **Spanish m/h/d intentionally identical to English** — universal time-unit abbreviations preserve compact 5m/2h/3d visual style across locales; locked in CONTEXT.md
- **common.timeAgo.* coexists with dashboard.home.timeAgo.*** — new compact namespace; old long-form (`{count}m ago` / `Hace {count}m`) untouched (different surface, different style)
- **web/src/lib/utils/ subdirectory introduced alongside existing web/src/lib/utils.ts** — TypeScript module resolution treats both paths independently; `cn()` import path `@/lib/utils` unaffected
- **Commit-message contamination on commit `99900e7`** — Task 2 i18n key changes committed under wrong message ("feat(14-01): add assertOrgMembership...") due to parallel agent activity; content correct, message misleading. Documented in 14-02-SUMMARY.md.

Phase 13-01 decisions (2026-04-30):
- **operations tab inserted between productivity and reports** — groups internal-process categories (productivity → operations → reports) before AI Agents; deliberately NOT alphabetized
- **agencias chip appended as LAST industry key** — JSON insertion order = render order via `Object.keys(translations.industries)`; appending preserves byte-for-byte EN/ES key-order parity
- **Catalog cards now map t.category and t.industry_tags through translations bundle** — UAT-surfaced bug fix in commit 8fc33e0; raw DB slugs were leaking through to user-facing cards (latent defect from Phase 10, only visible after operations category exposed asymmetric EN/ES labels)
- **Raw-key fallback (?? t.category) in card translation lookup** — preserves safety for slugs not yet registered, allowing seed to evolve without breaking the UI
- **Pre-existing baseline lint debt deferred** — 104 errors / 1584 warnings in unrelated files (queries.ts, auth forms) verified out of scope; logged in deferred-items.md with recommendation for dedicated tech-debt phase before v1.2
- [Phase 15]: Plan 15-01: removed kpiTrends/avgResponseTime/notifications-query placeholders rather than computing replacements (real trends need historical data; avgResponseTime from seed always ~5s)

Phase 15-02 decisions (2026-04-30):
- **Per-file YAML key style preserved** — 08-01/02/05 keep snake_case (matches existing dependency_graph/tech_stack/key_files keys); 08-04 uses kebab-case (matches its minimal-frontmatter style and the newer Phase 13/14 standard). Heterogeneous styles across siblings are intentional and locked.
- **Insertion location: just before metrics: (or before closing --- if absent)** — top-level field placement, never nested. Makes the field discoverable by audit tooling that reads frontmatter only.
- **Inline-array bare-scalar syntax** — `[HOME-02, HOME-03, ...]` no quotes. Matches Phase 13/14 SUMMARY reference style and is valid YAML.
- **08-03 explicitly excluded** — out of audit scope (audit named exactly four plans: 01, 02, 04, 05). 08-03 already had requirements-completed: [NOTF-01, NOTF-02, NOTF-03] from its original 2026-04-10 ship commit `3e89f9b`.
- **Body content invariant** — only frontmatter receives a single +1 line per file; verified via `git diff --stat` showing 4 files changed, 4 insertions, 0 deletions.
- **Commit-message contamination on commit `93a51a0`** — Task 1 frontmatter additions to 08-01/02 absorbed by parallel Plan 15-01 agent's commit (which wears a `refactor(15-01):` message). Same pattern as 14-02's `99900e7` contamination. Content correct, message misleading. Documented in 15-02-SUMMARY.md.

### Pending Todos

- Run `npx supabase db reset` when Docker Desktop is running to confirm full migration stack + seed apply cleanly (prerequisite before Phase 08).

### Blockers/Concerns

- Phase 7 (schema migration) is a hard prerequisite for all v1.1 frontend phases — must complete first
- `automation_templates.category` CHECK constraint expansion requires careful ALTER ordering (drop old, add new)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix password reset email link redirecting to root instead of reset-password page | 2026-04-01 | 984780a | [1-fix-password-reset-email-link-redirectin](./quick/1-fix-password-reset-email-link-redirectin/) |
| 2 | Fix password reset link showing expired (PKCE cookie in browser context) | 2026-04-02 | ed19bfc | [2-fix-password-reset-link-showing-expired-](./quick/2-fix-password-reset-link-showing-expired-/) |
| 3 | Replace main page with full AIDEAS branded landing page (React conversion from HTML/jQuery) | 2026-04-07 | c30b119 | [3-replace-main-page-with-landing-page-and-](./quick/3-replace-main-page-with-landing-page-and-/) |
| 4 | Redesign dashboard UI with purple accent, KPI trends, gradient top automation card, success rate, performance metrics, status-icon activity feed | 2026-04-10 | 41cdcec | [4-redesign-dashboard-ui-based-on-reference](./quick/4-redesign-dashboard-ui-based-on-reference/) |

## Session Continuity

Last session: 2026-04-30
Stopped at: Plan 15-02 COMPLETE — 4 Phase 8 SUMMARY files backfilled with requirements_completed/requirements-completed frontmatter field. 2 tasks, 4 min, 2 commits (Task 1: 93a51a0 [contaminated by 15-01 parallel agent — content correct, message misleading]; Task 2: b318212 [clean]). Per-file YAML key style preserved (snake_case for 08-01/02/05; kebab-case for 08-04). 08-03 untouched (out of scope, already had field). Closes v1.1 milestone audit tech-debt for Phase 8 SUMMARY frontmatter requirement-ID traceability. Phase 15 now 2/2 plans complete (alongside 15-01 which closed Phase 8 placeholder tech-debt earlier same session).
Resume file: None — Phase 15 complete. Next action: v1.1 milestone audit re-run + `/gsd:verify-work` for Phase 15 + `/gsd:complete-milestone`.
