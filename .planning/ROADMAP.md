# Roadmap: AIDEAS Customer Portal

## Milestones

- ✅ **v1.0 Backend Foundation + Auth** — Phases 1-6 (shipped 2026-04-08)
- ✅ **v1.1 Core Dashboard Experience** — Phases 7-15 (shipped 2026-05-04)
- 🚧 **v1.2 Admin Dashboard** — Phases 16-22 (in planning, started 2026-05-04)

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

### 🚧 v1.2 Admin Dashboard (Phases 16-22) — IN PLANNING

**Milestone Goal:** Build the AIDEAS team admin dashboard at `app.aideas.com/admin/*` so operations can manage templates, attend customer requests, track in-flight automations, and oversee clients — closing the operational loop that v1.1 left open. Stripe deferred to v1.3 (operations-first sequencing).

**Sequencing rationale:**
- Phase 16 (carry-over) lands FIRST to fix the v1.1 Next.js 16 build blocker so CI stays green during admin development.
- Phase 17 (foundation) is a hard prerequisite for every admin-facing capability — schema, RLS, route gate, layout, helper.
- Phases 18-21 are capability phases. Catalog (18) ships before Requests (19) because requests reference templates. Automations (20) and Clients (21) follow naturally.
- Phase 22 (admin home) lands LAST because it aggregates KPIs and activity from all the surfaces above.
- I18N-01 is cross-cutting and tracked under every UI-bearing phase (17, 18, 19, 20, 21, 22).

#### Summary Checklist

- [ ] **Phase 16: Carry-over Cleanup** — Resolve 4 v1.1 audit tech-debt items so CI is green for v1.2 (3 plans)
- [ ] **Phase 17: Admin Foundation** — `platform_staff` schema + RLS + `/admin/*` gate + admin layout + `assertPlatformStaff` helper (3 plans)
- [ ] **Phase 18: Catalog Admin** — CRUD UI for `automation_templates` with active/featured toggles (3 plans)
- [ ] **Phase 19: Requests Inbox** — List + detail + single-step approve (creates automation) + reject-with-reason (3 plans)
- [ ] **Phase 20: Automations Admin** — Global cross-org list + read-only detail + status transitions (3 plans)
- [ ] **Phase 21: Clients Admin** — Orgs list + search + 360° detail + cross-links + free-form internal notes (3 plans)
- [ ] **Phase 22: Admin Home** — Operational KPIs + activity feed + quick-link cards (2 plans)

## Phase Details

