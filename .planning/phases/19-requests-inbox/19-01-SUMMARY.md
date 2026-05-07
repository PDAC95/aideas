---
phase: 19-requests-inbox
plan: 01
subsystem: database
tags: [supabase, postgres, migration, typescript, admin, automation-requests]

requires:
  - phase: 17-admin-foundation
    provides: assertPlatformStaff, createAdminServerClient, platform_staff RLS
  - phase: 18-catalog-admin
    provides: catalog-queries.ts pattern (admin client + assertPlatformStaff + locale-filtered translation embed)

provides:
  - automations.setup_notes column for persisting customer custom_requirements text on approve
  - fetchAdminRequests({status, locale}) — list query with org+template join, FIFO/DESC ordering
  - fetchAdminRequestStatusCounts() — single-pass counters for pending/approved/rejected tabs
  - fetchAdminRequestDetail(id, locale) — full detail with requester, org, plan, active automations count, resultingAutomationId
  - AdminRequestStatus, AdminRequestRow, AdminRequestDetail, AdminRequestStatusCounts shared types

affects: [19-02-list-page, 19-03-actions, 20-automations-admin]

tech-stack:
  added: []
  patterns:
    - "Admin-side data layer mirrors Phase 18 catalog-queries shape: createAdminServerClient -> assertPlatformStaff -> SELECT with locale-filtered translation embed -> optional second aggregate query"
    - "Defensive normalization of Supabase !left embed results (may return object or array depending on cardinality resolution)"
    - "Status-tab UI consumes a single counts query instead of one query per tab"
    - "Result-link derivation via deterministic match (org+template+created_at>=) instead of a foreign key — avoids schema migration"

key-files:
  created:
    - "supabase/migrations/20260508000001_automations_setup_notes.sql"
    - "web/src/lib/admin/types.ts"
    - "web/src/lib/admin/request-queries.ts"
  modified: []

key-decisions:
  - "automations.setup_notes is a nullable TEXT column with no CHECK and no default — NULL is the correct sentinel for automations not created via the approve-request flow"
  - "Migration uses ADD COLUMN IF NOT EXISTS so re-runs on already-migrated environments noop cleanly"
  - "subscription !left embed coded defensively to accept both object and array shapes; UNIQUE(organization_id) means at most one row but Supabase JS may still return an array"
  - "Status counts query is a single round trip that buckets client-side, NOT three separate count queries — saves ~2 RTTs and matches CONTEXT.md's tab-counter prescription"
  - "resultingAutomationId is derived per-call by matching (org, template, created_at>=request.created_at) rather than persisted as a column — keeps schema lean; the link only appears on approved-status detail pages where the match is deterministic for v1.2 volume"
  - "All three query functions throw on auth failure (do not return error union) — admin layout gates the route, so reaching these without staff is a programmer error, not user input"

patterns-established:
  - "Admin query files live at web/src/lib/admin/<feature>-queries.ts and consume types from web/src/lib/admin/types.ts (single shared types file across admin features)"
  - "Locale-filtered translation embed pattern from Phase 18 reused verbatim for automation_requests inbox: .eq('template.translations.locale', locale).eq('template.translations.field', 'name')"

requirements-completed: [REQS-01, REQS-02]

duration: 4 min
completed: 2026-05-07
---

# Phase 19 Plan 01: Requests Inbox Data Plane Summary

**Adds automations.setup_notes column plus three typed admin queries (list, counts, detail) on automation_requests so the Plan 19-02 list page and Plan 19-03 detail page can render and act without ad-hoc Supabase calls.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-07T13:20:38Z
- **Completed:** 2026-05-07T13:24:22Z
- **Tasks:** 2
- **Files modified:** 3 (3 created, 0 modified)

## Accomplishments

- Migration `20260508000001_automations_setup_notes.sql` adds nullable `setup_notes TEXT` to `public.automations` with a documenting `COMMENT ON COLUMN`. Idempotent via `ADD COLUMN IF NOT EXISTS`. No RLS changes — existing org-member SELECT and service-role write policies cover the new column unchanged.
- `web/src/lib/admin/types.ts` exposes the four shared types (`AdminRequestStatus`, `AdminRequestRow`, `AdminRequestDetail`, `AdminRequestStatusCounts`). Tiny, types-only — future admin features can extend it.
- `web/src/lib/admin/request-queries.ts` exposes three async functions, all gated by `assertPlatformStaff`:
  - `fetchAdminRequests({status, locale})` — list scoped to one status tab; embed-joins organizations + automation_templates + locale-filtered translations; FIFO when status='pending', DESC otherwise; description preview clipped at 80 chars.
  - `fetchAdminRequestStatusCounts()` — single-pass counters for pending/approved/rejected; one network round trip.
  - `fetchAdminRequestDetail(id, locale)` — full request + org + requester profile + linked template + subscription plan + active-like automation count for the requesting org + deterministic `resultingAutomationId` when approved.
- Existing `/admin/requests` placeholder page (committed in Phase 17-03) is unchanged. UI changes land in Plan 19-02.

## Task Commits

1. **Task 1: Add setup_notes column to automations via migration** — `f880b8c` (feat)
2. **Task 2: Build admin shared types + request queries** — `accd996` (feat)

**Plan metadata:** _(committed after this summary)_

## Files Created/Modified

- `supabase/migrations/20260508000001_automations_setup_notes.sql` — Adds nullable `setup_notes TEXT` to `automations` with documenting comment.
- `web/src/lib/admin/types.ts` — Shared admin types: `AdminRequestStatus`, `AdminRequestRow`, `AdminRequestDetail`, `AdminRequestStatusCounts`.
- `web/src/lib/admin/request-queries.ts` — Three admin query functions: `fetchAdminRequests`, `fetchAdminRequestStatusCounts`, `fetchAdminRequestDetail`. All gated by `assertPlatformStaff`.

