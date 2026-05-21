---
milestone: v1.3
milestone_name: Public Funnel & Factory Reskin
audited: 2026-05-19T20:00:00Z
status: gaps_found
scores:
  requirements: 14/58
  phases: 3/10
  integration: 13/13 (provider contracts intact)
  flows: 0/1 (anonymous-visitor funnel broken end-to-end)
gaps:
  requirements:
    # ============ Phase 28 — Public Landing Page (UNWIRED) ============
    - id: "LAND-01"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started; web/src/app/page.tsx still redirects anon visitors to /landing/index.html (legacy static HTML); no SSR landing route exists"
    - id: "LAND-02"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — Hero section + primary CTA missing"
    - id: "LAND-03"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — Working Process section missing"
    - id: "LAND-04"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — Services / functional-areas overview missing"
    - id: "LAND-05"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — Pricing section missing"
    - id: "LAND-06"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — FAQ section missing"
    - id: "LAND-07"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — Final CTA section missing"
    - id: "LAND-08"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — web/src/app/layout.tsx metadata is stub ('title: AIDEAS', 'description: Customer Portal'); no sitemap entry, no OG image"
    - id: "LAND-09"
      status: "unsatisfied"
      phase: "Phase 28 — Public Landing Page"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 28 not started — EN/ES parity on landing copy missing"

    # ============ Phase 29 — Public Catalog Navigation (UNWIRED) ============
    - id: "PUBCAT-01"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started; no web/src/app/catalog/ directory; only logged-in catalog at web/src/app/(dashboard)/dashboard/catalog/ exists"
    - id: "PUBCAT-02"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started — functional-area landing pages missing"
    - id: "PUBCAT-03"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started — scenario detail page missing"
    - id: "PUBCAT-04"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started — cross-linking missing"
    - id: "PUBCAT-05"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started — SEO essentials on catalog pages missing"
    - id: "PUBCAT-06"
      status: "unsatisfied"
      phase: "Phase 29 — Public Catalog Navigation"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 29 not started — EN/ES parity on catalog missing"

    # ============ Phase 30 — Scenario Selector + ROI Calculator (UNWIRED) ============
    - id: "ROI-01"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started; zero references to 'scenarios' table anywhere in web/src"
    - id: "ROI-02"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started — persistent selection state missing"
    - id: "ROI-03"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started — 'See my plan' CTA + plan view missing"
    - id: "ROI-04"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started — hours-saved aggregation missing"
    - id: "ROI-05"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started — CAD employee-cost calculator missing"
    - id: "ROI-06"
      status: "unsatisfied"
      phase: "Phase 30 — Scenario Selector + ROI Calculator"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 30 not started — shareable plan URL missing"

    # ============ Phase 31 — Lead Capture Flow (UNWIRED) ============
    - id: "LEAD-01"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started; no email-gate form anywhere in web/src"
    - id: "LEAD-02"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — no Resend transactional email wiring"
    - id: "LEAD-03"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — pre-call form (4-5 questions) missing"
    - id: "LEAD-04"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — enriched lead persistence missing"
    - id: "LEAD-05"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — `leads` table migration does not exist (grep of supabase/migrations/ for 'leads' returns only comment matches)"
    - id: "LEAD-06"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — reCAPTCHA v3 not wired on lead forms"
    - id: "LEAD-07"
      status: "unsatisfied"
      phase: "Phase 31 — Lead Capture Flow"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 31 not started — /admin/leads route does not exist (glob returned no matches)"

    # ============ Phase 32 — Reskin Customer Dashboard (UNWIRED) ============
    - id: "RESKIN-01"
      status: "unsatisfied"
      phase: "Phase 32 — Reskin Customer Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 32 not started; 9 composed-component groups explicitly deferred from Phase 25 (25-07-UAT.md:151-163) still use pre-Factory utilities (bg-white shadow-sm)"
    - id: "RESKIN-02"
      status: "unsatisfied"
      phase: "Phase 32 — Reskin Customer Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 32 not started — token-rendering verification on KPI cards, charts, tables, forms, modals in EN/ES not performed"
    - id: "RESKIN-03"
      status: "unsatisfied"
      phase: "Phase 32 — Reskin Customer Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 32 not started — mobile + desktop snapshot regression run not performed"
    - id: "RESKIN-04"
      status: "unsatisfied"
      phase: "Phase 32 — Reskin Customer Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 32 not started — dark-mode verification on composed components not performed"

    # ============ Phase 33 — Reskin Admin Dashboard (UNWIRED) ============
    - id: "RESKIN-05"
      status: "unsatisfied"
      phase: "Phase 33 — Reskin Admin Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 33 not started; 5 admin composed-component groups deferred from Phase 25 (25-07-UAT.md:165-174)"
    - id: "RESKIN-06"
      status: "unsatisfied"
      phase: "Phase 33 — Reskin Admin Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 33 not started — ADMIN badge token consumption already verified in Phase 25 (admin-header.tsx:18 uses bg-primary text-primary-foreground), but holistic admin reskin verification missing"
    - id: "RESKIN-07"
      status: "unsatisfied"
      phase: "Phase 33 — Reskin Admin Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 33 not started — v1.2 carry-over CARRY-A: language switcher UI absent from web/src/app/(admin)/admin/layout.tsx (also flagged in CLAUDE.md Known Tech Debt Phase 19)"
    - id: "RESKIN-08"
      status: "unsatisfied"
      phase: "Phase 33 — Reskin Admin Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 33 not started — v1.2 carry-over CARRY-B: dark-mode toggle UI absent from admin header"
    - id: "RESKIN-09"
      status: "unsatisfied"
      phase: "Phase 33 — Reskin Admin Dashboard"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 33 not started — I18N runtime UAT on admin surfaces blocked by missing language switcher"

    # ============ Phase 34 — Launch Polish (UNWIRED) ============
    - id: "OPS-01"
      status: "unsatisfied"
      phase: "Phase 34 — Launch Polish"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 34 not started — Vercel Analytics + custom funnel events missing"
    - id: "OPS-02"
      status: "unsatisfied"
      phase: "Phase 34 — Launch Polish"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 34 not started — no /sitemap.xml or /robots.txt routes; nothing to enumerate (depends on Phase 28+29)"
    - id: "OPS-03"
      status: "unsatisfied"
      phase: "Phase 34 — Launch Polish"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 34 not started — no OG/Twitter card metadata on landing or scenario pages"
    - id: "OPS-04"
      status: "unsatisfied"
      phase: "Phase 34 — Launch Polish"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 34 not started — no Lighthouse run; nothing to measure (depends on Phase 28+29)"
    - id: "OPS-05"
      status: "unsatisfied"
      phase: "Phase 34 — Launch Polish"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "missing"
      evidence: "Phase 34 not started — pre-existing ~8 non-vendor app-source lint errors from v1.2 still open"
  integration:
    - flow: "Anonymous visitor → SSR landing"
      gap: "middleware.ts:200-208 still rewrites anonymous `/` to /landing/index.html (legacy static HTML). Phase 28 must remove this rewrite when introducing the SSR landing route."
      affected_requirements: ["LAND-01", "LAND-02", "LAND-03", "LAND-04", "LAND-05", "LAND-06", "LAND-07", "LAND-08", "LAND-09"]
    - flow: "Landing → public catalog"
      gap: "No web/src/app/catalog/ directory exists. The only catalog is web/src/app/(dashboard)/dashboard/catalog/ (auth-gated). DB schema (Phase 26+27) is fully populated but has zero front-end consumer."
      affected_requirements: ["PUBCAT-01", "PUBCAT-02", "PUBCAT-03", "PUBCAT-04", "PUBCAT-05", "PUBCAT-06"]
    - flow: "Catalog → scenario selection → plan view"
      gap: "Zero references to `scenarios` table anywhere in web/src; no multi-select UI; no plan-view page; no CAD employee-cost calculator."
      affected_requirements: ["ROI-01", "ROI-02", "ROI-03", "ROI-04", "ROI-05", "ROI-06"]
    - flow: "Plan view → email gate → pre-call form → /admin/leads"
      gap: "`leads` table migration does not exist; no email-gate form; no Resend integration; no pre-call form; /admin/leads route does not exist; no server actions in web/src/lib/actions/ for lead capture."
      affected_requirements: ["LEAD-01", "LEAD-02", "LEAD-03", "LEAD-04", "LEAD-05", "LEAD-06", "LEAD-07"]
    - flow: "Factory token consumption across customer dashboard composed components"
      gap: "9 component groups (KpiCards, ActivityFeed, AutomationList, Catalog tabs/chips, Reports cards, Billing, Settings, Notifications, top-automation-card) still use `bg-white shadow-sm` and hardcoded `gray-*` literals — Phase 32 scope."
      affected_requirements: ["RESKIN-01", "RESKIN-02", "RESKIN-03", "RESKIN-04"]
    - flow: "Factory token consumption across admin dashboard composed components + admin UX controls"
      gap: "5 admin component groups (admin-home-kpi-cards, catalog admin tables/forms, requests inbox, automations admin, clients/Client 360) still on pre-Factory styling; admin header missing language switcher + dark-mode toggle — Phase 33 scope."
      affected_requirements: ["RESKIN-05", "RESKIN-06", "RESKIN-07", "RESKIN-08", "RESKIN-09"]
    - flow: "SEO + Analytics + Sitemap + Lighthouse"
      gap: "web/src/app/layout.tsx metadata is stub; no sitemap.xml route; no robots.txt route; no OG meta on landing/scenarios; no Vercel Analytics; no Lighthouse baseline — Phase 34 scope."
      affected_requirements: ["OPS-01", "OPS-02", "OPS-03", "OPS-04", "OPS-05"]
  flows:
    - name: "Anonymous Visitor Funnel (milestone definition of done)"
      breaks_at: "Step 1 — visitor lands on /landing/index.html (legacy static HTML) instead of Factory-styled SSR page. All 7 downstream steps (catalog → selection → plan → email → email-cta → pre-call form → admin lead) are missing entirely."
      affected_phases: ["28", "29", "30", "31"]
      affected_requirements_count: 28
