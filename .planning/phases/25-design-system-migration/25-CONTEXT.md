# Phase 25: Design System Migration - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the existing OKLCH dark-first theme in `web/src/app/globals.css` with the Factory.ai light-mode design system so every existing screen (customer dashboard, admin dashboard, auth pages) consumes the new palette, typography, and radius scale without breaking layout, contrast, or i18n.

This phase delivers tokens + shadcn primitive updates. It is the **visual foundation** for the rest of v1.3 — Phase 28 (Landing), Phase 32 (Reskin Customer), Phase 33 (Reskin Admin) all assume the new tokens already live in the codebase.

Scope is intentionally focused: tokens + primitives. Full surface reskins live in Phases 32/33. However, the UAT bar in this phase is high enough that some surface-level fixes will be absorbed here (see `Definition of done` below).

</domain>

<decisions>
## Implementation Decisions

### Visual reference (locked)
- **Source of truth:** `factory.ai` live site is the visual reference. Research/plan agents must inspect the live site for typography, spacing, hover states, micro-interactions, and any detail not spelled out in the roadmap.
- **Fidelity target:** Pixel-perfect to `factory.ai` look-and-feel for shared primitives (buttons, cards, inputs, forms, tabs, badges). AIDEAS is a customer SaaS portal, not a marketing site, but the visual system must feel identical to a user landing on factory.ai.
- **Conflict resolution between `factory.ai` and roadmap tokens:** Claude's Discretion — evaluate case-by-case during plan. Roadmap tokens (`#eeeeee`, `#fafafa`, `#ef6f2e`, Geist, radii 4/6/0) are the starting contract; factory.ai is the visual ground-truth for everything else.

### Definition of done (locked)
- **Verification method:** Manual UAT by the developer across every existing screen.
- **UAT scope:** Customer dashboard (7 sections), admin dashboard (5 sections + layout), auth pages (login/signup/verify-email/etc.). All ~40 screens must pass visual inspection.
- **What "done" means in UAT:** If a screen is visually broken (overflow, bad contrast, broken layout) — fix it inside Phase 25. The phase does not ship until every existing screen renders acceptably under the new tokens.
- **UAT matrix:** Claude's Discretion — plan should propose a manageable matrix (likely `EN×ES × light × mobile+desktop` for Phase 25, with full dark validation deferred to where toggles exist). Justify the trade-off in the plan.

### Migration strategy
- **OKLCH → Factory token swap mechanics:** Claude's Discretion — research/plan agents decide between big-bang `globals.css` replacement vs parallel-layer migration based on risk assessment of touching live primitives.
- **Hardcoded Tailwind classes** (`bg-zinc-900`, `text-white`, `border-gray-200`, etc.): Claude's Discretion — evaluate per-case during plan. Convert to semantic tokens when it removes risk; leave alone when it would balloon scope.
- **Phase 25 scope vs Phase 32/33 reskin scope:** Claude's Discretion — plan must draw the line clearly. Default expectation: 25 touches tokens + primitives + auth pages; 32/33 touch composed components. The UAT-blocking rule means 25 may overflow into composed components when needed to ship an acceptable build.
- **Interim quality bar for screens awaiting reskin (Phase 32/33):** Claude's Discretion — plan should define what "acceptable but not polished" means and how to triage between fix-now vs defer-to-32/33.

### Dark-mode handling
- **Dark-mode quality bar:** Claude's Discretion — choose between simple inversion of light tokens (cheap, `usable but degraded`) and a custom dark palette (expensive, polished). Roadmap criterion #4 only requires `.dark` produce a usable variant for shadcn primitives, so the floor is low; the ceiling is a plan-time call.
- **Accent in dark mode:** Claude's Discretion — same `#ef6f2e` or adjusted variant. Validate visually against the Factory.ai dark mode (if it has one) and against AA contrast.
- **Where dark gets validated in Phase 25:** Claude's Discretion — customer dashboard has a toggle, admin doesn't (Phase 33 will add it). Plan should pick the smallest set of surfaces that confirms `.dark` works without blocking on Phase 33.
- **Default theme on first visit:** Claude's Discretion — light-always vs respect `prefers-color-scheme`. Decision affects all customer surfaces, so document the choice clearly.

