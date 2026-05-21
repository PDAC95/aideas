# Reorganization Plan — Three-Module Repo (v2 architecture)

**Created:** 2026-05-21
**Status:** Approved 2026-05-21 — Stage A in execution

## Decisions locked (2026-05-21)

1. **Branch strategy:** New branch `feature/v1.3-three-module-reorg` from `main`. Delete old `feature/phase-28-landing-redesign` (had no useful unmerged work — descart was already on main).
2. **Deploy URLs:** Industry-standard split — `aideas.ca` (landing) + `app.aideas.ca` (web dashboard). Landing link buttons point to `app.aideas.ca/login`, `app.aideas.ca/signup`, `app.aideas.ca/dashboard`.
3. **API strategy:** Hybrid pragmatic (Option A). Next.js Server Components/Actions keep calling Supabase directly for: reading data to render, mutating own-user state, simple validations. FastAPI handles ONLY: public endpoints (landing forms), external webhooks (Stripe, n8n, Resend), long-running jobs (>5s, PDFs, scraping), secret-bearing integrations, and any action a future mobile/B2B client will need. Rule in `CLAUDE.md`: "if in doubt, FastAPI."
4. **Old phases 28-34:** Archive into `.planning/milestones/v1.3-original-archive/`. New phases reflect this reorg.
**Goal:** Pivot from "single Next.js project" to "three independent paralel modules in one repo" — `landing/` (Vite+React), `web/` (Next.js), `api/` (FastAPI).

---

## 1. Target structure

```
12ai/
├── landing/                       ← NEW. Public site (Vite + React + Bootstrap)
│   ├── public/assets/             ← CSS, fonts, imgs, scripts (from Orisa template)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                ← reduced router (6 routes only)
│   │   ├── layouts/MainLayout.tsx
│   │   ├── pages/                 ← Home, Catalog, Services, Pricing, FAQ, Contact
│   │   ├── shared/                ← header, footer, sections (only kept ones)
│   │   ├── seo/, types/, data/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tokens.json                ← extracted design tokens (Paso 2)
│   └── README.md
│
├── web/                            ← KEEP. Dashboard (Next.js + Tailwind + shadcn)
│   ├── src/app/(dashboard)/        ← existing customer dashboard
│   ├── src/app/(admin)/            ← existing admin dashboard (under /admin)
│   ├── src/app/(auth)/             ← login, signup
│   ├── tokens.json                 ← copy from landing/ (Paso 3)
│   ├── tailwind.config.ts          ← consumes tokens.json
│   └── README.md
│
├── api/                            ← REORGANIZED. FastAPI (single Supabase consumer)
│   ├── src/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── public/             ← /api/public/* (no auth — landing forms)
│   │   │   ├── client/             ← /api/client/* (auth — customer dashboard)
│   │   │   └── admin/              ← /api/admin/* (auth + role admin)
│   │   ├── deps/                   ← auth dependencies, Supabase client
│   │   └── services/
│   ├── requirements/
│   └── README.md
│
├── supabase/                       ← KEEP. Migrations + seed (shared)
├── docs/
├── .planning/
└── CLAUDE.md
```

**What changed at the top level:**
- `web/public/landing/` (current static HTML) → **deleted** (replaced by `landing/`)
- `web/src/app/(public)/` if any → **never created** (replaced by `landing/`)
- New top-level folder: `landing/`
- `api/` gets re-organized routes (3 namespaces)

---

## 2. What we keep vs replace

