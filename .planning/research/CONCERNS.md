# Domain Pitfalls: AIDEAS Landing Page

**Domain:** Multi-language static marketing site (i18next + SWUP + GSAP)
**Researched:** 2026-03-03
**Confidence:** HIGH — based on direct inspection of the Ashley template source code

---

## Critical Pitfalls

### 1. Client-Side i18n is Invisible to Google by Default
Google crawls each URL once — it sees one language only. No separate `/es/`, `/en/` URLs = no multi-language indexing.
**Prevention:** Accept for MVP (EN-only SEO), generate static per-language pages in Phase 2.

### 2. SWUP `swup:contentReplaced` — i18next State Lost on Navigation
SWUP fetches raw HTML and injects into `#swupMain`. i18next does not observe DOM changes. New DOM needs manual re-translation.
**Prevention:** Call `applyTranslations()` inside `swup:contentReplaced` handler after GSAP/slider reinit.

### 3. GSAP ScrollTrigger Instance Accumulation
`ScrollTrigger.refresh()` recalculates but does NOT kill instances. Orphaned triggers accumulate after each navigation.
**Prevention:** `ScrollTrigger.getAll().forEach(t => t.kill())` before creating new animations in SWUP handler.

### 4. Template `lang="zxx"` — Broken at the Root
Every HTML file has `<html lang="zxx">` (IANA code for "no linguistic content"). Breaks SEO and screen readers.
**Prevention:** Change to `<html lang="en">`, dynamically update via `document.documentElement.lang = i18next.language`.

### 5. Contact Form Has No Action — Leads Silently Lost
The contact form has no `action`, no `method`. Submitting loses all data.
**Prevention:** Integrate Formspree or similar static form backend before launch.

---

## Moderate Pitfalls

### 6. ~480KB of Synchronous JavaScript on First Load
8 script tags loaded sequentially. Heavy for mobile.
**Prevention:** Add `defer` to all scripts; conditionally load Fancybox/Swiper only where needed. Target Lighthouse 70+ on mobile.

### 7. Google Fonts Blocking Render
Outfit at 9 weights without `font-display: swap` causes FOIT/FOUT.
**Prevention:** Add `display=swap` parameter + preconnect hints.

### 8. Language Selector Accessibility
Custom dropdown without ARIA is inaccessible to keyboard/screen reader users.
**Prevention:** Use native `<select>` or implement full ARIA roles + keyboard handling.

### 9. SWUP Intercepts Language Selector Links
SWUP intercepts all `<a>` clicks. Language links get treated as page navigations.
**Prevention:** Use `<button>` elements for language switching, or add `data-no-swup` attribute.

### 10. 150+ Automation Cards — DOM Bloat
All cards in a single page = 1500+ DOM nodes. Lighthouse warnings, mobile scroll degradation.
**Prevention:** Paginate (24/page + "Load more") or per-category pages. Add client-side search.

### 11. Swiper Instances Not Destroyed Before Reinit
SWUP reinit creates new Swiper without destroying old one. Conflicts on pages with sliders.
**Prevention:** Guard with `if (el.swiper) el.swiper.destroy(true, true)` before `new Swiper()`.

### 12. Form Validation Messages in Browser Language
HTML5 validation shows messages in browser's UI language, not page's selected language.
**Prevention:** Implement all validation in JS using i18next strings from day one.

---

## Minor Pitfalls

### 13. hreflang on Single-URL Site is Counterproductive
All language variants pointing to same URL = Google ignores/penalizes.
**Prevention:** Skip hreflang for MVP.

### 14. Translation JSON Cached Indefinitely
Without cache-busting, updated translations don't reach returning users.
**Prevention:** Add version query param tied to deploy hash.

### 15. Custom Cursor on Touch Devices
Invisible cursor element consumes cycles on mobile.
**Prevention:** Gate on `window.matchMedia('(pointer: coarse)')`.

### 16. Screen Reader Language Mismatch
If `document.documentElement.lang` not updated, Spanish text read with English pronunciation.
**Prevention:** Update `lang` in i18next `languageChanged` event + `swup:contentReplaced`.

### 17. Preloader Must Stay Outside `#swupMain`
Moving preloader inside SWUP container breaks GSAP timeline on navigation.
**Prevention:** Keep all persistent UI outside `#swupMain`.

---

## Template Adaptation Risks

1. Portfolio grid → Automation catalog requires structural changes, not just content swap
2. Pricing page doesn't exist in template — must build from scratch using `mil-` CSS system
3. Navigation hierarchy mismatch (Agency vs SaaS)
4. Copy tone mismatch — emotive agency → benefit-specific SaaS
5. Dark aesthetic vs catalog readability — consider `mil-light-bg` for catalog
6. Preloader contains "Pioneering Creative Excellence" placeholder copy

---

## Phase-Specific Warnings

| Phase | Pitfall | Mitigation |
|-------|---------|------------|
| i18next setup | Language lost on refresh | Use languagedetector with localStorage |
| SWUP transitions | Translation state lost | `applyTranslations()` in every SWUP hook |
| GSAP animations | ScrollTrigger accumulation | Kill all triggers before reinit |
| Contact form | Silent lead loss | Formspree in Phase 1, not afterthought |
| Catalog | DOM bloat, no search | Paginate + client-side search |
| Language selector | SWUP intercepts links | Use `<button>` elements |
| Template cleanup | `lang="zxx"`, placeholder copy | Find-and-replace at project start |
