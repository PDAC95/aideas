# Phase 23 — Deferred Items

Out-of-scope discoveries logged during execution. Each entry is something
this phase noticed but intentionally did not fix because it lies outside
the current task's blast radius (per scope-boundary rule).

## From Plan 02 execution (2026-05-13)

### Lint: unused row-type imports introduced by Plan 01

- **Files:**
  - `web/src/lib/admin/request-queries.ts` — `AdminRequestRow` imported but unused
  - `web/src/lib/admin/automation-queries.ts` — `AdminAutomationRow` imported but unused
- **Origin:** Plan 01 commit `b746167` switched both query fns to return the
  envelope shapes (`AdminRequestListResult` / `AdminAutomationListResult`).
  The row types are now reachable transitively through the envelope types,
  so the direct import lines became dead.
- **Why deferred:** Pre-existing relative to Plan 02 — Plan 02 owns the
  page-callsite consumers, not the query-file internals. The fix is a
  trivial 2-line cleanup and belongs to whatever phase next touches those
  query files (or a dedicated lint sweep).
- **Severity:** Low (warning, not error). Build passes.

### Cosmetic: AdminAutomationsFilters dropdown does not reflect slug-form ?org=

- **File:** `web/src/components/admin/automations/admin-automations-filters.tsx`
- **Symptom:** When the user arrives at `/admin/automations?org=acme-co` from
  Client 360, the new `<AdminOrgFilterChip>` correctly displays "Organization:
  Acme Co", but the existing dropdown's "selected" highlight shows "All
  organizations" because its `value` is the slug `acme-co` which doesn't
  match any UUID in `filterOptions.orgs`.
- **Why deferred:** Plan 02's `<AdminOrgFilterChip>` is the primary affordance
  for showing/clearing the org filter and works correctly. Re-aligning the
  dropdown to accept either slug or UUID (and resolve to the matching
  option) would ripple through the Phase 20 filters component — out of
  scope for this wave per CONTEXT.md.
- **Severity:** Cosmetic. No data integrity issue; filter still works.
