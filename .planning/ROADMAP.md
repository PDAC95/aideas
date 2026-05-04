# Roadmap: AIDEAS Customer Portal

## Milestones

- ✅ **v1.0 Backend Foundation + Auth** — Phases 1-6 (shipped 2026-04-08)
- ✅ **v1.1 Core Dashboard Experience** — Phases 7-15 (shipped 2026-05-04)
- 📋 **v1.2 Stripe + Production-Ready** — TBD (planning)

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

### 📋 v1.2 Stripe + Production-Ready (Planned)

**Milestone Goal (TBD — define via `/gsd:new-milestone`):** Wire Stripe Checkout, Customer Portal, and webhooks; address v1.1 carry-over tech debt; production hardening.

**Carry-over from v1.1:**
- Build error: `next/dynamic({ ssr: false })` rejected by Next.js 16 + Turbopack in `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16`
- Out-of-scope placeholder: `<AutomationSuccessRate trend="+5%" />` in `dashboard/page.tsx:212`
- Code consolidation: `saveCompanyName` + `saveHourlyCost` should use `assertOrgMembership` helper (Phase 14 introduced it)
- Asymmetric reCAPTCHA bypass: server gracefully skips when keys missing, client hard-fails — add symmetric dev bypass

Phases TBD.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. API Foundation | v1.0 | 2/2 | Complete | 2026-03-05 |
| 2. Database Schema | v1.0 | 3/3 | Complete | 2026-03-06 |
| 3. Auth Integration | v1.0 | 2/2 | Complete | 2026-03-27 |
| 4. User Registration | v1.0 | 4/4 | Complete | 2026-03-31 |
| 5. User Login | v1.0 | 2/2 | Complete | 2026-03-31 |
| 6. Password Recovery & Email Verification | v1.0 | 3/3 | Complete | 2026-04-07 |
| 7. Schema & Seed Data | v1.1 | 3/3 | Complete | 2026-04-10 |
| 8. Dashboard Home & Notifications | v1.1 | 5/5 | Complete | 2026-04-13 |
| 9. My Automations | v1.1 | 4/4 | Complete | 2026-04-14 |
| 10. Catalog | v1.1 | 3/3 | Complete | 2026-04-14 |
| 11. Reports & Billing | v1.1 | 3/3 | Complete | 2026-04-15 |
| 12. Settings | v1.1 | 5/5 | Complete | 2026-04-29 |
| 13. Catalog Coverage Fix | v1.1 | 1/1 | Complete | 2026-04-30 |
| 14. i18n & Security Hygiene | v1.1 | 2/2 | Complete | 2026-04-30 |
| 15. Dashboard Home Polish | v1.1 | 2/2 | Complete | 2026-04-30 |
