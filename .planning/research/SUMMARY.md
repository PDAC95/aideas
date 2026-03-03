# Research Summary — AIDEAS Landing Page

**Synthesized:** 2026-03-03
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, CONCERNS.md

---

## Key Insights

1. **i18next + SWUP integration is the core technical risk.** SWUP replaces DOM on navigation → i18next translations are lost → must call `applyTranslations()` in every `swup:contentReplaced` handler. This is the #1 bug that will surface.

2. **ScrollTrigger memory leak is a pre-existing template bug.** The Ashley template's SWUP handler calls `ScrollTrigger.refresh()` but never kills old instances. Must fix with `ScrollTrigger.getAll().forEach(t => t.kill())` before reinit. Same pattern for Swiper instances.

3. **Template has 5 launch blockers out of the box:** `lang="zxx"` on all pages, contact form with no action, preloader with placeholder copy, synchronous script loading, no font-display:swap.

4. **Client-side i18n = EN-only SEO.** Google indexes one language per URL. Accept this for MVP (EN for US/Canada). Multi-language SEO requires static page generation per language — defer to Phase 2+.

5. **The catalog page is the most complex deliverable.** 150+ items need: JSON data source, client-side search/filter, category tabs, pagination (24/page), responsive grid, and Fancybox modals. This is not a content swap — it's new functionality.

6. **Pricing page doesn't exist in the template.** Must build from scratch using `mil-` CSS system. Plan comparison table, monthly/annual toggle, FAQ accordion are all new HTML+JS.

7. **SCSS override pattern is clean.** Never edit `_variables.scss`, `_common.scss`, `_components.scss`. Create `_variables-aideas.scss` and `_aideas.scss` as override layers.

---

## Architecture Decisions (Confirmed)

| Decision | Status |
|----------|--------|
| i18next (CDN) + http-backend + browser-languagedetector | Confirmed |
| 5 JSON namespaces x 4 languages = 20 translation files | Confirmed |
| `data-i18n` attributes on HTML elements | Confirmed |
| `<button>` for language selector (avoid SWUP interception) | Confirmed |
| Formspree for contact form backend | Confirmed |
| SCSS override layers (not editing template files) | Confirmed |
| Skip hreflang for MVP | Confirmed |
| Paginate catalog (24 items + load more) | Confirmed |
| `automations.json` as master data source for catalog | Confirmed |

---

## Risk Matrix

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| i18n lost on SWUP navigation | HIGH | CERTAIN | applyTranslations() in swup:contentReplaced |
| ScrollTrigger memory leak | HIGH | CERTAIN | Kill all triggers before reinit |
| Contact form loses leads | CRITICAL | CERTAIN | Formspree integration |
| Catalog DOM bloat (150+ cards) | MEDIUM | HIGH | Paginate + search |
| Mobile performance (480KB JS) | MEDIUM | HIGH | defer scripts, gate cursor |
| SEO for non-EN languages | LOW (MVP) | CERTAIN | Accept; defer to Phase 2 |

---

## Recommended Phase Structure

Based on research findings, the work breaks down into these natural phases:

1. **Template Cleanup & Foundation** — Fix launch blockers (lang="zxx", preloader, fonts, scripts), set up SCSS override pattern, create file structure
2. **i18next Integration** — Core i18n setup, translation files, language selector, SWUP integration hook
3. **Home Page** — Hero, trust bar, stats, how-it-works, categories, before/after, testimonials, CTA
4. **Automations Catalog** — Data JSON, category filter, search, card grid, pagination, Fancybox modals
5. **Pricing Page** — Plan cards, monthly/annual toggle, feature comparison, ROI table, FAQ accordion
6. **Contact Page** — Form with Formspree, validation with i18n, category selector, WhatsApp CTA
7. **Polish & Deploy** — SEO meta tags, OG images, Lighthouse optimization, Vercel deployment, cross-browser testing
