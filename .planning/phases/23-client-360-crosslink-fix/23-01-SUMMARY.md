---
phase: 23-client-360-crosslink-fix
plan: 01
subsystem: api
tags: [admin, supabase, postgrest, query-layer, slug-resolution, uuid]

# Dependency graph
requires:
  - phase: 19-requests-inbox
    provides: fetchAdminRequests query layer with TAB_TO_STATUSES grouping + translation embed
  - phase: 20-automations-admin
    provides: fetchAdminAutomations with org/template/name filter chain + load-bearing filter ordering
  - phase: 21-client-360
    provides: Client 360 tabs that emit ?org=<slug> crosslinks the list pages must now honor
provides:
  - "isUuid(value): strict RFC 4122 v1-5 detector for org-identifier discrimination"
  - "resolveOrgIdentifier(supabase, raw): single helper that turns slug-or-uuid into {orgId, resolvedOrg, orgIdentifierProvided}"
  - "AdminRequestListResult / AdminAutomationListResult envelope types (rows + orgFilter)"
  - "fetchAdminRequests(orgIdentifier?) — now scopes inbox to a slug-or-uuid org filter"
  - "fetchAdminAutomations(filters.organizationId) — now interprets the field as slug-or-uuid (was UUID-only)"
  - "Unresolved-identifier short-circuit returning empty rows without scanning the table"
