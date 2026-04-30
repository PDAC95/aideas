# Roadmap: AIDEAS Customer Portal

## Milestones

- ✅ **v1.0 Backend Foundation + Auth** — Phases 1-6 (shipped 2026-04-08)
- 🚧 **v1.1 Core Dashboard Experience** — Phases 7-12 (in progress)

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

### 🚧 v1.1 Core Dashboard Experience (In Progress)

**Milestone Goal:** Deliver the complete customer-facing dashboard — all 7 sections with mock/seed data (Stripe wired in v1.2) — so customers can monitor automations, browse the catalog, and see ROI.

**Stripe is OUT OF SCOPE for v1.1.** All payment-related UI uses mock/seed data only.

- [x] **Phase 7: Schema & Seed Data** — Migrate schema for 3 tables and seed 66+ templates + demo org data (completed 2026-04-10)
- [x] **Phase 8: Dashboard Home & Notifications** — Personalized landing with KPIs, activity feed, and notification bell (completed 2026-04-13)
- [x] **Phase 9: My Automations** — Full automation inventory with filterable list, detail views, and lifecycle action buttons (completed 2026-04-14)
- [x] **Phase 10: Catalog** — Browse 66+ templates with industry/category filters and template detail pages (completed 2026-04-14)
- [x] **Phase 11: Reports & Billing** — Impact metrics with charts and billing summary with mock payment history (completed 2026-04-15)
- [x] **Phase 12: Settings** — Profile, preferences (language, hourly cost), and security management (completed 2026-04-15)
- [x] **Phase 13: Catalog Coverage Fix** — Add `operations` category and `agencias` industry to catalog UI + i18n (closes audit HIGH-1, HIGH-2) — completed 2026-04-30
- [ ] **Phase 14: i18n & Security Hygiene** — Org ownership check on `updateAutomationStatus`; replace hardcoded "Just now"; wire `notification-bell` time format to next-intl (closes audit MEDIUM-1, LOW-1, NEW-LOW-1)
- [ ] **Phase 15: Dashboard Home Polish** — Drop redundant notifications query; replace hardcoded KPI trend / avgResponseTime placeholders; backfill SUMMARY frontmatter for Phase 8 (closes audit LOW-2 + tech debt)

## Phase Details

### Phase 7: Schema & Seed Data
**Goal**: The database has the expanded schema and realistic demo data that all dashboard sections depend on
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. `automation_templates` table has all new columns (setup_price, monthly_price, setup_time_days, industry_tags, connected_apps, typical_impact_text, avg_minutes_per_task, activity_metric_label) and expanded category CHECK
  2. `automations` table has `stripe_subscription_id` column and `in_setup` is a valid status value
  3. `automation_requests` table has checkout fields and expanded status values
  4. Querying `automation_templates` returns 66+ records across 8 categories and 6 industries with realistic pricing and metrics
  5. Querying demo org data returns 5-6 automations, ~500 executions over 60 days, 8-10 notifications, and org settings with hourly_cost
**Plans**: TBD

### Phase 8: Dashboard Home & Notifications
**Goal**: Users land on a dashboard that shows their automation health at a glance and can access their notifications
**Depends on**: Phase 7
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01
**Success Criteria** (what must be TRUE):
  1. User sees a personalized greeting with their first name on the dashboard home
  2. User sees 3 KPI cards (active automations, tasks this week, hours saved this month) populated from real data
  3. User sees their automations in a compact list with status badges and daily metrics, and can click through to the catalog
  4. User sees an activity feed of the last 10-15 execution events
  5. Bell icon in the sidebar shows unread count badge; clicking opens a dropdown with the last 20 notifications and a "mark all as read" action
  6. All new UI text renders correctly in both English and Spanish (EN/ES translation keys in place for all dashboard sections)
**Plans**: TBD

### Phase 9: My Automations
**Goal**: Users can view and manage their full automation inventory with detailed performance data
**Depends on**: Phase 8
**Requirements**: AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, AUTO-06
**Success Criteria** (what must be TRUE):
  1. User can filter their automation list by All / Active / In Setup / Paused and each filter shows the correct subset
  2. Each automation card shows name, category, connected apps, status badge, monthly metric, and monthly price
  3. User can navigate to an automation detail page and see 3 KPI cards (metric count, hours saved, monthly charge) for that automation
  4. Automation detail page shows an activity timeline of the last 20 executions and a weekly bar chart of the last 4 weeks
  5. Pause, resume, and cancel buttons appear on the detail view in the correct states (pause for active, resume/cancel for paused) — buttons are visible UI with no Stripe wiring
