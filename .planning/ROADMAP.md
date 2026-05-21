# Roadmap: AIDEAS Customer Portal

## Milestones

- ✅ **v1.0 Backend Foundation + Auth** — Phases 1-6 (shipped 2026-04-08)
- ✅ **v1.1 Core Dashboard Experience** — Phases 7-15 (shipped 2026-05-04)
- ✅ **v1.2 Admin Dashboard** — Phases 16-24 (shipped 2026-05-14)
- 🚧 **v1.3 Public Funnel & Factory Reskin** — Phases 25-34 (in progress, started 2026-05-14)

## Phases

<details>
<summary>✅ v1.0 Backend Foundation + Auth (Phases 1-6) — SHIPPED 2026-04-08</summary>

- [x] Phase 1: API Foundation (2/2 plans) — completed 2026-03-05
- [x] Phase 2: Database Schema (3/3 plans) — completed 2026-03-06
- [x] Phase 3: Auth Integration (2/2 plans) — completed 2026-03-27
- [x] Phase 4: User Registration (4/4 plans) — completed 2026-03-31
- [x] Phase 5: User Login (2/2 plans) — completed 2026-03-31
- [x] Phase 6: Password Recovery & Email Verification (3/3 plans) — completed 2026-04-07

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 Core Dashboard Experience (Phases 7-15) — SHIPPED 2026-05-04</summary>

- [x] Phase 7: Schema & Seed Data (3/3 plans) — completed 2026-04-10
- [x] Phase 8: Dashboard Home & Notifications (5/5 plans) — completed 2026-04-13
- [x] Phase 9: My Automations (4/4 plans) — completed 2026-04-14
- [x] Phase 10: Catalog (3/3 plans) — completed 2026-04-14
- [x] Phase 11: Reports & Billing (3/3 plans) — completed 2026-04-15
- [x] Phase 12: Settings (5/5 plans) — completed 2026-04-29
- [x] Phase 13: Catalog Coverage Fix (1/1 plan) — completed 2026-04-30
- [x] Phase 14: i18n & Security Hygiene (2/2 plans) — completed 2026-04-30
- [x] Phase 15: Dashboard Home Polish (2/2 plans) — completed 2026-04-30

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

<details>
<summary>✅ v1.2 Admin Dashboard (Phases 16-24) — SHIPPED 2026-05-14</summary>

- [x] Phase 16: Carry-over Cleanup (3/3 plans) — completed 2026-05-04 (retroactively verified by Phase 24 on 2026-05-14)
- [x] Phase 17: Admin Foundation (3/3 plans) — completed 2026-05-05
- [x] Phase 18: Catalog Admin (3/3 plans) — completed 2026-05-06
- [x] Phase 19: Requests Inbox (3/3 plans) — completed 2026-05-07
- [x] Phase 20: Automations Admin (4/4 plans) — completed 2026-05-08
- [x] Phase 21: Clients Admin (3/3 plans) — completed 2026-05-08
- [x] Phase 22: Admin Home (2/2 plans) — completed 2026-05-13
- [x] Phase 23: Client 360 Cross-Link Fix (3/3 plans) — completed 2026-05-14
- [x] Phase 24: Phase 16 Retroactive Verification (1/1 plan) — completed 2026-05-14

Full details: [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)

</details>

### 🚧 v1.3 Three-Module Repo Reorganization (Phases 25-31)

**Goal:** Reorganize the repo into three independent paralel modules (`landing/` Vite + React + Bootstrap using the Orisa template, `web/` Next.js dashboard unchanged, `api/` FastAPI with public/client/admin namespaces). Replaces the abandoned SSR funnel approach.

**Pivoted:** 2026-05-21 from "Public Funnel & Factory Reskin" to "Three-Module Reorg". The original public-funnel scope (phases 28-34) and dashboard reskins are deferred — see `.planning/milestones/v1.3-original-archive/` for the original plan and `.planning/REORG-V2-PLAN.md` for the new execution plan.

**Depth:** 7 phases total. Phases 25-27 already complete. Phases 28-31 are the reorg itself.

**Domain split (locked 2026-05-21):**
- `aideas.ca` → landing module (public marketing, SEO)
- `app.aideas.ca` → web module (login, dashboards, admin)
- `api.aideas.ca` (or path on app) → FastAPI

