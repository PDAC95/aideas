# Requirements: AIDEAS Landing Page

**Defined:** 2026-03-03
**Core Value:** Visitors immediately understand that AIDEAS saves them money by replacing expensive manual tasks with affordable AI automations — and can browse the full catalog, see pricing, and sign up in minutes.

## v1 Requirements

### Foundation

- [ ] **FOUN-01**: All HTML pages use `lang="en"` (not `zxx`) with dynamic update via i18next
- [ ] **FOUN-02**: SCSS override pattern uses `_variables-aideas.scss` and `_aideas.scss` without editing template files
- [ ] **FOUN-03**: All template placeholder content (preloader text, demo links, agency copy) is replaced with AIDEAS content
- [ ] **FOUN-04**: Google Fonts loads Outfit with `display=swap` and preconnect hints
- [ ] **FOUN-05**: All scripts load with `defer` attribute
- [ ] **FOUN-06**: File structure matches architecture spec (index.html, automations.html, pricing.html, contact.html)

### Internationalization

- [ ] **I18N-01**: i18next initializes on page load with fallback to English
- [ ] **I18N-02**: Translation JSON files exist for all 4 languages (EN, ES, PT, FR) across 5 namespaces (common, home, catalog, pricing, contact)
- [ ] **I18N-03**: Language selector is visible in navigation and footer, uses `<button>` elements (not `<a>` to avoid SWUP interception)
- [ ] **I18N-04**: Selected language persists in localStorage across page navigations and browser refreshes
- [ ] **I18N-05**: Translations re-apply after every SWUP page transition via `applyTranslations()` in `swup:contentReplaced`
- [ ] **I18N-06**: `document.documentElement.lang` updates when language changes
- [ ] **I18N-07**: All visible text strings use `data-i18n` attributes (no hardcoded text in HTML)

### Home Page

- [ ] **HOME-01**: Hero section with outcome-focused headline, subheadline, primary CTA (→ app.aideas.com/signup), and secondary CTA (→ automations)
- [ ] **HOME-02**: Integration trust bar with animated logo strip (Gmail, Slack, HubSpot, Notion, Airtable, WhatsApp, etc.)
- [ ] **HOME-03**: Statistics strip with 4 counters (150+ automations, 8+ categories, hours saved, rating)
- [ ] **HOME-04**: How It Works section with 3 steps (Describe → We Build → It Runs)
- [ ] **HOME-05**: Category preview showing 8-10 automation categories as cards with icons
- [ ] **HOME-06**: Before/After comparison section (manual costs vs AIDEAS)
- [ ] **HOME-07**: Testimonials carousel using Swiper
- [ ] **HOME-08**: Final CTA section before footer

### Automations Catalog

- [ ] **CATL-01**: Page banner with "Explore 150+ Automations" headline
- [ ] **CATL-02**: Category filter tabs (All + 8-10 categories) with automation count per category
- [ ] **CATL-03**: Client-side search bar that filters automations by name and description
- [ ] **CATL-04**: Automation cards grid showing icon, category badge, name, description, and "Request" CTA
- [ ] **CATL-05**: Results count indicator ("Showing X of 150 automations") updates with filter
- [ ] **CATL-06**: Pagination or "Load more" (max 24 items visible at once)
- [ ] **CATL-07**: Empty state message with link to contact page when no results match
- [ ] **CATL-08**: Automations data loaded from `data/automations.json` master file
- [ ] **CATL-09**: All automation names, descriptions, and categories are translatable via i18next

### Pricing

