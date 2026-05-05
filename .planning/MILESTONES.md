# Milestones

## v1.0 Backend Foundation + Auth (Shipped: 2026-04-08)

**Phases:** 6 | **Plans:** 16 | **Requirements:** 54/54
**Timeline:** 70 days (2026-01-28 → 2026-04-08)
**LOC:** ~110K (TypeScript + Python) | **Files changed:** 441
**Git range:** `feat(01-01)` → `feat(06-03)` + 3 quick tasks

**Delivered:** Complete authentication system — users can sign up (email or Google), verify email, log in with persistent sessions, and recover forgotten passwords, backed by a production-ready FastAPI API and 11-table Supabase schema with RLS.

**Key accomplishments:**
1. FastAPI backend production-ready with Supabase client, CORS, structured logging, health checks, and Docker/Railway deployment config
2. 11 Supabase tables with row-level security policies, versioned migrations, and comprehensive seed data
3. Supabase Auth configured for email/password + Google OAuth with AIDEAS-branded bilingual email templates (EN/ES)
4. Full user registration flow: signup form with Zod validation, Google OAuth, automatic org creation, reCAPTCHA protection
5. Login with JWT session persistence, remember-me cookies, multi-tab sync (AuthSync), and middleware auth guards
6. Password recovery + email verification with enumeration protection, defense-in-depth middleware gate, and branded landing page

**Tech debt carried forward:** 5 non-blocking items (see milestones/v1.0-MILESTONE-AUDIT.md)

**Archives:**
- [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md)
- [v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md)

---


## v1.1 Core Dashboard Experience (Shipped: 2026-05-04)

**Phases:** 9 (Phases 7-15) | **Plans:** 28 | **Requirements:** 38/38
**Timeline:** 21 days (2026-04-10 → 2026-05-01)
**LOC:** +28,861 / -394 across 143 files (TypeScript + SQL)
**Git range:** `feat(07-01)` → `feat(14-01)` + closing docs commits

**Delivered:** Complete customer-facing dashboard with all 7 sections operational on real Supabase data — customers can monitor automation health (KPIs, activity feed, notifications), browse 66+ templates with filters, view automation detail with execution timeline and weekly chart, see ROI in Reports, review billing with mock payment history, and manage their profile (avatar, language, hourly cost, password, sessions). Stripe Checkout/Portal intentionally deferred to v1.2 — all payment UI uses mock/seed data.

**Key accomplishments:**
1. Schema expansion + 66+ template seed — migration adds pricing, industry_tags, connected_apps, typical_impact_text columns plus 60-day demo execution history
2. Dashboard home with KPIs + activity feed + notification bell — personalized greeting, 3 live KPI cards (active automations, tasks this week, hours saved), realtime unread badge, EN/ES translation parity
3. My Automations with detail views — filterable list (All/Active/In Setup/Paused), per-automation page with KPIs, execution timeline (last 20), weekly bar chart, lifecycle action buttons (UI-only, Stripe deferred)
4. Catalog with 66+ templates — industry chips (Retail/Salud/Legal/Inmobiliaria/Restaurantes/Agencias), category tabs (Mas populares/Ventas/Marketing/Atencion al cliente/Documentos/Productividad/Reportes/Agentes IA/Operations), template detail with mock "Solicitar" button
5. Reports & Billing — period selector (This month/Last month/Last 3 months), 3 impact KPI cards (tasks, hours saved, estimated value gated by hourly_cost), weekly chart (~8 weeks), per-automation breakdown table, mock payment history
6. Settings full — avatar upload via Supabase Storage, profile edit, language switch (EN/ES), hourly cost (feeds Reports estimated value), password change, active session management
7. Audit gap closures (Phases 13-15) — registered `operations` category + `agencias` industry in i18n/UI, hardened `updateAutomationStatus` with org-membership check via `assertOrgMembership` helper, replaced hardcoded "Just now" with shared `formatRelativeTime` (i18n-aware), eliminated KPI trend / avgResponseTime placeholders

**Tech debt carried forward (4 items, see milestones/v1.1-MILESTONE-AUDIT.md):**
- BLOCKER: `next/dynamic({ ssr: false })` build error in `automations/[id]/page.tsx:16` under Next.js 16 + Turbopack
- `<AutomationSuccessRate trend="+5%" />` placeholder in `dashboard/page.tsx:212` (locked OUT-OF-SCOPE per Phase 15 decision)
- `saveCompanyName` + `saveHourlyCost` should use `assertOrgMembership` helper instead of inline checks
- Asymmetric reCAPTCHA bypass — server bypasses gracefully, client hard-fails when keys missing (dev-env friction)

**Archives:**
- [v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)
- [v1.1-REQUIREMENTS.md](milestones/v1.1-REQUIREMENTS.md)
- [v1.1-MILESTONE-AUDIT.md](milestones/v1.1-MILESTONE-AUDIT.md)

---


