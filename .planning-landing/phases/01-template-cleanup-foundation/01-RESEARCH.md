# Phase 1 Research: Template Cleanup & Foundation

**Phase:** 1 — Template Cleanup & Foundation
**Researched:** 2026-03-03
**Requirements addressed:** FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, NAVL-01, NAVL-05, NAVL-06, NAVL-07, PERF-02
**Confidence:** HIGH — findings drawn from direct codebase inspection

---

## What This Phase Actually Is

Phase 1 is not about building features. It is about making the Ashley agency template structurally safe to build on. Every subsequent phase depends on the page structure, navigation, SWUP wiring, and SCSS override system being clean and correct before a single line of content is written.

Think of it as demolition + framing: tear out the agency placeholders, rename the pages, wire the navigation, lock down the SCSS override pattern, and fix the performance landmines (synchronous scripts, blocking fonts, mobile cursor). Nothing AIDEAS-specific is built in Phase 1 beyond the skeleton — content comes in Phase 3+.

---

## Codebase Reality: What Exists Today

### File Inventory

The `landing/` directory currently contains:
- `home-1.html` — the primary template page (will become `index.html`)
- `contact.html` — contact page (usable as base, needs cleanup)
- `404.html` — error page (keep as-is, minor branding)
- `blog.html`, `blog-inner.html`, `publication.html` — delete
- `portfolio-1.html`, `portfolio-2.html`, `portfolio-3.html` — delete
- `project-1.html` through `project-6.html` — delete
- `service.html`, `services.html`, `team.html`, `home-2.html` — delete
- `automations.html`, `pricing.html` — DO NOT EXIST yet (must be created new)

### Template Structure (Confirmed from Source)

Every HTML page follows this structure:

```
<html lang="zxx">                   ← Must change to lang="en"
<head>
  CSS links (no fonts here)         ← Fonts loaded in _variables.scss via @import
  <title>Ashley</title>             ← Must update
</head>
<body>
  <div class="mil-wrapper" id="top">
    .mil-ball                       ← Custom cursor (outside swupMain)
    .mil-preloader                  ← Preloader (outside swupMain) — contains placeholder copy
    .mil-progress-track             ← Scroll progress bar (outside swupMain)
    .mil-menu-frame                 ← Full overlay menu (outside swupMain)
      .mil-frame-top                ← Logo + hamburger clone
      .mil-menu-content             ← Nav links with dropdown ul structure
    .mil-curtain                    ← Page transition curtain (outside swupMain)
    .mil-frame                      ← Sticky top frame (outside swupMain)
      .mil-frame-top                ← Logo + hamburger (visible always)
      .mil-frame-bottom             ← Page name + back to top
    .mil-content
      #swupMain.mil-main-transition ← SWUP replaces this on navigation
        [page sections]
        <footer>                    ← Footer lives INSIDE swupMain
        .mil-hidden-elements        ← SVG templates cloned by JS (must stay inside swupMain)
  </div>

  <!-- Scripts at bottom of body, no defer -->
  jquery.min.js
  swup.min.js
  swiper.min.js
  fancybox.min.js
  gsap.min.js
  smooth-scroll.js
  ScrollTrigger.min.js
  ScrollTo.min.js
  main.js
</head>
```

**Critical structural finding:** The `<footer>` lives inside `#swupMain`. This means EVERY page must contain the full footer HTML. There is no shared include system. Changing footer content = editing all 4 HTML files.

**Critical structural finding:** `.mil-hidden-elements` (the dodecahedron SVG and lines SVG that get cloned by jQuery into `.mil-animation` and `.mil-lines-place` elements) must remain inside `#swupMain` on every page, or the append logic in `main.js` breaks on navigation.

### SWUP Configuration (Confirmed from main.js line 21-27)

```javascript
const options = {
    containers: ['#swupMain', '#swupMenu'],
    animateHistoryBrowsing: true,
    linkSelector: 'a:not([data-no-swup])',
    animationSelector: '[class="mil-main-transition"]'
};
```

`#swupMenu` maps to `.mil-main-menu` with `id="swupMenu"`. Both containers are replaced on navigation. The nav active state updates automatically because `#swupMenu` is a SWUP container.

### Navigation Structure (Confirmed from source)

Current nav uses nested `<ul>` with `mil-has-children` dropdown pattern:
```html
<nav class="mil-main-menu" id="swupMenu">
  <ul>
    <li class="mil-has-children mil-active">
      <a href="#.">Homepage</a>
      <ul>...</ul>
    </li>
  </ul>
</nav>
```