tech_debt:
  - phase: "25-design-system-migration"
    items:
      - "Customer composed components (9 groups) deferred to Phase 32 — KpiCards, ActivityFeed, AutomationList, Catalog tabs/chips, Reports cards, Billing, Settings, Notifications, top-automation-card still on pre-Factory styling"
      - "Admin composed components (5 groups) deferred to Phase 33 — admin-home-kpi-cards, catalog admin, requests inbox, automations admin, clients/Client 360 still on pre-Factory styling"
      - "Admin header missing language switcher (v1.2 carry-over CARRY-A) — deferred to Phase 33"
      - "Admin header missing dark-mode toggle (v1.2 carry-over CARRY-B) — deferred to Phase 33"
      - "Legacy static landing at web/public/landing/* still served by middleware.ts:200-208 — to be replaced by Phase 28 SSR landing"
  - phase: "27-scenario-content-seed"
    items:
      - "scenarios.typical_hours_per_week DB CHECK is `>= 0` only; integer-1-to-20 business rule enforced at seed time only — deferred to future admin-CRUD phase (not Phase 30 blocker)"
  - phase: "pre-existing (not introduced by 25-27)"
    items:
      - "Phase 08: Hardcoded KPI trend values in web/src/app/(dashboard)/dashboard/page.tsx:137-143"
      - "Phase 08: Hardcoded `avgResponseTime = '< 1 min'` placeholder"
      - "Phase 09: updateAutomationStatus server action missing org ownership check"
      - "Phase 09: Hardcoded `'Just now'` string bypassing i18n in [id]/page.tsx:41"
      - "Phase 10: `operations` category has no UI tab or i18n key"
      - "Phase 10: `agencias` industry has no UI chip or i18n key"
      - "Phase 19: Race-condition error toast on approve/reject buttons disappears too fast"
