# AIDEAS Customer Portal

## What This Is

A customer portal (app.aideas.com) for AIDEAS — an AI automation managed service for SMBs. The portal lets customers monitor their automations, browse the 66+ template catalog, request new automations, see ROI through Reports, manage billing, and configure their profile. Built with Next.js 16 + FastAPI + Supabase. v1.0 shipped backend foundation + auth; v1.1 shipped the complete customer-facing dashboard with mock payment UI.

## Core Value

Customers can monitor their automations' performance, request new ones, and see the ROI of their subscription — all from a single bilingual dashboard.

## Requirements

### Validated

<!-- v1.0 — Backend Foundation + Auth -->
- ✓ FastAPI backend with Supabase integration, CORS, health checks, structured logging — v1.0
- ✓ Database schema: 11 tables (organizations, profiles, members, templates, automations, executions, requests, subscriptions, chat_messages, notifications, invitations) — v1.0
- ✓ RLS policies on all tables and Supabase migrations — v1.0
- ✓ Supabase Auth integration (email/password + Google OAuth) — v1.0
- ✓ JWT validation in FastAPI endpoints — v1.0
- ✓ AIDEAS-branded bilingual email templates (EN/ES) — v1.0
- ✓ User registration with email verification, org auto-creation, reCAPTCHA — v1.0
- ✓ User login with JWT session persistence, remember-me, multi-tab sync — v1.0
- ✓ Password recovery flow with enumeration protection — v1.0
- ✓ Email verification flow with middleware gate — v1.0
- ✓ Comprehensive seed data for development — v1.0

<!-- v1.1 — Core Dashboard Experience -->
- ✓ Schema expansion: ALTER templates/automations/requests + seed 66+ templates + 60-day demo data — v1.1
- ✓ Dashboard home with personalized greeting, 3 KPI cards, automation list, activity feed — v1.1
- ✓ Notification bell with unread count badge, dropdown, mark-all-read — v1.1
- ✓ My Automations: filterable list (All/Active/In Setup/Paused), detail page, KPIs, weekly chart, execution timeline — v1.1
- ✓ Automation lifecycle action UI (pause/resume/cancel) — v1.1 (UI only, Stripe wiring deferred)
- ✓ Catalog with 66+ templates, industry chips (6), category tabs (9), template detail page — v1.1
- ✓ Reports with period selector, 3 impact KPI cards, weekly chart (~8 weeks), per-automation breakdown — v1.1
- ✓ Estimated value gated by org `hourly_cost`; link to Settings when unset — v1.1
- ✓ Billing with monthly summary card, per-automation charges table, mock payment history — v1.1
- ✓ Settings: avatar upload (Supabase Storage), profile edit, language switch, hourly cost, password change, session management — v1.1
- ✓ Full EN/ES i18n parity (477+ translation keys, 0 only-in-EN, 0 only-in-ES) — v1.1
- ✓ Defense-in-depth: `assertOrgMembership` helper on lifecycle write actions — v1.1

<!-- v1.2 — Admin Dashboard -->
- ✓ Carry-over cleanup: Next.js 16 build blocker fixed, KPI placeholder stripped, `assertOrgMembership` consolidated in settings.ts, symmetric reCAPTCHA dev bypass — v1.2
- ✓ `platform_staff` schema with `super_admin | operator` roles + RLS extensions on 11 business tables + SECURITY DEFINER helpers (`is_platform_staff`, `is_super_admin`) — v1.2
- ✓ Two-cookie session scheme (sb-* customer + sb-admin-* staff coexisting), `/admin/*` middleware gate, `assertPlatformStaff` typed helper — v1.2
- ✓ Admin shell: AdminLayout + AdminSidebar + AdminHeader (orange ADMIN badge), 5 admin surfaces (home/catalog/requests/automations/clients) — v1.2
- ✓ Catalog admin: full CRUD UI for `automation_templates` with active/featured toggles, soft-delete via is_active, per-template EN/ES translations — v1.2
- ✓ Requests inbox: `/admin/requests` list with status tabs + FIFO ordering, detail page with single-step approve (provisions automation), reject-with-reason — v1.2
- ✓ Automations admin: global cross-org list with filters, read-only detail with timeline/chart, status transitions with notification fan-out — v1.2
- ✓ Clients admin: orgs list with text search, 360° detail with members/automations/requests tabs + internal notes, cross-link affordances — v1.2
- ✓ Admin home: operational KPI cards + activity feed (last 25 events) + quick-link cards — v1.2
- ✓ Client 360 cross-link fix (gap closure): slug-or-uuid `resolveOrgIdentifier` + `?org=` URL filter wired into /admin/requests + /admin/automations — v1.2
- ✓ Phase 16 retroactive verification (process gap closure): 16-VERIFICATION.md backfilled, REQUIREMENTS.md reconciled to 31/31 — v1.2
- ✓ admin.* i18n namespace grew to 875+ keys with full EN/ES parity (programmatic diff: zero key mismatches) — v1.2