## Function Signatures (intel for Plans 19-02 / 19-03)

```typescript
fetchAdminRequests(input: {
  status: AdminRequestStatus;  // 'pending' | 'approved' | 'rejected'
  locale: string;              // 'en' | 'es' (or whatever next-intl resolves)
}): Promise<AdminRequestRow[]>

fetchAdminRequestStatusCounts(): Promise<AdminRequestStatusCounts>
// returns { pending: number, approved: number, rejected: number }

fetchAdminRequestDetail(
  requestId: string,
  locale: string
): Promise<AdminRequestDetail | null>
// null when no row matches OR row is soft-deleted; throws on auth failure
```

`AdminRequestRow` carries: `id`, `organizationId`, `organizationName`, `templateId`, `templateDisplayName` (translation -> slug -> title fallback chain), `status`, `customRequirementsPreview` (~80 chars), `createdAt`.

`AdminRequestDetail` carries everything in `AdminRequestRow` plus full description, urgency, notes (rejection reason), updatedAt/completedAt, requester (id+email+full_name), org plan from subscriptions, active-automations count, and `resultingAutomationId` (only populated when status='approved' and a matching automation exists).

## Decisions Made

- **`setup_notes` is plain nullable TEXT** with no constraint and no default. Operators may approve a request with no notes (the customer's `custom_requirements` text is the source); NULL distinguishes those from approvals where the operator added context.
- **`resultingAutomationId` is derived, not persisted.** The pure-derivation approach (match on org+template+created_at>=) avoids a schema migration and the cleanup work it would entail. At v1.2 volume the match is deterministic; if collisions ever appear in v1.3 we add a foreign key column.
- **Counts query is one round trip, bucketed client-side.** The list page header needs three numbers; three separate count queries cost three RTTs. Selecting only `id, status` for the three relevant statuses and bucketing in JS is cheaper at every reasonable scale.
- **All admin queries throw on auth failure.** Admin layout (Phase 17-03) already redirects non-staff before these queries can run. Returning a `Result` union here would just push dead code into every caller.
- **Defensive Supabase embed-shape normalization for `subscription`.** Although `subscriptions.UNIQUE(organization_id)` means at most one row, the Supabase JS client's PostgREST resolver sometimes returns single-row LEFT embeds as `T | null` and sometimes as `T[]` depending on relationship inference. Normalizing inside `fetchAdminRequestDetail` (`Array.isArray(detail.subscription) ? detail.subscription[0] ?? null : detail.subscription ?? null`) keeps the public type stable regardless of which shape Supabase picks.

## Deviations from Plan

None - plan executed exactly as written.

The plan flagged a possible TypeScript-shape gotcha around `subscription` (object vs array). I pre-emptively coded for both shapes via a normalized union (`Array<...> | object | null`) so Plan 19-03 won't have to debug this at runtime. Type check (`npx tsc --noEmit`) and lint (`npx eslint`) both exit 0 against the new files.

## Issues Encountered

- **`npm run build` failed against Google Fonts (TLS / network)** — Out of scope for this plan. Turbopack tried to fetch `Geist` and `Geist Mono` from `fonts.googleapis.com` and failed with a TLS connection error during a sandboxed build. This is unrelated to the new files (which only add types and query functions; no font / layout changes). The plan-level verification is `tsc --noEmit` + `eslint`, both of which pass clean. Logging here as intel: when `npm run build` is required in CI, set `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` or pre-warm the font cache. Not blocking Plan 19-02 or 19-03.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 19-02 (list page) can import `fetchAdminRequests` and `fetchAdminRequestStatusCounts` directly. The `AdminRequestRow` shape lines up with the 5-column intermediate set prescribed in CONTEXT.md (Customer / Template / Status / Requirements preview / Created date).
- Plan 19-03 (detail page + approve/reject server actions) can import `fetchAdminRequestDetail` and rely on `setup_notes` existing on `automations`. The approve action will copy `automation_requests.description` -> `automations.setup_notes` per CONTEXT.md.
- Migration is local-file-only — `supabase migration up` (or whatever the project's apply path is) still needs to run before `npm run dev` against a fresh DB. Existing dev DB has no breaking change since the column is nullable with no default.

---
*Phase: 19-requests-inbox*
*Completed: 2026-05-07*

## Self-Check: PASSED

All claimed artifacts verified on disk:
- `supabase/migrations/20260508000001_automations_setup_notes.sql` — FOUND
- `web/src/lib/admin/types.ts` — FOUND
- `web/src/lib/admin/request-queries.ts` — FOUND
- `.planning/phases/19-requests-inbox/19-01-SUMMARY.md` — FOUND

All claimed commits verified in `git log`:
- `f880b8c` feat(19-01): add setup_notes column to automations — FOUND
- `accd996` feat(19-01): add admin request queries and shared types — FOUND

Verification commands run during execution (all passed):
- Migration regex check: `ADD COLUMN IF NOT EXISTS setup_notes TEXT` present
- Types exports check: all 4 type symbols exported
- Queries exports check: all 3 function declarations present
- `npx tsc --noEmit -p .` from `web/` — exit 0
- `npx eslint src/lib/admin/types.ts src/lib/admin/request-queries.ts` — exit 0
- 3 SELECTs from `automation_requests` confirmed in request-queries.ts
- Admin requests placeholder page (`web/src/app/(admin)/admin/requests/page.tsx`) untouched since Phase 17-03
