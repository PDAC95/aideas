# Requirements: AIDEAS Customer Portal — v1.2 Admin Dashboard

**Defined:** 2026-05-04
**Core Value:** Customers can monitor automations, request new ones, and see their ROI from a single bilingual dashboard — paired with an operations team who can fulfill what they request.
**Milestone Goal:** Build the AIDEAS team admin dashboard so the operations team can manage templates, attend customer requests, track in-flight automations, and oversee clients — closing the operational loop that v1.1 left open on the customer-facing side.

## v1.2 Requirements

Requirements for v1.2 release. Each maps to roadmap phases.

### Carry-over Cleanup (CARRY)

> Closes v1.1 audit tech-debt before admin work begins. Ideally lands as the first phase to keep CI green during admin development.

- [x] **CARRY-01**: `npm run build` passes cleanly under Next.js 16 + Turbopack — resolves the `next/dynamic({ ssr: false })` rejection in `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16`
- [x] **CARRY-02**: `<AutomationSuccessRate trend="+5%" />` placeholder in `dashboard/page.tsx:212` is replaced with a computed value or removed (along with its UI surface)
- [x] **CARRY-03**: `saveCompanyName` and `saveHourlyCost` server actions consolidate org-membership checks via the `assertOrgMembership` helper introduced in Phase 14-01 (no inline duplicated checks)
- [x] **CARRY-04**: Client-side reCAPTCHA gracefully bypasses when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is missing (symmetric with server-side `verifyRecaptcha` behavior), unblocking local dev without keys

### Foundation (FOUND)

> Schema, RLS, auth gate, layout. Prerequisite for every admin-facing capability.

- [x] **FOUND-01**: Migration creates `platform_staff` table with `user_id (FK → auth.users PK)`, `role text CHECK ('super_admin'|'operator')`, `created_at timestamptz default now()`, with indexes for FK lookup
- [x] **FOUND-02**: RLS policies on business tables (`organizations`, `automation_templates`, `automation_requests`, `automations`, `automation_executions`, `subscriptions`, `notifications`, `chat_messages`) extend to grant SELECT/INSERT/UPDATE/DELETE when caller exists in `platform_staff` (org-scope bypass for staff)
- [x] **FOUND-03**: Middleware blocks unauthorized access to `/admin/*` — redirects clients-only users to `/dashboard`, unauthenticated to `/login`, only `platform_staff` members proceed
- [x] **FOUND-04**: `/admin/*` layout reuses customer header/sidebar components with admin-specific sidebar items (Home, Catalog, Requests, Automations, Clients) and a visible "AIDEAS Admin" banner/title to distinguish context
- [x] **FOUND-05**: Server-action helper `assertPlatformStaff(role?)` verifies caller is in `platform_staff` (and matches required role if specified) before mutation; returns typed error for UI on failure

### Catalog Admin (CTLG)

> CRUD for `automation_templates`. Replaces editing seed.sql by hand.

- [x] **CTLG-01**: Staff sees a table with ALL templates (including `is_active=false`), filterable by category and industry, with columns: name, slug, category, industries, pricing_tier, setup_price, monthly_price, is_featured, is_active
- [x] **CTLG-02**: Staff can create a new template via a form with all required fields (name i18n key, slug, description, category, industries[], connected_apps[], pricing_tier, setup_price, monthly_price, setup_time_days, typical_impact_text, avg_minutes_per_task, activity_metric_label) and Zod validation
- [x] **CTLG-03**: Staff can edit any field of an existing template and save changes; updates reflect immediately in the customer-facing catalog
- [x] **CTLG-04**: Staff can toggle `is_active` on a template; inactive templates disappear from the customer catalog without being deleted
- [x] **CTLG-05**: Staff can toggle `is_featured` on a template (controls appearance in customer "Mas populares" tab)

### Requests Inbox (REQS)

> Attend incoming customer requests.

- [ ] **REQS-01**: Staff sees list of `automation_requests` filterable by status (pending/approved/rejected), ordered by `created_at` DESC, with columns: customer (org name), template requested, status, created date
- [ ] **REQS-02**: Staff opens request detail page showing customer info, template requested, custom requirements text (if any), status, status history, and creation timestamp
- [ ] **REQS-03**: Staff approves a `pending` request — single-step transition that sets request status to `approved` AND creates a new row in `automations` with status `in_setup`, scoped to the requesting org and linked to the template
- [ ] **REQS-04**: Staff rejects a `pending` request — transition requires a non-empty rejection reason (form validation, stored in request notes); request status becomes `rejected`

### Automations Admin (AUTM)

> Global cross-org view. Read-only fields + status transitions only.

- [ ] **AUTM-01**: Staff sees global list of all `automations` across all orgs, filterable by status (`draft|pending_review|in_setup|active|paused|failed|archived`), by org, and by template
- [ ] **AUTM-02**: Staff transitions an automation from `in_setup` → `active` (marks it ready for customer use)
- [ ] **AUTM-03**: Staff manually pauses (`active` → `paused`) or resumes (`paused` → `active`) an automation from admin
- [ ] **AUTM-04**: Staff archives an automation (`active|paused` → `archived`) from admin
- [ ] **AUTM-05**: Staff opens automation detail page (read-only) showing KPIs (execution count, hours saved), recent execution timeline, owning org, and template info; no field editing — only status transitions via the buttons from AUTM-02/03/04

### Clients (CLNT)

> 360° view of customer organizations.