| Item | Current state | After reorg | Action |
|------|--------------|-------------|--------|
| `web/` Next.js dashboard | Production-ready, 12 phases done | Same code, untouched | KEEP. Just add `tokens.json` consumption. |
| `web/public/landing/` static HTML | Old Oneex template | Gone | DELETE (replaced by `landing/`) |
| `web/src/app/page.tsx` root redirect | Sends auth users to `/dashboard`, unauth rewrites to `/landing/index.html` | Rewrite the unauth path | UPDATE: unauth users redirect to `https://aideas.ca/` (the landing module). On localhost dev, redirect to `http://localhost:5173/`. |
| `api/` FastAPI | Has `routes/auth.py` + `routes/health.py` (flat) | Becomes 3-namespace structure | RESTRUCTURE into `routes/public/`, `routes/client/`, `routes/admin/` |
| `supabase/` migrations + seed | 28+ files all working | Same | KEEP unchanged |
| `.planning/` GSD planning | Reflects old roadmap (v1.3 = SSR funnel) | Needs v1.3 update | UPDATE: scrap phases 28-34 reskin/public funnel and replace with v1.3 = "Three-module reorg" |
| Orisa template raw files | In root: `orisa-creative-agency-portfolio-react-template-...` | Source copied into `landing/`, raw folder removed | COPY → DELETE raw |
| `seed/` (top-level random folder) | Unknown content, untracked | Investigate before deleting | INSPECT then likely delete |
| `web/src/components/landing/` (5 files) | Components used by `(public)` route attempts | Delete | DELETE (landing is now its own module) |

**Old static landing (`web/public/landing/`):** ~50MB of HTML/CSS/JS/images that we won't use. Delete from filesystem AND from git.

**The 14 unused Orisa pages:** purge as part of Paso 1.

---

## 3. Pages reduction (Orisa template adaptation)

The template ships with ~50 routes. We keep 6:

| AIDEAS page | Orisa source page | Orisa sections used | Header/Footer style |
|-------------|-------------------|---------------------|---------------------|
| `/` Home | `Home2Page` (Index 2 light+dark) | index-2/Section1..13 BUT replace Section1 with `index-7/Section1` (hero) | header 2, footer 2 |
| `/catalog` Catalog | `Portfolio3Page` | portfolio-3 sections | header 2, footer 2 |
| `/services` Services | `Services1Page` | services-1 sections | header 2, footer 2 |
| `/pricing` Pricing | `PricingPage` | index-2/Section12 + services-details/Section4 + about-3/Section7 | header 2, footer 2 |
| `/faq` FAQ | `FaqsPage` | faqs sections | header 2, footer 2 |
| `/contact` Contact | `Contact1Page` | contact-1 sections | header 2, footer 2 |
| `*` 404 | `NotFoundPage` | — | header 2, footer 2 |

**Hero swap detail:** the user wants the home to be **Index 2** layout BUT with the **Hero from Index 7**. Implementation:
- Copy `shared/sections/index-7/Section1.tsx` → keep it
- In `pages/HomePage.tsx`, import the Index 7 hero as the first section and the rest from `index-2`
- Keep both `shared/sections/index-2/Section1.tsx` (in case we want to swap back) OR delete it

**Light/dark mode:** the template uses `data-bs-theme="light"` on `<html>` and a `theme-init.js` script. User wants both modes available. Keep `ThemeSwitcher.tsx` and `theme-init.js` as-is.

### Files to DELETE in Paso 1

```
src/pages/
  About1Page.tsx, About2Page.tsx, About3Page.tsx
  Archive1Page.tsx ... Archive4Page.tsx
  BlogDetailsPage.tsx
  ComingSoonPage.tsx
  Contact2Page.tsx
  Home1Page.tsx, Home3Page.tsx ... Home15Page.tsx  (keep only Home2Page → renamed HomePage)
  Portfolio1Page.tsx, Portfolio2Page.tsx, Portfolio4Page.tsx, Portfolio5Page.tsx, Portfolio6Page.tsx
  PortfolioCinemaPage.tsx, PortfolioCurtainPage.tsx
  PortfolioDetails1..6Page.tsx
  PortfolioHorizontalPage.tsx, PortfolioSplitPage.tsx, PortfolioStackPage.tsx, PortfolioVistaPage.tsx, PortfolioZstackPage.tsx
  ProductArchivePage.tsx, ProductCartPage.tsx, ProductCheckoutPage.tsx, ProductDetailsPage.tsx
  Services2Page.tsx, Services3Page.tsx, ServicesDetailsPage.tsx
  TeamPage.tsx, TeamDetailsPage.tsx

src/shared/sections/
  about-1/, about-2/, about-3/         (BUT see WARNING below)
  archive-1/ ... archive-4/
  blog-details/
  coming-soon/
  contact-2/
  index-1/, index-3/ ... index-6/, index-8/ ... index-15/  (keep index-2 and index-7)
  portfolio-1/, portfolio-2/, portfolio-4/, portfolio-5/, portfolio-6/
  portfolio-details-1/ ... portfolio-details-6/
  portfolio-cinema/, portfolio-curtain/, portfolio-horizontal/, portfolio-split/, portfolio-stack/, portfolio-vista/, portfolio-zstack/
  product/, product-cart/, product-checkout/, product-details/
  services-2/, services-3/, services-details/  (BUT see WARNING below)
  team/, team-details/

src/shared/header/
  Header1.tsx, Header3..15.tsx  (keep Header2)

src/shared/footer/
  Footer1.tsx, Footer3..15.tsx  (keep Footer2)
```