### Phase 16: Carry-over Cleanup
**Goal:** Resolve the 4 v1.1 audit tech-debt items so the build is green and helpers are consolidated before admin work begins.
**Depends on:** Nothing (first phase of milestone, builds on v1.1 baseline)
**Requirements:** CARRY-01, CARRY-02, CARRY-03, CARRY-04
**Success Criteria** (what must be TRUE):
  1. `npm run build` and `npm run lint` pass cleanly under Next.js 16 + Turbopack with no errors and no `next/dynamic ssr:false` rejection
  2. `dashboard/page.tsx` no longer renders the hardcoded `<AutomationSuccessRate trend="+5%" />` placeholder — either a computed value or the surface is removed
  3. `saveCompanyName` and `saveHourlyCost` server actions use the shared `assertOrgMembership` helper, with no inline duplicated org-membership checks
  4. A developer running `npm run dev` without `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` configured can complete signup end-to-end (client matches server's graceful bypass)
**Plans:** 3 plans
- [ ] 16-01-PLAN.md — Fix Next.js 16 build blocker (remove next/dynamic ssr:false wrapper) and strip AutomationSuccessRate trend placeholder
- [ ] 16-02-PLAN.md — Consolidate org-membership role check via assertOrgMembership in saveCompanyName + saveHourlyCost
- [ ] 16-03-PLAN.md — Add dev-only reCAPTCHA bypass to signup form (NODE_ENV-gated, empty-string token, prod hard-fails)

### Phase 17: Admin Foundation
**Goal:** Establish the schema, RLS, route gate, layout, and server-action helper that every admin capability builds on.
**Depends on:** Phase 16
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Migration creates `platform_staff` table with `(user_id, role, created_at)` and the `role` CHECK constraint accepts only `super_admin` or `operator`
  2. RLS policies on the 8 business tables grant full CRUD to any caller present in `platform_staff`, while preserving existing org-scoped policies for clients
  3. A non-staff authenticated user navigating to `/admin` is redirected to `/dashboard`; an unauthenticated user is redirected to `/login`; a `platform_staff` member loads the admin shell
  4. `/admin` renders the customer header/sidebar with a visible "AIDEAS Admin" banner and an admin-specific sidebar (Home, Catalog, Requests, Automations, Clients) — no theme/redesign changes
  5. `assertPlatformStaff(role?)` returns a typed error when caller is not staff or lacks the required role, and is callable from any server action
  6. All admin shell strings (banner, sidebar items, role-denied messages) exist in both `en.json` and `es.json` with parity
**Plans:** 1/3 plans executed
- [ ] 17-01-PLAN.md — platform_staff schema + helper functions + RLS extensions on 11 business tables + super_admin seed for pdmckinster@gmail.com
- [ ] 17-02-PLAN.md — Independent admin sessions (sb-admin-* cookie scope), middleware /admin gate + /dashboard staff redirect, /admin/login page + form, signInStaff/signOutStaff actions, assertPlatformStaff helper
- [ ] 17-03-PLAN.md — Fresh AdminLayout + AdminSidebar + AdminHeader (no customer-component reuse) with ADMIN badge, 5 placeholder pages, admin.* i18n keys with EN/ES parity

### Phase 18: Catalog Admin
**Goal:** Operations can manage the `automation_templates` catalog through UI instead of editing seed.sql.
**Depends on:** Phase 17
**Requirements:** CTLG-01, CTLG-02, CTLG-03, CTLG-04, CTLG-05, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Staff loads `/admin/catalog` and sees ALL templates (including `is_active=false`) with name, slug, category, industries, pricing tier, setup price, monthly price, is_featured, is_active columns; filters by category and industry work
  2. Staff creates a new template through a form with Zod validation on every required field (name i18n key, slug, description, category, industries[], connected_apps[], pricing_tier, setup_price, monthly_price, setup_time_days, typical_impact_text, avg_minutes_per_task, activity_metric_label) and the new template appears in the list
  3. Staff edits any field on an existing template; saves persist and the customer-facing `/dashboard/catalog` reflects the change on next load
  4. Staff toggles `is_active` off on a template and that template no longer appears in the customer catalog (but is still visible in admin list)
  5. Staff toggles `is_featured` and the template appears/disappears in the customer "Mas populares" tab accordingly
  6. All admin catalog UI strings (table headers, form labels, validation messages, toggle labels) have EN/ES parity
**Plans:** TBD (sketched: 18-01 list + filters, 18-02 create/edit form + validation, 18-03 active/featured toggles + customer-side propagation check)

### Phase 19: Requests Inbox
**Goal:** Operations can attend and triage incoming customer automation requests, with single-step approval that provisions the automation.
**Depends on:** Phase 18
**Requirements:** REQS-01, REQS-02, REQS-03, REQS-04, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Staff loads `/admin/requests` and sees a list of `automation_requests` ordered by `created_at` DESC, filterable by status (pending/approved/rejected), with customer org, template, status, and created date columns
  2. Staff opens a request detail page that shows customer info, template requested, custom requirements text (if any), status, status history, and creation timestamp
  3. Staff approves a `pending` request via a single button — request status flips to `approved` AND a new row appears in `automations` with status `in_setup`, scoped to the requesting org and linked to the template (verifiable by SQL)
  4. Staff rejecting a request must enter a non-empty rejection reason; submitting empty fails form validation; on success the request status is `rejected` and the reason is persisted in request notes
  5. All inbox UI strings (filters, columns, detail labels, approve/reject buttons, validation errors) have EN/ES parity
**Plans:** TBD (sketched: 19-01 inbox list + filters, 19-02 detail page + status history, 19-03 approve/reject server actions with assertPlatformStaff)

### Phase 20: Automations Admin
**Goal:** Operations can monitor and transition the status of every automation across all orgs from a global view.
**Depends on:** Phase 17 (Phase 19 helpful but not strictly required)
**Requirements:** AUTM-01, AUTM-02, AUTM-03, AUTM-04, AUTM-05, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Staff loads `/admin/automations` and sees a global list of all `automations` across all orgs, filterable by status (`draft|pending_review|in_setup|active|paused|failed|archived`), by org, and by template
  2. Staff transitions an automation from `in_setup` → `active` via a dedicated button; status updates and the change is visible to the owning customer's `/dashboard/automations`
  3. Staff manually pauses (`active` → `paused`) and resumes (`paused` → `active`) any automation from the admin detail page
  4. Staff archives an automation (`active|paused` → `archived`) via a dedicated button; archived automations remain in the admin list but disappear from the customer's active filter
  5. The admin automation detail page shows KPIs (execution count, hours saved), recent execution timeline, owning org, and template info — with NO field editing, only the status transition buttons from above
  6. All automations admin UI strings (filters, status labels, action buttons, detail labels) have EN/ES parity
**Plans:** TBD (sketched: 20-01 global list + filters + org/template joins, 20-02 read-only detail page with KPIs + timeline, 20-03 status transition buttons + server actions)

### Phase 21: Clients Admin
**Goal:** Operations get a 360° view of every customer organization — list, search, members, automations, requests, and free-form internal notes.
**Depends on:** Phase 19 (request links), Phase 20 (automation links)
**Requirements:** CLNT-01, CLNT-02, CLNT-03, CLNT-04, CLNT-05, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Staff loads `/admin/clients` and sees all `organizations` with name, slug, # active automations, # members, and created date columns
  2. Staff filters/searches clients by name or slug and the list narrows accordingly
  3. Staff opens a client detail page showing org info, list of members (email, role, last login), list of automations (with status), and list of automation_requests (with status)
  4. From client detail, staff clicks any automation row to navigate to its admin detail page (Phase 20) and any request row to navigate to its admin detail page (Phase 19)
  5. Staff adds and edits free-form internal notes per client (e.g., "VIP", "churn risk"); notes persist via a new `organization_notes` column or related table and are visible only on the admin client detail page (never to the customer)
  6. All clients admin UI strings (table headers, search placeholder, detail section labels, notes editor) have EN/ES parity
**Plans:** TBD (sketched: 21-01 migration for org notes + list with stats, 21-02 detail page with members/automations/requests + cross-links, 21-03 notes CRUD with assertPlatformStaff)

### Phase 22: Admin Home
**Goal:** Operations land on `/admin` and immediately see what needs attention — pending requests, in-setup automations, active clients, and weekly signups — plus an activity feed and quick-link cards.
**Depends on:** Phases 18, 19, 20, 21 (consumes data from all of them)
**Requirements:** HOME-01, HOME-02, HOME-03, I18N-01 (cross-cutting)
**Success Criteria** (what must be TRUE):
  1. Staff loads `/admin` and sees 4 KPI cards with live counts: pending requests, in-setup automations, total active clients, signups this week
  2. Staff sees an activity feed of the last 15-20 system events (request created, automation activated, signup, status transition) ordered most-recent first, each with a relative timestamp
  3. Staff sees quick-link cards to the most-used screens — Requests inbox (with pending count badge) and Automations in setup — each clickable to the corresponding admin screen
  4. KPI counts and activity feed reflect actual database state at request time (no stale or hardcoded values)
  5. All admin home UI strings (KPI labels, activity feed event types, quick-link card titles) have EN/ES parity
**Plans:** TBD (sketched: 22-01 KPI cards + queries, 22-02 activity feed + quick-link cards + i18n)

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
| 16. Carry-over Cleanup | v1.2 | 0/3 | Not started | — |
| 17. Admin Foundation | 1/3 | In Progress|  | — |
| 18. Catalog Admin | v1.2 | 0/3 | Not started | — |
| 19. Requests Inbox | v1.2 | 0/3 | Not started | — |
| 20. Automations Admin | v1.2 | 0/3 | Not started | — |
| 21. Clients Admin | v1.2 | 0/3 | Not started | — |
| 22. Admin Home | v1.2 | 0/2 | Not started | — |