AIDEAS needs flat nav (no dropdowns): Home, Automations, Pricing, Contact, + CTA button. The `mil-has-children` JS handler (main.js line 377-382) can stay — unused items just won't trigger.

### Hamburger Menu (Confirmed from main.js line 367-371)

```javascript
$('.mil-menu-btn').on("click", function () {
    $('.mil-menu-btn').toggleClass('mil-active');
    $('.mil-menu').toggleClass('mil-active');
    $('.mil-menu-frame').toggleClass('mil-active');
});
```

The hamburger toggles `.mil-active` on `.mil-menu-frame`. This is the full-page overlay nav. PERF-02 (hamburger works on mobile) is already wired — the task is replacing the nav link content, not fixing the toggle logic.

### Custom Cursor (Confirmed from main.js line 234-361)

The cursor code runs unconditionally on page load. It attaches `pointermove` listener and jQuery hover events on all `<a>`, `input`, `textarea`. No touch detection exists. To disable on touch devices, wrap the entire cursor block:

```javascript
if (!window.matchMedia('(pointer: coarse)').matches) {
    // all cursor initialization code
}
```

Also hide `.mil-ball` via CSS:
```css
@media (pointer: coarse) {
    .mil-ball { display: none; }
}
```

### SCSS Build System (Confirmed from source)

`style.scss` currently imports:
```scss
@import 'variables';
@import 'common';
@import 'components';
```

Font loading happens in `_variables.scss` line 1:
```scss
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

This is a CSS `@import` inside SCSS — it outputs directly to `style.css`. The font loads **without** `display=swap` in the current file. Wait — the URL already contains `&display=swap` in the raw template. Double-check this:

**Confirmed:** `_variables.scss` line 1 reads:
```
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

The `display=swap` is present. However, the `preconnect` hints are NOT in any HTML `<head>`. The font request still blocks because there is no `<link rel="preconnect" href="https://fonts.googleapis.com">` in the HTML head. FOUN-04 requires adding preconnect hints to the HTML.

**Build tool:** Prepros (GUI tool) currently compiles SCSS. The architecture research recommends replacing with npm scripts (`sass --watch`). Phase 1 must establish `package.json` with the npm build scripts before SCSS editing begins.

### Scripts (Confirmed from source)

8 scripts, all loaded synchronously at bottom of `<body>`, no `defer`. FOUN-05 requires adding `defer` to all of them.

**Important:** `defer` on scripts means they execute after the DOM is parsed but before `DOMContentLoaded`. Since the template uses jQuery's `$(function() {...})` pattern (equivalent to `$(document).ready()`), adding `defer` is safe — the ready handler fires at the same relative time.

**Order dependency:** SWUP, GSAP, Swiper, and Fancybox must load before `main.js`. With `defer`, execution order within the same page is preserved in source order. Safe to add `defer` to all.

### Preloader Placeholder Content (Confirmed from source)

In every HTML file, the preloader contains:
```html
<div class="mil-pos-abs mil-animation-1">
    <p class="mil-h3 mil-muted mil-thin">Pioneering</p>
    <p class="mil-h3 mil-muted">Creative</p>
    <p class="mil-h3 mil-muted mil-thin">Excellence</p>
</div>
<div class="mil-pos-abs mil-animation-2">
    <div class="mil-reveal-frame">
        <p class="mil-reveal-box"></p>
        <p class="mil-h3 mil-muted mil-thin">ashley.com</p>
    </div>
</div>
```

Replace "Pioneering / Creative / Excellence" with AIDEAS tagline (e.g., "Automate / Save Time / Scale"). Replace "ashley.com" with "aideas.com".

**Note:** The preloader animation is GSAP-driven (main.js lines 51-116). The structure of `.mil-animation-1` (three `<p>` elements) and `.mil-animation-2` (one `.mil-reveal-box` + one text `<p>`) must be preserved for the animation to work. Content inside the `<p>` tags is safe to change.

### Footer Structure (Confirmed from source)

Current footer (inside `#swupMain`) contains:
- Logo text "Ashley."
- Newsletter subscribe form (remove — out of scope)
- Nav links: Home, Portfolio, Services, Contact, Blog (replace with AIDEAS links)
- Legal links: Privacy Policy, Terms, Cookie Policy, Careers (update)
- Address blocks: Canada + Germany fake addresses (remove or replace with AIDEAS contact info)
- Social icons: 4 `<i class="far fa-circle">` placeholders (replace with real icons)
- Copyright: "© Copyright 2023 - Mil. All Rights Reserved." (update)