**⚠ WARNING — cross-section dependencies:**
- `PricingPage.tsx` imports from `index-2/Section12`, `services-details/Section4`, `about-3/Section7`. So we **cannot fully delete** `services-details/` and `about-3/`. Need to keep ONLY those two cross-referenced sections.
- `Home2Page.tsx` may import from sections outside `index-2/`. Audit before deleting.
- Same audit for `Contact1Page`, `FaqsPage`, `Services1Page`, `Portfolio3Page`.

**Audit step (before deletion):** grep each kept page's imports and the imports of its imported sections recursively. Build a "keep set" and delete only what's NOT in the keep set.

---

## 4. Execution order

### Stage A — Setup & safety (no code touched)

1. ✅ User approves this plan.
2. Update `.planning/ROADMAP.md` and `REQUIREMENTS.md` to reflect new v1.3 scope (three-module reorg replaces public funnel phases).
3. Confirm we're on `feature/phase-28-landing-redesign` branch (we are). Decide: continue on this branch or create new `feature/v1.3-three-module-reorg`. **Recommended:** new branch since this is a bigger pivot.
4. Inspect mystery folders (`seed/`) before deletion.

### Stage B — Landing module (Paso 1: adapt template)

5. Copy template into `landing/`:
   - Source: `orisa-creative-agency-portfolio-react-template-.../Orisa-react-v3.0.0-unzip-first/1.Orisa-reactjs/`
   - Dest: `landing/`
6. `cd landing && npm install` — verify it builds and runs as-is on port 5173.
7. Build the "keep set" by auditing imports for each kept page.
8. Purge unused pages, sections, headers, footers (only delete files NOT in keep set).
9. Update `App.tsx`:
   - Reduce to 7 routes (`/`, `/catalog`, `/services`, `/pricing`, `/faq`, `/contact`, `*`)
   - Replace `Home2Page` → `HomePage` (also rename file)
   - Replace `Portfolio3Page` → `CatalogPage` (also rename)
   - Replace `Services1Page` → `ServicesPage`
   - Replace `Contact1Page` → `ContactPage`
   - All use `headerStyle={2} footerStyle={2}`.
10. Swap Hero: in `HomePage.tsx`, replace `<Section1 />` (index-2) with `<Section1 from "index-7" />`.
11. Add 3 cross-module link buttons in header / nav:
    - "Log in" → `/login` (resolves to `aideas.ca/login` in prod, `localhost:3000/login` in dev)
    - "Sign up" → `/signup`
    - "Dashboard" → `/dashboard` (only shown if cookie indicates logged-in; v1 just hardcoded link)
12. Verify `npm run build` succeeds with no broken imports.
13. **Do NOT replace the demo copy yet** — that's a separate "content swap" pass after structure is locked.

### Stage C — Design tokens (Pasos 2-3)

14. Read `landing/public/assets/css/main.css` `:root { --at-* }` block. Extract:
    - All `--at-neutral-*` (light + dark)
    - `--at-theme-primary`, `--at-grey-*`
    - `--at-ff-body`, `--at-ff-heading`
    - `--at-fz-*` font sizes
    - Bootstrap breakpoints (sm 576, md 768, lg 992, xl 1200, xxl 1400)
    - Border-radius (Bootstrap default + `rounded-3` = 12px)
    - Shadows (`--tc-shadow-1` from docs)
