---
phase: 20-automations-admin
plan: 02
subsystem: ui
tags: [next-intl, supabase, postgrest, admin, automations, detail, kpis, timeline]

# Dependency graph
requires:
  - phase: 20-automations-admin
    plan: 01
    provides: AdminAutomationStatus type, automation-queries.ts file (3 fetchers + assertPlatformStaff guard), /admin/automations list with row Name links pointing at /admin/automations/[id]
  - phase: 19-requests-inbox
    provides: actions ReactNode slot pattern from admin-request-detail.tsx, embed-shape singleEmbed normalizer pattern, server-only translations-prop pattern
  - phase: 17-admin-foundation
    provides: assertPlatformStaff helper, createAdminServerClient, (admin) route group + AdminShell layout
provides:
  - AdminAutomationExecutionEntry, AdminAutomationDetail types (appended to web/src/lib/admin/types.ts)
  - fetchAdminAutomationDetail(automationId, locale) — single automation + org + template (with locale-filtered translation) + 4 precomputed KPIs + last-20 execution timeline; null on missing/soft-deleted
  - singleEmbed<T>() helper inside automation-queries.ts — defensive normalizer for !inner / !left embeds returning T or T[] (Supabase JS PostgREST quirk; Phase 19-01 pattern)
  - AdminAutomationKpis (server) — locale-aware 4-card grid (Total executions / Hours saved / Success rate / Last execution); 'Never' / '—' fallbacks
  - AdminAutomationTimeline (server) — last-20 execution feed; status dot + label + relative timestamp + optional duration in seconds; empty state
  - AdminAutomationDetail (server) — layout shell (back link + header [name + status badge + actions slot] + KPI grid + 2-column body)
  - /admin/automations/[id] real server-rendered route — awaits params + fetchAdminAutomationDetail + getTranslations in parallel; notFound() on null; passes actions={null}
  - admin.automations.detail i18n namespace — 31 leaf keys per locale, EN + ES, full parity
