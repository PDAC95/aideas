# Requirements: AIDEAS Customer Portal

**Defined:** 2026-04-09
**Core Value:** Customers can monitor automations, request new ones, and communicate with the AIDEAS team from a single dashboard that proves the ROI of their subscription

## v1.1 Requirements

Requirements for Core Dashboard Experience. Each maps to roadmap phases.

### Schema & Data

- [ ] **DATA-01**: Schema migration ALTERs `automation_templates` with pricing, industry, metric columns and expanded category CHECK
- [ ] **DATA-02**: Schema migration ALTERs `automations` with `stripe_subscription_id` and `in_setup` status
- [ ] **DATA-03**: Schema migration ALTERs `automation_requests` with checkout fields and expanded status CHECK
- [ ] **DATA-04**: Seed 66+ automation templates across 8 categories and 6 industries with realistic pricing and metrics
- [ ] **DATA-05**: Seed demo org data: 5-6 automations, ~500 executions over 60 days, 5-6 requests, 8-10 notifications, org settings with hourly_cost

### Dashboard Home

- [ ] **HOME-01**: User sees personalized greeting with their first name
- [ ] **HOME-02**: User sees 3 KPI summary cards (active automations, tasks this week, hours saved this month)
- [ ] **HOME-03**: User sees compact list of their automations with status and daily metric
- [ ] **HOME-04**: User sees activity feed of last 10-15 execution events
- [ ] **HOME-05**: User can navigate to catalog via "+ Nueva automatizacion" CTA

### My Automations

- [ ] **AUTO-01**: User can view filterable list of automations (All, Active, In Setup, Paused)
- [ ] **AUTO-02**: User sees automation cards with name, category, connected apps, status badge, monthly metric, monthly price
- [ ] **AUTO-03**: User can view automation detail with 3 KPI cards (metric count, hours saved, monthly charge)
- [ ] **AUTO-04**: User sees activity timeline of last 20 executions in detail view
- [ ] **AUTO-05**: User sees weekly bar chart of executions (last 4 weeks) in detail view
- [ ] **AUTO-06**: User sees pause/resume/cancel buttons (UI only — Stripe wired in future milestone)

### Catalog

- [ ] **CATL-01**: User can browse catalog grid with industry chip filters (Todas, Retail, Salud, Legal, Inmobiliaria, Restaurantes)
- [ ] **CATL-02**: User can filter by category tabs (Mas populares, Ventas, Marketing, Atencion al cliente, Documentos, Productividad, Reportes, Agentes IA)
- [ ] **CATL-03**: User can view template detail page with description, connected apps, impact text, setup time, pricing
- [ ] **CATL-04**: User sees "Solicitar esta automatizacion" button (UI only — Stripe Checkout wired in future milestone)

### Reports

- [ ] **REPT-01**: User can select report period (This month, Last month, Last 3 months)
- [ ] **REPT-02**: User sees 3 impact KPI cards (tasks completed, hours saved, estimated value)
- [ ] **REPT-03**: User sees weekly activity bar chart (last ~8 weeks)
- [ ] **REPT-04**: User sees per-automation breakdown table (name, metric label + count, hours saved)
- [ ] **REPT-05**: Estimated value card shows when org has hourly_cost configured, with link to settings when not set

### Billing

- [ ] **BILL-01**: User sees monthly summary card (total active charges, next charge date)
- [ ] **BILL-02**: User sees per-automation monthly charges table
- [ ] **BILL-03**: User sees payment history table (from seed/mock data — Stripe API wired later)
- [ ] **BILL-04**: User sees "Manage payment" button (UI only — Stripe Customer Portal wired later)

### Settings

- [ ] **SETT-01**: User can upload and change profile avatar (Supabase Storage)
- [ ] **SETT-02**: User can edit name and company name
- [ ] **SETT-03**: User can switch language (Español/English)
- [ ] **SETT-04**: User can set hourly cost for value estimation
- [ ] **SETT-05**: User can change password
- [ ] **SETT-06**: User can see active sessions and close all other sessions

