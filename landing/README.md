# landing/

AIDEAS public marketing site. Built from the [Orisa](https://1.envato.market/alithemes-orisa-react) React template (Vite + React 19 + Bootstrap 5 + GSAP), reduced to 6 public routes plus a 404.

> Production URL: **https://aideas.ca**
> Dashboard sister app: **https://app.aideas.ca** (the `web/` module)
> Single backend: **https://api.aideas.ca** (the `api/` module — used for public forms only)

---

## Quick start

```bash
cd landing
npm install
cp .env.example .env.local   # adjust VITE_APP_URL and VITE_API_URL
npm run dev                  # → http://localhost:5173
```

`npm run build` emits to `dist/` (deployable to any static host).

## Routes

| Path | Component | Source sections (Orisa) |
|------|-----------|-------------------------|
| `/` | `HomePage` | **Index 2** layout with **Index 7 hero** swapped in as Section1 |
| `/services` | `ServicesPage` | services-1 + index-1 + about-3 + index-2 + about-1 |
| `/catalog` | `CatalogPage` | portfolio-3 + about-3 |
| `/pricing` | `PricingPage` | index-2/Section12 + services-details + about-3 |
| `/faq` | `FaqsPage` | faqs |
| `/contact` | `ContactPage` | contact-1 + about-2 |
| `*` | `NotFoundPage` | 404 |

Header style 2 + Footer style 2 are wired on every route (`MainLayout headerStyle={2} footerStyle={2}`). Other Orisa header/footer styles were pruned to keep the bundle small.

## Tech stack (locked by template)

- **React 19** + **TypeScript 5.8** + **Vite 6**
- **React Router DOM 6.30** (`createBrowserRouter`)
- **Bootstrap 5.3** as the base CSS (utility classes + custom `at-*` classes in `/public/assets/css/main.css`)
- **GSAP 3.12** for hero/scroll animations
- **Swiper 11** for carousels
- **Isotope** for filter grids
- **WOW.js** + **split-text** + **react-fast-marquee** for scroll/text effects
- **DM Sans** (Google Fonts) — single typeface family across body + headings

⚠ **Do not switch the CSS to Tailwind here.** The dashboard (`web/`) uses Tailwind 4. The two modules deliberately do not share UI components — only design **tokens** (see `tokens.json` once Phase 29 lands).

## File structure

```
landing/
├── public/assets/         # CSS, fonts, imgs, scripts (Orisa originals)
│   ├── css/main.css       # 37k-line CSS bundle — do not edit by hand
│   ├── css/vendors/       # Bootstrap, Swiper, Font Awesome, etc.
│   └── scripts/           # theme-init.js (runs before paint)
├── src/
│   ├── main.tsx
│   ├── App.tsx            # 7 routes + MainLayout
│   ├── layouts/MainLayout.tsx
│   ├── pages/             # 7 page files (HomePage, CatalogPage, etc.)
│   ├── shared/
│   │   ├── header/Header2.tsx
│   │   ├── footer/Footer2.tsx
│   │   ├── sections/      # only the section folders we actually use
│   │   ├── components/, effects/, elements/, hooks/, ...
│   ├── seo/PageMeta.tsx
│   └── types/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Environment variables

| Var | Purpose | Default |
|-----|---------|---------|
| `VITE_APP_URL` | Where the dashboard lives (Log in / Sign up CTAs) | `https://app.aideas.ca` |
| `VITE_API_URL` | Where FastAPI lives (public forms only) | `https://api.aideas.ca` |

Vite only exposes vars prefixed `VITE_` to the browser. See `.env.example`.

## Conventions

- **Routing:** `App.tsx` is the single source of truth. New page → new file in `pages/` + new `<Route>` in `App.tsx`.
- **Sections:** the Orisa template organises pages as compositions of `<SectionN />` components. Keep that pattern when adapting pages.
- **Imports:** use the `@/` alias for everything inside `src/`. Relative imports only within the same section folder (e.g. `./Section12Pricing`).
- **Header + Footer:** style 2 is the only wired variant. If we need a different variant later, add it explicitly to `HEADER_COMPONENTS` / `FOOTER_COMPONENTS` in `MainLayout.tsx`.
- **Theme:** light + dark are both supported via the `data-bs-theme` attribute on `<html>` and `theme-init.js`. The `ThemeSwitcher` component toggles between them.
- **Bootstrap utilities + custom `at-*` classes** are the styling vocabulary. Do not introduce Tailwind here.

## Known tech debt

- **swiper 6.5.1 → 12.x is a breaking change.** The template ships swiper 11.2 which has a known critical prototype-pollution advisory ([GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643)). Upgrading is not safe inside this reorg — it requires rewriting every carousel call site. Tracked separately.
- **TypeScript `strict` mode flags a few template files** (`SideBar.tsx`, `CardAwardPreviewEffect.tsx`, `vite.config.ts` needs `node:path` types). The `npm run build` script bypasses `tsc -b`, so it ships. To enable full type-check on CI, run `npx tsc --noEmit`.

## Deploy

This module deploys as a static SPA. Any of these works:

- **Vercel:** `framework: vite`, `output: dist`, root path `landing/`.
- **Cloudflare Pages / Netlify:** same idea. Add SPA fallback so unknown routes hit `index.html` (otherwise React Router 404s on hard reloads).
- **CDN + Cloudflare R2:** copy `dist/` and configure 404 → 200 rewrite to `index.html`.

The host must rewrite unknown paths to `index.html` for the SPA router to work.
