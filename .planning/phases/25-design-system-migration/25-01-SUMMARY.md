---
phase: 25-design-system-migration
plan: 01
subsystem: ui
tags: [tailwind-v4, design-tokens, factory-ai, geist, theming, dark-mode]

# Dependency graph
requires:
  - phase: 22-design-system
    provides: OKLCH shadcn token system (replaced by this plan)
provides:
  - Factory.ai light + dark token palette in web/src/app/globals.css (HEX values, warm-gray neutrals + Code Orange #ef6f2e accent)
  - Radius scale absolute values (--radius-sm 4px buttons, --radius-md 6px cards, --radius-lg 8px modals)
  - Geist character variants cv02/03/04/11 enabled globally via font-feature-settings
  - Stable token NAMES (--primary, --background, --card, etc.) for shadcn consumers — no utility churn
affects: [25-02-primitives-reskin, 25-03-brand-color-literals-swap, 25-04-auth-pages-reskin, 25-05-charts-data-viz, 25-06-marketing-surfaces, 25-07-uat-pass, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Light-first dual palette (:root light, .dark inversion) with @custom-variant dark wiring"
    - "@theme inline mapping --color-* → semantic CSS vars (Tailwind v4 token-to-utility bridge)"
    - "HEX values throughout (no OKLCH) for cross-tool color consistency with Factory.ai source"
    - "Geist font-feature-settings cv02/03/04/11 applied to body (zero-cost typography upgrade matching Factory)"

key-files:
  created: []
  modified:
    - web/src/app/globals.css

key-decisions:
  - "Big-bang OKLCH → HEX swap (no parallel layer) per 25-RESEARCH.md recommendation — token NAMES preserved so consumers keep compiling"
  - "Default theme is light always (no prefers-color-scheme honor) per 25-RESEARCH.md Open Question 5"
  - "outline-ring/50 global selector kept as-is — UAT will verify contrast in 25-07 per 25-RESEARCH.md Pitfall 5"
  - "Radius scale moved from calc(var(--radius) ± Npx) to absolute rem values matching Factory's button=4px / card=6px / modal=8px split"
  - "layout.tsx Geist wiring verified intact — no modification needed (geistSans.variable + geistMono.variable already on body className)"

patterns-established:
  - "Factory token contract: --primary=#ef6f2e (Code Orange) is the single accent across light + dark, no purple/pink anywhere in palette"
  - "Token reuse for borders: --border = --secondary = --muted = #d6d3d2 (Factory neutral-100) — replaces shadow-heavy separation with flat warm-gray borders"

requirements-completed: [DESIGN-01, DESIGN-02, DESIGN-05]

# Metrics
duration: 2 min
completed: 2026-05-15
---

# Phase 25 Plan 01: Factory.ai Token Migration Summary

**Big-bang OKLCH-to-HEX swap of web/src/app/globals.css to Factory.ai light-first palette (warm-gray neutrals + #ef6f2e Code Orange accent) with Geist character variants cv02/03/04/11 enabled on body.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-15T12:56:28Z
- **Completed:** 2026-05-15T12:58:21Z
- **Tasks:** 2 (1 rewrite + 1 verify)
- **Files modified:** 1 (web/src/app/globals.css)

## Accomplishments

- Replaced all OKLCH function calls in :root and .dark with Factory HEX values (0 oklch( strings remain)
- Light palette shipped: #eeeeee bg / #1f1d1c fg / #fafafa cards / #ef6f2e primary / #d6d3d2 borders / warm-gray muted-fg #5c5855
- Dark palette shipped: #020202 bg / #d6d3d2 fg / #101010 cards / #ef6f2e primary unchanged / #3d3a39 borders / #a49d9a muted-fg
- Chart palette switched to orange + warm-neutral progression (--chart-1 #ef6f2e through --chart-5 #ee6018)
- Sidebar palette aligned to Factory surfaces (--sidebar #fafafa light / #101010 dark)
- Radius scale converted to absolute rem values (--radius-sm 0.25rem, --radius-md 0.375rem, --radius-lg 0.5rem, --radius-xl 0.75rem, --radius-2xl 1rem)
- Geist character variants `cv02`, `cv03`, `cv04`, `cv11` applied via `font-feature-settings` on body
- layout.tsx Geist wiring verified intact — both `--font-geist-sans` and `--font-geist-mono` exposed on body className (no modification needed)
- `npm run build` exits 0 (27/27 static pages generated, no Tailwind errors, no TypeScript errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite globals.css with Factory tokens** — `c995ec8` (feat)
2. **Task 2: Verify Geist font wiring in layout.tsx** — no commit (read-only verification, file unchanged per plan instruction)

**Plan metadata:** `7136e6a` (docs: complete factory token migration plan)

## Files Created/Modified

- `web/src/app/globals.css` — Rewrote :root, .dark, @theme inline blocks; preserved @import + @custom-variant + @layer base structure; added font-feature-settings on body. Net: +108 / -99 lines (134 total).

## Decisions Made

- **OKLCH → HEX big-bang swap.** No parallel `*-factory` namespace; token names preserved (--primary, --card, --border, etc.). Rationale: 25-RESEARCH.md flagged parallel layer as Pitfall 1 (consumer drift). Tradeoff: any consumer hardcoding OKLCH values directly would break — but a grep shows no such cases exist (all consumers use Tailwind utilities bound to semantic tokens).
- **Light-first default.** No prefers-color-scheme honor in :root. Rationale: 25-RESEARCH.md Open Question 5 — public funnel pages (Phase 28-31) need stable light surfaces for marketing/lead gen; dark mode opt-in via .dark class only.
- **Absolute radius rem values.** Replaced calc(var(--radius) ± Npx) chain with literal --radius-sm 0.25rem etc. Rationale: Factory's button/card/modal radius split is intentional (4/6/8px), not derivative of a single base.
- **Geist font-feature-settings on body.** Zero-cost typography upgrade matching Factory exactly. Rationale: 25-RESEARCH.md Open Question 4 — cv02/03/04/11 toggle alternate glyph forms (single-story 'a', tabular figures, etc.) for editorial polish without changing the font family.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Tokens are live.** Downstream Phase 25 plans (02 primitives reskin, 03 brand-color literal swaps, 04 auth pages, 05 charts, 06 marketing surfaces, 07 UAT) can immediately consume:
  - `bg-primary` → Code Orange #ef6f2e
  - `bg-card` → #fafafa light / #101010 dark
  - `text-foreground` → #1f1d1c light / #d6d3d2 dark
  - `text-muted-foreground` → #5c5855 light / #a49d9a dark
  - `border-border` → #d6d3d2 light / #3d3a39 dark
  - `--chart-1..5` for Recharts data viz
  - `--sidebar*` for nav surfaces
- **Visual smoke-check deferred to 25-07 UAT pass.** Build verification confirmed Tailwind v4 accepts the new @theme block; runtime visual confirmation (page bg actually light gray, accent actually orange) is covered by the dedicated UAT plan rather than blocking this foundation plan.
- **No blockers for Wave 2** (Plans 02-06 can begin in any order they were planned).

## Self-Check: PASSED

- `web/src/app/globals.css` — exists on disk
- `.planning/phases/25-design-system-migration/25-01-SUMMARY.md` — exists on disk
- Commit `c995ec8` (feat(25-01)) — present in `git log`

---
*Phase: 25-design-system-migration*
*Completed: 2026-05-15*
