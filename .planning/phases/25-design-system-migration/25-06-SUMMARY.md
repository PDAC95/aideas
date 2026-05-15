---
phase: 25-design-system-migration
plan: 06
subsystem: ui
tags: [tailwind, design-tokens, shadcn, sidebar, layout-shell, factory-reskin]

# Dependency graph
requires:
  - phase: 25-design-system-migration
    provides: "Plan 25-01 sidebar token group (--sidebar-*) + Plan 25-04 purple/pink sweep"
  - phase: 25-design-system-migration
    provides: "Plan 25-05 auth shells reskinned (admin-login dark-base HEX precedent)"
provides:
  - "Customer dashboard shell (nav.tsx + dashboard-header.tsx) consumes Factory sidebar tokens — bg-sidebar / text-sidebar-foreground / border-sidebar-border across mobile and desktop"
  - "Admin shell (admin/layout.tsx + admin-sidebar.tsx + admin-header.tsx) unified with customer shell — same bg-background page, same sidebar token group"
  - "ADMIN badge visual distinction preserved as Code Orange (bg-primary text-primary-foreground) — RESKIN-06 token consumption verified, full <Badge> refactor deferred to Phase 33"
  - "Page background unified across customer + admin (bg-background → #eeeeee light / #020202 dark)"
affects: [25-07, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cross-cutting layout shells consume the --sidebar-* token group (Plan 25-01) — customer + admin sidebars share the same warm-gray surface in light mode and the same near-black surface in dark mode"
    - "Layout shell separators use border-b border-border instead of shadow-sm (Factory 'no decorative shadow' rule extended from primitives to shells)"
    - "ADMIN badge consumes bg-primary directly (inline className) — not yet refactored to <Badge variant=\"default\"> (Phase 33 scope)"

key-files:
  created: []
  modified:
    - "web/src/components/dashboard/nav.tsx — mobile header + mobile drawer + mobile dropdown + desktop floating sidebar + bottom utility bar all on sidebar tokens"
    - "web/src/components/dashboard/dashboard-header.tsx — bg-card + border-b border-border; gray literals swapped to muted/foreground; shadow-sm dropped"
    - "web/src/app/(admin)/admin/layout.tsx — bg-gray-100 dark:bg-gray-950 → bg-background"
    - "web/src/components/admin/admin-sidebar.tsx — bg-gray-900 + orange-500 active state → bg-sidebar + bg-primary/10 active; ADMIN badge → bg-primary"
    - "web/src/components/admin/admin-header.tsx — bg-orange-500 ADMIN badge → bg-primary; gray subtitle → text-muted-foreground; added border-b + bg-card"

key-decisions:
  - "Admin sidebar reskinned to LIGHT bg-sidebar surface (same as customer dashboard) instead of preserving the dark gray-900 admin-distinct surface — visual distinction is now carried entirely by the Code Orange ADMIN badge (per CONTEXT.md unified token system goal); admin-login page retains its dark-base HEX (Plan 25-05) as the deliberate boundary between admin-auth and admin-shell surfaces"
  - "ADMIN badge swapped from bg-orange-500 (Tailwind literal) to bg-primary text-primary-foreground (Factory token) in BOTH admin-sidebar.tsx and admin-header.tsx — both visual instances now reflect the v1.3 Code Orange (#ef6f2e) and will auto-update if --primary ever changes; refactor to <Badge variant=\"default\"> deferred to Phase 33"
  - "Removed 'brightness-0 invert' utility from admin-sidebar logo image — that hack inverted the dark-mode logo against the previous gray-900 background; against the new bg-sidebar (#fafafa light / #101010 dark) the logo renders correctly in both modes without inversion"
  - "Rounded radius normalized to rounded-sm (4px) for hover targets and pills, rounded-md (6px) for the floating sidebar container — matches Plan 25-02 button/input/card primitive split; abandoned rounded-lg / rounded-xl / rounded-2xl Tailwind defaults from the pre-Factory era"
  - "dashboard-header.tsx now ships border-b border-border + bg-card — was previously a transparent header floating over the page bg; the border gives the shell a clean separator that does not rely on shadow-sm (matching Factory's flat aesthetic)"
  - "No language switcher or dark-mode toggle added to admin-header.tsx — explicitly deferred to Phase 33 per CONTEXT.md 'Deferred Ideas' even though the customer header has both; scope-locked"

patterns-established:
  - "Token-driven layout shells: every page background, sidebar surface, header surface, and separator border in both dashboards resolves through the Factory token CSS variables — never through Tailwind gray/white literals"
  - "Single token group for both sidebars: bg-sidebar / text-sidebar-foreground / border-sidebar-border / bg-sidebar-accent / bg-sidebar-primary applied identically across customer DashboardNav and admin AdminSidebar"
  - "ADMIN visual distinction via brand color, not surface color: badge is bg-primary (Code Orange), surface is the same neutral sidebar token shared with customer dashboard"

requirements-completed: [DESIGN-03, DESIGN-04]

# Metrics
duration: 6m 14s
completed: 2026-05-15
---

# Phase 25 Plan 06: Cross-Cutting Layout Shells Summary

**Customer + admin dashboard shells migrated to the Factory sidebar token group with the ADMIN badge preserved as Code Orange via bg-primary — page background unified across both dashboards at bg-background.**

## Performance

- **Duration:** 6m 14s
- **Started:** 2026-05-15T13:47:42Z
- **Completed:** 2026-05-15T13:53:56Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Customer dashboard sidebar (mobile + desktop) consumes bg-sidebar / text-sidebar-foreground / border-sidebar-border across all 5 distinct surfaces (mobile header bar, mobile dropdown, mobile sidebar drawer, desktop floating sidebar, desktop bottom utility bar).
- Customer dashboard header drops shadow-sm and gains border-b border-border on a bg-card surface — separator now lives in the border, not a decorative shadow.
- Admin layout page background swapped from `bg-gray-100 dark:bg-gray-950` literal to `bg-background` — both dashboards now share the same #eeeeee light / #020202 dark page surface.
- Admin sidebar reskinned to share the customer sidebar's token group exactly; previous gray-900 + orange-500-accent treatment retired. Active nav items now use bg-primary/10 + text-primary (same as customer).
- ADMIN badge (in admin-sidebar.tsx mobile bar + AdminSidebar header + admin-header.tsx) standardized on `bg-primary text-primary-foreground` — Code Orange brand distinction preserved while consuming Factory tokens.
- Removed obsolete `brightness-0 invert` logo utility from admin-sidebar — no longer needed against the light bg-sidebar surface.

## Task Commits

Each task was committed atomically:

1. **Task 1: Reskin customer dashboard shell (nav.tsx + dashboard-header.tsx) to sidebar tokens** — `ae19fb1` (feat)
2. **Task 2: Reskin admin shell (admin/layout.tsx + admin-sidebar.tsx + admin-header.tsx) — preserve ADMIN badge** — `361d39d` (feat)

**Plan metadata:** _pending — final commit captures SUMMARY.md + STATE.md + ROADMAP.md updates_

## Files Created/Modified

- `web/src/components/dashboard/nav.tsx` — Customer dashboard navigation shell (mobile + desktop) reskinned to sidebar tokens; 12 occurrences of bg-sidebar / text-sidebar-foreground / border-sidebar-border across the 5 inner surfaces
- `web/src/components/dashboard/dashboard-header.tsx` — Customer dashboard top header reskinned to bg-card + border-b border-border; search input + notification pill + create-agent button rewired to muted/foreground tokens
- `web/src/app/(admin)/admin/layout.tsx` — Admin shell root div migrated from `bg-gray-100 dark:bg-gray-950` to `bg-background` (single source of truth for page bg)
- `web/src/components/admin/admin-sidebar.tsx` — Admin sidebar (mobile bar + mobile drawer + desktop fixed sidebar) reskinned to sidebar tokens; ADMIN badge `bg-orange-500` → `bg-primary text-primary-foreground`; logo inversion utility removed
- `web/src/components/admin/admin-header.tsx` — Admin header gained `border-b border-border bg-card`; ADMIN badge token-fied; subtitle color migrated to text-muted-foreground

## Decisions Made

- **Admin sidebar surface unified with customer (rather than preserving dark gray-900 distinction):** RESKIN-06 visual distinction is now carried entirely by the Code Orange ADMIN badge against a shared neutral sidebar surface. This is the explicit CONTEXT.md goal for v1.3 (one design system, brand-distinguished via accent colors).
- **ADMIN badge consumes `bg-primary` directly via className (not `<Badge variant="default">`):** Faster surgical fix; the inline pattern still resolves through the same token. Refactor to the primitive is Phase 33 scope and would require touching ~3 badge call-sites simultaneously.
- **Radius normalized to rounded-sm (4px) for pills/hover targets and rounded-md (6px) for the floating customer sidebar container:** Matches Plan 25-02's button/card primitive radius split. The pre-Factory rounded-2xl / rounded-xl / rounded-lg defaults were inconsistent with the rest of the design system.
- **Customer dashboard header gained a hard `border-b border-border` + `bg-card` shell:** Previous treatment was a transparent header floating over the page bg with no separator — the shadow-sm crutch was removed everywhere else, so the header needs its own structural separator.
- **No language switcher or dark-mode toggle added to admin-header.tsx:** Explicitly deferred to Phase 33 per CONTEXT.md "Deferred Ideas." Scope-locked even though the gap is visible. This UAT will surface the gap; Phase 33 closes it.

## Deviations from Plan

None - plan executed exactly as written. The plan's verification grep (`! grep -E "bg-gray-|bg-white|border-gray-|shadow-"`) passes cleanly on all 5 files. The orange Tailwind literals (`bg-orange-500`, `text-orange-300`) inside admin-sidebar.tsx and admin-header.tsx — which were NOT called out in the plan's verify step but ARE token-leak risks — were also swept proactively to `bg-primary` to satisfy the must_haves contract ("ADMIN badge ... still renders Code Orange (bg-primary)").

## Issues Encountered

None. Both tasks compiled cleanly on first attempt; `npm run build` exited 0 after each task; `npm run lint` shows the established 103 pre-existing errors baseline (unchanged from Plan 25-04). The one nav.tsx warning (`'user' is defined but never used`) is pre-existing in the prop destructure since Phase 8/11 and was not introduced by this plan.

## Next Phase Readiness

**Ready for Plan 25-07 (UAT).** All cross-cutting shells are clean:
- Customer `/dashboard/*` routes inherit a token-driven shell (sidebar + header + page bg).
- Admin `/admin/*` routes inherit the same token-driven shell pattern with the Code Orange ADMIN badge as the only visual distinguisher.

UAT can now focus on per-route surface checks rather than re-evaluating layout chrome on every screen. Composed components inside the shells (KpiCards, ActivityFeed, AutomationList, admin tables, settings cards, billing cards, request modals) may still show shadow-sm or bg-white literals — those are Phase 32/33 scope and should NOT block 25-07 UAT unless they break readability.

**Theme toggle status:** The customer dashboard theme toggle wiring was NOT modified by this plan; it should continue to work because everything we touched is token-based and resolves through the `.dark` class on `<html>`. Plan 25-07 should explicitly verify the toggle still flips both shells to the dark Factory palette (bg-sidebar #101010, bg-background #020202).

**Admin language switcher + dark-mode toggle:** Still missing from admin-header.tsx. Continues to be Phase 33 scope. Phase 17 carried this gap forward; v1.3 closes it in Phase 33.

## Self-Check: PASSED

- `web/src/components/dashboard/nav.tsx` — FOUND (12 bg-sidebar/text-sidebar-foreground/border-sidebar-border occurrences; 0 bg-gray-* / bg-white / border-gray-* / shadow-* matches)
- `web/src/components/dashboard/dashboard-header.tsx` — FOUND (3 bg-card/border-border occurrences; 0 gray/white/shadow matches)
- `web/src/app/(admin)/admin/layout.tsx` — FOUND (1 bg-background match; 0 gray/white/shadow matches)
- `web/src/components/admin/admin-sidebar.tsx` — FOUND (5 bg-sidebar/text-sidebar-foreground occurrences; 0 gray/white/orange-*/shadow matches)
- `web/src/components/admin/admin-header.tsx` — FOUND (1 bg-primary on ADMIN badge; 0 gray/white/orange-*/shadow matches)
- Commit `ae19fb1` — FOUND in `git log --oneline`
- Commit `361d39d` — FOUND in `git log --oneline`
- `cd web && npm run build` — exit 0
- `cd web && npm run lint` — exit 1 (103 pre-existing errors, baseline unchanged from Plan 25-04)

---
*Phase: 25-design-system-migration*
*Completed: 2026-05-15*
