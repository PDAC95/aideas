# Phase 23: Client 360 Cross-Link Fix - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Make `?org=` deep-links from `/admin/clients/[id]` tabs functionally filter `/admin/requests` and `/admin/automations`. Currently the tabs emit `?org=<slug>` but:

- `/admin/requests/page.tsx` ignores `?org=` entirely (silent no-op)
- `/admin/automations/page.tsx` reads `?org=` and passes the slug as `organizationId` to `fetchAdminAutomations`, which expects a UUID — returns empty results (silent fail)

This phase closes that gap. Scope is the cross-link parsing, query plumbing, lookup, and the filter-chip UI affordance to make the active org-filter visible and clearable. No new pages, no schema changes, no new filter capabilities beyond `?org=`.

</domain>

<decisions>
## Implementation Decisions

### Identifier convention
- `?org=` accepts **slug-or-uuid** with auto-detection — if value matches UUID v4 regex, treat as UUID; otherwise treat as slug and resolve via lookup
- Emitter (`admin-client-requests-tab.tsx` and `admin-client-automations-tab.tsx`) keeps emitting **slug** with `encodeURIComponent` — defensive even though slugs are kebab-case ASCII
- Slug→UUID lookup lives **inside `fetchAdminRequests` and `fetchAdminAutomations`**, not in the page server components. Each query function accepts slug-or-uuid as a single param, does the lookup internally, and returns empty results if the org doesn't exist. Pages stay thin; callers don't worry about identifier type.
- Param length capped at ~100 chars before lookup (defensive — real slugs are < 60)
- Malformed values (neither valid UUID nor resolvable slug) follow the same path as "org not found" — empty results + error chip

### Filter chip UX
- **Chip pill** (shadcn/ui Badge style) sits **inline with existing filters** (same row as status/search), arrow-of-attention at top of the list table
- Label shows **organization name only** (e.g., "Acme Corp") — requires fetching the org name as part of the slug→UUID resolution, so no extra round trip
- Chip has a `✕` close affordance implemented as a plain `<Link>` to the same page **without** `?org=` (preserves other searchParams like `?status=` and `?search=`)
- When the org cannot be resolved, the chip still renders but with **error styling** (red/destructive variant) and label `"Organization not found: '<slug>'"` — explains why the empty state appears

### Query / filter combination
- `?org=` **AND**s with existing filters on both pages
  - `/admin/requests`: `?org=acme&status=pending` filters to Acme's pending requests
  - `/admin/automations`: `?org=acme&status=active&search=foo` ANDs all three
- Clearing the org chip only removes `?org=` — other filters in the URL are preserved
- Server-side pagination/sort (if any in the future) continues to work because the org filter becomes part of the base query, not an override

### Empty / invalid org handling
- **Valid org, zero rows:** Contextual empty state — "No requests found for Acme Corp" / "No automations found for Acme Corp" — and the active filter chip stays visible
- **Org not found (slug renamed, typo, malformed):** Same empty state + the chip switches to error styling with "Organization not found: '<value>'". No banner, no toast — chip carries the signal
- No 404, no redirect — keep the user on the page so they can clear the filter or fix it manually

### EN/ES i18n parity (cross-cutting)
- New strings required (both `en.json` and `es.json`):
  - Chip label prefix for the filter context (e.g., "Organization:" / "Organización:")
  - Error-chip label "Organization not found: {value}" / "Organización no encontrada: {value}"
  - Contextual empty state copy that includes the org name (interpolated)
- Reuse existing chip/close button strings if shadcn primitives provide them; otherwise add under `admin.requests.*` and `admin.automations.*` namespaces

### Claude's Discretion
- Exact i18n key naming under the existing `admin.*` namespace
- Whether to extract a shared `<OrgFilterChip>` component for reuse across both pages or inline it twice (decide based on the pages' existing filter-chip patterns — if there's already a reusable filter-chip component, extend it; if not, inline is fine for 2 callsites)
- Whether `resolveOrgIdentifier` is a private helper inside each query file or a tiny shared util in `lib/admin/` (planner decides based on duplication risk)
- Exact UUID-v4 regex / detection strategy (regex vs `crypto.randomUUID`-style parser)
- Whether to memoize the slug→UUID lookup within a single request (probably unnecessary — one lookup per page load)
- Tailwind/shadcn variant for the error chip (`destructive` vs custom)
- Responsive behavior of the chip on mobile (wrap, hide label, etc.)
- Whether to add telemetry/analytics on the cross-link traversal (out of scope unless trivial)

</decisions>

<specifics>
## Specific Ideas

- Tabs already emit `?org=${encodeURIComponent(orgSlug)}` — keep that emitter; do not switch to UUID emission (URLs stay shareable/readable)
- `fetchAdminAutomations` already accepts an `organizationId` param — extend its contract to accept slug-or-uuid rather than introducing a new param name
- `fetchAdminRequests` does not currently accept any org param — add the same slug-or-uuid param with consistent naming
- Identifier resolution is the central decision; everything else (chip, empty state, AND-combine) flows from "the query knows how to resolve slug-or-uuid and returns the resolved org name back to the page for chip rendering"
- Suggested return shape from the query: `{ rows, total, resolvedOrg: { id, name, slug } | null, orgIdentifierProvided: string | null }` — gives the page enough to render the chip without a second query
- Existing surfaces to update:
  - `web/src/components/admin/clients/admin-client-requests-tab.tsx` (emitter — verify only)
  - `web/src/components/admin/clients/admin-client-automations-tab.tsx` (emitter — verify only)
  - `web/src/app/(admin)/admin/requests/page.tsx` (parse `?org=`, pass to query, render chip)
  - `web/src/app/(admin)/admin/automations/page.tsx` (already parses `?org=` — fix slug handling, render chip)
  - `web/src/lib/admin/request-queries.ts` (`fetchAdminRequests` — accept slug-or-uuid, do lookup, return resolvedOrg)
  - `web/src/lib/admin/automation-queries.ts` (`fetchAdminAutomations` — same)
  - `web/messages/en.json` + `web/messages/es.json` (chip + empty state strings)

</specifics>

<deferred>
## Deferred Ideas

- Telemetry/analytics on cross-link traversal usage — separate observability phase
- Persisting the org filter as a sticky UI preference across navigation — not requested
- Multi-org filtering (`?org=acme,beta`) — out of scope
- Renaming `organizationId` query param to something more accurate now that it accepts slug — cosmetic, deferred
- Extracting a generic `<FilterChip>` for reuse with status/search filters — refactor opportunity but not required for gap closure

</deferred>

---

*Phase: 23-client-360-crosslink-fix*
*Context gathered: 2026-05-13*