- [ ] **PRIC-01**: 3 plan cards (Starter / Professional / Business) with Professional highlighted as "Most Popular"
- [ ] **PRIC-02**: Monthly/Annual billing toggle that updates displayed prices (annual = 2 months free)
- [ ] **PRIC-03**: Feature checklist per plan with checkmarks for included features
- [ ] **PRIC-04**: Setup fee + monthly price displayed transparently per plan
- [ ] **PRIC-05**: CTA button per plan linking to app.aideas.com/signup
- [ ] **PRIC-06**: FAQ accordion with 6-8 questions (using Ashley's `.mil-accordion-group`)
- [ ] **PRIC-07**: "Need more? Contact us" enterprise escape valve below plan cards

### Contact

- [ ] **CONT-01**: Lead capture form with fields: Name, Company, Email, Phone (optional), Automation Category (dropdown), Message
- [ ] **CONT-02**: Form submits to Formspree (or equivalent) static form backend — no leads are lost
- [ ] **CONT-03**: Form validation in JavaScript using i18next strings (not browser-native validation)
- [ ] **CONT-04**: Success/error states after form submission with translated messages
- [ ] **CONT-05**: "What happens next" 3-step process section (Describe → Build → Deploy)
- [ ] **CONT-06**: WhatsApp CTA link visible alongside form
- [ ] **CONT-07**: Response time promise: "We respond within 24 hours"

### Navigation & Layout

- [ ] **NAVL-01**: Shared navigation across all pages with AIDEAS logo + links (Home, Automations, Pricing, Contact) + language selector + CTA button
- [ ] **NAVL-02**: SWUP page transitions work between all pages with proper GSAP/Swiper/i18next reinit
- [ ] **NAVL-03**: ScrollTrigger instances killed before reinit on every SWUP transition (no memory leak)
- [ ] **NAVL-04**: Swiper instances destroyed before reinit on every SWUP transition
- [ ] **NAVL-05**: Footer with nav links, social media links, language selector, legal links (Privacy, Terms)
- [ ] **NAVL-06**: Custom cursor disabled on touch devices (`pointer: coarse` media query)
- [ ] **NAVL-07**: All CTAs link to app.aideas.com/signup with `data-no-swup` attribute

### Responsive & Performance

- [ ] **PERF-01**: Mobile responsive on all pages (Bootstrap grid breakpoints: 576, 768, 992, 1200)
- [ ] **PERF-02**: Hamburger menu works on mobile with AIDEAS nav links
- [ ] **PERF-03**: Catalog filter tabs horizontally scrollable on mobile
- [ ] **PERF-04**: Pricing cards stack vertically on mobile with recommended plan first
- [ ] **PERF-05**: Images use `loading="lazy"` below the fold
- [ ] **PERF-06**: Lighthouse mobile performance score >= 70

### SEO & Meta

- [ ] **META-01**: Each page has unique title and meta description (translatable)
- [ ] **META-02**: Open Graph tags (og:title, og:description, og:image) on all pages
- [ ] **META-03**: Semantic HTML structure (proper heading hierarchy, semantic elements)
- [ ] **META-04**: Favicon and Apple touch icon set to AIDEAS branding

## v2 Requirements

### Multi-Language SEO

- **MSEO-01**: Static page generation per language (/en/, /es/, /pt/, /fr/ directories)
- **MSEO-02**: hreflang tags pointing to language-specific URLs
- **MSEO-03**: Sitemap.xml with all language variants
- **MSEO-04**: Build script for pre-rendering translated HTML

### Catalog Enhancements

- **CATE-01**: Fancybox detail modal per automation showing full description, integrations, time saved
- **CATE-02**: "Popular" and "New" badges on automation cards
- **CATE-03**: Time-saved estimate displayed per automation card
- **CATE-04**: Integration badges (app icons) shown per card

### Analytics & Tracking

- **ANLY-01**: Google Analytics 4 integration
- **ANLY-02**: Event tracking on CTA clicks, form submissions, language changes
- **ANLY-03**: UTM parameter tracking for campaign attribution

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live chat widget | Adds 40-80KB JS, requires staffing, use WhatsApp link instead |
| Interactive ROI calculator | High complexity, static comparison table sufficient |
| Video demo embed | Kills Lighthouse scores, use screenshot/GIF instead |
| Individual automation detail pages | 150 HTML pages unmaintainable, use modals instead (v2) |
| Blog / content section | Not core to conversion, defer to future milestone |
| Newsletter signup | No content to send, use social media links instead |
| Competitor comparison page | Risky for new brand, handle in sales calls |
| Cookie consent with complex options | Overkill for lead-gen static site |
| User portal login in landing nav | Login lives at app.aideas.com, avoid confusion |
| Payment processing | Handled in the app portal, not on landing |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 1 | Pending |
| FOUN-04 | Phase 1 | Pending |
| FOUN-05 | Phase 1 | Pending |
| FOUN-06 | Phase 1 | Pending |
| I18N-01 | Phase 2 | Pending |
| I18N-02 | Phase 2 | Pending |
| I18N-03 | Phase 2 | Pending |
| I18N-04 | Phase 2 | Pending |
| I18N-05 | Phase 2 | Pending |
| I18N-06 | Phase 2 | Pending |
| I18N-07 | Phase 2 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-02 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |
| HOME-04 | Phase 3 | Pending |
| HOME-05 | Phase 3 | Pending |
| HOME-06 | Phase 3 | Pending |
| HOME-07 | Phase 3 | Pending |
| HOME-08 | Phase 3 | Pending |
| CATL-01 | Phase 4 | Pending |
| CATL-02 | Phase 4 | Pending |
| CATL-03 | Phase 4 | Pending |
| CATL-04 | Phase 4 | Pending |
| CATL-05 | Phase 4 | Pending |
| CATL-06 | Phase 4 | Pending |
| CATL-07 | Phase 4 | Pending |
| CATL-08 | Phase 4 | Pending |
| CATL-09 | Phase 4 | Pending |
| PRIC-01 | Phase 5 | Pending |
| PRIC-02 | Phase 5 | Pending |
| PRIC-03 | Phase 5 | Pending |
| PRIC-04 | Phase 5 | Pending |
| PRIC-05 | Phase 5 | Pending |
| PRIC-06 | Phase 5 | Pending |
| PRIC-07 | Phase 5 | Pending |
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| CONT-04 | Phase 6 | Pending |
| CONT-05 | Phase 6 | Pending |
| CONT-06 | Phase 6 | Pending |
| CONT-07 | Phase 6 | Pending |
| NAVL-01 | Phase 1 | Pending |
| NAVL-02 | Phase 2 | Pending |
| NAVL-03 | Phase 2 | Pending |
| NAVL-04 | Phase 2 | Pending |
| NAVL-05 | Phase 1 | Pending |
| NAVL-06 | Phase 1 | Pending |
| NAVL-07 | Phase 1 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-02 | Phase 1 | Pending |
| PERF-03 | Phase 4 | Pending |
| PERF-04 | Phase 5 | Pending |
| PERF-05 | Phase 7 | Pending |
| PERF-06 | Phase 7 | Pending |
| META-01 | Phase 7 | Pending |
| META-02 | Phase 7 | Pending |
| META-03 | Phase 7 | Pending |
| META-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after initial definition*
