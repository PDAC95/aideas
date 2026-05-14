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



## v1.2 Admin Dashboard (Shipped: 2026-05-14)

**Phases:** 9 (Phases 16-24) | **Plans:** 25 | **Requirements:** 31/31
**Timeline:** 11 days (2026-05-04 → 2026-05-14)
**LOC:** +91,966 / -1,114 across 453 files (TypeScript + SQL + docs)
**Git range:** `fix(16-01)` → `merge: v1.2 Admin Dashboard milestone` (112 feat commits)

**Delivered:** Complete AIDEAS team admin dashboard at `app.aideas.com/admin/*` — operations can manage the template catalog with CRUD UI, triage and approve/reject customer automation requests with single-step provisioning, monitor every automation across all orgs with status transitions, get a 360° view of every client organization with cross-linked tabs, and oversee the platform from a home page with operational KPIs and activity feed. Stripe remains deferred to v1.3 (operations-first sequencing — fulfillment before billing).

**Key accomplishments:**
1. Carry-over cleanup (Phase 16) — unblocked Next.js 16 + Turbopack build by removing `next/dynamic ssr:false`, stripped `+5%` trend placeholder, consolidated `assertOrgMembership` helper across server actions, added dev-friendly reCAPTCHA bypass
2. Admin foundation (Phase 17) — `platform_staff` table + `is_platform_staff`/`is_super_admin` SECURITY DEFINER helpers + RLS extensions across 11 business tables, two-cookie session scheme (sb-* customer + sb-admin-* staff coexisting), `/admin/*` middleware gate, fresh AdminLayout/Sidebar/Header with orange ADMIN badge, `assertPlatformStaff` typed helper, 27-key `admin.*` i18n namespace EN/ES parity
3. Catalog admin (Phase 18) — full CRUD UI for `automation_templates` with active/featured toggles, soft-delete via `is_active`, per-template translations (EN/ES) for name/description/typical_impact/activity_metric, slug-immutable edit, list filters by category/industry
4. Requests inbox (Phase 19) — `/admin/requests` list with status tabs (Pending/Approved/Rejected + counters), FIFO ordering, detail page with single-step approve (INSERT `automations` with `status=in_setup`), reject-with-reason modal (Zod 10-500 char), race-guarded UPDATE, customer notification fan-out via revalidatePath
5. Automations admin (Phase 20) — global cross-org `/admin/automations` list with filters (status/org/text), read-only detail with execution timeline + weekly chart + setup notes, status transitions (in_setup → active → paused → archived) with notifyOrgMembers fan-out
6. Clients admin (Phase 21) — `/admin/clients` orgs list with text search + 360° detail per org showing members/automations/requests tabs + free-form internal notes, cross-link affordances to /admin/requests and /admin/automations
7. Admin home (Phase 22) — operational KPI cards (pending requests, in-setup automations, active orgs, new signups 7d), activity feed (last 25 events across requests/automations/clients), quick-link cards to each admin surface
8. Gap closure — Client 360 cross-links fix (Phase 23): slug-or-uuid `resolveOrgIdentifier` helper, `?org=` URL filter wired into /admin/requests + /admin/automations, AdminOrgFilterChip with notFound state; Phase 16 retroactive verification (Phase 24): backfilled 16-VERIFICATION.md citing 5 commits + live build/lint, REQUIREMENTS.md coverage reconciled to 31/31
9. I18N-01 cross-cutting verified — `admin.*` namespace grew from 27 keys (Phase 17) to 875+ keys (Phase 22) with full EN/ES parity, programmatic diff returns zero key mismatches

**Tech debt carried forward (4 items, see milestones/v1.2-MILESTONE-AUDIT.md):**
- Language switcher missing in admin shell — blocks I18N runtime UAT across all admin surfaces (cross-cutting tech debt, tracked in CLAUDE.md)
- Dark mode toggle missing in admin shell — `dark:` Tailwind classes wired across components but no UI control exists (same surface as language switcher)
- Pre-existing lint debt: 103 errors / 1589 warnings (~95 in `web/public/landing/js/*.js` vendor minified, ~8 in non-CARRY app source). Verified pre-existing via clean-tree reproduction. CARRY-01 `npm run build` exit 0 — lint surface deferred to a future cleanup phase
- Phase 16-03 partial RLS hardening gaps — out of CARRY-04 scope, tracked separately for a future RLS phase

**Archives:**
- [v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)
- [v1.2-REQUIREMENTS.md](milestones/v1.2-REQUIREMENTS.md)
- [v1.2-MILESTONE-AUDIT.md](milestones/v1.2-MILESTONE-AUDIT.md)

---