affects: [23-02, client-360, admin-requests-page, admin-automations-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared identifier-resolution helper consumed by sibling query files (single source of truth for slug-or-uuid logic)"
    - "Envelope return shape (rows + filter metadata) to avoid second-query round-trip for filter-chip rendering"
    - "Short-circuit on unresolved identifier to give pages a distinct 'not found' state without full-table scan"

key-files:
  created:
    - "web/src/lib/admin/org-identifier.ts"
  modified:
    - "web/src/lib/admin/types.ts"
    - "web/src/lib/admin/request-queries.ts"
    - "web/src/lib/admin/automation-queries.ts"

key-decisions:
  - "23-01: Keep AdminAutomationListFilters.organizationId field name (semantic-only widening to slug-or-uuid) to avoid a phase-22-wide callsite rename"
  - "23-01: 100-char input cap inside resolveOrgIdentifier — defends against hostile ?org=... payloads without rejecting legitimate slugs"
  - "23-01: Echo back the raw user input via orgIdentifierProvided even when resolution fails — lets the page render an explicit 'Org not found' state rather than a silent empty list"
  - "23-01: Generic SupabaseClient type (no Database generic) keeps the helper portable across admin/customer clients without coupling to the generated schema types"

patterns-established:
  - "Pattern: identifier-resolution helper — when two sibling queries accept the same polymorphic identifier, hoist the regex+lookup into one shared async function rather than duplicating the discriminator"
  - "Pattern: envelope return shape — when a list query depends on a filter argument that must be displayed back to the user (filter chip), bundle the rows + resolved filter metadata into one return value"

requirements-completed:
  - CLNT-04
  - AUTM-02

# Metrics
duration: 3 min
completed: 2026-05-13
---

# Phase 23 Plan 01: Slug-or-UUID Org Identifier Contract Summary

**Shared `resolveOrgIdentifier` helper plus envelope return shapes on `fetchAdminRequests` and `fetchAdminAutomations`, so the Client 360 → admin list crosslinks accept either slugs or UUIDs and short-circuit cleanly when neither resolves.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-13T19:12:45Z
- **Completed:** 2026-05-13T19:15:56Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- Single source of truth for slug-or-uuid resolution: `resolveOrgIdentifier` handles UUID detection, slug lookup, trim/cap, soft-delete filtering, and unresolved-identifier semantics.
- `fetchAdminRequests` now accepts the optional `orgIdentifier` slot it was missing entirely (the CLNT-04 bug: query string was being thrown away).
- `fetchAdminAutomations` no longer assumes its `organizationId` argument is a UUID — the AUTM-02 silent-empty-result bug now goes through `resolveOrgIdentifier`.
- Both list queries now return `{ rows, orgFilter }` envelopes so Plan 02 can render the filter chip ("Acme Co · Clear") from a single round-trip.
- Filter-chain order preserved verbatim in both files (load-bearing for postgrest-js embedded-filter behavior, documented at `automation-queries.ts:41-48`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Create slug-or-uuid resolver helper + type envelopes** — `ed2ce0a` (feat)
2. **Task 2: Refactor fetchAdminRequests and fetchAdminAutomations** — `b746167` (feat)

_Plan metadata commit: appended after this summary lands._

## Files Created/Modified

- `web/src/lib/admin/org-identifier.ts` *(new)* — exports `isUuid` (strict RFC 4122 v1-5 regex) and `resolveOrgIdentifier` (slug-or-uuid → `{orgId, resolvedOrg, orgIdentifierProvided}`). Generic `SupabaseClient` typed; assumes caller already gated via `assertPlatformStaff`.
- `web/src/lib/admin/types.ts` — added `ResolvedOrg`, `AdminOrgFilterMeta`, `AdminRequestListResult`, `AdminAutomationListResult`. JSDoc note on `AdminAutomationListFilters` flagging `organizationId` as slug-or-uuid post-Phase-23.
- `web/src/lib/admin/request-queries.ts` — `fetchAdminRequests` signature widened with optional `orgIdentifier`; resolver invoked after auth gate; short-circuit on unresolved identifier; `.eq("organization_id", orgId)` inserted into the canonical filter-chain slot; return now wraps the row-map in the envelope shape. Other functions in the file (counts, detail) untouched.
- `web/src/lib/admin/automation-queries.ts` — same wiring on `fetchAdminAutomations`; resolver replaces the old direct `.eq("organization_id", filters.organizationId)` line; envelope return. `fetchAdminAutomationStatusCounts`, `fetchAdminAutomationFilterOptions`, `fetchAdminAutomationDetail` untouched.

## Decisions Made

- **Keep `AdminAutomationListFilters.organizationId` field name.** Widening the meaning (slug-or-uuid) is documented in JSDoc; renaming the field would ripple through Phase 20's filter-bar component, the page, and the searchParams parser for no functional gain in this wave. Defer rename per CONTEXT.md.
- **100-char input cap in the resolver.** The slug column is varchar — anything longer than 100 chars cannot match a legitimate slug. Truncating instead of rejecting still preserves the user's intent for the "Org not found" state.
- **Echo back the raw user input via `orgIdentifierProvided` even on failure.** Gives Plan 02 enough signal to render `"Org not found: 'acme-co'"` instead of an indistinguishable empty list.
- **Generic `SupabaseClient` type (no `Database` generic).** Keeps the helper portable; the row-shape cast at the read site is locally scoped.

## Deviations from Plan

None — plan executed exactly as written. Both tasks completed with their `<done>` criteria met, all verification checklist items satisfied, and the two expected typed breaking-change errors at the page callsites (`page.tsx:140` in automations, `page.tsx:95` in requests) are precisely the ones the plan flagged for Plan 02 to close.

## Issues Encountered

- **Isolated `tsc --noEmit <file>` does not resolve `@/` aliases.** The plan's automated verification command was `npx tsc --noEmit src/lib/admin/...ts`, which without a project flag bypasses `tsconfig.json` and reports the existing `@/lib/supabase/admin-server` / `@/lib/auth/assert-platform-staff` imports as unresolvable. These are not new errors — they are a tsconfig-mode artifact present in the source files before this plan. Re-ran with `npx tsc --noEmit -p tsconfig.json` to validate properly: only the two expected breaking-change errors at the page callsites surface, exactly as the plan predicted. No action needed; Plan 02 closes both.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 02 can now consume both list queries as:
  ```typescript
  const { rows, orgFilter } = await fetchAdminRequests({ tab, locale, orgIdentifier: sp.org ?? null });
  const { rows, orgFilter } = await fetchAdminAutomations({ tab, locale, organizationId: sp.org ?? null, templateId, nameQuery });
  ```
- The two page-level type errors at `(admin)/admin/requests/page.tsx:95` and `(admin)/admin/automations/page.tsx:140` are intentional and scoped to the call sites Plan 02 owns.
- `npm run build` will be temporarily red between this commit and Plan 02's first commit — flagged in the plan's NOTE block; not a regression.

## Self-Check: PASSED

Verified files on disk and commits in git log:

- `web/src/lib/admin/org-identifier.ts` — present
- `web/src/lib/admin/types.ts` — present
- `web/src/lib/admin/request-queries.ts` — present
- `web/src/lib/admin/automation-queries.ts` — present
- `.planning/phases/23-client-360-crosslink-fix/23-01-SUMMARY.md` — present
- Commit `ed2ce0a` (Task 1) — present
- Commit `b746167` (Task 2) — present

---
*Phase: 23-client-360-crosslink-fix*
*Completed: 2026-05-13*