- [ ] **CLNT-01**: Staff sees list of all `organizations` with columns: name, slug, # active automations, # members, created date
- [ ] **CLNT-02**: Staff can filter/search clients by name or slug
- [ ] **CLNT-03**: Staff opens client detail page showing org info, list of members (email, role, last login), list of automations (with status), and list of automation_requests
- [ ] **CLNT-04**: From client detail, staff can navigate (link/button) to the detail page of any associated automation or request
- [ ] **CLNT-05**: Staff can add and edit free-form internal notes per client (e.g., "VIP", "churn risk"), persisted in a new `organization_notes` field or related table; visible only on admin client detail page

### Admin Home (HOME)

> Operational landing dashboard for the team.

- [ ] **HOME-01**: Staff lands on `/admin` and sees 4 KPI cards: pending requests count, in-setup automations count, total active clients, signups this week
- [ ] **HOME-02**: Staff sees an activity feed of the last 15-20 system events (request created, automation activated, signups, status transitions)
- [ ] **HOME-03**: Staff sees quick-link cards to the most-used screens (Requests inbox with pending count badge, Automations in setup)

### i18n (I18N)

- [x] **I18N-01** (Phase 17 surface complete; cross-cuts 18-22): All admin UI strings have keys in both `en.json` and `es.json` with 100% parity (same project rule as v1.0/v1.1)

## v1.3+ Future Requirements

Deferred to future milestones. Tracked but not in v1.2 roadmap.

### Stripe Integration (STRP) — v1.3

- **STRP-01**: Stripe Checkout for catalog "Solicitar esta automatizacion" requests
- **STRP-02**: Stripe Customer Portal wired to Billing "Manage payment" button
- **STRP-03**: Stripe webhooks for `subscription.created/updated/canceled`
- **STRP-04**: Stripe webhooks for `invoice.paid/failed`
- **STRP-05**: Revenue metrics in admin home (MRR, churn, etc.)
- **STRP-06**: Decision on FastAPI vs Next.js Route Handlers for webhook handling

### Operational Hardening (HARD) — v1.3+

- **HARD-01**: Audit log for admin actions (who approved/rejected/transitioned, when)
- **HARD-02**: Manual notifications/messages from staff to customers
- **HARD-03**: Bulk actions on requests/automations (multi-select + transition)
- **HARD-04**: Request assignment among multiple operators
- **HARD-05**: Staff management UI (invite, change role, deactivate) — currently SQL-only
- **HARD-06**: Export reports / advanced analytics for admin
- **HARD-07**: Seed-vs-prod data cleanup strategy (deferred to v1.3 deploy time)

## Out of Scope for v1.2

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Stripe Checkout / Customer Portal / webhooks | Operations-first sequencing — admin must exist before charging real money. Scheduled for v1.3 |
| FastAPI endpoints for business writes | Revisit alongside Stripe in v1.3; v1.2 admin can use Next.js server actions like the customer side does |
| Audit log of admin actions | Important eventually, not for v1.2 minimum-viable admin |
| Manual notifications/messages from staff to clients | Adds chat/messaging surface; defer until v1.3+ |
| Revenue metrics in admin home | Naturally lands with Stripe integration in v1.3 |
| Request assignment among staff | Premature until there are multiple operators |
| Staff management UI (invite, change role) | Defer — invitation by SQL until it hurts |
| Bulk actions on requests/automations | Defer — single-action workflows until volume demands batching |
| Export reports / advanced analytics | Defer — v1.4+ if/when needed |
| Visual redesign of admin (new theme, dark mode forced) | Layout reuse + banner is enough for 1-3 internal users; redesign is a v2.0 concern |
| Subdomain `admin.aideas.com` | Same-app `/admin/*` is sufficient and reuses all auth/i18n/components |
| Self-service automation builder for staff | Out of business model — AIDEAS builds automations as managed service, not in-portal |
| Seed-vs-prod data cleanup | Deferred to v1.3 deploy time; v1.2 admin operates over whatever data exists |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CARRY-01 | Phase 16 | Complete |
| CARRY-02 | Phase 16 | Complete |
| CARRY-03 | Phase 16 | Complete |
| CARRY-04 | Phase 16 | Complete |
| FOUND-01 | Phase 17 | Complete |
| FOUND-02 | Phase 17 | Complete |
| FOUND-03 | Phase 17 | Complete |
| FOUND-04 | Phase 17 | Complete |
| FOUND-05 | Phase 17 | Complete |
| CTLG-01 | Phase 18 | Complete |
| CTLG-02 | Phase 18 | Complete |
| CTLG-03 | Phase 18 | Complete |
| CTLG-04 | Phase 18 | Complete |
| CTLG-05 | Phase 18 | Complete |
| REQS-01 | Phase 19 | Pending |
| REQS-02 | Phase 19 | Pending |
| REQS-03 | Phase 19 | Pending |
| REQS-04 | Phase 19 | Pending |
| AUTM-01 | Phase 20 | Pending |
| AUTM-02 | Phase 20 | Pending |
| AUTM-03 | Phase 20 | Pending |
| AUTM-04 | Phase 20 | Pending |
| AUTM-05 | Phase 20 | Pending |
| CLNT-01 | Phase 21 | Pending |
| CLNT-02 | Phase 21 | Pending |
| CLNT-03 | Phase 21 | Pending |
| CLNT-04 | Phase 21 | Pending |
| CLNT-05 | Phase 21 | Pending |
| HOME-01 | Phase 22 | Pending |
| HOME-02 | Phase 22 | Pending |
| HOME-03 | Phase 22 | Pending |
| I18N-01 | Phases 17, 18, 19, 20, 21, 22 (cross-cutting) | Phase 17 surface complete; cross-cuts 18-22 |

**Coverage:**
- v1.2 requirements: 31 total
- Mapped to phases: 31 ✓
- Unmapped: 0

---
*Requirements defined: 2026-05-04*
*Last updated: 2026-05-04 — roadmap created, traceability populated*