**Plans**: 4 plans
  - [ ] 09-01-PLAN.md — i18n keys (EN/ES), TypeScript types, and Supabase query functions
  - [ ] 09-02-PLAN.md — Automations list page with filter tabs, cards, and empty states
  - [ ] 09-03-PLAN.md — Install Recharts, build WeeklyBarChart and ExecutionTimeline components
  - [ ] 09-04-PLAN.md — Automation detail page with KPIs, timeline, chart, and lifecycle actions

### Phase 10: Catalog
**Goal**: Users can browse the full automation catalog and view complete template details before requesting
**Depends on**: Phase 8
**Requirements**: CATL-01, CATL-02, CATL-03, CATL-04
**Success Criteria** (what must be TRUE):
  1. User can filter the catalog grid by industry chip (Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes) and results update correctly
  2. User can filter by category tab (Mas populares, Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA) and results update correctly
  3. User can navigate to a template detail page and see description, connected apps, typical impact text, setup time, setup price, and monthly price
  4. "Solicitar esta automatizacion" button is visible on the template detail page (UI only — no Stripe Checkout wired)
**Plans**: TBD

### Phase 11: Reports & Billing
**Goal**: Users can see the ROI of their automations and review their billing charges
**Depends on**: Phase 9
**Requirements**: REPT-01, REPT-02, REPT-03, REPT-04, REPT-05, BILL-01, BILL-02, BILL-03, BILL-04
**Success Criteria** (what must be TRUE):
  1. User can select a report period (This month, Last month, Last 3 months) and the impact KPIs and chart update accordingly
  2. Reports page shows 3 impact KPI cards (tasks completed, hours saved, estimated value) and a weekly activity bar chart (~8 weeks)
  3. Reports page shows a per-automation breakdown table with name, metric label, count, and hours saved
  4. Estimated value card appears when org has hourly_cost set; when not set, a link to Settings appears in its place
  5. Billing page shows monthly summary card, per-automation charges table, and a mock payment history table; "Manage payment" button is visible (UI only — no Stripe Portal wired)
**Plans**: 3 plans
  - [ ] 11-01-PLAN.md — i18n keys (EN/ES), TypeScript types, Supabase query functions, and nav update
  - [ ] 11-02-PLAN.md — Reports page with period selector, KPI cards, weekly chart, and breakdown table
  - [ ] 11-03-PLAN.md — Billing page with summary card, charges table, and mock payment history

### Phase 12: Settings
**Goal**: Users can manage their profile, preferences, and security from a single settings page
**Depends on**: Phase 8
**Requirements**: SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06
**Success Criteria** (what must be TRUE):
  1. User can upload a new avatar image and see it reflected immediately across the dashboard (Supabase Storage)
  2. User can edit and save their name and company name
  3. User can switch language between Espanol and English and the UI re-renders in the selected language
  4. User can enter an hourly cost value and see it used in the Reports estimated value calculation
  5. User can change their password via the security block
  6. User can view active sessions and close all other sessions
**Plans**: 3 plans
  - [ ] 12-01-PLAN.md — Storage migration, Zod schemas, server actions, query functions, types, and i18n keys
  - [ ] 12-02-PLAN.md — Settings page, Profile card (avatar + name), and Preferences card (language + hourly cost)
  - [ ] 12-03-PLAN.md — Security card with password change form and session management

### Phase 13: Catalog Coverage Fix
**Goal**: All seeded automation templates are reachable via catalog filters; no orphaned categories or industries
**Depends on**: Phase 10 (catalog shipped)
**Requirements**: CATL-01, CATL-02, CATL-03, I18N-01 (already satisfied — closes audit gaps within these)
**Gap Closure**: Closes HIGH-1 (`operations` category orphan, 8 templates) and HIGH-2 (`agencias` industry orphan, ~48 templates) from `.planning/v1.1-MILESTONE-AUDIT.md`
**Success Criteria** (what must be TRUE):
  1. `dashboard.catalog.categories.operations` key present in `web/messages/en.json` and `es.json` with translated label
  2. `dashboard.catalog.industries.agencias` key present in `web/messages/en.json` and `es.json` with translated label
  3. `CATEGORY_ORDER` in `catalog-client.tsx` includes `operations` so the tab renders in the correct sort position
  4. `catalog/page.tsx` translation map includes `operations` (categories) and `agencias` (industries) so labels render
  5. Browsing `/dashboard/catalog` and selecting Operations tab shows all 8 operations templates; selecting Agencias chip shows all ~48 templates tagged `agencias`