**API strategy (locked 2026-05-21, see CLAUDE.md):** Hybrid pragmatic. Next.js Server Components continue to read Supabase directly for existing dashboard queries. FastAPI handles all NEW server-side logic (public forms, external webhooks, long-running jobs, secret-bearing integrations). "If in doubt, FastAPI."

- [x] **Phase 25: Design System Migration** — Replace OKLCH theme with Factory.ai tokens (light bg #eeeeee, cards #fafafa, Code Orange #ef6f2e accent, Geist Sans/Mono, 4px/6px radii, no shadows) (completed 2026-05-15)
- [x] **Phase 26: Catalog Data Model** — Add `functional_areas` + `scenarios` + `scenario_templates` schema with anonymous-read RLS, preserving current 66+ template back-compat (completed 2026-05-15)
- [x] **Phase 27: Scenario Content Seed** — Seed 50 client-language scenarios mapped to ~135 n8n templates across 8 functional areas with EN/ES pain copy and typical-impact estimates (completed 2026-05-19)
- [ ] **Phase 28: Landing Module** — Create top-level `landing/` (Vite + React + Bootstrap, Orisa template). Reduce template to 6 pages (Home from Index 2 + Hero from Index 7, Catalog from Portfolio 3, Services 1, Pricing, FAQ, Contact 1). Header 2 + Footer 2. Light/dark mode preserved.
- [ ] **Phase 29: Design Tokens Sync** — Extract `landing/tokens.json` from Orisa CSS variables (colors, typography, spacing, radius, shadows, breakpoints). Copy to `web/tokens.json`. Add `scripts/sync-tokens.js` + `scripts/check-tokens-sync.js` (CI guard). **Note:** dashboard does NOT consume tokens in this phase — that's a future reskin phase. tokens.json provides parity-for-tooling only.
- [ ] **Phase 30: API Restructure** — Reorganize `api/src/routes/` into 3 namespaces: `public/` (no auth, landing forms), `client/` (auth, customer dashboard), `admin/` (auth + platform_staff). Update CORS for both frontends. Document rule in CLAUDE.md: "all NEW data access goes through FastAPI; existing Supabase server components stay until they need to change."
- [ ] **Phase 31: Wire-up + Cleanup** — Update `web/src/app/page.tsx` to redirect unauth users to `process.env.NEXT_PUBLIC_LANDING_URL`. Delete `web/public/landing/` (old static HTML) and `web/src/components/landing/` stubs. Delete raw Orisa template folder. Add READMEs to each module. Update root `README.md` and `CLAUDE.md` for three-module architecture. Verify end-to-end: landing → click "Log in" → web `/login`.

**Deferred (post-reorg, separate milestone):** original Phase 28 (SSR funnel), Phase 32 (customer dashboard reskin), Phase 33 (admin dashboard reskin), Phase 34 (launch polish — analytics, SEO, OG, sitemap, Lighthouse). Archived in `.planning/milestones/v1.3-original-archive/README.md`.

## Phase Details

### Phase 25: Design System Migration
**Goal**: Replace the existing OKLCH dark-first theme with Factory.ai light-mode tokens so every component in the codebase consumes the new palette, typography, and radius scale.
**Depends on**: Nothing (foundation for all later phases)
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Opening any existing screen (dashboard, admin, auth) renders against Factory tokens (#eeeeee bg, #fafafa cards, #ef6f2e accent) with no broken contrast or layout regressions.
  2. Text on every page renders in Geist Sans (body) and Geist Mono (code/numbers) following the Factory spacing/sizing scale.
  3. Buttons, cards, and headers respect the new radius scale (4px / 6px / 0px), and no component carries shadows or gradients.
  4. Existing `.dark` class continues to produce a usable dark variant for every shadcn primitive (Button, Card, Input, Badge, Tabs).
**Plans**: 7 plans
- [ ] 25-01-PLAN.md — Rewrite globals.css with Factory tokens (light + dark, Geist character variants)
- [ ] 25-02-PLAN.md — Reskin existing primitives: button (rounded-sm), card (border + no shadow), input/form/label
- [ ] 25-03-PLAN.md — Scaffold new shadcn primitives: Badge + Tabs + Chart with Factory variants
- [ ] 25-04-PLAN.md — Brand-color sweep: purple/pink literals → --primary token across ~56 files; gradient + Recharts HEX cleanup
- [ ] 25-05-PLAN.md — Auth + legal pages reskin; admin login keeps intentional dark look via Factory dark-base HEX
- [ ] 25-06-PLAN.md — Cross-cutting layout shells (customer + admin sidebar/header) reskinned to sidebar tokens
- [ ] 25-07-PLAN.md — Manual UAT pass across ~26 routes × EN/ES × light/dark; UAT-blocking fix loop

### Phase 26: Catalog Data Model
**Goal**: Introduce the scenario-first catalog schema so the database can power both the public funnel and the admin tooling without losing existing template back-compat.
**Depends on**: Phase 25 (token churn lands first so seeding/admin UIs are reskinned in place)
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05
**Success Criteria** (what must be TRUE):
  1. `functional_areas`, `scenarios`, and `scenario_templates` tables exist with EN/ES labels, ordering, slugs, and `is_active` flags wired into Supabase migrations.
  2. Anonymous (unauthenticated) Supabase clients can SELECT from the three new tables; writes are blocked except for service role / platform_staff.
  3. Existing `automation_templates` rows still load correctly in the customer + admin catalog UIs after the migration (no breaking changes to industry/category fields).
  4. Running migrations against a fresh database produces a working schema where the new tables are joinable to `automation_templates` via the pivot.
**Plans**: 3 plans
- [ ] 26-01-PLAN.md — `functional_areas` migration (DDL + RLS + indexes + trigger; anon SELECT filtered to active rows)
- [ ] 26-02-PLAN.md — `scenarios` + `scenario_templates` pivot migration (DDL + RLS gated by parent active-ness + CASCADE FKs + smoke test)
- [x] 26-03-PLAN.md — Anon SELECT policy on `automation_templates` + Phase 26 holistic verification (db reset, 4-table join, build check) (completed 2026-05-15)

### Phase 27: Scenario Content Seed
**Goal**: Populate the new schema with 50 client-language scenarios across 8 functional areas, mapped to ~135 n8n templates, ready for the public funnel to consume.
**Depends on**: Phase 26
**Requirements**: SCEN-01, SCEN-02, SCEN-03, SCEN-04
**Success Criteria** (what must be TRUE):
  1. Querying `scenarios` returns 50 rows distributed across 8 functional areas, each with EN/ES pain copy.
  2. Querying `scenario_templates` returns ~135 mappings linking scenarios to existing `automation_templates`, with no orphaned scenarios.
  3. Each scenario carries a typical-impact estimate (hours/week or tasks/month) that the ROI calculator can read.
  4. `supabase db reset` (or equivalent re-seed) can be run repeatedly in dev without manual cleanup or duplicate-key errors.
**Plans**: 4 plans
- [x] 27-01-PLAN.md — Seed 8 functional_areas with idempotent ON CONFLICT migration (completed 2026-05-15)
- [x] 27-02-PLAN.md — Draft 50 bilingual scenarios + 150 template mappings (Patrick approved 2026-05-19; locked as source-of-truth for 27-03) (completed 2026-05-19)
- [x] 27-03-PLAN.md — Transform approved draft into idempotent scenarios + scenario_templates seed (completed 2026-05-19)
- [ ] 27-04-PLAN.md — Correct ROADMAP 7-to-8 areas + REQUIREMENTS sync + end-to-end phase verification

### Phase 28: Landing Module (Vite + Orisa template)
**Goal**: Spin up a new top-level `landing/` module using the Orisa React template, reduced to the 6 pages AIDEAS needs. Light + dark mode preserved.
**Depends on**: Phase 25 (tokens), Phase 27 (catalog data available — even if Phase 28 doesn't yet wire it, content must be compatible)
**Pages kept**:
  - `/` Home — Orisa **Index 2** layout BUT with the **Hero from Index 7** swapped as Section1
  - `/catalog` — Orisa **Portfolio 3** layout
  - `/services` — Orisa **Services 1** layout
  - `/pricing` — Orisa **PricingPage** layout (uses index-2/Section12, services-details/Section4, about-3/Section7)
  - `/faq` — Orisa **FaqsPage** layout
  - `/contact` — Orisa **Contact 1** layout
  - `*` 404 (NotFoundPage)
**Header/Footer**: style 2 for all routes. Light/dark via Orisa's `data-bs-theme` mechanism + `theme-init.js`.
**Success Criteria**:
  1. `cd landing && npm run dev` serves the 6 reduced routes on port 5173 with no console errors.
  2. `cd landing && npm run build` produces a clean dist/ with no unresolved imports.
  3. Light/dark toggle works on every page (via ThemeSwitcher).
  4. Every page renders without TypeScript errors and without broken images/CSS.
  5. All deleted pages, headers, footers, and sections are removed from disk; the remaining "keep set" was derived by an import audit (not guesswork).
  6. Nav links point to `app.aideas.ca/login`, `app.aideas.ca/signup`, `app.aideas.ca/dashboard` (env-driven for dev: `localhost:3000`).
**Plans**: TBD

### Phase 29: Design Tokens Sync
**Goal**: Extract design tokens from the Orisa template into `landing/tokens.json`, replicate to `web/tokens.json`, and document them as the single source of truth — without modifying the dashboard's existing CSS variables (the dashboard reskin is a separate future phase).
**Depends on**: Phase 28
**Tokens extracted** (sourced from `landing/public/assets/css/main.css` `:root` block):
  - Colors: theme-primary `#F0460E`, neutrals (light + dark scales), common (white/black/bubbles), grey (1-5), gradient.
  - Typography: families (DM Sans), font weights (light → black), display + body + heading size scales, line-heights.
  - Spacing scale (Bootstrap default rem-based).
  - Border-radius (Bootstrap defaults + `rounded-3` = 12px).
  - Shadows (single shadow `0px 20px 60px 0px rgba(0,0,0,0.08)`).
  - Breakpoints (Bootstrap: sm 576, md 768, lg 992, xl 1200, xxl 1400).
  - Motion (basic ease cubic-bezier, duration scale).
**Scope decision (2026-05-21):** dashboard does NOT consume `tokens.json` in this phase. The dashboard already has its own working Factory palette across 12 shipped phases; pisar that palette to import Orisa values would cause visual regressions across 12 customer sections and 5 admin sections. `tokens.json` is shipped for **tooling parity** — it exists so any future reskin phase has an authoritative target.
**Success Criteria**:
  1. `landing/tokens.json` exists with all token sections; values match the CSS variables in `landing/public/assets/css/main.css`.
  2. `web/tokens.json` is byte-identical to `landing/tokens.json`.
  3. `scripts/sync-tokens.js` copies landing → web; `scripts/check-tokens-sync.js` exits 1 on drift (suitable for CI).
  4. `web/src/app/globals.css` has a header comment documenting the token-sync arrangement so future contributors understand why the file exists but isn't consumed.
  5. `web/` still builds successfully (`npm run build` → no regressions).
**Plans**: TBD (this phase shipped without a discuss-phase, direct execution)

### Phase 30: API Restructure (3 namespaces + CORS)
**Goal**: Reorganize `api/src/routes/` into `public/`, `client/`, `admin/` so the FastAPI service has a clear contract for each audience. Update CORS to allow both frontends.
**Depends on**: Phase 28 (need both frontend URLs to set CORS).
**Structure**:
```
api/src/routes/
  __init__.py
  health.py
  public/
    __init__.py
    contact.py     # POST /api/public/contact (landing form)
    waitlist.py    # POST /api/public/waitlist
  client/
    __init__.py
    (existing auth routes moved here; future endpoints land here)
  admin/
    __init__.py
    (future admin endpoints)
```
**Success Criteria**:
  1. The 3-namespace structure exists; existing endpoints still respond at the same external paths (no breaking change for `web/`).
  2. `client/` and `admin/` routers attach an auth dependency; `public/` does not.
  3. CORS allows `http://localhost:5173`, `http://localhost:3000`, `https://aideas.ca`, `https://app.aideas.ca`.
  4. CLAUDE.md documents the rule: "all NEW server-side logic goes through FastAPI; existing Next.js Server Components reading Supabase stay until they need substantive change." (Hybrid pragmatic API strategy.)
  5. A smoke test POST to `/api/public/contact` from `landing/` succeeds (even if the body is a stub).
**Plans**: TBD

### Phase 31: Wire-up + Cleanup
**Goal**: Make the three modules visibly cooperate end-to-end and remove all leftover artifacts from the prior architecture.
**Depends on**: Phase 28, Phase 29, Phase 30.
**Tasks**:
  - Update `web/src/app/page.tsx`: unauthenticated visitors redirect to `process.env.NEXT_PUBLIC_LANDING_URL` (defaults to `http://localhost:5173` in dev, `https://aideas.ca` in prod).
  - Delete `web/public/landing/` (the old static HTML site).
  - Delete `web/src/components/landing/` (Next.js stubs that were never wired).
  - Delete the raw Orisa template folder (`orisa-creative-agency-portfolio-react-template-...`) once Phase 28 copied what it needed.
  - Create `landing/README.md`, `web/README.md`, `api/README.md` each describing: purpose, dev command, deploy target, env vars.
  - Update root `README.md` and `CLAUDE.md` to document the three-module layout, the hybrid API rule, and the deploy URLs.
**Success Criteria**:
  1. Manual smoke test: run all 3 services locally (`landing` :5173, `web` :3000, `api` :8000). Visit `localhost:5173` → click "Log in" → land on `localhost:3000/login`. Then unauthenticated visit to `localhost:3000` → redirect to `localhost:5173`.
  2. `git status` is clean after the deletions; no orphaned imports anywhere.
  3. `npm run build` works in `landing/` and `web/`; FastAPI starts without import errors.
  4. Repo root has no leftover artifacts (no raw Orisa folder, no `seed` file, no `web/public/landing/`).
  5. The three READMEs exist and accurately describe how to run each module.
**Plans**: TBD

### Deferred (not in this reorg)

- **Original Phase 28 (SSR funnel)** — Cancelled 2026-05-20. Drafts archived in `.planning/milestones/v1.3-original-archive/`.
- **Original Phase 32 (Customer Dashboard Reskin)** — Deferred. The dashboard keeps its current OKLCH theme until a future explicit reskin phase.
- **Original Phase 33 (Admin Dashboard Reskin + admin EN/ES + dark mode toggle)** — Deferred.
- **Original Phase 34 (Launch Polish — Vercel Analytics, sitemap, OG, Lighthouse ≥ 90)** — Deferred to a post-reorg polish milestone.

These are not lost — see `.planning/milestones/v1.3-original-archive/README.md`.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 25. Design System Migration | 7/7 | Complete    | 2026-05-15 |
| 26. Catalog Data Model | 3/3 | Complete    | 2026-05-15 |
| 27. Scenario Content Seed | 4/4 | Complete    | 2026-05-19 |
| 28. Landing Module (Orisa) | 0/? | Not started | — |
| 29. Design Tokens Sync | 0/? | Not started | — |
| 30. API Restructure | 0/? | Not started | — |
| 31. Wire-up + Cleanup | 0/? | Not started | — |

## Dependency Graph

```
Phase 25 (Design System) ─┐
Phase 26 (Catalog Data) ──┼─► Phase 28 (Landing Module)
Phase 27 (Scenario Seed) ─┘         │
                                     ├─► Phase 29 (Design Tokens Sync)
                                     │         │
                                     │         └─► Phase 30 (API Restructure)
                                     │                   │
                                     └─────────────────► Phase 31 (Wire-up + Cleanup)
```

Critical path: 25/26/27 (done) → 28 → 29 → 30 → 31 (4 sequential reorg phases).
Old phases 28-34 (SSR funnel + reskins + polish) — archived as historical reference; replaced by the 4 reorg phases above.

## Coverage Summary

**Re-scoped 2026-05-21.** The original v1.3 requirements list (58 total: DESIGN-XX, CAT-XX, SCEN-XX, LAND-XX, PUBCAT-XX, ROI-XX, LEAD-XX, RESKIN-XX, OPS-XX) targeted phases 25-34. After the reorg pivot:

- **Completed and stays on main (14 reqs):** DESIGN-01..05, CAT-01..05, SCEN-01..04 — fully satisfied by phases 25-27.
- **Deferred to post-reorg milestones (35 reqs):** PUBCAT-01..06, ROI-01..06, LEAD-01..07, RESKIN-01..09, OPS-01..05 — re-homed when the public-funnel and reskin work is resumed.
- **Descarted (9 reqs):** LAND-01..LAND-09 — superseded by Phase 28 (Orisa landing module) which doesn't follow the SSR-route requirement format.

**New v1.3 reorg requirements (to be authored as phases 28-31 are planned):**
- REORG-01..N (Phase 28: Landing module structure & routing)
- REORG-XX (Phase 29: Tokens sync)
- REORG-XX (Phase 30: API namespaces)
- REORG-XX (Phase 31: Wire-up & cleanup)

REQUIREMENTS.md will be updated as each new phase is planned (`/gsd:discuss-phase` / `/gsd:plan-phase`).
