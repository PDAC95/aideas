# v1.3 Original Plan — Archive

**Archived:** 2026-05-21
**Reason:** v1.3 pivoted from "SSR public funnel + Factory reskin" to "three-module repo reorganization" on 2026-05-21.

## What was archived

The original v1.3 milestone defined 10 phases (25-34). Phases 25-27 were completed and their work remains on `main`. Phases 28-34 were **never executed** (only phase 28 had context/plans drafted). Those drafts are preserved here for historical reference.

### Original phase plan (now superseded)

| Phase | Original goal | Status at archive | Replacement in new v1.3 |
|-------|---------------|-------------------|-------------------------|
| 25 | Design System Migration (Factory tokens) | ✅ Completed 2026-05-15 — stays on main | — |
| 26 | Catalog Data Model (functional_areas + scenarios) | ✅ Completed 2026-05-15 — stays on main | — |
| 27 | Scenario Content Seed (50 scenarios) | ✅ Completed 2026-05-19 — stays on main | — |
| 28 | Public Landing Page (SSR `/` route) | 📁 Context + 4 plans drafted, never executed. **Descarted 2026-05-20**, re-pivoted into reorg 2026-05-21 | NEW Phase 28: Landing module (Vite + Orisa template) |
| 29 | Public Catalog Navigation | Never created | NEW Phase 29: Design tokens + tailwind sync |
| 30 | Scenario Selector + ROI Calculator | Never created | NEW Phase 30: API restructure (public/client/admin namespaces) |
| 31 | Lead Capture Flow | Never created | NEW Phase 31: Wire-up + cleanup |
| 32 | Reskin Customer Dashboard | Never created | (Deferred — dashboard reskin not in this reorg) |
| 33 | Reskin Admin Dashboard | Never created | (Deferred) |
| 34 | Launch Polish (analytics, SEO) | Never created | (Deferred to a future polish phase) |

## Why the pivot

After phases 25-27 completed, multiple attempts at the SSR landing (phase 28) produced low-quality output despite using the right design skills. The user decided to:

1. Use an established React template (Orisa) as the landing's foundation instead of designing one from scratch.
2. Restructure the repo into three independent modules (`landing/`, `web/`, `api/`) rather than embedding the landing inside the Next.js project.
3. Defer the dashboard reskin (phases 32-33) and SEO polish (phase 34) until after the reorganization stabilizes.

See `.planning/REORG-V2-PLAN.md` and the new `.planning/ROADMAP.md` for the current plan.

## What's preserved here

- `28-public-landing-page/` — original phase 28 context and 4 plans (LAND-01..LAND-09 requirements, SSR + i18n + SEO scope). These were superseded but are useful reference for copy/structure ideas.

## Related archives

- `.planning/milestones/v1.3-INTENT-archive.md` — original v1.3 strategy conversation (2026-05-14).
- `.planning/milestones/v1.0-*`, `v1.1-*`, `v1.2-*` — prior milestones completed and archived per project policy.