---

## Key Decisions Required

### 1. Page File Strategy

**Decision:** Rename `home-1.html` to `index.html`. Create `automations.html` and `pricing.html` as new files from scratch (copying the shell from `index.html` minus the content sections). Adapt `contact.html` from the existing template contact page.

**Why:** The existing `contact.html` has a form structure to build from. `automations.html` and `pricing.html` have no template equivalents — they must be built new. The shell (preloader, menu frame, frame, SWUP container, scripts) is identical across all pages.

### 2. Page Shell Template Approach

Because there is no server-side include system, the 4 pages will share the same nav/footer HTML by duplication. Every page has identical:
- `.mil-ball` (cursor)
- `.mil-preloader`
- `.mil-progress-track`
- `.mil-menu-frame` (full overlay nav)
- `.mil-frame` (sticky top frame)
- Script tags at bottom
- Footer HTML

**Implication for maintenance:** If nav or footer changes, update all 4 files. This is the tradeoff of a static HTML site with SWUP. Phase 2 (i18next) will add `data-i18n` attributes to nav/footer — again in all 4 files. Accept this as the static-site cost.

### 3. SCSS Override File Location

Create `landing/scss/_variables-aideas.scss` and `landing/scss/_aideas.scss`. Update `landing/scss/style.scss`:

```scss
@import 'variables';
@import 'variables-aideas';  // NEW — overrides template defaults
@import 'common';
@import 'components';
@import 'aideas';            // NEW — AIDEAS custom styles
```

`_variables-aideas.scss` can override `$accent`, `$dark`, `$light`, and font variables if needed. Phase 1 may not need any overrides yet — just create the files and import them.

### 4. SWUP and Footer Position

The footer inside `#swupMain` is correct per the template pattern. When SWUP navigates, the entire `#swupMain` content (including footer) is replaced. Each page provides its own footer. This is intentional — it allows page-specific footer states.

**Phase 1 action:** Ensure all 4 HTML pages have the identical AIDEAS footer HTML inside `#swupMain`.

### 5. The `.mil-hidden-elements` Block

Every page must include the `.mil-hidden-elements` div with the SVG dodecahedron and lines SVG inside `#swupMain`. The `swup:contentReplaced` handler in `main.js` runs:
```javascript
$(".mil-dodecahedron").clone().appendTo(".mil-animation");
$(".mil-lines").clone().appendTo(".mil-lines-place");
```

If `.mil-hidden-elements` is absent on a page, these clones fail silently but the decorative 3D shapes and lines on that page will not render. Include it on all 4 pages.

---

## Requirement-by-Requirement Analysis

### FOUN-01: lang="en" on all pages
**What to do:** Change `<html lang="zxx">` to `<html lang="en">` on all 4 HTML files.
**Where:** Line 2 of every HTML file.
**Phase 2 note:** Phase 2 will add dynamic update via `document.documentElement.lang = i18next.language` in the i18n handler. Phase 1 only needs the static `lang="en"`.

### FOUN-02: SCSS override pattern
**What to do:** Create `_variables-aideas.scss` and `_aideas.scss`, update `style.scss` imports.
**Where:** `landing/scss/`
**Risk:** None. Adding empty files that are imported is harmless.

### FOUN-03: Replace template placeholder content
**Preloader:** Replace "Pioneering / Creative / Excellence" + "ashley.com"
**Nav:** Replace agency menu structure with flat AIDEAS links
**Footer:** Replace all placeholder content (logo, nav links, addresses, copyright, social icons)
**Logo in .mil-frame-top and .mil-menu-frame:** Replace "A." text logo with AIDEAS logo (img or SVG)

