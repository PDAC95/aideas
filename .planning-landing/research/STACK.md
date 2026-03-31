# Technology Stack — AIDEAS Landing Page (i18next Integration)

**Project:** AIDEAS Landing Page
**Researched:** 2026-03-03
**Scope:** i18next integration for static multi-page HTML with vanilla JS + jQuery + SWUP
**Overall confidence:** HIGH

---

## Recommended Stack

### Core i18n Libraries

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| i18next | ^23.x | Translation engine | Industry standard, stable API, works without any framework |
| i18next-http-backend | ^2.x | Load JSON translation files from server | Async fetch of `/locales/{lng}/{ns}.json` — perfect for static hosting |
| i18next-browser-languagedetector | ^7.x | Detect user language from browser | Reads navigator.language, localStorage, querystring, htmlTag in priority order |

### Existing Template Libraries (Retained)

| Technology | Purpose | Notes |
|------------|---------|-------|
| jQuery 3.x | DOM manipulation, event binding | Already in landing/js/plugins/jquery.min.js |
| GSAP + ScrollTrigger 3.x | Scroll animations, parallax, custom cursor | Already in landing/js/plugins/ |
| SWUP 2.x | SPA-like page transitions | Already in landing/js/plugins/swup.min.js |
| Swiper 8.x | Carousels/sliders | Already in landing/js/plugins/swiper.min.js |

---

## i18next Integration Pattern

### HTML Markup

```html
<h1 data-i18n="home.hero.headline"></h1>
<meta name="description" data-i18n="[content]home.meta.description">
<img src="..." data-i18n="[alt]home.hero.image_alt">
<input type="email" data-i18n="[placeholder]contact.form.email_placeholder">
```

### landing/js/i18n.js

```javascript
(function () {
  'use strict';

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key.indexOf('[') === 0) {
        var parts = key.split(';');
        parts.forEach(function (part) {
          var match = part.match(/^\[([^\]]+)\](.+)$/);
          if (match) el.setAttribute(match[1], i18next.t(match[2]));
        });
      } else {
        el.textContent = i18next.t(key);
      }
    });
    document.documentElement.lang = i18next.language;
  }

  i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['es', 'en', 'pt', 'fr'],
      ns: ['common', 'home', 'catalog', 'pricing', 'contact'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: {
        order: ['path', 'localStorage', 'navigator', 'htmlTag'],
        lookupFromPathIndex: 0,
        lookupLocalStorage: 'aideas_lang',
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
    })
    .then(function () { applyTranslations(); });

  window.aideasI18n = {
    applyTranslations: applyTranslations,
    changeLanguage: function (lng) {
      i18next.changeLanguage(lng, function () {
        applyTranslations();
        localStorage.setItem('aideas_lang', lng);
      });
    },
    t: function (key, options) { return i18next.t(key, options); },
  };
})();
```

---

## SWUP Integration (CRITICAL)

The existing `main.js` already uses `document.addEventListener("swup:contentReplaced", ...)` at line 616 to reinitialize all plugins. i18next translations must call `applyTranslations()` inside this same handler:

```javascript
document.addEventListener("swup:contentReplaced", function () {
  // ... existing GSAP/Swiper/jQuery reinit code stays as-is ...
  // ADD: re-walk new DOM with current translations
  if (window.aideasI18n) {
    window.aideasI18n.applyTranslations();
  }
});
```

i18next does NOT need to re-initialize. All JSON is already in memory. Only the DOM re-walk is needed. Stay on SWUP v2 (event: `swup:contentReplaced`) — do not upgrade to v3 which uses a different hook API.

---

## JSON File Structure

```
landing/locales/
  en/ / es/ / pt/ / fr/
    common.json    (nav, footer, CTAs, shared UI)
    home.json      (hero, how-it-works, categories, testimonials)
    catalog.json   (filter labels, category names, automation cards)
    pricing.json   (plan names, prices, features, FAQ)
    contact.json   (form labels, validation messages, success states)
```

Total: 5 namespaces x 4 languages = 20 JSON files.

### Key naming convention

- snake_case throughout
- Structure: `scope.semantic_role` (e.g., `hero.headline`, `nav.home`, `plan_pro_name`)
- Named keys over positional: `plan_starter`, `plan_pro`, `plan_business` — NOT `plan_1`, `plan_2`
- Dynamic values use `{{variable}}` interpolation: `"results_count": "Showing {{count}} automations"`

---

## SEO

**Option A (recommended for launch):** Single HTML set, client-side JS switching only. Google indexes one language. Fast to ship.

**Option B (recommended for Phase 2):** Build script generates `/en/`, `/es/`, `/pt/`, `/fr/` directories with pre-compiled HTML + hreflang tags. Google indexes all 4 languages.

---

## CDN Load Order

```html
<!-- bottom of <body>, before main.js -->
<script src="https://unpkg.com/i18next@23.11.5/i18next.min.js"></script>
<script src="https://unpkg.com/i18next-http-backend@2.5.2/i18nextHttpBackend.min.js"></script>
<script src="https://unpkg.com/i18next-browser-languagedetector@7.2.1/i18nextBrowserLanguageDetector.min.js"></script>
<script src="js/i18n.js"></script>
<!-- existing template scripts follow -->
<script src="js/plugins/jquery.min.js"></script>
<script src="js/main.js"></script>
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| i18n library | i18next | Polyglot.js | No backend loading, no namespace support, no language detection |
| Translation format | Namespaces per page | Single flat JSON per language | 400+ keys per file; no lazy loading |
| URL structure | /en/ directory prefix | ?lang=en query param | Weaker SEO signal |
| Launch approach | Option A (client-side only) | Option B (pre-compiled) | Adds build tooling cost; defer |
| SWUP version | Keep v2 | Upgrade to v3 | v3 changes event API — not justified |
