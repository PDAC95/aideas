# Project State: AIDEAS Landing Page

**Current phase:** Not started — run `/gsd:plan-phase 1` to begin
**Last action:** Project initialized with roadmap
**Updated:** 2026-03-03

## Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Template Cleanup & Foundation | Not started |
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
