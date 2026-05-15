---
phase: 25-design-system-migration
plan: 02
subsystem: ui
tags: [shadcn, tailwind-v4, design-tokens, factory-ai, primitives, cva]

# Dependency graph
requires:
  - phase: 25-design-system-migration
    provides: Factory token palette (Code Orange #ef6f2e, warm-gray neutrals, --radius-sm/md/lg) and Geist character variants in globals.css (Plan 25-01)
provides:
  - shadcn primitives (button, card, input) reskinned to consume Factory tokens via semantic utilities (bg-primary, border-border, ring-ring)
  - Button radius locked to rounded-sm (4px) across base + size variants
  - Card border discipline enforced (border border-border) — mitigates Pitfall 1 (white-card-on-white-bg) so consumers can drop shadow-sm without losing card visibility
  - Input focus ring on --ring token (Code Orange) — matches button focus contract
  - Zero shadow utilities across all 5 primitives — Factory no-shadow rule baked in
  - form.tsx + label.tsx verified token-clean (no hardcoded text-red-*/text-gray-* literals)
affects: [25-03-brand-color-literals-swap, 25-04-auth-pages-reskin, 25-05-charts-data-viz, 25-06-marketing-surfaces, 25-07-uat-pass, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CVA variant edits ONLY (no API changes) — 60+ consumers across the app pick up Factory styling without import changes"
    - "Card border-discipline pattern: every Card root MUST include border border-border (research Pitfall 1 mitigation, encoded at the primitive level so consumers cannot regress)"
    - "Focus ring shortcut documented in code (button.tsx comment): keeping ring (box-shadow) over Factory's outline-only rule — accessibility shortcut, deliberate divergence (Pitfall 5)"
    - "Button + input share rounded-sm (4px) for visual rhythm; cards use rounded-md (6px) per Factory radius scale split"

key-files:
  created: []
  modified:
    - web/src/components/ui/button.tsx
    - web/src/components/ui/card.tsx
    - web/src/components/ui/input.tsx

key-decisions:
  - "Kept focus-visible:ring (box-shadow) over Factory's outline-2px rule — documented divergence in button.tsx code comment (research Pitfall 5: accessibility shortcut justified)"
  - "Bumped size variants (xs/sm/lg/icon-xs) from rounded-md to rounded-sm so all button sizes share the 4px radius (visual consistency over preserving original size-variant radii)"
  - "Input switched to rounded-sm to match buttons at 4px (plan said 'inputs match buttons at 4px') — consistent 4px form-element rhythm"
  - "Card padding: gap-6 py-6 → gap-4 p-6 per plan target structure — full p-6 on root is redundant with sub-components' px-6 but matches plan spec exactly and is harmless (same value)"
  - "form.tsx + label.tsx left UNCHANGED — defensive review confirmed they already consume --destructive/--foreground via tokens (no hardcoded literals to swap)"

patterns-established:
  - "Primitive reskin via CVA class swap only: preserve exported API (Button, buttonVariants, Card, CardHeader, ...) so consumers compile unchanged — propagates new look across 60+ call sites for free"
  - "No-shadow rule across all UI primitives: cards rely on border + bg-contrast, buttons on color + radius, inputs on border + focus ring"

requirements-completed: [DESIGN-03, DESIGN-04]

# Metrics
duration: 4 min
completed: 2026-05-15
---

# Phase 25 Plan 02: Primitives Reskin Summary

**shadcn button + card + input reskinned to Factory tokens (rounded-sm/rounded-md, no shadows, Code Orange focus ring); form.tsx + label.tsx verified already token-clean — 5 primitives delivered with zero API changes.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-15T13:06:35Z
- **Completed:** 2026-05-15T13:10:59Z
- **Tasks:** 3
- **Files modified:** 3 (button.tsx, card.tsx, input.tsx)
- **Files verified clean (no edit):** 2 (form.tsx, label.tsx)

## Accomplishments
- Button radius migrated md→sm (4px) across base + all 4 rounded-* size variants; outline variant lost shadow-xs and now uses border-border + bg-accent/10 hover (Code Orange tint)
- Card root now ships border border-border + rounded-md + no shadow — Pitfall 1 (white-card-on-white-bg) mitigated at the primitive level so #fafafa card stays visible on #eeeeee page bg
- Card padding tightened: gap-6 py-6 → gap-4 p-6 (matches Factory's denser card rhythm)
- Input focus ring rewired to ring-2 ring-ring ring-offset-2 — consumes --ring (Code Orange) instead of border-ring + ring-ring/50; shadow-xs dropped; rounded-md → rounded-sm to align with buttons
- form.tsx FormMessage/FormLabel verified consuming text-destructive + data-[error=true]:text-destructive (token-driven, no swap needed)
- label.tsx verified inheriting text-foreground from body (no override, no swap needed)
- Build (`npm run build`) exits 0 — all routes compile (auth, dashboard, admin)
- Lint clean for the 5 primitives (`npx eslint` on the touched files returns zero issues)

## Task Commits

Each task was committed atomically:

1. **Task 1: Reskin button.tsx to Factory tokens** — `c1d0e24` (feat)
2. **Task 2: Reskin card.tsx with border + rounded-md + no shadow** — `026c5f1` (feat)
3. **Task 3: Reskin input.tsx + verify form.tsx + label.tsx** — `ab246de` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified

- `web/src/components/ui/button.tsx` — Base radius rounded-md→rounded-sm; size variants rounded-md→rounded-sm (xs/sm/lg/icon-xs); focus ring border-ring+ring-ring/50+ring-[3px] → ring-2+ring-ring+ring-offset-2; outline variant lost shadow-xs and gained hover:bg-accent/10; ghost variant hover changed to bg-accent/10; documentation comment added for Pitfall 5 divergence
- `web/src/components/ui/card.tsx` — Card root: dropped shadow-sm; rounded-xl→rounded-md; explicit border border-border added; gap-6 py-6 → gap-4 p-6 (sub-components CardHeader/CardContent/CardFooter unchanged, still ship px-6 internally)
- `web/src/components/ui/input.tsx` — Dropped shadow-xs; rounded-md→rounded-sm; focus ring border-ring+ring-ring/50+ring-[3px] → ring-2+ring-ring+ring-offset-2; preserved border-input, aria-invalid pattern, dark:bg-input/30

**Verified clean (no edits required):**
- `web/src/components/ui/form.tsx` — Already token-clean (text-destructive, text-muted-foreground, data-[error=true]:text-destructive)
- `web/src/components/ui/label.tsx` — Already token-clean (no text-color overrides; inherits text-foreground from body)

## Decisions Made

- **Kept ring (box-shadow) for focus-visible across button + input** — Factory's pure outline-2px rule would be visually consistent but tab order accessibility is better served by box-shadow ring with offset; documented in button.tsx code comment as deliberate Pitfall 5 divergence
- **Bumped all rounded-* size variants** (button xs/sm/lg/icon-xs) from rounded-md to rounded-sm so every button size shares the 4px radius — original behavior had base rounded-md with size variants overriding; new behavior consolidates to single radius scale per primitive
- **Input radius matches buttons at 4px** (rounded-sm) per plan's explicit phrasing "inputs match buttons at 4px" — creates consistent 4px form-element rhythm between input fields and their submit buttons
- **Card root padding p-6 (full)** per plan target structure, even though CardHeader/CardContent/CardFooter sub-components still ship internal px-6 — value matches so no visual regression, and changing sub-components is out of scope for this plan
- **form.tsx + label.tsx left untouched** — defensive review confirmed they're already token-driven; editing them just for completeness would introduce noise without benefit

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Re-applied input.tsx edit after silent revert**
- **Found during:** Task 3 (Input reskin)
- **Issue:** After first Edit on input.tsx and successful grep verification, running `npm run lint` triggered a system-reminder showing the file had reverted to its original state (rounded-md, shadow-xs, old focus ring). Likely a Tailwind/Prettier autoformat hook fired between the Edit call and the lint run.
- **Fix:** Re-applied the same Edit, re-verified with grep, re-ran build (exit 0)
- **Files modified:** web/src/components/ui/input.tsx
- **Verification:** Grep confirms rounded-sm + focus-visible:ring-2 ring-ring ring-offset-2 + no shadow-* present; npm run build exits 0
- **Committed in:** ab246de (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. The revert appears to be an editor-side artifact; the final committed state matches the plan specification exactly.

## Issues Encountered

- **Lint baseline note (not a deviation):** `npm run lint` reports 1692 problems (103 errors, 1589 warnings) repo-wide. All pre-existing per Phase 24-01 SUMMARY (verified Phase 24 documented and accepted these 103 errors as known open items). Targeted `npx eslint` on the 5 primitives touched in this plan returns zero issues — no new lint debt introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Plan 25-03 (brand-color literals swap) is unblocked.** Primitive tokens are live. Composed components that import these primitives (Button, Card, Input from `@/components/ui/*`) will pick up the new Factory look automatically without code changes — Plan 25-03 only needs to hunt for files with hardcoded purple-* / pink-* literals (or other off-token brand colors) and swap them to semantic utilities.
- **Card consumers no longer need `shadow-sm`** — border is now baked in. Plan 25-04+ should drop any leftover `shadow-sm` overrides on Card instances across auth pages and dashboards.
- **Focus rings are Code Orange everywhere buttons/inputs render.** UAT in Plan 25-07 should confirm visual on /login, /signup, /dashboard form fields.

## Self-Check: PASSED

- FOUND: web/src/components/ui/button.tsx
- FOUND: web/src/components/ui/card.tsx
- FOUND: web/src/components/ui/input.tsx
- FOUND: commit c1d0e24 (Task 1)
- FOUND: commit 026c5f1 (Task 2)
- FOUND: commit ab246de (Task 3)
- FOUND: .planning/phases/25-design-system-migration/25-02-SUMMARY.md

---
*Phase: 25-design-system-migration*
*Completed: 2026-05-15*