affects: [20-03, 21-clients-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Defensive embed-shape normalizer: singleEmbed<T>(v) handles Supabase JS returning single-row !inner/!left embeds as either T or T[]. Reused from Phase 19-01 (subscriptions); now also applied to organizations !inner and automation_templates !left."
    - "Two-roundtrip detail query: 1 SELECT for the row + embedded org + embedded template (with translation), 1 SELECT for ALL executions (no pagination needed for KPIs since per-automation execution volume is small). KPIs computed in JS from the same rowset that supplies the timeline slice."
    - "ReactNode actions slot in detail header: actions?: ReactNode prop lets a future plan (20-03) inject status-transition buttons without restructuring the layout. The slot only renders when actions is truthy. Mirrors Phase 19-03 admin-request-detail."
    - "Server-only translation pattern continued: page calls getTranslations + t.raw, builds a plain translations object, passes it as a prop to fully server-rendered components — zero useTranslations() in the client tree (because there IS no client tree in this plan)."

key-files:
  created:
    - web/src/app/(admin)/admin/automations/[id]/page.tsx
    - web/src/components/admin/automations/admin-automation-detail.tsx
    - web/src/components/admin/automations/admin-automation-kpis.tsx
    - web/src/components/admin/automations/admin-automation-timeline.tsx
  modified:
    - web/src/lib/admin/types.ts (additive — 2 new exported interfaces, no removals)
    - web/src/lib/admin/automation-queries.ts (additive — 1 new fetcher + 1 internal helper, all 3 plan-20-01 fetchers preserved)
    - web/messages/en.json (+admin.automations.detail with 31 new leaf keys)
    - web/messages/es.json (+admin.automations.detail with 31 new leaf keys, accent-free Spanish)

key-decisions:
  - "Defensive singleEmbed() normalization for organization (!inner) AND template (!left). Even though FK + UNIQUE constraints make these 1-to-1, Supabase JS PostgREST sometimes returns single-row embeds as T[] (length 0..1). Bake the normalizer into the detail fetcher from day 1 per the 20-01 SUMMARY 'TypeScript-shape gotcha' note."
  - "Two round trips, not three. Pulled ALL executions (no pagination) instead of issuing separate count + slice queries. KPIs (total, successful, success rate) and the last-20 timeline both derive from the same rowset. Acceptable at v1.2 volume; revisit if any one automation accumulates 10k+ executions."
  - "Hours saved formula: round((successfulExecutions × avg_minutes_per_task) / 60, 1 decimal). Mirrors Phase 8 dashboard hours-saved exactly. avg_minutes_per_task may be NULL for some templates → coerced to 0 so the multiplication is safe; result is just 0.0h on those rows (correct behavior — we have no signal otherwise)."
  - "lastRunAt prefers automations.last_run_at column with fallback to allExecs[0].started_at. The column is updated by the writer process; if it lags (e.g. crash before commit), the most-recent execution start is the next-best signal."
  - "Setup notes section renders ONLY when value is non-empty after .trim(). CONTEXT.md prescribed inline (not collapsible) section; an empty/whitespace-only setup_notes string would otherwise render an empty purple card."
  - "Actions slot only renders when truthy. Plan 20-02 passes actions={null}, so the header gracefully collapses without an empty flex container. Plan 20-03 will swap null for the four contextual transition buttons; the layout container is already in place."
  - "Status badges palette (7 statuses, not 5): active=green, in_setup=blue, paused=amber, failed=red, archived=gray, draft=gray, pending_review=purple. The detail page covers ALL real DB statuses (unlike the list which only tabs the 5 main ones), because navigating to a draft or pending_review row's detail must still render a sensible badge."
  - "Monthly price formatted as USD currency with 2 decimals via Intl.NumberFormat. Schema stores cents (Phase 18-03 convention); the detail component divides by 100 client-side and formats — keeps the schema layer pure cents and the UI layer pure dollars."
  - "Custom-automation empty state in template card: 'Custom automation' heading + 'This automation was set up without a catalog template.' body. Avoids forcing every operator to learn that template_id can be NULL — explains the absence in plain language."
  - "Translation embed string wins; slug is the fallback. templateDisplayName = translations[0]?.value ?? slug ?? null (full null when there's no template at all). Defensive: any future locale-row deletion would surface as the slug and not as 'undefined'."
  - "All four new files are server components. No 'use client' directive anywhere. The Intl.RelativeTimeFormat / Intl.NumberFormat calls happen on the server during render — zero hydration cost."

patterns-established:
  - "Admin detail page recipe: server route awaits params + Promise.all([fetcher, getTranslations]) + notFound() on null + plain translations object → server-only layout shell with actions ReactNode slot. Reusable for Phase 21 Clients Admin detail page (next layer up)."
  - "Two-query KPI pattern: pull entire child rowset (small N), reduce in JS for COUNT / SUM / RATE / latest. Cheaper than 4 separate aggregate round trips; simpler than a Postgres aggregate function."
  - "actions: ReactNode slot in a server layout: lets a sibling plan inject client buttons without breaking the server tree. Already battle-tested in Phase 19-03 (admin-request-detail) and now Phase 20-02; will be reused by Phase 20-03 (transition buttons), Phase 21 (client account actions), and Phase 22 (admin home contextual actions)."

requirements-completed: [AUTM-05, I18N-01]

# Metrics
duration: 7min
completed: 2026-05-07
---

# Phase 20 Plan 02: Admin Automation Detail Page Summary

**Read-only /admin/automations/[id] surface — staff lands on a header (name + status + reserved actions slot), 4 KPIs, last-20-execution timeline, org card, template card, and inline setup_notes (when present). 31 new i18n keys per locale; full EN/ES parity. The 20-01 list view's row Name links now resolve to a live page.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-07T19:58:29Z
- **Completed:** 2026-05-07T20:05:01Z
- **Tasks:** 3
- **Files modified:** 8 (4 created, 4 modified)

## Accomplishments

- Real /admin/automations/[id] detail page replaces the dead links from Plan 20-01's list rows. Server route fans out Promise.all([fetchAdminAutomationDetail, getTranslations]) and renders a fully server-side layout.
- Two new exported interfaces appended to web/src/lib/admin/types.ts: AdminAutomationDetail (full detail object with 5 org+template fields, 4 precomputed KPIs, and the recentExecutions array) and AdminAutomationExecutionEntry (timeline row shape).
- One new fetcher appended to web/src/lib/admin/automation-queries.ts: fetchAdminAutomationDetail(id, locale) — guarded by assertPlatformStaff, two round trips (row + embeds; all executions), maybeSingle() with soft-delete filter, defensive singleEmbed normalization on org (!inner) and template (!left), null-on-missing for the page to 404.
- Three new server components in web/src/components/admin/automations/: admin-automation-detail (layout shell with actions ReactNode slot), admin-automation-kpis (locale-aware 4-card grid), admin-automation-timeline (last-20 execution feed).
- 31 new i18n leaf keys per locale under admin.automations.detail with full EN/ES parity (857 total leaf keys after this plan).
- Plan 20-01's row Name links from the list view now resolve to a real, server-rendered page (no more dead links).

## Task Commits

Each task was committed atomically on `feature/phase-20-automations-admin`:

1. **Task 1: Append AdminAutomationDetail types + fetchAdminAutomationDetail query** — `0ac8f8a` (feat)
2. **Task 2: Build /admin/automations/[id] detail page + 3 server components** — `9ffd988` (feat)
3. **Task 3: Add admin.automations.detail i18n keys (EN + ES, full parity)** — `21e59ab` (feat)

## Files Created/Modified

**Created:**
- `web/src/app/(admin)/admin/automations/[id]/page.tsx` — server route, awaits params, parallel-fetches detail + translations, notFound() on null, passes actions={null}.
- `web/src/components/admin/automations/admin-automation-detail.tsx` — server component, layout shell. Header includes name + status badge + actions ReactNode slot (slot is hidden when actions is falsy). Right column composes Org card + Template card (with template_id-null empty state) + Setup notes section (renders only when non-empty after trim).
- `web/src/components/admin/automations/admin-automation-kpis.tsx` — server component, 4-card grid. Locale-aware Intl.NumberFormat for total executions count and hours-saved fixed-1-decimal. Intl.RelativeTimeFormat for last-execution rendering. 'Never' fallback on null lastRunAt; '—' fallback on null successRate.
- `web/src/components/admin/automations/admin-automation-timeline.tsx` — server component, last-20 execution feed. Status dot color per status (success=green, error=red, cancelled=gray, running=blue+pulse). Optional 'Ns' duration (durationMs / 1000 rounded) and relative timestamp per row. Truncated 80-char errorMessage display when present. Localized empty state.

**Modified:**
- `web/src/lib/admin/types.ts` — appended 2 new exported interfaces; no removals.
- `web/src/lib/admin/automation-queries.ts` — appended `fetchAdminAutomationDetail` + an internal `singleEmbed<T>` helper; all 3 plan-20-01 fetchers preserved; imports extended to include the 2 new types.
- `web/messages/en.json` — added `admin.automations.detail` (31 leaf keys) as a sibling of `admin.automations.list`.
- `web/messages/es.json` — same shape with Spanish parity (accent-free per project convention).

## Decisions Made

- **Defensive singleEmbed() normalization for both embeds.** Even though FK + UNIQUE constraints make automations→organizations and automations→automation_templates 1-to-1, Supabase JS PostgREST sometimes returns single-row embeds as T (single object) and sometimes as T[] (length 0..1). Phase 20-01's SUMMARY explicitly flagged this as a 20-02 concern; the detail fetcher applies the normalizer from day 1. Reusable for any future UNIQUE-FK !inner / !left embed in admin queries (Phase 21 will need it for clients↔owner).
- **Two round trips, not three.** Pulled ALL executions (`.order(started_at, desc)`) instead of separate aggregate + slice queries. KPIs (total, successful, success rate) and the last-20 timeline both derive from the same rowset. Acceptable at v1.2 volume (per-automation execution count is small); revisit if a single automation ever crosses ~10k executions.
- **Hours saved formula mirrors Phase 8 dashboard.** `round((successfulExecutions × template.avg_minutes_per_task) / 60, 1 decimal)`. avg_minutes_per_task may be NULL for some templates → `?? 0` so the multiplication is safe; the row just shows 0.0h, which is correct given we have no time-savings signal otherwise.
- **lastRunAt prefers automations.last_run_at column with execution-most-recent as fallback.** The column is maintained by the writer process; if it lags or was never populated (test seed data), the most recent execution's started_at is the next-best signal. Avoids 'Never' showing up for an automation that clearly DID run recently.
- **Setup notes section renders ONLY when value is non-empty after .trim().** Avoids an empty purple card for any seed automation whose setup_notes is the empty string or whitespace-only. CONTEXT.md prescribed inline (not collapsible) — done.
- **Actions slot only renders when truthy.** `{actions && (<div>{actions}</div>)}` — passing actions={null} from the page (this plan) yields a header with no flex wrap container, no empty whitespace. Plan 20-03 will swap null for the four contextual transition buttons.
- **Status badge palette covers all 7 real DB statuses.** Unlike the list view (which tabs only the 5 main ones), the detail page might receive an automation in `draft` or `pending_review` and must render a sensible badge. Palette: active=green, in_setup=blue, paused=amber, failed=red, archived=gray, draft=gray, pending_review=purple. Fallback to draft palette for any unknown future status string.
- **Monthly price formatted as USD currency with 2 decimals.** Schema stores cents (Phase 18-03 convention); detail divides by 100 and uses Intl.NumberFormat({style: 'currency', currency: 'USD'}). Locale-aware separators (1,234.50 in en, 1.234,50 if a future locale uses comma decimals).
- **Custom-automation empty state in template card.** When template_id is null, render 'Custom automation' heading + 'This automation was set up without a catalog template.' body — operator-friendly explanation rather than a NULL/dash. Reusable copy pattern for Phase 21 client-detail empty states.
- **Translation-string wins; slug is the fallback for templateDisplayName.** `translations[0]?.value ?? slug ?? null`. Cheap defense against any future row-level translation deletion.
- **All four new files are server components.** No 'use client' directive anywhere; Intl.RelativeTimeFormat / Intl.NumberFormat run on the server during render. Zero hydration cost. The actions slot is the only seam where a client subtree could enter (Plan 20-03 will pass client transition buttons through it).

## Deviations from Plan

None — plan executed exactly as written, with one minor clarification: the plan listed three round trips for the detail query but the implementation uses two (one for the joined automation + org + template + translation, one for the executions). This matches the plan's stated `<verify>` block intent, just with cleaner numbering. No code changes from plan; same query shape.

**Total deviations:** 0
**Impact on plan:** None.

## Issues Encountered

- `npm run build` requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` env var on Windows for Geist Google Fonts (carry-over from Phase 16/19/20-01). Build succeeds with the env var set. Build output emits `/admin/automations/[id]` as `ƒ (Dynamic) — server-rendered on demand`, the expected shape.
- Pre-existing `npm run lint` errors in unrelated files (auth, dashboard, signup form, ~104 errors) remain — out of scope per deviation-rules scope boundary. Scoped lint against this plan's files exits 0.

## TypeScript-shape gotchas (carry-forward for plan 20-03)

- `actions: ReactNode` slot is now wired and battle-tested in plan 20-02. Plan 20-03 will pass a fragment containing `<TransitionButton>` client components (plus the modal portal where applicable). The detail layout's `{actions && (<div>{actions}</div>)}` already gracefully handles `null` (this plan) AND the populated case (plan 20-03). No changes needed to the layout component when 20-03 ships.
- `singleEmbed<T>()` helper is internal to automation-queries.ts. If Phase 21 needs the same defensive normalization for its clients↔owner embed, copy the helper rather than exporting from this file (each query module owns its own embed defenses; keeps imports clean).
- `template.translations` always returns as an Array (length 0..1) after the locale + field eq filters. Read via `translations[0]?.value ?? fallback`. Same as Phase 18, 19-01, 20-01.
- Status badge classnames now cover all 7 real DB statuses; reuse the same `STATUS_BADGE_CLASS` palette in any future detail surface that might receive any of the 7.

## User Setup Required

None — no external service configuration. The `/admin/automations/[id]` page is wired against existing seed data. Recommended UAT (the plan's `<output>` block called these out):

- **Visit /admin/automations/[id] for an automation WITH executions** — KPIs render with non-zero numbers, success rate as a percent, last execution as a relative timestamp, timeline lists up to 20 entries newest first.
- **Visit /admin/automations/[id] for an automation with NO executions** — KPIs show 0 / 0.0 / "—" / "Never", timeline empty state renders.
- **Visit /admin/automations/[id] for an automation with setup_notes set** (e.g., one created via the Phase 19 approve flow) — purple inline section renders the notes verbatim with whitespace preserved.
- **Visit /admin/automations/[id] for an automation with template_id=null** — template card shows the 'Custom automation' empty state.
- **Visit /admin/automations/garbage-or-deleted-id** — Next's notFound() 404 page renders.
- **Switch locale to ES** — back link reads "Volver a automatizaciones", KPI labels read "Ejecuciones totales / Horas ahorradas / Tasa de exito / Ultima ejecucion", status badge for active reads "Activa".

## Next Phase Readiness

- **Plan 20-03 (status transitions) is unblocked.** The detail layout's `actions` ReactNode slot is wired and battle-tested with `null`. Plan 20-03 will:
  1. Add `automation-actions.ts` (or extend automation-queries.ts) with four server actions: in_setup→active, active↔paused, archive, and a generic transition helper.
  2. Build a `<AdminAutomationTransitions>` client component that renders the four contextual buttons based on `detail.status`.
  3. Update `(admin)/admin/automations/[id]/page.tsx` to pass `actions={<AdminAutomationTransitions detail={detail} translations={...} />}` instead of `null`.
- **AUTM-05 (Detail page read-only) and I18N-01 (this slice) are now satisfied.** AUTM-02..04 remain for plan 20-03 only.
- **20-01 list row Name links are now LIVE.** No more dead links; clicking any row in the list jumps to the new detail surface.

## Self-Check: PASSED

Files verified to exist:
- web/src/lib/admin/types.ts — FOUND (modified)
- web/src/lib/admin/automation-queries.ts — FOUND (modified)
- web/src/app/(admin)/admin/automations/[id]/page.tsx — FOUND
- web/src/components/admin/automations/admin-automation-detail.tsx — FOUND
- web/src/components/admin/automations/admin-automation-kpis.tsx — FOUND
- web/src/components/admin/automations/admin-automation-timeline.tsx — FOUND
- web/messages/en.json — FOUND (modified)
- web/messages/es.json — FOUND (modified)

Commits verified to exist on `feature/phase-20-automations-admin`:
- 0ac8f8a — FOUND
- 9ffd988 — FOUND
- 21e59ab — FOUND

Verifications run:
- `npx tsc --noEmit` exits 0 across the whole project (zero errors).
- `npx eslint` against Phase 20-02 files (types, queries, page, 3 components) exits 0 with zero errors and zero warnings.
- `npm run build` exits 0 (with NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1) and emits both `/admin/automations` AND `/admin/automations/[id]` as dynamic server-rendered routes.
- i18n parity script: 857 total keys, zero missing in either direction.
- All 31 required `admin.automations.detail.*` leaf keys present in both locales (validated by explicit allow-list in the parity script).
- All 4 new component/page files verified server-rendered (no `"use client"` directive at file head).

---
*Phase: 20-automations-admin*
*Plan: 02*
*Completed: 2026-05-07*