### shadcn primitives scope
- **Existing primitives in `web/src/components/ui/`:** button, card, form, input, label (5 files).
- **Missing primitives mentioned in success criteria:** badge, tabs (do NOT exist in the repo yet). Claude's Discretion to decide:
  - Create them now in Phase 25 with Factory tokens (avoids downstream rework when Phase 28+ needs them), OR
  - Defer creation to the consuming phase and update Phase 25 success criteria to reflect what exists.
- **App-level components (KpiCards, ActivityFeed, AdminSidebar, etc.):** Claude's Discretion — these are composed components, primarily Phase 32/33 territory. Plan should specify which (if any) Phase 25 touches as part of validating primitives.
- **Recharts palette (`--chart-1..5`):** Claude's Discretion — define Factory-derived chart tokens in Phase 25, or defer to Phase 32 when Recharts visualizations are reskinned.
- **CVA variants on Button/Card:** Claude's Discretion — straight color/radius swap vs structural variant alignment with Factory's catalog.

### Shadows / gradients policy
- **Current state:** 26 occurrences of `shadow-*` / `bg-gradient-to-*` across 20+ files. Factory says "no shadows, no gradients."
- **Scope of cleanup in Phase 25:** Claude's Discretion — eliminate everywhere now (touches 20+ files but enforces discipline) vs. only in primitives + auth pages (lets 32/33 finish the job in composed components).
- **Replacement pattern when removing a shadow:** Claude's Discretion — `border 1px` (Factory-classic, clearly defined) vs background-contrast (`#fafafa` on `#eeeeee`, more minimal). Plan should pick one default and call out exceptions.
- **Functional overlays (modal, dialog, dropdown):** Claude's Discretion — strict "no shadows" vs allow `shadow-sm` for floating overlays because they need separation from the backdrop.
- **Focus rings (shadcn uses `ring` = box-shadow):** Claude's Discretion — keep `ring` for accessibility (WCAG) and only kill decorative shadows, or migrate focus to `outline 2px` to honor the policy literally.

### Claude's Discretion (summary)
The user explicitly delegated nearly all implementation choices to the planner with the exceptions captured above (`factory.ai` reference, pixel-perfect fidelity, manual-UAT done, UAT-blocking fixes). Treat every `Claude's Discretion` marker as: "make the call in plan, justify the trade-off, do not bother the user again."

</decisions>

<specifics>
## Specific Ideas

- **Visual reference:** `factory.ai` — inspect live during research. WebFetch or browser inspection should capture typography (font-size scale, weight, line-height), spacing rhythm, hover/focus state styling, dropdown/modal patterns, and how the orange accent is applied (CTAs, focus, status, none of the above?).
- **Tokens floor (from roadmap):** light bg `#eeeeee`, cards `#fafafa`, Code Orange accent `#ef6f2e`, Geist Sans (body) + Geist Mono (code/numbers), border-radius scale 4px (buttons) / 6px (cards) / 0px (headers), no shadows, no gradients.
- **Existing tech context:** Tailwind v4 + PostCSS, shadcn/ui copy-paste primitives, CVA for variants, `cn()` (clsx + twMerge) for class merging, Geist Sans + Geist Mono already loaded via `next/font`.
- **Dark mode lives via `.dark` class variant on the root element; customer dashboard has a toggle, admin does not (Phase 33 will add it).**
- **The phase is foundation:** Phases 28, 32, 33 will fail or look inconsistent if Phase 25 ships incomplete or inconsistent tokens. Hold the line.

</specifics>

<deferred>
## Deferred Ideas

- **Admin language switcher + dark-mode toggle:** Already part of Phase 33 scope (v1.2 carry-over from Phase 17). Not absorbed into Phase 25 unless plan finds a strong reason.
- **Full reskin of composed customer/admin components:** Belongs in Phases 32 and 33. Phase 25 only touches them as much as UAT requires to clear visual regressions.
- **Public landing visual identity:** Phase 28 owns the landing surface. Phase 25 only provides the token + primitive foundation.
- **Lint-debt triage and removal of `console.log` / unused code:** Belongs in Phase 34 (Launch Polish).

</deferred>

---

*Phase: 25-design-system-migration*
*Context gathered: 2026-05-14*