### FOUN-04: Google Fonts with display=swap and preconnect
**Finding:** `display=swap` is already in `_variables.scss`. The gap is the missing `preconnect` hints.
**What to do:** Add to `<head>` of all 4 HTML files:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```
**Alternative consideration:** Move the Google Fonts `@import` from SCSS to HTML `<link>` tags, which is the recommended approach for performance (CSS `@import` inside SCSS blocks render, whereas `<link>` can be preloaded). This is a meaningful improvement but adds complexity. Recommend doing it: move font loading from `_variables.scss` to HTML `<head>` as a `<link>` element with preconnect, and remove the SCSS `@import url(...)` line. This requires updating `_variables-aideas.scss` to only declare the `$font-1` variable without re-importing.

### FOUN-05: Scripts with defer
**What to do:** Add `defer` to all 9 script tags at the bottom of every HTML file.
**Safety check:** Template uses `$(function(){...})` wrapper — fully compatible with defer.
**Caution:** `swup.min.js` must still load before `main.js` since main.js calls `new Swup()`. Source order is preserved with `defer`, so this is safe.

### FOUN-06: File structure (4 HTML pages)
**What to do:**
1. Rename `home-1.html` → `index.html`
2. Create `automations.html` from index.html shell (gutted content sections)
3. Create `pricing.html` from index.html shell
4. Adapt `contact.html` from existing template contact page
5. Delete: blog.html, blog-inner.html, publication.html, portfolio-*.html, project-*.html, service.html, services.html, team.html, home-2.html

### NAVL-01: Shared navigation with AIDEAS links
**Nav links needed:** Home (index.html), Automations (automations.html), Pricing (pricing.html), Contact (contact.html), CTA button (app.aideas.com/signup)
**Structure change:** Replace nested dropdown `<ul>` with flat `<ul>`:
```html
<nav class="mil-main-menu" id="swupMenu">
    <ul>
        <li class="mil-active"><a href="index.html">Home</a></li>
        <li><a href="automations.html">Automations</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>
</nav>
```
Remove the `mil-has-children` JS handler's relevance — not needed with flat nav.
**CTA button:** Add to `.mil-menu-right` area of the overlay menu AND to `.mil-frame-top` sticky bar:
```html
<a href="https://app.aideas.com/signup" data-no-swup class="mil-button">Get Started</a>
```

**Active state:** SWUP updates `#swupMenu` on navigation, so active class needs to be set per-page. Simplest approach: each page's `index.html`, `automations.html` etc. sets `mil-active` on the correct `<li>` in the HTML. SWUP replaces the whole `#swupMenu` with the new page's version.

