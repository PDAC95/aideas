# Architecture — AIDEAS Landing Page

**Project:** AIDEAS Landing Page
**Researched:** 2026-03-03
**Confidence:** HIGH (confirmed from direct codebase inspection)

---

## Folder Structure

```
landing/
  index.html              ← Home (renamed from home-1.html)
  automations.html        ← Catalog page (new)
  pricing.html            ← Pricing page (new)
  contact.html            ← Contact/Demo (adapted from existing)
  404.html                ← Error page (adapted)

  css/
    style.css             ← Compiled SCSS output
    plugins/              ← Vendor CSS (bootstrap-grid, swiper, fancybox, font-awesome)

  scss/
    style.scss            ← Entry point
    _variables.scss       ← Template vars (DO NOT EDIT)
    _common.scss          ← Template common (DO NOT EDIT)
    _components.scss      ← Template components (DO NOT EDIT)
    _variables-aideas.scss ← AIDEAS overrides (NEW)
    _aideas.scss          ← AIDEAS custom styles (NEW)

  js/
    main.js               ← Template main (MODIFY: add i18n hook to swup:contentReplaced)
    i18n.js               ← i18next init + applyTranslations (NEW)
    automations.js        ← Catalog search/filter logic (NEW)
    pricing.js            ← Monthly/annual toggle logic (NEW)
    plugins/              ← Vendor JS (jquery, gsap, swup, swiper, fancybox, etc.)

  locales/
    en/
      common.json         ← Nav, footer, CTAs, shared UI
      home.json           ← Hero, how-it-works, categories, testimonials
      catalog.json        ← Filter labels, category names, automation cards
      pricing.json        ← Plan names, prices, features, FAQ
      contact.json        ← Form labels, validation, success states
    es/ pt/ fr/           ← Same structure, 20 total files

  data/
    automations.json      ← Master catalog: 150+ automations with category, description, tags

  img/
    logo/                 ← AIDEAS logo variants (dark, light, icon)
    automations/icons/    ← SVG category icons
    integrations/         ← App logos (Gmail, Slack, HubSpot, etc.)
    og/                   ← Open Graph images per page
    works/                ← Keep template images as fallback
```

---

## SWUP Configuration

**Containers identified from codebase:**
- `#swupMain` (`.mil-main-transition`) — page content
- `#swupMenu` — navigation (active state)
- Reinit event: `swup:contentReplaced` — already wired in `main.js` lines 616-936

**All pages must share:**
- Same `<nav>` structure (outside `#swupMain` is ok, `#swupMenu` handles active state)
- Same footer structure
- Same `<head>` script/style includes
- `data-page` body attribute for page-specific JS init

**SWUP bypass for external links:**
```html
<a href="https://app.aideas.com/signup" data-no-swup>Get Started</a>
```

---

## SCSS Architecture

**Import order in style.scss:**
```scss
@import 'variables';          // Template defaults
@import 'variables-aideas';   // AIDEAS overrides
@import 'common';             // Template common
@import 'components';         // Template components
@import 'aideas';             // AIDEAS custom styles
```

**Rule: Never edit `_variables.scss`, `_common.scss`, or `_components.scss` directly.** Override in `_variables-aideas.scss` and `_aideas.scss` instead.

---

## i18next Organization

**By language + by namespace** (5 namespaces x 4 languages = 20 files):
- `common` — shared across all pages (nav, footer, CTAs)
- `home` — home page specific
- `catalog` — automations catalog specific
- `pricing` — pricing page specific
- `contact` — contact page specific

Each HTML page loads `common` + its page namespace.

---

## Build Workflow

**Replace Prepros with npm scripts:**

```json
{
  "scripts": {
    "sass": "sass --watch scss/style.scss:css/style.css --style compressed",
    "serve": "npx live-server --port=3000 --no-browser",
    "dev": "npm run sass & npm run serve"
  }
}
```

---

## Vercel Deployment

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/locales/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```
