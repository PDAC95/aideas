# Roadmap: AIDEAS Landing Page

**Created:** 2026-03-03
**Milestone:** v1 — Launch-ready marketing site
**Phases:** 7
**Requirements covered:** 57/57

---

## Phase 1: Template Cleanup & Foundation

**Goal:** Transform the Ashley agency template into AIDEAS-branded page structure with all launch blockers fixed.

**Requirements:** FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, NAVL-01, NAVL-05, NAVL-06, NAVL-07, PERF-02

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Build system setup (npm + sass) and SCSS override architecture
- [x] 01-02-PLAN.md — Clean index.html template with AIDEAS branding and main.js cursor fix
- [ ] 01-03-PLAN.md — Create 4 HTML pages, delete unused template pages, verify SWUP navigation

**Success criteria:**
- [ ] 4 HTML pages exist: index.html, automations.html, pricing.html, contact.html
- [ ] All pages use `lang="en"` (not `zxx`)
- [ ] Preloader, navigation, footer contain AIDEAS content (no template placeholders)
- [x] SCSS override files created (`_variables-aideas.scss`, `_aideas.scss`) — done in 01-01
- [ ] Scripts load with `defer`, fonts use `display=swap` with preconnect
- [ ] Custom cursor disabled on touch devices
- [ ] All CTAs link to app.aideas.com/signup with `data-no-swup`
- [ ] Hamburger menu works on mobile with AIDEAS nav links
- [ ] Navigation and footer are shared across all 4 pages
- [ ] SWUP transitions work between all 4 pages (content loads)

**Depends on:** Nothing (first phase)

---

## Phase 2: i18next Integration

**Goal:** Multi-language support works across all pages with persistent language selection and proper SWUP integration.

**Requirements:** I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06, I18N-07, NAVL-02, NAVL-03, NAVL-04

**Success criteria:**
- [ ] i18next initializes on page load, detects browser language, falls back to EN
- [ ] 20 JSON translation files exist (5 namespaces x 4 languages)
- [ ] Language selector in nav and footer uses `<button>` elements
- [ ] Switching language updates all visible text on current page
- [ ] Selected language persists in localStorage across page loads
- [ ] SWUP navigation re-applies translations to new DOM content
- [ ] ScrollTrigger instances killed before reinit on SWUP transitions
- [ ] Swiper instances destroyed before reinit on SWUP transitions
- [ ] `document.documentElement.lang` updates on language change
- [ ] All text strings use `data-i18n` attributes (nav, footer, shared UI complete)

**Depends on:** Phase 1 (page structure must exist)

---

## Phase 3: Home Page

**Goal:** Fully-built home page that communicates AIDEAS value proposition and drives visitors to signup or catalog.

**Requirements:** HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07, HOME-08

**Success criteria:**
- [ ] Hero section with translated headline, subheadline, primary CTA (signup), secondary CTA (automations)
- [ ] Integration trust bar with animated logo strip (8+ app logos)
- [ ] Statistics strip with 4 animated counters
- [ ] How It Works section: 3 numbered steps with icons
- [ ] Category preview: 8-10 cards with icons linking to automations catalog
- [ ] Before/After comparison section (manual costs vs AIDEAS costs)
- [ ] Testimonials Swiper carousel with 3-5 quotes
- [ ] Final CTA section: "Start saving time today" + signup button
- [ ] All text translatable via i18next (all 4 languages)
- [ ] GSAP scroll animations working on all sections

**Depends on:** Phase 2 (i18next must be integrated)

---

## Phase 4: Automations Catalog

**Goal:** Browsable, searchable catalog of 150+ automations organized by category with responsive grid.

**Requirements:** CATL-01, CATL-02, CATL-03, CATL-04, CATL-05, CATL-06, CATL-07, CATL-08, CATL-09, PERF-03

**Success criteria:**
- [ ] `data/automations.json` contains 150+ automations across 8-10 categories
- [ ] Page banner with translated headline
- [ ] Category filter tabs (All + categories) with count badge per category
- [ ] Filter tabs horizontally scrollable on mobile
- [ ] Client-side search bar filters by name and description
- [ ] Automation cards grid: icon, category badge, name, description, "Request" CTA
- [ ] Results count updates with active filter ("Showing X of 150")
- [ ] Pagination: max 24 items visible, "Load more" button
- [ ] Empty state with "Tell us what you need →" link to contact
- [ ] All category names, automation names, descriptions translatable
- [ ] Cards responsive: 1 col mobile, 2 cols tablet, 3 cols desktop