### NAVL-05: Footer with nav links, social media, language selector, legal links
**Footer nav:** Home, Automations, Pricing, Contact
**Social links:** Link to real AIDEAS social accounts (LinkedIn, Twitter/X, Instagram as available)
**Language selector:** Phase 2 adds language switching. Phase 1 can include placeholder `<div class="aideas-lang-selector">` or leave it as a comment marker. Do not add functional language switching in Phase 1.
**Legal:** Privacy Policy (link to #), Terms (link to #) — real pages are out of scope for MVP
**Copyright:** "© 2024 AIDEAS. All Rights Reserved."
**Remove:** Newsletter subscribe form (out of scope), address blocks

### NAVL-06: Custom cursor disabled on touch devices
**What to do in JS (main.js):**
```javascript
if (!window.matchMedia('(pointer: coarse)').matches) {
    // wrap all cursor initialization here
    const cursor = document.querySelector('.mil-ball');
    // ... all cursor code through line 361
}
```
**What to do in SCSS (_aideas.scss):**
```scss
@media (pointer: coarse) {
    .mil-ball {
        display: none !important;
    }
}
```
**Scope of main.js cursor block:** Lines 234-361 in main.js. The entire block from `const cursor = document.querySelector('.mil-ball');` through the `$('body').mouseup()` handler must be wrapped.

**Note:** Also wrap the cursor reinit inside `swup:contentReplaced` if cursor init code is duplicated there. Looking at lines 616+, the reinit handler does NOT contain cursor re-initialization — cursor is initialized once on page load only. So only the initial block needs wrapping.

### NAVL-07: All CTAs link to app.aideas.com/signup with data-no-swup
**All occurrences in Phase 1 scope:** Nav CTA button, any hero section CTA (placeholder for Phase 3)
**Pattern:**
```html
<a href="https://app.aideas.com/signup" data-no-swup class="mil-button mil-arrow-place">
    <span>Get Started</span>
</a>
```
`data-no-swup` is already handled by main.js line 24: `linkSelector: 'a:not([data-no-swup])'`

### PERF-02: Hamburger menu works on mobile with AIDEAS nav links
**Finding:** The hamburger toggle is already implemented in main.js. The task is ensuring the nav content inside `.mil-menu-frame` uses AIDEAS links (same flat nav as above). No JS changes needed for the toggle.
**Verification:** Test that clicking hamburger on mobile (<992px) shows the overlay, AIDEAS links are visible, and clicking a link navigates correctly with SWUP.

---

## Implementation Pitfalls for This Phase

### Pitfall 1: SWUP contentReplaced fires after DOM swap — menu state must reset
When navigating, `.mil-menu-frame` is not inside `#swupMain`, so it persists across navigations. The `swup:contentReplaced` handler already closes the menu (lines 634-636):
```javascript
$('.mil-menu-btn').removeClass('mil-active');
$('.mil-menu').removeClass('mil-active');
$('.mil-menu-frame').removeClass('mil-active');
```
This is correct. No change needed.

### Pitfall 2: The append logic runs on init AND on contentReplaced
`main.js` line 141-146 (init) and line 642-648 (reinit) both call:
```javascript
$(".mil-arrow").clone().appendTo(".mil-arrow-place");
$(".mil-dodecahedron").clone().appendTo(".mil-animation");
```
On reinit, old clones are removed first (`$(".mil-arrow-place .mil-arrow, .mil-animation .mil-dodecahedron, .mil-current-page a").remove()`). This is correct — but it means `.mil-hidden-elements` must be present on every page or the clone sources won't exist.

### Pitfall 3: Deleting template pages while SWUP may have cached them
Not a risk for Phase 1 since SWUP caches in-session. Deleting unused HTML files has no impact on SWUP behavior for the 4 target pages.

### Pitfall 4: The `defer` order must match source order
With `defer`, scripts execute in the order they appear in HTML. Current order: jQuery → SWUP → Swiper → Fancybox → GSAP → smooth-scroll → ScrollTrigger → ScrollTo → main.js. `main.js` depends on all of the above. Adding `defer` preserves this order. Safe.

### Pitfall 5: Font loading via SCSS vs HTML
Moving `@import url(...)` from `_variables.scss` to an HTML `<link>` element improves performance but introduces a discrepancy: if someone compiles SCSS without the HTML context, fonts won't load. This is acceptable for this project since there's no standalone SCSS compilation without an HTML page.

**Recommendation:** Move font loading to HTML. Update `_variables.scss` to only contain the variable declaration (`$font-1: 'Outfit', sans-serif;`) without the `@import url()`. Add `<link>` tags for the font and preconnect to all 4 HTML files in `<head>`.

### Pitfall 6: `automations.html` and `pricing.html` page content placeholder
These pages need enough HTML inside `#swupMain` to not cause layout breaks (empty `#swupMain` may cause GSAP/SWUP animation issues). Add a minimal placeholder banner:
```html
<section class="mil-dark-bg mil-p-120-60">
    <div class="container">
        <h1 class="mil-muted">Automations</h1>
        <p class="mil-light-soft">Coming soon.</p>
    </div>
</section>
```
This placeholder will be replaced in Phases 3-5.

### Pitfall 7: Preloader only runs on hard page load, not SWUP navigations
The preloader GSAP timeline in main.js runs once on `$(function(){...})` — the initial page load. SWUP navigations do not re-trigger the preloader. This is correct behavior. Do not add preloader logic to `swup:contentReplaced`.

---

## Build System Setup

Before any file editing, Phase 1 must set up the npm-based build workflow to replace Prepros.

**package.json** to create at `landing/package.json`:
```json
{
  "name": "aideas-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "sass": "sass --watch scss/style.scss:css/style.css --style compressed",
    "serve": "npx live-server --port=3000",
    "dev": "npm run sass & npm run serve",
    "build": "sass scss/style.scss:css/style.css --style compressed"
  },
  "devDependencies": {
    "sass": "^1.70.0",
    "live-server": "^1.2.2"
  }
}
```

**Install command:** `cd landing && npm install`

The `sass` CLI tool handles the `@import url()` passthrough — it emits CSS `@import` for URL-based imports, which is what we want for Google Fonts (if keeping in SCSS) or simply passes through (if moved to HTML).

---

## Order of Operations for Phase 1

This sequence minimizes broken states during development:

1. **Set up build system** — create `package.json`, run `npm install`, verify `npm run dev` compiles SCSS and serves site
2. **Rename home-1.html to index.html** — verify site still loads
3. **Create SCSS override files** — `_variables-aideas.scss` (empty), `_aideas.scss` (empty), update `style.scss` imports
4. **Fix lang="zxx" on index.html** — change to `lang="en"`
5. **Fix script defer on index.html** — add `defer` to all 9 scripts, verify site still works
6. **Move font loading to HTML** — remove `@import url()` from `_variables.scss`, add `<link>` tags + preconnect to HTML head
7. **Add touch cursor disable** — wrap cursor code in main.js, add `@media (pointer: coarse)` to `_aideas.scss`
8. **Replace nav content in index.html** — AIDEAS flat nav, logo, CTA button
9. **Replace preloader content in index.html** — AIDEAS tagline
10. **Replace footer content in index.html** — AIDEAS links, social, copyright
11. **Create automations.html** — copy index.html shell, add placeholder content, fix active state on nav
12. **Create pricing.html** — same as above
13. **Adapt contact.html** — copy shell from index.html, keep contact form area, fix nav/footer/preloader/lang
14. **Verify SWUP** — navigate between all 4 pages, confirm transitions work and nav active state updates
15. **Delete unused template pages** — all portfolio, blog, project, service, team, home-2 files
16. **Final audit** — check all success criteria against all 4 pages

---

## Open Questions / Decisions Needed Before Coding

1. **AIDEAS logo format:** Is there an SVG or image file for the AIDEAS logo? The template uses "A." text. Phase 1 needs an actual logo asset (SVG preferred, placed at `img/logo/aideas-logo.svg`). If unavailable, use styled text as temporary placeholder.

2. **Social media accounts:** Which social platforms does AIDEAS have? (LinkedIn, Twitter/X, Instagram, etc.) Needed for footer social icons.

3. **AIDEAS preloader copy:** What 3 lines should replace "Pioneering / Creative / Excellence"? Suggestion: "Automate / Save Time / Scale" or brand-specific phrases.

4. **Font loading strategy:** Confirm decision to move `@import url()` from `_variables.scss` to HTML `<link>` tags. This is recommended but changes the SCSS file (even though `_variables.scss` is template — HOWEVER the rule says do not edit template files). Resolution: add the `<link>` tags to HTML head AND override in `_variables-aideas.scss` by redeclaring `$font-1` without the import. Then in `_variables.scss`, the font import stays but becomes a secondary load (the HTML link preloads faster). This avoids editing the template file while still improving performance.

   **Cleaner resolution:** Add only the preconnect hints to HTML head (solving the connection latency) without moving the font import. This avoids touching `_variables.scss`. The `display=swap` is already present. Preconnect + display=swap = acceptable performance for Phase 1.

5. **CTA button in sticky top frame:** The `.mil-frame-top` in the template has only logo + hamburger button. Adding a "Get Started" CTA button to `.mil-frame-top` requires a CSS addition (`_aideas.scss`) to position it correctly. Is this desired, or should the CTA only appear in the overlay menu and on-page sections?

---

## Success Verification Checklist

After implementation, verify each success criterion:

| Criterion | How to Verify |
|-----------|---------------|
| 4 HTML pages exist | `ls landing/*.html` shows index.html, automations.html, pricing.html, contact.html |
| All pages use lang="en" | `grep 'lang=' landing/*.html` shows en on all |
| Preloader has AIDEAS content | Open site, watch preloader animation |
| Nav has AIDEAS links | Click hamburger, inspect overlay menu links |
| Footer has AIDEAS content | Scroll to bottom of any page |
| SCSS overrides created | `ls landing/scss/` shows _variables-aideas.scss, _aideas.scss |
| style.scss imports them | Read landing/scss/style.scss |
| Scripts have defer | `grep 'defer' landing/index.html` |
| Preconnect hints in head | `grep 'preconnect' landing/index.html` |
| Cursor disabled on touch | Open DevTools → Toggle device toolbar → No cursor element visible |
| CTAs have data-no-swup | `grep 'data-no-swup' landing/*.html` |
| Hamburger works on mobile | Resize browser below 992px, click hamburger |
| Nav shared across 4 pages | Navigate between all pages, nav present and correct |
| Footer shared across 4 pages | Navigate between all pages, footer present and correct |
| SWUP transitions work | Navigate between all 4 pages — smooth transition, no white flash |

---

## Sources

- Direct inspection: `C:/dev/12ai/landing/home-1.html` (confirmed structure, preloader, nav, footer, scripts)
- Direct inspection: `C:/dev/12ai/landing/js/main.js` (confirmed SWUP config, cursor code, hamburger, reinit hook)
- Direct inspection: `C:/dev/12ai/landing/scss/_variables.scss` (confirmed font import with display=swap)
- Direct inspection: `C:/dev/12ai/landing/scss/style.scss` (confirmed current import order)
- Direct inspection: `C:/dev/12ai/landing/contact.html` (confirmed same template structure)
- Project research: `.planning/research/ARCHITECTURE.md` (SWUP containers, SCSS pattern, folder structure)
- Project research: `.planning/research/CONCERNS.md` (cursor fix, lang=zxx, preloader pitfalls)
- Project research: `.planning/research/STACK.md` (defer safety, SWUP v2 event names)
