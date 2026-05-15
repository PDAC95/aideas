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

### 🚧 v1.3 Public Funnel & Factory Reskin (Phases 25-34)

**Goal:** Convert the login-gated catalog into a public lead-generation funnel — SSR/SEO, anonymous browsing, scenario-based ROI calculator, email + pre-call form capture — and reskin both dashboards with the Factory.ai design system.

**Depth:** standard (10 phases) — matches natural delivery boundaries between data model, public surfaces, lead funnel, and reskins.

- [x] **Phase 25: Design System Migration** — Replace OKLCH theme with Factory.ai tokens (light bg #eeeeee, cards #fafafa, Code Orange #ef6f2e accent, Geist Sans/Mono, 4px/6px radii, no shadows) (completed 2026-05-15)
- [x] **Phase 26: Catalog Data Model** — Add `functional_areas` + `scenarios` + `scenario_templates` schema with anonymous-read RLS, preserving current 66+ template back-compat (completed 2026-05-15)
- [ ] **Phase 27: Scenario Content Seed** — Seed 50 client-language scenarios mapped to ~135 n8n templates across 7 functional areas with EN/ES pain copy and typical-impact estimates
- [ ] **Phase 28: Public Landing Page** — SSR `/` route with Hero, Working Process, Services, Pricing, FAQ, CTA sections, SEO essentials, and EN/ES parity
- [ ] **Phase 29: Public Catalog Navigation** — SSR `/catalog` with functional-area landing pages, scenario detail pages, cross-linking, and SEO essentials
- [ ] **Phase 30: Scenario Selector + ROI Calculator** — Multi-select UI, persistent selection state, plan view with hours-saved aggregation and CAD employee-cost equivalent
- [ ] **Phase 31: Lead Capture Flow** — Email gate at peak intent, transactional plan email, pre-call context form (4-5 structured questions), `leads` table, reCAPTCHA spam protection, `/admin/leads` surface
- [ ] **Phase 32: Reskin Customer Dashboard** — Apply Factory tokens across all 7 customer-side sections without regression in EN/ES, light/dark, mobile/desktop
- [ ] **Phase 33: Reskin Admin Dashboard** — Apply Factory tokens across all 5 admin surfaces + AdminLayout/Sidebar/Header; close v1.2 carry-over by shipping admin language switcher + dark-mode toggle
- [ ] **Phase 34: Launch Polish** — Analytics wiring, sitemap/robots, OG/Twitter cards, Lighthouse ≥ 90, lint debt triage

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
**Goal**: Populate the new schema with 50 client-language scenarios across 7 functional areas, mapped to ~135 n8n templates, ready for the public funnel to consume.
**Depends on**: Phase 26
**Requirements**: SCEN-01, SCEN-02, SCEN-03, SCEN-04
**Success Criteria** (what must be TRUE):
  1. Querying `scenarios` returns 50 rows distributed across 7 functional areas, each with EN/ES pain copy.
  2. Querying `scenario_templates` returns ~135 mappings linking scenarios to existing `automation_templates`, with no orphaned scenarios.
  3. Each scenario carries a typical-impact estimate (hours/week or tasks/month) that the ROI calculator can read.
  4. `supabase db reset` (or equivalent re-seed) can be run repeatedly in dev without manual cleanup or duplicate-key errors.
**Plans**: 4 plans
- [ ] 27-01-PLAN.md — Seed 8 functional_areas with idempotent ON CONFLICT migration
- [ ] 27-02-PLAN.md — Draft 50 bilingual scenarios + ~135 template mappings (Patrick review checkpoint)
- [ ] 27-03-PLAN.md — Transform approved draft into idempotent scenarios + scenario_templates seed migration
- [ ] 27-04-PLAN.md — Correct ROADMAP 7-to-8 areas + REQUIREMENTS sync + end-to-end phase verification

### Phase 28: Public Landing Page
**Goal**: Ship a public, SSR-rendered landing page at `/` that introduces AIDEAS to anonymous Ontario SMB visitors and routes them into the catalog funnel.
**Depends on**: Phase 25
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07, LAND-08, LAND-09
**Success Criteria** (what must be TRUE):
  1. Visiting `/` while logged-out renders a server-rendered landing page (no client-side flash, no login redirect) with all 6 sections (Hero, Working Process, Services, Pricing, FAQ, CTA).
  2. Clicking the primary Hero CTA ("Ver qué puedo automatizar") routes the visitor to `/catalog`.
  3. View-source on `/` shows complete meta tags, Open Graph image, structured data, and a sitemap entry; layout is mobile-responsive at 360px width.
  4. Switching the locale cookie between `en` and `es` swaps all landing copy via next-intl with zero hardcoded strings.
**Plans**: TBD

### Phase 29: Public Catalog Navigation
**Goal**: Ship the public, SSR-rendered scenario catalog so anonymous visitors can browse the 8 functional areas and individual scenarios with full SEO support.
**Depends on**: Phase 27, Phase 28
**Requirements**: PUBCAT-01, PUBCAT-02, PUBCAT-03, PUBCAT-04, PUBCAT-05, PUBCAT-06
**Success Criteria** (what must be TRUE):
  1. Visiting `/catalog` while logged-out renders an SSR page listing all 8 functional areas, each with a pain-language headline and link into its area page.
  2. Visiting a functional-area page (e.g. `/catalog/marketing`) lists every scenario in that area, and each scenario detail page shows mapped n8n templates and the typical-impact estimate.
  3. Every catalog page exposes a unique title, meta description, canonical URL, and appears in the generated sitemap.
  4. Locale switching swaps every catalog string (areas, scenarios, headlines) without leaving English text in Spanish mode or vice-versa.
**Plans**: TBD

### Phase 30: Scenario Selector + ROI Calculator
**Goal**: Let anonymous visitors select the scenarios that match their pain and see a personalized plan view with a CAD employee-cost equivalent.
**Depends on**: Phase 29
**Requirements**: ROI-01, ROI-02, ROI-03, ROI-04, ROI-05, ROI-06
**Success Criteria** (what must be TRUE):
  1. A visitor can tick checkboxes next to scenarios across multiple area pages and the selection persists as they navigate the catalog (cookie or localStorage, no auth required).
  2. Clicking "See my plan" produces a plan view that lists every selected scenario and shows a total estimated hours/week saved.
  3. The plan view converts hours saved into a CAD employee-cost equivalent (anchored to ~$60-80K/yr, editable on the page).
  4. Copying the plan-view URL and opening it in a fresh browser session reproduces the same plan (selection encoded in the URL).
**Plans**: TBD

### Phase 31: Lead Capture Flow
**Goal**: Convert plan-view intent into enriched, admin-visible leads via an email gate plus a structured pre-call form (not a chat).
**Depends on**: Phase 30
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07
**Success Criteria** (what must be TRUE):
  1. After seeing their ROI, a visitor sees an email gate that captures email + locale + selected scenarios and, on submit, receives a transactional email (Resend) containing the plan and a schedule-call CTA.
  2. Clicking the email CTA lands the visitor on a pre-call form with 4-5 structured questions (company size, role, current pain, deadline, budget range); submitting persists an enriched lead row with email + plan + answers + UTM.
  3. Both the email gate and pre-call form reject submissions when reCAPTCHA v3 fails (with the existing dev-bypass pattern when keys are absent).
  4. A platform_staff user can open `/admin/leads`, see the new lead in a list, view its detail (scenarios + form answers), and use a "convert to org" affordance to provision a manual customer record.
**Plans**: TBD

### Phase 32: Reskin Customer Dashboard
**Goal**: Apply Factory tokens across every customer-side surface so the post-login experience visually matches the new public funnel.
**Depends on**: Phase 25
**Requirements**: RESKIN-01, RESKIN-02, RESKIN-03, RESKIN-04
**Success Criteria** (what must be TRUE):
  1. Each of the 7 customer-side sections (Home, Automations, Catalog, Reports, Billing, Settings, Notifications) renders against Factory tokens with no broken layouts, contrast issues, or color regressions.
  2. KPI cards, Recharts visualizations, tables, forms, and modals all render correctly in both EN and ES.
  3. Mobile (≤640px) and desktop (≥1280px) snapshots of every customer section match expectations, with no overflow or stacking regressions.
  4. Toggling `.dark` on the customer dashboard still produces a usable dark variant under the new palette.
**Plans**: TBD

### Phase 33: Reskin Admin Dashboard
**Goal**: Apply Factory tokens across every admin surface, close the v1.2 carry-over by adding the language switcher and dark-mode toggle to the admin header, and unblock I18N runtime UAT on admin.
**Depends on**: Phase 25, Phase 32 (shared primitives stable before admin reskin)
**Requirements**: RESKIN-05, RESKIN-06, RESKIN-07, RESKIN-08, RESKIN-09
**Success Criteria** (what must be TRUE):
  1. AdminLayout, AdminSidebar, AdminHeader, and all 5 admin surfaces (Home, Catalog, Requests, Automations, Clients) render against Factory tokens with no regressions.
  2. The "ADMIN" badge remains visually distinct (Code Orange) while harmonizing with the new neutral palette.
  3. A platform_staff user can toggle EN↔ES from the AdminHeader and see every admin surface re-render in the chosen language without losing route or filters.
  4. A platform_staff user can toggle light↔dark from the AdminHeader and see admin components render correctly under both palettes.
**Plans**: TBD

### Phase 34: Launch Polish
**Goal**: Make the v1.3 funnel production-launch ready — analytics, SEO surface area, and lint debt triage.
**Depends on**: Phase 28, Phase 29, Phase 31 (all public surfaces shipped)
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05
**Success Criteria** (what must be TRUE):
  1. Vercel Analytics is wired on every public page and custom events fire for the catalog → plan → email gate → pre-call form funnel (visible in the analytics dashboard).
  2. `/sitemap.xml` and `/robots.txt` are served by the app and the sitemap enumerates every public catalog and scenario route.
  3. View-source on landing and every scenario page exposes complete Open Graph + Twitter card metadata.
  4. A Lighthouse run against a production build of `/` and `/catalog` returns ≥ 90 for performance, accessibility, and SEO; no new lint errors have been introduced relative to the start of v1.3.
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 25. Design System Migration | 7/7 | Complete    | 2026-05-15 |
| 26. Catalog Data Model | 3/3 | Complete    | 2026-05-15 |
| 27. Scenario Content Seed | 1/4 | In Progress|  |
| 28. Public Landing Page | 0/? | Not started | - |
| 29. Public Catalog Navigation | 0/? | Not started | - |
| 30. Scenario Selector + ROI Calculator | 0/? | Not started | - |
| 31. Lead Capture Flow | 0/? | Not started | - |
| 32. Reskin Customer Dashboard | 0/? | Not started | - |
| 33. Reskin Admin Dashboard | 0/? | Not started | - |
| 34. Launch Polish | 0/? | Not started | - |

## Dependency Graph

```
Phase 25 (Design System)
   ├── Phase 26 (Catalog Data Model)
   │      └── Phase 27 (Scenario Seed)
   │             └── Phase 29 (Public Catalog) ← Phase 28 (Landing)
   │                    └── Phase 30 (Selector + ROI)
   │                           └── Phase 31 (Lead Capture)
   │                                  └── Phase 34 (Launch Polish)
   ├── Phase 28 (Landing) ──────────────────────┘
   ├── Phase 32 (Reskin Customer)
   └── Phase 33 (Reskin Admin) ← Phase 32
```

Critical path: 25 → 26 → 27 → 29 → 30 → 31 → 34 (7 sequential phases).
Parallelizable: Phase 28 can run alongside 26+27; Phase 32 can run alongside 26-31; Phase 33 must wait on 32 for shared primitives.

## Coverage Summary

- **v1.3 requirements:** 58 total
- **Mapped to phases:** 58 (100%) ✓
- **Orphaned requirements:** 0 ✓
- **Duplicate mappings:** 0 ✓
