# Project State: AIDEAS Landing Page

**Current phase:** 01-template-cleanup-foundation — Plan 01 complete, Plan 02 next
**Last action:** Completed 01-01 (npm build system + SCSS override architecture)
**Updated:** 2026-03-03

## Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Template Cleanup & Foundation | In progress (1/N plans done) |
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
- Critical fix needed: lang="zxx" → lang="en" on all pages
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

## Last Session

- **Stopped at:** Completed 01-01-PLAN.md (npm build system + SCSS override architecture)
- **Commits:** 815d67c (chore: npm build), 7241185 (feat: SCSS override architecture)
- **Requirements completed:** FOUN-02, FOUN-04
