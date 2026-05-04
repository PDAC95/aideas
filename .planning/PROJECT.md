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

### Active

<!-- v1.2 — Stripe + Production-Ready (TBD via /gsd:new-milestone) -->
- [ ] Stripe Checkout for catalog "Solicitar esta automatizacion" requests
- [ ] Stripe Customer Portal wired to Billing "Manage payment" button
- [ ] Stripe webhooks (subscription created/updated/canceled, invoice paid/failed)
- [ ] FastAPI endpoints: automation request, pause/resume/cancel, billing portal/history, admin activation
- [ ] Carry-over: fix Next.js 16 + Turbopack build blocker on `automations/[id]/page.tsx` (`next/dynamic ssr:false`)
- [ ] Carry-over: replace `<AutomationSuccessRate trend="+5%" />` placeholder with computed value or remove
- [ ] Carry-over: refactor `saveCompanyName` + `saveHourlyCost` to use `assertOrgMembership` helper
- [ ] Carry-over: symmetric reCAPTCHA dev bypass on client (currently only server bypasses)

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

Shipped v1.0 + v1.1 with ~140K LOC (TypeScript + Python + SQL).
Tech stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **FastAPI** + **Supabase** (PostgreSQL + Auth + Realtime + Storage). UI: **shadcn/ui** + **Tailwind CSS v4** + **Recharts**. i18n: **next-intl** (cookie-based, EN/ES). Hosting: **Vercel** (frontend), **Railway** (backend), **Supabase** (database).

**Current state (post-v1.1):** Complete customer dashboard operational. All 7 sections (Home, Automations, Catalog, Reports, Billing, Settings, Notifications) consume real Supabase data with org-scoped RLS. Stripe schema fields exist on `automations` and `subscriptions` tables but no Stripe API integration yet — all payment UI uses mock/seed data per intentional v1.1 scope.

**Audit results (v1.1):** 38/38 requirements satisfied, 9/9 phases verified, 9/9 cross-phase integrations wired, 8/8 E2E flows complete. Status: `tech_debt` (4 carry-over items, see Active above).

**Known tech debt (v1.0 + v1.1, non-blocking unless flagged):**
- v1.0: middleware rename warning, summary inaccuracy in 06-01, brittle error substring match, missing server-side auth guard on /complete-registration, email_confirmed_at not checked in dashboard layout (middleware handles it)
- v1.1 BLOCKER: `next/dynamic ssr:false` build error in `automations/[id]/page.tsx:16` (Next.js 16 + Turbopack)
- v1.1: `<AutomationSuccessRate trend="+5%" />` placeholder, `assertOrgMembership` consolidation opportunity, asymmetric reCAPTCHA bypass

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

## Current Milestone: v1.2 Stripe + Production-Ready (Planning)

**Goal (TBD — define via `/gsd:new-milestone`):** Wire Stripe Checkout + Customer Portal + webhooks to convert v1.1's mock payment UI into real billing; address v1.1 build blocker; harden for production traffic.

**Likely scope:**
- Stripe Checkout for catalog requests
- Stripe Customer Portal for "Manage payment"
- Stripe webhooks (subscription lifecycle, invoice events)
- FastAPI endpoints for business writes (request/pause/resume/cancel/admin)
- Carry-over fixes: Next.js 16 build blocker, AutomationSuccessRate trend placeholder, assertOrgMembership consolidation, symmetric reCAPTCHA dev bypass

---
*Last updated: 2026-05-04 after v1.1 milestone shipped*