---

# Milestone v1.3 — Public Funnel & Factory Reskin Audit Report

**Audited:** 2026-05-19
**Status:** GAPS_FOUND
**Verifier:** Claude (gsd-audit-milestone, Opus 4.7 1M)

---

## Executive Summary

This audit was run **prematurely** — only 3 of 10 phases in the v1.3 milestone are complete (Phases 25, 26, 27). The remaining 7 phases (28, 29, 30, 31, 32, 33, 34) have not been started, leaving 44 of 58 requirements unsatisfied and the entire public-visitor funnel (the milestone's definition of done) not built.

**Crucially: this is not a regression or quality failure.** Every gap maps cleanly to a not-yet-built phase. The 3 completed phases delivered their provider-side contracts (design tokens, DB schema, seed content) cleanly and without regression. The audit's `gaps_found` status reflects work that hasn't started, not work that was done badly.

The milestone **cannot be marked complete**. The recommended next step is to resume execution starting at Phase 28 (Public Landing Page).

---

## Score Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Requirements satisfied | 14 / 58 (24%) | DESIGN-01..05 + CAT-01..05 + SCEN-01..04 |
| Phases complete | 3 / 10 (30%) | 25, 26, 27 |
| Provider-side contract integrity | 13 / 13 (100%) | All Phase 25 wiring + Phase 26/27 schema intact |
| End-to-end flows working | 0 / 1 (0%) | Anonymous-visitor funnel entirely unbuilt |

---

## Requirements Status (3-Source Cross-Reference)

### Satisfied Requirements (14)

All Phase 25-27 requirements satisfied across all three sources (VERIFICATION.md + SUMMARY.md frontmatter + REQUIREMENTS.md traceability).

**Phase 25 — DESIGN-01..05** (5 reqs)
- Note: Phase 25 SUMMARY.md files have empty `requirements-completed:` frontmatter (Plans 25-01 through 25-07), but VERIFICATION.md explicitly verifies all 5 reqs and REQUIREMENTS.md traceability table marks them Complete. Treated as **satisfied with SUMMARY frontmatter gap** (cosmetic — not a functional issue).

**Phase 26 — CAT-01..05** (5 reqs)
- 26-01 SUMMARY: `[CAT-01]` ✓
- 26-02 SUMMARY: `[CAT-02, CAT-03]` ✓
- 26-03 SUMMARY: `[CAT-04, CAT-05]` ✓
- All verified in VERIFICATION.md and marked Complete in REQUIREMENTS.md

**Phase 27 — SCEN-01..04** (4 reqs)
- 27-01 SUMMARY: `[SCEN-04]` ✓
- 27-03 SUMMARY: `[SCEN-01, SCEN-02, SCEN-03, SCEN-04]` ✓
- 27-04 SUMMARY: `[SCEN-01, SCEN-02, SCEN-03, SCEN-04]` ✓
- 27-02 SUMMARY: intentionally empty (string note — physical realization happens in 27-03)
- All verified in VERIFICATION.md and marked Complete in REQUIREMENTS.md

### Unsatisfied Requirements (44)

| Requirement | Phase | Description | Why |
|-------------|-------|-------------|-----|
| **LAND-01..09** | Phase 28 | Public SSR landing page (Hero, Working Process, Services, Pricing, FAQ, CTA, SEO, EN/ES) | Phase 28 not started |
| **PUBCAT-01..06** | Phase 29 | Public SSR catalog (functional areas, scenarios, SEO, cross-linking, EN/ES) | Phase 29 not started |
| **ROI-01..06** | Phase 30 | Multi-select scenario UI + plan view + CAD employee-cost calculator | Phase 30 not started |
| **LEAD-01..07** | Phase 31 | Email gate + Resend + pre-call form + `leads` table + reCAPTCHA + `/admin/leads` | Phase 31 not started |
| **RESKIN-01..04** | Phase 32 | Factory token migration on 7 customer-side composed-component groups | Phase 32 not started |
| **RESKIN-05..09** | Phase 33 | Factory token migration on 5 admin surfaces + language switcher + dark-mode toggle | Phase 33 not started |
| **OPS-01..05** | Phase 34 | Analytics + sitemap + robots + OG cards + Lighthouse ≥ 90 + lint debt triage | Phase 34 not started |

### Orphaned Requirements

**Zero orphaned requirements.** Every REQ-ID in REQUIREMENTS.md is mapped to exactly one phase. The 44 unsatisfied reqs are all assigned to unstarted phases, not abandoned.

---

## Cross-Phase Integration Findings

### Provider-side contracts intact (13 / 13)

The 3 completed phases produced consumable artifacts for the remaining 7 phases. All artifacts verified present and intact:

| # | Provider | Contract | Verified |
|---|----------|----------|----------|
| 1 | Phase 25 | `web/src/app/globals.css` Factory tokens (#eeeeee bg, #fafafa cards, #ef6f2e accent) | ✓ Present at globals.css:51-87 (light) + 89-124 (dark) |
| 2 | Phase 25 | Geist Sans + Geist Mono fonts wired in layout.tsx | ✓ layout.tsx:7-13 + globals.css:40-41 |
| 3 | Phase 25 | 8 shadcn primitives consuming tokens | ✓ All present in web/src/components/ui/ |
| 4 | Phase 25 | Reskinned customer shell (layout + header + nav) | ✓ (dashboard)/layout.tsx + dashboard-header.tsx + nav.tsx |
| 5 | Phase 25 | Reskinned admin shell (layout + sidebar + header) | ✓ (admin)/admin/layout.tsx + admin-sidebar.tsx + admin-header.tsx |
| 6 | Phase 25 | Zero purple/pink residue in web/src | ✓ Grep verified |
| 7 | Phase 25 | Reskinned auth pages | ✓ All 6 customer + 1 admin login |
| 8 | Phase 26 | `functional_areas` table + anon RLS | ✓ Migration 20260516000001 |
| 9 | Phase 26 | `scenarios` table + bilingual pain copy + FK + anon RLS | ✓ Migration 20260516000002 |
| 10 | Phase 26 | `scenario_templates` pivot + cascading FKs + anon RLS | ✓ Migration 20260516000002 |
| 11 | Phase 26 | `automation_templates` anon SELECT (RLS chain closure) | ✓ Migration 20260516000003 |
| 12 | Phase 27 | 8 functional_areas + 50 scenarios + 150 mappings (DB content) | ✓ Migration 20260517000001 + seed.sql Section 14 |
| 13 | Phase 27 | Idempotent re-seed | ✓ In-place re-apply produced zero errors |

### Broken end-to-end flows

The **Anonymous Visitor Funnel** is the milestone's definition of done. Every step from Step 1 onward is missing.

| Step | Route / Action | Status | Blocker |
|------|----------------|--------|---------|
| 1. Visitor lands on `/` | SSR Factory page | ❌ Middleware rewrites to legacy `/landing/index.html` | Phase 28 not started; middleware.ts:200-208 must be updated when Phase 28 ships |
| 2. Clicks to `/catalog` | Public SSR catalog | ❌ No `web/src/app/catalog/` directory | Phase 29 not started |
| 3. Selects scenarios | ROI multi-select | ❌ No scenario consumer in web/src | Phase 30 not started |
| 4. Views plan + CAD cost | Plan view page | ❌ No plan view exists | Phase 30 not started |
| 5. Hits email gate | Email capture form | ❌ No form, no `leads` table | Phase 31 not started |
| 6. Receives transactional email | Resend integration | ❌ No trigger code | Phase 31 not started |
| 7. Submits pre-call form | Pre-call form (4-5 questions) | ❌ Form does not exist | Phase 31 not started |
| 8. Admin views `/admin/leads` | Admin leads inbox | ❌ Route does not exist | Phase 31 not started |

### Integration risks for downstream phases

- **Phase 28 must update `middleware.ts:200-208`** to remove the `/landing/index.html` rewrite when introducing the SSR landing route — otherwise the new SSR route will be silently overridden by middleware before Next.js routing can serve it. This is a known and expected Phase 28 migration task, but it is load-bearing.

---

## Tech Debt Aggregation

### From Phase 25 (deferred by design — not gaps)

These were explicitly deferred to Phase 32/33 per 25-CONTEXT.md scope boundary and 25-07-UAT.md documentation. They are tracked as Phase 32/33 backlog, not Phase 25 gaps.

**To Phase 32:**
- `kpi-cards.tsx`, `top-automation-card.tsx`, `activity-feed.tsx`, `automations/*`, `catalog/*` (composed), `reports/*`, `billing/*`, `settings/*`, `notifications/*` — all still on `bg-white shadow-sm` + hardcoded `gray-*` literals

**To Phase 33:**
- `admin-home-kpi-cards.tsx`, `admin/catalog/*`, `admin/requests/*`, `admin/automations/*`, `admin/clients/*` — all still on pre-Factory styling
- Admin header language switcher (v1.2 carry-over CARRY-A)
- Admin header dark-mode toggle (v1.2 carry-over CARRY-B)

### From Phase 27

- `scenarios.typical_hours_per_week` DB CHECK is `>= 0`; integer-1-to-20 business rule enforced at seed time only — deferred to future admin-CRUD phase. Non-blocker for Phase 30 since ROI calculator reads (not writes).

### Pre-existing (carried from v1.0–v1.2, not introduced by Phases 25-27)

Per CLAUDE.md "Known Tech Debt" section:
- Phase 08: Hardcoded KPI trend values; hardcoded avgResponseTime
- Phase 09: updateAutomationStatus missing org ownership check; hardcoded "Just now" string
- Phase 10: `operations` category + `agencias` industry missing UI tabs/chips/i18n keys
- Phase 19: Race-condition error toast on approve/reject buttons

---

## Anti-Patterns Found

**Zero** anti-patterns introduced by Phases 25-27.

- No new TODOs / FIXMEs / PLACEHOLDERs in delivered code
- No `console.log` introductions
- All "intentional retentions" (focus-ring `box-shadow` in `button.tsx:7` for WCAG accessibility) documented in plans

---

## Final Verdict

**Status:** GAPS_FOUND (premature audit)
**Recommendation:** **Do NOT mark v1.3 milestone complete.** Resume execution at Phase 28.

The 3 completed phases (25, 26, 27) shipped clean, regression-free provider contracts. The 7 remaining phases (28-34) contain 44 unsatisfied requirements that map cleanly to unstarted work. Nothing is broken in the codebase — there is simply 70% of the milestone left to build.

---

## Next Steps

The natural continuation is **Phase 28 — Public Landing Page** (`LAND-01..09`, 9 reqs). Phase 28 is unblocked: it depends only on Phase 25 (tokens) which is complete.

Suggested command flow:

```
/gsd:discuss-phase 28   # gather Phase 28 context if not already done
/gsd:plan-phase 28      # create 28-PLAN.md
/gsd:execute-phase 28   # build the SSR landing
```

After Phase 28, the natural critical path per ROADMAP.md is:
- Phase 29 (depends on 27+28) — Public Catalog Navigation
- Phase 30 (depends on 29) — ROI Calculator
- Phase 31 (depends on 30) — Lead Capture Flow
- Phase 32 (depends on 25) — can run in parallel
- Phase 33 (depends on 25+32) — Reskin Admin
- Phase 34 (depends on 28+29+31) — Launch Polish

**Re-run this audit** (`/gsd:audit-milestone v1.3`) after Phase 34 completes to validate full milestone definition of done before archiving.

---

*Audited: 2026-05-19T20:00:00Z*
*Audit method: 3-source cross-reference (VERIFICATION.md + SUMMARY frontmatter + REQUIREMENTS.md traceability) + cross-phase integration check (gsd-integration-checker Sonnet) + tech-debt aggregation*
*Sources verified: 3 phase VERIFICATION.md + 14 SUMMARY.md + REQUIREMENTS.md traceability table + middleware.ts + app/page.tsx + app/layout.tsx + supabase/migrations/*.sql + supabase/seed.sql Section 14*