15. Write `landing/tokens.json` with sections:
    ```json
    {
      "colors": { "primary": "#F0460E", "neutral": {...}, "dark-neutral": {...}, "system": {...} },
      "typography": { "families": {...}, "sizes": {...}, "weights": {...} },
      "spacing": { "scale": [...] },
      "radius": {...},
      "shadows": {...},
      "breakpoints": {...}
    }
    ```
16. Copy `landing/tokens.json` → `web/tokens.json`.
17. Update `web/tailwind.config.ts` to consume `tokens.json`:
    - `theme.extend.colors.primary` from tokens
    - `theme.extend.fontFamily` from tokens
    - `theme.extend.borderRadius` from tokens
    - keep existing OKLCH dark mode untouched for now (dashboard reskin is a future phase)

### Stage D — Backend (Paso 4)

18. Restructure `api/src/routes/`:
    ```
    routes/
      __init__.py
      health.py                 ← unchanged
      public/
        __init__.py
        contact.py              ← POST /api/public/contact (landing contact form)
        waitlist.py             ← POST /api/public/waitlist (landing signup)
      client/
        __init__.py
        (move existing auth + dashboard routes here)
      admin/
        __init__.py
        (move existing admin routes here)
    ```
19. Add a global `Depends` for auth on `client/` and `admin/` routers.
20. Update CORS in `main.py`:
    ```python
    allow_origins=[
      "http://localhost:5173",        # landing dev
      "http://localhost:3000",        # web dev
      "https://aideas.ca",            # landing prod
      "https://app.aideas.ca",        # if web uses subdomain (TBD)
    ]
    ```
21. Add `landing/.env.example` and `web/.env.example` with `VITE_API_URL` / `NEXT_PUBLIC_API_URL`.

### Stage E — Wire-up and validation

22. Update `web/src/app/page.tsx` so the root redirect for unauth users goes to the landing URL (env-driven: `process.env.NEXT_PUBLIC_LANDING_URL`).
23. Delete `web/public/landing/` static files.
24. Delete `web/src/components/landing/` Next.js stubs.
25. Delete the raw Orisa template folder from repo root.
26. Add `README.md` to each module (`landing/`, `web/`, `api/`).
27. Update root `README.md` and `CLAUDE.md` to document the three-module architecture.
28. Run all three locally side-by-side: `npm run dev` in landing/, `npm run dev` in web/, `uvicorn` in api/. Verify nav links work end-to-end.
29. Commit per stage with atomic commits (`feat(reorg-A1): ...`, `feat(reorg-B5): ...`, etc.).

---

## 5. Risks and decisions to validate

### Decisions needed from user

1. **Branch strategy.** Current branch is `feature/phase-28-landing-redesign`. This pivot is much bigger than phase 28. **Recommend:** create new `feature/v1.3-three-module-reorg` from `main` and abandon the phase 28 branch (it had no useful commits beyond the descart of phase 28 in roadmap, which is already on main).

2. **Deploy URLs.** The user said "aideas.ca/login, /dashboard" — implying landing and web share the same domain. That's only possible with:
   - **Option A:** Vercel rewrites: deploy landing at `aideas.ca`, web at `app.aideas.ca`, and add rewrites at the edge so `/login` and `/dashboard` proxy from landing to web. Complicated.
   - **Option B:** Single Vercel project with reverse proxy from landing's `vite.config.ts` → web's Next.js, OR vice versa. Even more complicated.
   - **Option C (recommended):** landing at `aideas.ca`, web at `app.aideas.ca`. Link buttons on landing point to `app.aideas.ca/login`. This is the standard split that everyone (Linear, Vercel, Stripe) uses. The "aideas.ca/login" experience requires either A or B which adds infrastructure debt.

   **Need user input.** I'll default to C if no answer.

3. **Existing tech debt in `api/`.** The current `api/` is barely populated (just auth + health). Moving the few existing endpoints to `client/` namespace is trivial. But: does `api/` actually have business-logic endpoints today, or is the Next.js `web/` calling Supabase directly via server components? **Need to verify.** If the latter, "FastAPI is the only one touching Supabase" requires migrating ~30 existing data-fetching server components, which is a separate large effort outside this reorg.

   **Recommend:** keep `web/` Supabase server-component calls for now (they work, RLS-protected). Document the rule "all NEW data access from now on goes through `api/`" as the going-forward standard, and migrate the existing calls in a future dedicated phase.