### Active

<!-- v1.3 — Public Funnel & Factory Reskin -->
- [ ] Design system migration (OKLCH → Factory.ai tokens: light theme, Code Orange #ef6f2e, no shadows, Geist Sans/Mono, 4px/6px radii)
- [ ] Catalog data model rework (functional_areas + scenarios + scenario_templates pivot; replaces industry-led classification)
- [ ] Scenario content seed (50 client-language scenarios mapped to ~135 n8n templates, pain copy, 7 functional areas)
- [ ] Public landing page at `/` (SSR, no login, Hero/Working Process/Services/Pricing/FAQ/CTA)
- [ ] Public catalog navigation at `/catalog` (SSR, anonymous browsing, no login gate)
- [ ] Scenario selector + ROI calculator (multi-select scenarios → personalized plan with employee-cost equivalent)
- [ ] Lead capture flow (email gate at peak intent → pre-call context form, 4-5 structured questions, NOT chat)
- [ ] Lead enrichment into existing admin dashboard (leads surface in admin)
- [ ] Reskin customer dashboard (7 sections) with Factory tokens
- [ ] Reskin admin dashboard (5 sections) with Factory tokens
- [ ] Resolve v1.2 carry-over: language switcher + dark mode toggle in admin shell

## Current Milestone: v1.3 Public Funnel & Factory Reskin

**Goal:** Convert the login-gated catalog into a public lead-generation funnel — anonymous browsing of client-language scenarios, ROI calculation, email + pre-call form capture — and reskin both dashboards with the Factory.ai design system.

**Target features:**
- Public surfaces (landing + catalog) with SEO + SSR — no login required
- Scenario-based catalog (50 scenarios in 7 functional areas, mapped to 135 n8n templates) replaces industry-led catalog
- ROI calculator that frames automation savings as employee-cost equivalents
- Email + pre-call context form (form, not chat) as lead capture
- Factory.ai design system applied across public + customer + admin surfaces
- Resolve admin shell carry-over (language switcher + dark mode toggle)

**Explicit deferrals (NOT in v1.3):**
- Stripe integration — manual invoicing / e-Transfer until customer 5+
- AI conversational chat — replaced with structured pre-call form
- DIY automation builder — still out of scope per managed service model

**Why this scope:** 0 paying customers. The current portal is locked behind login, killing SEO, organic traffic, and pre-signup interest validation. v1.3 inverts this to capture leads at peak intent.

### Out of Scope

- Self-service automation builder — NOT the AIDEAS model, customers don't build automations
- Real-time chat with AIDEAS team — deferred (post-v1.2)
- Team management / invitations — deferred (post-v1.2)
- Admin panel for AIDEAS team — deferred (post-v1.2)
- Status update notes during setup — deferred
- Empty states for zero-automation users — covered by seed data; revisit if real customers ship without seed
- Public API — Phase 2+
- Mobile app — Phase 2+, PWA may suffice
- AI chat assistant for needs discovery — Phase 2
- Direct integrations (Slack, WhatsApp) — Phase 2
- Advanced exportable reports — Phase 2

## Context

Shipped v1.0 + v1.1 + v1.2 with ~230K LOC (TypeScript + Python + SQL).
Tech stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **FastAPI** + **Supabase** (PostgreSQL + Auth + Realtime + Storage). UI: **shadcn/ui** + **Tailwind CSS v4** + **Recharts**. i18n: **next-intl** (cookie-based, EN/ES). Hosting: **Vercel** (frontend), **Railway** (backend), **Supabase** (database).

**Current state (post-v1.2):** Both halves of the product operational — customer portal (v1.1) + admin dashboard (v1.2). Customer side: 7 sections (Home, Automations, Catalog, Reports, Billing, Settings, Notifications) on real Supabase data. Admin side at `app.aideas.com/admin/*`: 5 surfaces (Home, Catalog, Requests, Automations, Clients) with platform_staff RLS, two-cookie session scheme, single-step request approval that provisions automations, cross-org visibility with `?org=` filter. Stripe schema fields exist but NO Stripe API integration — payment UI uses mock/seed data, deferred to v1.3.

**Audit results (v1.2):** 31/31 requirements satisfied, 9/9 phases verified, 12/12 cross-phase wirings, 13/13 E2E flows. Status: `passed`. Two gap-closure phases (23 + 24) brought milestone to clean pass.

**Known tech debt (v1.0 + v1.1 + v1.2, non-blocking):**
- v1.0: middleware rename warning, summary inaccuracy in 06-01, brittle error substring match, missing server-side auth guard on /complete-registration
- v1.2: language switcher missing in admin shell (blocks I18N runtime UAT on admin surfaces); dark mode toggle missing in admin shell (`dark:` classes wired but no UI control)
- v1.2: pre-existing lint debt (103 errors / 1589 warnings) — ~95 in `web/public/landing/js/*.js` minified vendor, ~8 in non-CARRY app source files (queries.ts any types, React 19 strict-render warnings). Verified pre-existing via clean-tree reproduction.
- v1.2: Phase 16-03 partial RLS hardening gaps — out of CARRY-04 scope, tracked separately

## Constraints

- **Frontend stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts
- **Backend stack**: FastAPI + Python 3.12 + Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Payments**: Stripe (checkout, customer portal, webhooks) — schema ready in v1.1, integration in v1.2
- **Email**: Resend for transactional emails
- **Hosting**: Vercel (frontend), Railway (backend), Supabase (database)
- **Auth**: Supabase Auth handles registration, login, OAuth, email verification
- **Realtime**: Supabase Realtime for notifications
- **Budget**: ~$30-65/mo for MVP infrastructure

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for auth + DB + realtime | Single service for multiple concerns, reduces complexity | ✓ Good — auth flows work, RLS enforces tenant isolation across 14 tables |
| FastAPI over Next.js API routes | Better for background jobs, Stripe webhooks, email sending, Python ecosystem | — Pending — JWT validation in place; v1.1 dashboard does NOT consume FastAPI (uses Supabase directly via SSR + server actions). Reassess in v1.2 when Stripe webhooks ship |
| shadcn/ui component library | Customizable, accessible, works with Tailwind, no vendor lock-in | ✓ Good — consistent UI across auth + dashboard |
| Managed service model (no DIY builder) | Core business differentiator — simplicity for customer, IP retention for AIDEAS | ✓ Good — v1.1 dashboard delivers the monitoring story without builder complexity |
| next-intl with cookie-based locale | Avoids URL path routing complexity, simple NEXT_LOCALE cookie | ✓ Good — works across all pages, 477+ keys with 100% EN/ES parity |
| Server-side JWT validation via supabase.auth.get_user() | Authoritative, handles expiry/revocation without local decode | ✓ Good — single source of truth |
| In-memory rate limiter (slowapi) | Sufficient for single Railway instance, no Redis dependency | ⚠️ Revisit — needs distributed limiter when scaling to multiple instances |
| reCAPTCHA v3 with dev bypass | Client-side "dev-bypass" token when key not configured | ⚠️ Revisit — server bypasses gracefully, client hard-fails (asymmetry). Add symmetric client bypass in v1.2 |
| handle_new_user trigger for org creation | Atomic org + profile + membership on every signup | ✓ Good — no race conditions, works for both email and OAuth |
| Server Components + Supabase Realtime (no React Query/SWR) | Reduces bundle size, RSC handles fetching, realtime for live updates | ✓ Good — v1.1 dashboard is RSC-first, only `"use client"` for forms/charts |
| Stripe DEFERRED to v1.2 (v1.1 ships with mock UI) | De-risk dashboard delivery; Stripe wiring is independent of UI shells | ✓ Good — all 7 dashboard sections shipped on time with mock data; Stripe is a clean v1.2 starter |
| `assertOrgMembership` server-action helper (Phase 14) | Centralize org-membership check across lifecycle writes | ✓ Good — applied to `updateAutomationStatus`; settings.ts saves still inline (consolidation opportunity for v1.2) |
| `formatRelativeTime` shared client helper (Phase 14-02) | DRY i18n-aware time formatting across notification-bell + automation detail | ✓ Good — replaces hardcoded "Just now" / "5m" strings; honors locale |
| Recharts via shadcn/ui chart wrapper (Phase 9 + 11) | First-class shadcn integration, no separate styling system | ✓ Good — used in WeeklyBarChart, ReportsWeeklyChart |
| Avatar upload via Supabase Storage (Phase 12-01) | Consistent storage with rest of stack, RLS-aware | ✓ Good — bucket policies scope per-user, public URLs cached on CDN |
| Decimal phase numbering for audit gap closures (Phases 13-15) | Clear insertion semantics — "fixes after milestone" vs renumbering | ✓ Good — phases 13/14/15 cleanly close 5 audit findings without disturbing 7-12 history |

## Next Milestone: v1.4 (TBD)

**Likely scope (deferred from v1.3):** Stripe Checkout + Customer Portal + webhooks, once the public funnel proves traction and customer 5 is reached.

---
*Last updated: 2026-05-14 — v1.3 milestone started (Public Funnel & Factory Reskin)*
