# Project State: AIDEAS Landing Page

**Current phase:** 01-template-cleanup-foundation — Plan 03 complete, Plan 04 next
**Last action:** Completed 01-03 (4 pages + 404 with AIDEAS shell, 16 template pages deleted; awaiting SWUP human verification)
**Updated:** 2026-03-03

## Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Template Cleanup & Foundation | In progress (3/N plans done) |
| 2 | i18next Integration | Not started |
| 3 | Home Page | Not started |
| 4 | Automations Catalog | Not started |
| 5 | Pricing Page | Not started |
| 6 | Contact Page | Not started |
| 7 | Polish, SEO & Deploy | Not started |

## Key Context

- Template: Ashley (millerDigitalDesign) — dark theme, orange accent, `mil-` CSS prefix
- SWUP v2 reinit hook: `swup:contentReplaced` at main.js line 616
- Critical fix needed: ScrollTrigger.getAll().kill() before reinit
- Critical fix needed: Contact form has no action — integrate Formspree
- lang="en" fixed in home-1.html (DONE in plan 02); all 5 pages now created from this template (DONE in plan 03)
- home-1.html renamed to index.html; 16 template pages deleted (DONE in plan 03)
- 4 AIDEAS pages + 404.html with correct per-page active states (DONE in plan 03)
- i18next: CDN via unpkg, 5 namespaces x 4 languages = 20 JSON files
- Automations data: data/automations.json master file (150+ entries)
- SCSS: override in _variables-aideas.scss and _aideas.scss, never edit template files
- Build: `npm run build` in landing/ (sass CLI) — replaces Prepros GUI

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-03 | Multi-page (not single-page) | Better SEO, matches template structure |
| 2026-03-03 | i18next for i18n | Industry standard, scalable, namespace support |
| 2026-03-03 | Keep dark + orange aesthetic | Fits AI/automation brand positioning |
| 2026-03-03 | 8-10 automation categories | Balanced: impressive without overwhelming |
| 2026-03-03 | CTAs → app.aideas.com/signup | Consistent with PRD architecture |
| 2026-03-03 | Skip hreflang for MVP | Client-side i18n = single-URL per page |
| 2026-03-03 | Formspree for form backend | Simplest static form solution |
| 2026-03-03 | Paginate catalog (24 items) | Prevents DOM bloat with 150+ cards |
| 2026-03-03 | sass CLI npm devDependency over global | Reproducible, no global install required |
| 2026-03-03 | Keep @import syntax (not @use) | Matches existing template files; mixing causes issues |
| 2026-03-03 | defer on all 9 scripts | Safe: main.js uses jQuery $(function(){}) = DOMContentLoaded |
| 2026-03-03 | data-no-swup on all external CTAs | Prevents SWUP from intercepting external navigation |
| 2026-03-03 | pointer:coarse guard for cursor | Preserves desktop UX, disables phantom cursor on touch devices |
| 2026-03-03 | contact.html full rewrite | Old template had Ashley dropdowns/footer; fresh write safer than patching |
| 2026-03-03 | 404.html keep banner content | mil-404-banner structure is template-agnostic; only shell replaced |

## Last Session

- **Stopped at:** Checkpoint 01-03-PLAN.md Task 3 (SWUP visual verification — awaiting human)
- **Commits:** 1ce17d6 (feat: index/automations/pricing), 5b23618 (feat: contact/404/delete pages)
- **Requirements completed:** FOUN-06, NAVL-05, PERF-02