4. **What to do with `.planning/phases/25-XX` through `34-XX`.** v1.3 was scoped as 10 phases (25-34). This reorg replaces phases 28-34 entirely. Phases 25-27 (design system, catalog data model, scenario seed) ARE complete and their work stays. **Recommend:** archive phases 28-34 into `.planning/milestones/v1.3-original-archive/` and create new phases reflecting the reorg (e.g., 28: landing module, 29: tokens, 30: api restructure, 31: wire-up).

### Technical risks

5. **Bootstrap CSS bleed.** Loading `bootstrap.min.css` in landing/ only affects landing/. But if we ever decide to embed a landing component inside web/, Bootstrap utilities would clash with Tailwind. **Mitigation:** never share components between landing and web; only share tokens.

6. **Two `tokens.json` files drifting apart.** Manual copy is error-prone. **Mitigation:** add a `scripts/sync-tokens.js` at repo root that copies `landing/tokens.json` → `web/tokens.json`, and a CI check that fails if they differ.

7. **Orisa template uses GSAP, Swiper, Isotope, WOW.js.** Heavy bundle. Should be fine for a marketing site but worth noting. Vite tree-shakes unused exports.

8. **GSAP is a paid library at scale.** Orisa ships with the free version which is fine for static animations. Verify license terms in the template's `source-and-credits.html`.

9. **`Footer2` is special.** It's a "floating footer" (sticky/parallax). MainLayout.tsx has special handling. Keep this in mind during purge — don't accidentally remove the floating-footer logic.

10. **`Section1` of Index 7 hero may depend on assets/effects unique to index-7.** Audit before swapping into HomePage to ensure all imported CSS classes, images, and effects come along. Specifically: WebGL canvas, sliders, video backgrounds — verify Section1 of index-7 is self-contained.

### Open questions

11. **Pricing source data.** Pricing page uses 3 cross-section imports. Are we OK keeping the demo prices ($29, $49, $99 or whatever) until we plug in real pricing? Or should the pricing copy be replaced as part of Stage B?

12. **Catalog data wiring.** `Portfolio3Page` will become `/catalog`. The original shows hardcoded portfolio items. Eventually we want it to display the 50 scenarios from Supabase (`functional_areas` + `scenarios` tables seeded in phases 26-27). **Recommend:** Stage B leaves it with hardcoded demo content; a separate phase wires it to the API once `api/public/catalog` endpoint exists.

13. **i18n.** Orisa is English-only. AIDEAS is bilingual (EN/ES). **Recommend:** Stage B ships English-only; bilingual is a follow-up phase.

---

## 6. Definition of done for this plan

This reorg is done when:

- [ ] Three folders exist at root: `landing/`, `web/`, `api/` — each with its own README.
- [ ] `landing/` builds (`npm run build`) and runs (`npm run dev` on :5173) with only 6 routes + 404.
- [ ] `web/` continues to build and serve the dashboard unchanged.
- [ ] `api/` runs with the 3-namespace structure (`public/`, `client/`, `admin/`) and CORS allowing both frontends.
- [ ] `landing/tokens.json` and `web/tokens.json` exist and match.
- [ ] `web/tailwind.config.ts` consumes `tokens.json`.
- [ ] Old `web/public/landing/` deleted; raw Orisa template folder deleted.
- [ ] Manual test: navigate `localhost:5173/` → click "Log in" → lands on `localhost:3000/login`. Navigate back. End-to-end works.
- [ ] `.planning/ROADMAP.md` reflects new structure.
- [ ] All staged file deletions reviewed before commit (no accidental loss of useful work).

---

## Next step

User reviews and tells me:
- Branch strategy (new branch yes/no?)
- Deploy URL strategy (A / B / C)
- `api/` migration scope (keep web/ supabase direct for now?)
- Phases 28-34 archive yes/no?

Then I execute Stage A. Each stage gets atomic commits and a summary.