**Plans**: 1 plan
  - [ ] 13-01-PLAN.md — Register operations category and agencias industry in i18n + UI registration points (4-file mechanical edit + manual UAT)

### Phase 14: i18n & Security Hygiene
**Goal**: Defense-in-depth on automation lifecycle action; full i18n coverage on user-visible time strings
**Depends on**: Phase 9 (automations shipped)
**Requirements**: AUTO-04, AUTO-06, NOTF-02, I18N-01 (already satisfied — closes audit gaps within these)
**Gap Closure**: Closes MEDIUM-1 (`updateAutomationStatus` missing org ownership check), LOW-1 (hardcoded "Just now"), and NEW-LOW-1 (`notification-bell` formatRelativeTime hardcoded EN) from audit
**Success Criteria** (what must be TRUE):
  1. `updateAutomationStatus` server action verifies the caller's `organization_members` membership for the automation's `organization_id` before updating, returning a typed error otherwise
  2. `automations/[id]/page.tsx` `buildTimeAgo` helper for `seconds < 60` returns the i18n-translated equivalent (e.g., `t("timeAgo.now")`) instead of the hardcoded `"Just now"`
  3. `notification-bell.tsx` `formatRelativeTime` reads its labels (`now`, `m`, `h`, `d`) from translations passed via props (or via a next-intl client hook) so Spanish locale renders Spanish abbreviations
  4. New i18n keys added to both `en.json` and `es.json` for the notification time abbreviations
**Plans**: 2 plans
  - [ ] 14-01-PLAN.md — `assertOrgMembership` helper + `updateAutomationStatus` hardening (admin-client write + localized error toast)
  - [ ] 14-02-PLAN.md — Shared `formatRelativeTime` helper + `common.timeAgo.*` i18n keys + wire notification-bell and automation detail page

### Phase 15: Dashboard Home Polish
**Goal**: Dashboard home renders only real values (no hardcoded placeholders) and Phase 8 SUMMARY frontmatter accurately lists completed requirements
**Depends on**: Phase 8 (dashboard home shipped)
**Requirements**: HOME-01, HOME-02, HOME-04, I18N-01 (already satisfied — closes documentation/perf gaps within these)
**Gap Closure**: Closes LOW-2 (redundant notifications query in `fetchDashboardData`) and Phase 8 tech debt items (KPI trend placeholders, avgResponseTime placeholder, SUMMARY frontmatter gap) from audit
**Success Criteria** (what must be TRUE):
  1. `fetchDashboardData` no longer fetches `notifications` (the value was discarded by the consumer); layout continues to fetch its own copy
  2. Hardcoded `kpiTrends` array (+12%, +8%, +15%) in `dashboard/page.tsx:139-143` is either replaced with computed period-over-period values or removed entirely (with the trend UI also removed)
  3. Hardcoded `avgResponseTime = "< 1 min"` placeholder is either replaced with a computed value or removed entirely (with the AutomationPerformance card adjusted)
  4. SUMMARY frontmatter `requirements_completed` field backfilled for plans 08-01, 08-02, 08-04, 08-05 to list HOME-01..05 and I18N-01 as appropriate
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. API Foundation | v1.0 | 2/2 | Complete | 2026-03-05 |
| 2. Database Schema | v1.0 | 3/3 | Complete | 2026-03-06 |
| 3. Auth Integration | v1.0 | 2/2 | Complete | 2026-03-27 |
| 4. User Registration | v1.0 | 4/4 | Complete | 2026-03-31 |
| 5. User Login | v1.0 | 2/2 | Complete | 2026-03-31 |
| 6. Password Recovery & Email Verification | v1.0 | 3/3 | Complete | 2026-04-07 |
| 7. Schema & Seed Data | 3/3 | Complete   | 2026-04-10 | - |
| 8. Dashboard Home & Notifications | 5/5 | Complete   | 2026-04-13 | - |
| 9. My Automations | 4/4 | Complete   | 2026-04-14 | - |
| 10. Catalog | 3/3 | Complete    | 2026-04-14 | - |
| 11. Reports & Billing | 3/3 | Complete    | 2026-04-15 | - |
| 12. Settings | 5/5 | Complete    | 2026-04-29 | - |
| 13. Catalog Coverage Fix | v1.1 | 1/1 | Complete | 2026-04-30 |
| 14. i18n & Security Hygiene | 1/2 | In Progress|  | - |
| 15. Dashboard Home Polish | v1.1 | 0/? | Pending | - |