**Depends on:** Phase 2 (i18next), Phase 3 not required (can parallel after Phase 2)

---

## Phase 5: Pricing Page

**Goal:** Transparent pricing with plan comparison that helps visitors self-qualify and convert.

**Requirements:** PRIC-01, PRIC-02, PRIC-03, PRIC-04, PRIC-05, PRIC-06, PRIC-07, PERF-04

**Success criteria:**
- [ ] 3 plan cards: Starter / Professional / Business
- [ ] Professional plan highlighted with "Most Popular" badge
- [ ] Monthly/Annual toggle updates all prices (annual = 2 months free)
- [ ] Setup fee + monthly price shown transparently per plan
- [ ] Feature checklist per plan with checkmarks
- [ ] CTA button per plan → app.aideas.com/signup
- [ ] FAQ accordion with 6-8 translated questions/answers
- [ ] "Need more? Contact us" enterprise CTA below cards
- [ ] Pricing cards stack vertically on mobile, recommended plan first
- [ ] All text translatable via i18next

**Depends on:** Phase 2 (i18next), can parallel with Phase 4

---

## Phase 6: Contact Page

**Goal:** Working lead capture form that reliably delivers demo requests to the AIDEAS team.

**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07

**Success criteria:**
- [ ] Lead capture form: Name, Company, Email, Phone (optional), Category dropdown, Message
- [ ] Form submits to Formspree — submission delivers to AIDEAS email
- [ ] JavaScript validation with translated error messages (not browser-native)
- [ ] Success state after submission with translated confirmation
- [ ] Error state with translated message if submission fails
- [ ] "What happens next" 3-step section above form
- [ ] WhatsApp CTA link visible alongside form
- [ ] "We respond within 24 hours" promise displayed
- [ ] All form labels, placeholders, and messages translatable

**Depends on:** Phase 2 (i18next), can parallel with Phase 4/5

---

## Phase 7: Polish, SEO & Deploy

**Goal:** Production-ready site with SEO meta tags, performance optimization, and Vercel deployment.

**Requirements:** PERF-01, PERF-05, PERF-06, META-01, META-02, META-03, META-04

**Success criteria:**
- [ ] All pages responsive across all breakpoints (576, 768, 992, 1200)
- [ ] Images use `loading="lazy"` below the fold
- [ ] Lighthouse mobile performance >= 70
- [ ] Each page has unique translated title and meta description
- [ ] Open Graph tags on all pages (og:title, og:description, og:image)
- [ ] Semantic HTML: proper heading hierarchy, semantic elements
- [ ] Favicon and Apple touch icon with AIDEAS branding
- [ ] `vercel.json` configured (cleanUrls, cache headers for locales)
- [ ] Site deployed to Vercel and accessible at aideas.com
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] All 4 languages tested end-to-end (navigation, translation, form)

**Depends on:** All previous phases complete

---

## Phase Dependency Graph

```
Phase 1 (Foundation)
  └──→ Phase 2 (i18next)
         ├──→ Phase 3 (Home)     ──→ Phase 7 (Polish & Deploy)
         ├──→ Phase 4 (Catalog)  ──→ Phase 7
         ├──→ Phase 5 (Pricing)  ──→ Phase 7
         └──→ Phase 6 (Contact)  ──→ Phase 7
```

**Parallelizable:** Phases 3, 4, 5, 6 can run in parallel after Phase 2.

---

## Requirement Coverage

| Category | Count | Phase(s) |
|----------|-------|----------|
| Foundation (FOUN) | 6 | Phase 1 |
| Internationalization (I18N) | 7 | Phase 2 |
| Home Page (HOME) | 8 | Phase 3 |
| Catalog (CATL) | 9 | Phase 4 |
| Pricing (PRIC) | 7 | Phase 5 |
| Contact (CONT) | 7 | Phase 6 |
| Navigation (NAVL) | 7 | Phases 1, 2 |
| Performance (PERF) | 6 | Phases 1, 4, 5, 7 |
| SEO/Meta (META) | 4 | Phase 7 |
| **Total** | **57** | **All mapped** |

---
*Roadmap created: 2026-03-03*
*Last updated: 2026-03-03 — 01-02 complete (AIDEAS branding: home-1.html + main.js cursor guard)*
*Phase 1 planned: 2026-03-03 — 3 plans in 2 waves*