### Notifications

- [ ] **NOTF-01**: User sees bell icon in sidebar with unread count badge
- [ ] **NOTF-02**: User can open dropdown with last 20 notifications (icon by type, title, message, timestamp)
- [ ] **NOTF-03**: User can mark all notifications as read

### i18n

- [ ] **I18N-01**: All new dashboard UI text available in both EN and ES under structured translation keys

## v1.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Stripe Integration

- **STRP-01**: Stripe Checkout session for automation purchase
- **STRP-02**: Stripe webhook handler (checkout.session.completed, invoice events, subscription events)
- **STRP-03**: Stripe Customer Portal redirect for payment management
- **STRP-04**: Billing history from Stripe API (replace mock data)
- **STRP-05**: Admin activation endpoint (creates Stripe Subscription on setup completion)
- **STRP-06**: Automation pause/resume/cancel via Stripe subscription lifecycle

### Communication

- **COMM-01**: Real-time chat with AIDEAS team
- **COMM-02**: Status update notes from AIDEAS team during automation setup

### Team Management

- **TEAM-01**: Invite team members to organization
- **TEAM-02**: Assign roles to team members
- **TEAM-03**: Remove team members

### Admin

- **ADMN-01**: Admin panel for AIDEAS team to manage automations and customers

## Out of Scope

| Feature | Reason |
|---------|--------|
| Self-service automation builder | NOT the AIDEAS model — customers don't build automations |
| Empty states for zero-automation users | Seed data covers v1.1; proper empty states in v1.2 |
| Public API | Phase 2+ |
| Mobile app | Phase 2+, PWA may suffice |
| AI chat assistant | Phase 2 |
| Direct integrations (Slack, WhatsApp) | Phase 2 |
| Advanced exportable reports | Phase 2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 7 | Pending |
| DATA-02 | Phase 7 | Pending |
| DATA-03 | Phase 7 | Pending |
| DATA-04 | Phase 7 | Pending |
| DATA-05 | Phase 7 | Pending |
| HOME-01 | Phase 8 | Pending |
| HOME-02 | Phase 8 | Pending |
| HOME-03 | Phase 8 | Pending |
| HOME-04 | Phase 8 | Pending |
| HOME-05 | Phase 8 | Pending |
| NOTF-01 | Phase 8 | Pending |
| NOTF-02 | Phase 8 | Pending |
| NOTF-03 | Phase 8 | Pending |
| I18N-01 | Phase 8 | Pending |
| AUTO-01 | Phase 9 | Pending |
| AUTO-02 | Phase 9 | Pending |
| AUTO-03 | Phase 9 | Pending |
| AUTO-04 | Phase 9 | Pending |
| AUTO-05 | Phase 9 | Pending |
| AUTO-06 | Phase 9 | Pending |
| CATL-01 | Phase 10 | Pending |
| CATL-02 | Phase 10 | Pending |
| CATL-03 | Phase 10 | Pending |
| CATL-04 | Phase 10 | Pending |
| REPT-01 | Phase 11 | Pending |
| REPT-02 | Phase 11 | Pending |
| REPT-03 | Phase 11 | Pending |
| REPT-04 | Phase 11 | Pending |
| REPT-05 | Phase 11 | Pending |
| BILL-01 | Phase 11 | Pending |
| BILL-02 | Phase 11 | Pending |
| BILL-03 | Phase 11 | Pending |
| BILL-04 | Phase 11 | Pending |
| SETT-01 | Phase 12 | Pending |
| SETT-02 | Phase 12 | Pending |
| SETT-03 | Phase 12 | Pending |
| SETT-04 | Phase 12 | Pending |
| SETT-05 | Phase 12 | Pending |
| SETT-06 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 — traceability complete after roadmap creation*
