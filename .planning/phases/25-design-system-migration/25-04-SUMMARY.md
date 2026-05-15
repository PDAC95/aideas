---
phase: 25-design-system-migration
plan: 04
subsystem: ui
tags: [tailwind, branding, color-tokens, code-orange, recharts, sweep]

# Dependency graph
requires:
  - phase: 25-design-system-migration
    provides: Factory --primary token (#ef6f2e Code Orange) from Plan 25-01 globals.css migration
  - phase: 25-design-system-migration
    provides: Reskinned Button/Card/Input primitives from Plan 25-02 so consumers compile against the new look
provides:
  - Zero purple-* / pink-* Tailwind utility class literals anywhere in web/src
  - Zero hardcoded purple/pink HEX values (#a855f7, #c084fc, #e9d5ff) in any web/src TSX/TS file
  - Zero bg-gradient-to-* utilities in web/src (the lone top-automation-card gradient eliminated)
  - All previously-purple brand surfaces (active tabs, focus rings, primary CTAs, top-automation callout, decorative pill badges, link colors) now render Code Orange via --primary token
  - Recharts Bar fills in reports-weekly-chart and weekly-bar-chart set to #ef6f2e inline (deferred ChartContainer migration documented for Phase 32)
affects: [25-05-marketing-surfaces, 25-07-uat-pass, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token-driven branding: utility classes reference --primary semantic token instead of color-scale literals — single-source-of-truth for brand color swaps"
    - "Tinted surfaces use bg-primary/{opacity} pattern (e.g., bg-primary/5, bg-primary/10, bg-primary/15) — preserves visual hierarchy across light + dark modes without dark: overrides"
    - "Active tab pill pattern: bg-primary/10 text-primary (light) doubles as dark:bg-primary/15 dark:text-primary — token identical in both modes per Plan 25-01"
    - "Recharts Bar fills use literal HEX inline (Pitfall 7) — SVG fills cannot read CSS vars without ChartContainer wrapper; deferred to Phase 32"
    - "Light/dark mode parity preserved at token level — no per-mode color tuning needed for brand swap"

key-files:
  created: []
  modified:
    - web/src/app/(admin)/admin/catalog/page.tsx
    - web/src/app/(dashboard)/dashboard/automations/page.tsx
    - web/src/app/(dashboard)/dashboard/billing/page.tsx
    - web/src/app/(dashboard)/dashboard/catalog/[slug]/catalog-request-button.tsx
    - web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx
    - web/src/app/(dashboard)/dashboard/page.tsx
    - web/src/app/(dashboard)/dashboard/reports/page.tsx
    - web/src/components/admin/admin-org-filter-chip.tsx
    - web/src/components/admin/automations/admin-automation-detail.tsx
    - web/src/components/admin/automations/admin-automations-filters.tsx
    - web/src/components/admin/automations/admin-automations-table.tsx
    - web/src/components/admin/automations/admin-automations-tabs.tsx
    - web/src/components/admin/catalog/admin-catalog-client.tsx
    - web/src/components/admin/catalog/admin-catalog-grid.tsx
    - web/src/components/admin/catalog/admin-catalog-table.tsx
    - web/src/components/admin/catalog/admin-template-form.tsx
    - web/src/components/admin/catalog/catalog-toggle-cell.tsx
    - web/src/components/admin/clients/admin-client-automations-tab.tsx
    - web/src/components/admin/clients/admin-client-detail.tsx
    - web/src/components/admin/clients/admin-client-note-create.tsx
    - web/src/components/admin/clients/admin-client-note-entry.tsx
    - web/src/components/admin/clients/admin-client-requests-tab.tsx
    - web/src/components/admin/clients/admin-client-tabs.tsx
    - web/src/components/admin/clients/admin-clients-search.tsx
    - web/src/components/admin/clients/admin-clients-table.tsx
    - web/src/components/admin/requests/admin-request-detail.tsx
    - web/src/components/admin/requests/admin-requests-table.tsx
    - web/src/components/admin/requests/admin-requests-tabs.tsx
    - web/src/components/admin/requests/reject-request-modal.tsx
    - web/src/components/dashboard/activity-feed.tsx
    - web/src/components/dashboard/automation-detail-header.tsx
    - web/src/components/dashboard/automation-list.tsx
    - web/src/components/dashboard/automation-success-rate.tsx
    - web/src/components/dashboard/automations-filter-tabs.tsx
    - web/src/components/dashboard/billing-summary-card.tsx
    - web/src/components/dashboard/catalog-card.tsx
    - web/src/components/dashboard/catalog-client.tsx
    - web/src/components/dashboard/dashboard-header.tsx
    - web/src/components/dashboard/kpi-cards.tsx
    - web/src/components/dashboard/language-switcher.tsx
    - web/src/components/dashboard/nav.tsx
    - web/src/components/dashboard/reports-breakdown-table.tsx
    - web/src/components/dashboard/reports-kpi-cards.tsx
    - web/src/components/dashboard/reports-period-selector.tsx
    - web/src/components/dashboard/reports-weekly-chart.tsx
    - web/src/components/dashboard/settings-preferences-card.tsx
    - web/src/components/dashboard/settings-profile-card.tsx
    - web/src/components/dashboard/top-automation-card.tsx
    - web/src/components/dashboard/user-menu.tsx
    - web/src/components/dashboard/weekly-bar-chart.tsx

key-decisions:
  - "Used Plan 25-04 mapping table verbatim for all class swaps — bg-purple-600 -> bg-primary, text-purple-700 -> text-primary, bg-purple-100 -> bg-primary/10, hover:bg-purple-700 -> hover:bg-primary/90, focus:ring-purple-500 -> focus:ring-primary, dark:text-purple-400 -> dark:text-primary"
  - "AppBadge decorative palette in automation-detail-header.tsx (deterministic hash-based chip color selector) collapsed purple-100 and pink-100 slots both to bg-primary/10 text-primary — preserved 6-slot array length for hash-determinism but lost 1 palette color; acceptable per plan's mechanical-rename rule and 'do not skip' directive"
  - "top-automation-card.tsx uses Open Question 3 default (solid bg-primary) — text-white swapped to text-primary-foreground and bg-white/20 chips swapped to bg-primary-foreground/20 so dark-mode parity works automatically without dark: overrides"
  - "Recharts Bar fills swapped to literal #ef6f2e (Code Orange) inline — deferred ChartContainer migration to Phase 32 per Plan 25-04 explicit non-goal; Pitfall 7 (Recharts SVG fills cannot read CSS vars) acknowledged"
  - "Tooltip inline border #e5e7eb (Tailwind gray-200) swapped to #d6d3d2 (Factory neutral-100 ~ --border token equivalent) — inline styles cannot read CSS vars in Recharts so literal HEX is the only path"
  - "Plan estimated ~56 files; actual was 48 files (within tolerance — research file inventory included some over-counts where multiple plans referenced same file)"

patterns-established:
  - "Pattern: When swapping brand color literals to tokens, use bg-primary/{opacity} for tinted surfaces rather than introducing new color stops — eliminates dark-mode override divergence"
  - "Pattern: text-white in branded-button contexts (bg-primary) should be text-primary-foreground for dark-mode-portable contrast"
  - "Pattern: Recharts SVG props (fill, stroke) get literal HEX in Phase 25 / token-driven migration in Phase 32 (when ChartContainer wrapping is added)"
  - "Anti-pattern: bg-gradient-to-* with brand colors fights the token system — solid bg-primary is the Factory call-out style (no gradient brand surfaces)"

requirements-completed: [DESIGN-01, DESIGN-03]

# Metrics
duration: 28 min
completed: 2026-05-15
---

# Phase 25 Plan 04: Brand Color Literal Sweep Summary

**Mechanical sweep of all `purple-*` and `pink-*` Tailwind utility literals plus hardcoded purple HEX values across 48 files — every previously-purple brand surface now renders Code Orange (#ef6f2e) via the `--primary` token. The lone gradient (top-automation-card) is replaced with solid `bg-primary text-primary-foreground` per Open Question 3 default, and 2 Recharts Bar fills receive one-line HEX swaps to maintain brand consistency until Phase 32 wraps them in `<ChartContainer>` for theme-aware token reading.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-05-15T13:17:22Z (after 25-03 commit)
- **Completed:** 2026-05-15T13:42:43Z
- **Tasks:** 2 (sweep + gradient/HEX swap)
- **Files modified:** 48 (47 in Task 1 commit + 3 in Task 2 commit; 2 overlap on reports-weekly-chart already in Task 1 commit; net 48 unique)

## Accomplishments

- **Zero brand-color leaks** in `web/src` — `grep -rn "purple-\|pink-" web/src --include="*.tsx" --include="*.ts"` returns 0 matches
- **Zero hardcoded purple HEX** — `grep -rn "#a855f7\|#c084fc\|#e9d5ff\|#e5e7eb" web/src --include="*.tsx" --include="*.ts"` returns 0 matches
- **Zero brand gradients** — `grep -rn "bg-gradient-to" web/src --include="*.tsx" --include="*.ts"` returns 0 matches
- Brand identity flip is live: active tabs, focus rings, primary CTAs, link colors, status pills, pricing-tier badges, popular badges, top-automation callout, KPI icon backgrounds, language-switcher highlight, period-selector active state, all-text-only-CTA hovers — every surface that was purple is now Code Orange
- `top-automation-card.tsx` gradient eliminated: solid `bg-primary text-primary-foreground` with chips using `bg-primary-foreground/20` for dark-mode portability
- 2 Recharts Bar fills (`reports-weekly-chart.tsx`, `weekly-bar-chart.tsx`) swapped to `fill="#ef6f2e"`; tooltip borders swapped from `#e5e7eb` (Tailwind gray-200) to `#d6d3d2` (Factory neutral-100)
- `npm run build` exits 0 — no TypeScript or compile errors from class renames
- `npm run lint` reports 103 errors — exactly the baseline established in Phase 24 (no new errors introduced)
- Light/dark mode parity preserved at the token level — `--primary` resolves to the same #ef6f2e in both modes per Plan 25-01

## Task Commits

Each task was committed atomically:

1. **Task 1: Sweep purple-/pink- literals across 45 files** — `fe48a3f` (refactor)
2. **Task 2: Drop top-automation-card gradient + swap Recharts HEX** — `61234cd` (refactor)

## Verification Results

```bash
# Task 1 + 2 success criteria
cd web && grep -rn "purple-\|pink-" src --include="*.tsx" --include="*.ts"
# -> ZERO matches

cd web && grep -rn "#a855f7\|#c084fc\|#e9d5ff\|#e5e7eb" src --include="*.tsx" --include="*.ts"
# -> ZERO matches

cd web && grep -rn "bg-gradient-to" src --include="*.tsx" --include="*.ts"
# -> ZERO matches

cd web && npm run build
# -> Compiled successfully in 8.4s; 27 routes generated; exit 0

cd web && npm run lint
# -> 103 errors, 1589 warnings (baseline unchanged from Phase 24)
```

## Mapping Table Applied

| Source literal | Target token expression |
| --- | --- |
| `bg-purple-50` | `bg-primary/5` |
| `bg-purple-100` | `bg-primary/10` |
| `bg-purple-600/700/800` | `bg-primary` |
| `bg-purple-900/40` | `bg-primary/15` |
| `hover:bg-purple-700` | `hover:bg-primary/90` |
| `hover:bg-purple-200` | `hover:bg-primary/15` |
| `hover:bg-purple-800/60` | `hover:bg-primary/25` |
| `text-purple-{300-900}` | `text-primary` |
| `dark:text-purple-{300,400}` | `dark:text-primary` |
| `border-purple-300` | `border-primary/40` |
| `border-purple-{500,600}` | `border-primary` |
| `focus:ring-purple-500` | `focus:ring-primary` |
| `focus:border-purple-500` | `focus:border-primary` |
| `ring-purple-300/30` | `ring-primary/25` (search input pattern) |
| `text-white` in bg-primary context | `text-primary-foreground` |
| `bg-white/20` in bg-primary context | `bg-primary-foreground/20` |
| `from-purple-300 to-pink-300` gradient | DROP — replace with solid `bg-primary` |
| `fill="#a855f7"` (Recharts SVG) | `fill="#ef6f2e"` |
| `border: "1px solid #e5e7eb"` (Recharts tooltip) | `border: "1px solid #d6d3d2"` |
| `bg-pink-100 text-pink-700` (AppBadge palette) | `bg-primary/10 text-primary` |

## Deviations from Plan

### Auto-fixed Issues

None — the sweep was purely mechanical and exhaustive per the mapping table. No bugs surfaced, no architectural decisions arose, no out-of-scope code was touched.

### Scope Clarifications

**1. [Scope] Plan said "~56 files"; actual was 48 unique files**

- **Found during:** Task 1, Step A enumeration
- **Discrepancy:** Research file inventory in 25-RESEARCH.md likely double-counted some files that appear in multiple plan references. The actual `grep -rln "purple-\|pink-"` returned 48 files, which is consistent with the spirit of the plan ("if the count is wildly off (e.g., 5 or 200), pause and reconcile"). 48 is not "wildly off" from 56.
- **Action:** Proceeded with sweep on all 48 files; no reconciliation needed.

**2. [Scope] Plan referenced 4 Recharts chart files; only 2 had hardcoded purple HEX**

- **Found during:** Task 2 verification grep
- **Discrepancy:** Plan named `reports-weekly-chart.tsx`, `weekly-bar-chart.tsx`, `automation-success-rate.tsx`, `automation-performance.tsx`. The latter 2 have no `fill=` or hardcoded HEX — they use Tailwind utility classes (swept in Task 1 via class swap, e.g., `text-purple-400 -> text-primary`).
- **Action:** Swapped the 2 chart files that actually had hardcoded HEX (`#a855f7`, `#e5e7eb`); no work needed on the other 2 since Task 1 already handled their utility-class purple references.

**3. [Pattern] AppBadge decorative palette collapse**

- **Found during:** Task 1, automation-detail-header.tsx review
- **Pattern detected:** A 6-slot deterministic-hash chip color palette (`["bg-purple-100 text-purple-700", "bg-blue-100 ...", "bg-emerald-100 ...", "bg-amber-100 ...", "bg-pink-100 text-pink-700", "bg-sky-100 ..."]`). Both purple and pink slots collapsed to `bg-primary/10 text-primary`, leaving 5 visually distinct colors in a 6-slot array.
- **Action:** Preserved 6-slot array length (so hash-modulo math still works); accepted slight palette degradation per plan's explicit "mechanical rename" directive. If this becomes a UX issue, Phase 32 can re-introduce a fully Factory-aligned chip palette.

## Open Items for Phase 25-07 (UAT)

- **Verify top-automation-card.tsx visual loudness** — Plan 25-04 Open Question 3 sets `bg-primary` as the default callout style. If UAT determines the solid orange card is too visually loud against the warm-gray dashboard backdrop, the documented fallback is `bg-card border-2 border-primary` (highlighted card pattern: neutral surface with Code Orange border accent and `text-foreground` content).
- **Light/dark mode visual review** — Confirm Code Orange contrast holds in dark mode for: active tabs, focus rings on form inputs, primary CTA buttons against `bg-card`, popular-badge pills inside catalog cards, and the top-automation callout text contrast.

## Open Items for Phase 32 (Customer Dashboard Reskin)

- **Recharts ChartContainer migration** — `reports-weekly-chart.tsx` and `weekly-bar-chart.tsx` currently use inline HEX (`fill="#ef6f2e"`). Phase 32 should:
  1. Wrap both `<BarChart>` instances in `<ChartContainer config={chartConfig}>` (the primitive scaffolded in Plan 25-03).
  2. Replace inline `fill="#ef6f2e"` with `fill="var(--color-count)"` where chartConfig defines `count: { color: "var(--chart-1)" }`.
  3. Replace inline tooltip `border: "1px solid #d6d3d2"` with `<ChartTooltipContent>` (which already reads `--border` via Tailwind classes).
  4. After migration, dark mode will automatically adjust chart colors via the `--chart-1..5` token cascade.
- **Why deferred:** Phase 25 scope is strictly token swap + primitive scaffold; ChartContainer integration is a structural refactor that risks animation/responsive regressions and belongs in the customer-dashboard reskin sweep (Phase 32).

## Self-Check: PASSED

- `grep -rn "purple-\|pink-" web/src --include="*.tsx" --include="*.ts"` -> 0 matches
- `grep -rn "#a855f7\|#c084fc\|#e9d5ff\|#e5e7eb" web/src --include="*.tsx" --include="*.ts"` -> 0 matches
- `grep -rn "bg-gradient-to" web/src --include="*.tsx" --include="*.ts"` -> 0 matches
- `git log --oneline | grep fe48a3f` -> FOUND
- `git log --oneline | grep 61234cd` -> FOUND
- `npm run build` -> exit 0
- `npm run lint` -> 103 errors (baseline unchanged from Phase 24)
- All 48 modified files exist on disk
