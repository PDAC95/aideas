# Requirements: AIDEAS v1.3 — Public Funnel & Factory Reskin

**Defined:** 2026-05-14
**Core Value:** Customers can monitor their automations' performance, request new ones, and see the ROI of their subscription — all from a single bilingual dashboard.
**Milestone goal:** Convert the login-gated catalog into a public lead-generation funnel (SSR/SEO, anonymous browsing, ROI calculator, email + pre-call form capture) and reskin both dashboards with the Factory.ai design system.

---

## v1.3 Requirements

Requirements for the Public Funnel & Factory Reskin milestone. Each maps to exactly one roadmap phase (phases 25–34).

### Design System Migration (Factory.ai tokens)

- [x] **DESIGN-01**: Replace OKLCH theme with Factory.ai token set in `globals.css` (light-mode default: #eeeeee bg, #fafafa cards, #ef6f2e Code Orange accent)
- [x] **DESIGN-02**: Typography system uses Geist Sans + Geist Mono with Factory spacing/sizing scale
- [x] **DESIGN-03**: Border-radius normalization (4px buttons, 6px cards, 0px headers); no shadows, no gradients across components
- [x] **DESIGN-04**: Update shadcn primitives (Button, Card, Input, Badge, Tabs) to consume new tokens with zero regressions on existing screens
- [x] **DESIGN-05**: Optional dark-mode tokens defined for the new palette so the existing `.dark` class continues to work without visual breakage

### Catalog Data Model (Functional areas + Scenarios)

- [x] **CAT-01**: Migration adds `functional_areas` table (8 areas: Ventas, Marketing, Atención al Cliente, Documentos, Productividad, Reportes, Agentes IA, Integraciones & Seguridad) with EN/ES labels and ordering
- [x] **CAT-02**: Migration adds `scenarios` table with pain-language EN/ES copy, functional_area_id FK, slug, ordering, and `is_active` flag
- [x] **CAT-03**: Migration adds `scenario_templates` pivot table linking scenarios to existing `automation_templates`
- [x] **CAT-04**: RLS policies allow anonymous read on functional_areas, scenarios, and scenario_templates (public surfaces)
- [x] **CAT-05**: Existing 66+ `automation_templates` keep their industry/category fields for back-compat (dashboards still render), no destructive migration

### Scenario Content Seed

- [x] **SCEN-01**: Seed 50 client-language scenarios across 7 functional areas with EN/ES pain copy
- [x] **SCEN-02**: Map ~135 n8n templates (from awesome-n8n-templates + custom) to scenarios via `scenario_templates`
- [x] **SCEN-03**: Each scenario carries a typical-impact estimate (hours/week or tasks/month) used by the ROI calculator
- [x] **SCEN-04**: Seed re-runnable / idempotent so dev environments can re-seed without manual cleanup

### Public Landing Page

- [ ] **LAND-01**: Public route `/` serves SSR landing page (no login gate) — replaces current root redirect for unauthenticated users
- [ ] **LAND-02**: Hero section with main value prop, primary CTA "Ver qué puedo automatizar" → `/catalog`
- [ ] **LAND-03**: Working Process section (how AIDEAS delivers as managed service)
- [ ] **LAND-04**: Services / functional areas overview section with link into catalog
- [ ] **LAND-05**: Pricing transparency section (setup fee + monthly, cancel anytime, no DIY)
- [ ] **LAND-06**: FAQ section addressing common Ontario SMB-owner objections
- [ ] **LAND-07**: Final CTA section pointing into the funnel
- [ ] **LAND-08**: SEO essentials — meta tags, Open Graph image, structured data, sitemap entry, mobile-responsive
- [ ] **LAND-09**: EN/ES parity on all landing copy via next-intl

### Public Catalog Navigation

- [ ] **PUBCAT-01**: Public route `/catalog` serves SSR catalog (no login gate) listing the 8 functional areas
- [ ] **PUBCAT-02**: Functional-area landing pages list scenarios within that area, with pain-language headlines
- [ ] **PUBCAT-03**: Scenario detail page shows mapped n8n templates and typical-impact estimate
- [ ] **PUBCAT-04**: Internal cross-linking between scenarios and back-link to area / catalog root
- [ ] **PUBCAT-05**: SEO essentials on every catalog page (titles, descriptions, canonical, sitemap)
- [ ] **PUBCAT-06**: EN/ES parity on all catalog copy

### Scenario Selector + ROI Calculator

- [ ] **ROI-01**: Multi-select checkbox UI on `/catalog` (or scenario list) lets anonymous visitors mark scenarios that apply
- [ ] **ROI-02**: Selection state persists across catalog navigation (cookie / localStorage, no auth required)
- [ ] **ROI-03**: "See my plan" CTA aggregates selected scenarios into a personalized plan view
- [ ] **ROI-04**: Plan view shows total estimated hours/week saved across selected scenarios
- [ ] **ROI-05**: ROI calculator converts hours saved → CAD employee-cost equivalent (anchored to ~$60–80K/yr benchmark, editable)
- [ ] **ROI-06**: Plan view is SSR-friendly and shareable via URL (selection encoded in query string or signed token)

### Lead Capture Flow

- [ ] **LEAD-01**: Email gate appears on the plan view at peak intent (after ROI is shown), captures email + locale + selected scenarios
- [ ] **LEAD-02**: Submission triggers a transactional email (Resend) with the plan summary + schedule-call CTA
- [ ] **LEAD-03**: Email CTA links to a pre-call context form (4–5 structured questions: company size, role, current pain, deadline, budget range — NOT a chat)
- [ ] **LEAD-04**: Pre-call form submission writes an enriched lead record (email + plan + form answers + UTM) into the database
- [ ] **LEAD-05**: Schema migration adds a `leads` (or equivalent) table with RLS so only platform_staff can read; anonymous insert path is allowed via a server action / API route, not direct DB write
- [ ] **LEAD-06**: Spam protection (reCAPTCHA v3 with the existing dev-bypass pattern) on both email gate and pre-call form
- [ ] **LEAD-07**: Lead surface in existing admin dashboard — new `/admin/leads` list + detail view with scenarios selected, form answers, and a "convert to org" affordance (manual until Stripe ships)

### Reskin Customer Dashboard

- [ ] **RESKIN-01**: Apply Factory tokens to all 7 customer-side sections (Dashboard home, Automations, Catalog [internal], Reports, Billing, Settings, Notifications)
- [ ] **RESKIN-02**: Verify KPI cards, charts (Recharts via shadcn wrapper), tables, forms, and modals render correctly under new tokens in EN and ES
- [ ] **RESKIN-03**: Mobile + desktop responsive snapshots pass without regression
- [ ] **RESKIN-04**: Existing dark-mode classes continue to render acceptably under the new palette (no broken contrast)

### Reskin Admin Dashboard

- [ ] **RESKIN-05**: Apply Factory tokens to all 5 admin-side surfaces (Home, Catalog, Requests, Automations, Clients) plus AdminLayout/Sidebar/Header
- [ ] **RESKIN-06**: Admin "ADMIN" badge keeps visual distinction (Code Orange) but harmonizes with new neutral palette
- [ ] **RESKIN-07**: Language switcher UI added to AdminHeader (closes v1.2 carry-over CARRY-A)
- [ ] **RESKIN-08**: Dark-mode toggle UI added to AdminHeader (closes v1.2 carry-over CARRY-B)
- [ ] **RESKIN-09**: I18N runtime UAT now possible on all admin surfaces — programmatic verification of EN/ES rendering after switcher ships

### Launch Polish (Ops + Analytics + SEO)

- [ ] **OPS-01**: Analytics wiring on public pages (Vercel Analytics + custom events for catalog → plan → email gate → pre-call form funnel)
- [ ] **OPS-02**: Sitemap.xml + robots.txt generated server-side, includes all public catalog routes
- [ ] **OPS-03**: Open Graph + Twitter card metadata on landing and every scenario page
- [ ] **OPS-04**: Lighthouse pass on landing + catalog root (performance, accessibility, SEO ≥ 90 in production build)
- [ ] **OPS-05**: Lint debt triage — at minimum, no NEW lint errors introduced; ideally close ~8 non-vendor app-source errors carried from v1.2

---

## Future Requirements (v1.4+)

Deferred — tracked but not in v1.3 roadmap.

### Stripe Integration

- **STRIPE-01**: Stripe Checkout wired to catalog "Solicitar esta automatización" requests
- **STRIPE-02**: Stripe Customer Portal as the Billing "Manage payment" button
- **STRIPE-03**: Stripe webhooks (subscription created/updated/canceled, invoice paid/failed)
- **STRIPE-04**: FastAPI endpoints for business writes (automation request, pause/resume/cancel, billing portal/history, admin activation)

### Cleanup & Hardening

- **CLEAN-01**: Phase 16-03 partial RLS hardening gaps (out of v1.2 CARRY-04 scope)
- **CLEAN-02**: Pre-existing lint debt sweep (103 errors / 1589 warnings — vendor + non-CARRY app source)
- **CLEAN-03**: Audit log table for admin actions (deferred from v1.2)
- **CLEAN-04**: Manual notifications/messages to clients (deferred from v1.2)

---

## Out of Scope (v1.3)

| Feature | Reason |
|---------|--------|
| Stripe integration | 0 paying customers; manual invoicing / e-Transfer until customer 5+ — focus this milestone on lead generation, not billing |
| AI conversational chat | Replaced with structured 4–5 question pre-call form — lower build cost, equally enriched leads |
| DIY automation builder | Permanently out of scope per managed service model |
| External template import (Aigocy/Aixor/DesignPro) | Evaluated and rejected for Bootstrap conflicts — building natively in existing Next.js 16 + Tailwind 4 + shadcn stack |
| GSAP / AOS animation libs | Framer Motion suffices for any motion needs |
| Mobile-native app | PWA may suffice; revisit after public funnel validates demand |
| Public API | v2+ |
| Real-time chat with AIDEAS team | Deferred (was already out of scope for v1.2) |
| Team management / invitations | Deferred (was already out of scope for v1.2) |
| Self-service catalog editing for customers | Catalog editing remains admin-only via /admin/catalog |

---

## Traceability

Every v1.3 requirement maps to exactly one phase. Verified 100% coverage.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESIGN-01 | Phase 25 — Design System Migration | Complete |
| DESIGN-02 | Phase 25 — Design System Migration | Complete |
| DESIGN-03 | Phase 25 — Design System Migration | Complete |
| DESIGN-04 | Phase 25 — Design System Migration | Complete |
| DESIGN-05 | Phase 25 — Design System Migration | Complete |
| CAT-01 | Phase 26 — Catalog Data Model | Complete |
| CAT-02 | Phase 26 — Catalog Data Model | Complete |
| CAT-03 | Phase 26 — Catalog Data Model | Complete |
| CAT-04 | Phase 26 — Catalog Data Model | Complete |
| CAT-05 | Phase 26 — Catalog Data Model | Complete |
| SCEN-01 | Phase 27 — Scenario Content Seed | Complete |
| SCEN-02 | Phase 27 — Scenario Content Seed | Complete |
| SCEN-03 | Phase 27 — Scenario Content Seed | Complete |
| SCEN-04 | Phase 27 — Scenario Content Seed | Complete |
| LAND-01 | Phase 28 — Public Landing Page | Pending |
| LAND-02 | Phase 28 — Public Landing Page | Pending |
| LAND-03 | Phase 28 — Public Landing Page | Pending |
| LAND-04 | Phase 28 — Public Landing Page | Pending |
| LAND-05 | Phase 28 — Public Landing Page | Pending |
| LAND-06 | Phase 28 — Public Landing Page | Pending |
| LAND-07 | Phase 28 — Public Landing Page | Pending |
| LAND-08 | Phase 28 — Public Landing Page | Pending |
| LAND-09 | Phase 28 — Public Landing Page | Pending |
| PUBCAT-01 | Phase 29 — Public Catalog Navigation | Pending |
| PUBCAT-02 | Phase 29 — Public Catalog Navigation | Pending |
| PUBCAT-03 | Phase 29 — Public Catalog Navigation | Pending |
| PUBCAT-04 | Phase 29 — Public Catalog Navigation | Pending |
| PUBCAT-05 | Phase 29 — Public Catalog Navigation | Pending |
| PUBCAT-06 | Phase 29 — Public Catalog Navigation | Pending |
| ROI-01 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| ROI-02 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| ROI-03 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| ROI-04 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| ROI-05 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| ROI-06 | Phase 30 — Scenario Selector + ROI Calculator | Pending |
| LEAD-01 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-02 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-03 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-04 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-05 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-06 | Phase 31 — Lead Capture Flow | Pending |
| LEAD-07 | Phase 31 — Lead Capture Flow | Pending |
| RESKIN-01 | Phase 32 — Reskin Customer Dashboard | Pending |
| RESKIN-02 | Phase 32 — Reskin Customer Dashboard | Pending |
| RESKIN-03 | Phase 32 — Reskin Customer Dashboard | Pending |
| RESKIN-04 | Phase 32 — Reskin Customer Dashboard | Pending |
| RESKIN-05 | Phase 33 — Reskin Admin Dashboard | Pending |
| RESKIN-06 | Phase 33 — Reskin Admin Dashboard | Pending |
| RESKIN-07 | Phase 33 — Reskin Admin Dashboard | Pending |
| RESKIN-08 | Phase 33 — Reskin Admin Dashboard | Pending |
| RESKIN-09 | Phase 33 — Reskin Admin Dashboard | Pending |
| OPS-01 | Phase 34 — Launch Polish | Pending |
| OPS-02 | Phase 34 — Launch Polish | Pending |
| OPS-03 | Phase 34 — Launch Polish | Pending |
| OPS-04 | Phase 34 — Launch Polish | Pending |
| OPS-05 | Phase 34 — Launch Polish | Pending |

**Coverage:**
- v1.3 requirements: 58 total
- Mapped to phases: 58 (100%) ✓
- Unmapped: 0 ✓
- Duplicate mappings: 0 ✓

**By phase:**
| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 25 — Design System Migration | DESIGN-01..05 | 5 |
| Phase 26 — Catalog Data Model | CAT-01..05 | 5 |
| Phase 27 — Scenario Content Seed | SCEN-01..04 | 4 |
| Phase 28 — Public Landing Page | LAND-01..09 | 9 |
| Phase 29 — Public Catalog Navigation | PUBCAT-01..06 | 6 |
| Phase 30 — Scenario Selector + ROI Calculator | ROI-01..06 | 6 |
| Phase 31 — Lead Capture Flow | LEAD-01..07 | 7 |
| Phase 32 — Reskin Customer Dashboard | RESKIN-01..04 | 4 |
| Phase 33 — Reskin Admin Dashboard | RESKIN-05..09 | 5 |
| Phase 34 — Launch Polish | OPS-01..05 | 5 |
| **Total** | | **58** |

---

*Requirements defined: 2026-05-14*
*Source: .planning/milestones/v1.3-INTENT-archive.md (strategy conversation 2026-05-14)*
*Traceability populated: 2026-05-14 by /gsd:new-project roadmapper*
*Last updated: 2026-05-14 — phase mapping complete*
