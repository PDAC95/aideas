# AIDEAS Customer Portal

## What This Is

A customer portal (app.aideas.com) for AIDEAS — an AI automation managed service for SMBs. The portal lets customers monitor their automations, browse the catalog, request new automations, communicate with the AIDEAS team via real-time chat, manage their team, and handle billing. Built with Next.js 14 + FastAPI + Supabase. v1.0 shipped the backend foundation and complete authentication system.

## Core Value

Customers can monitor their automations' performance, request new ones, and communicate with the AIDEAS team — all from a single dashboard that proves the ROI of their subscription.

## Requirements

### Validated

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

### Active

<!-- v1.1 — Core Dashboard Experience -->
- [ ] Dashboard home with KPIs, automation list, activity feed
- [ ] My Automations list with detail views, pause/resume/cancel via Stripe
- [ ] Automation catalog (66+ templates) with industry/category filters and Stripe Checkout purchase flow
- [ ] Reports with impact metrics, weekly charts, per-automation breakdown, optional value estimation
- [ ] Billing summary, monthly charges, payment history via Stripe API, Customer Portal
- [ ] Settings: profile, preferences (language, hourly cost), security (change password, session management)
- [ ] Notifications dropdown with unread count, created by business operations
- [ ] Schema migration: ALTER templates/automations/requests + seed 66+ templates + demo data
- [ ] FastAPI endpoints: automation request, pause/resume/cancel, billing portal/history, Stripe webhooks, admin activation

### Out of Scope

- Self-service automation builder — NOT the AIDEAS model, customers don't build automations
- Real-time chat with AIDEAS team — v1.2
- Team management / invitations — v1.2
- Admin panel for AIDEAS team — v1.2
- Status update notes during setup — v1.2
- Empty states for zero-automation users — v1.2 (seed data covers v1.1)
- Public API — Phase 2+
- Mobile app — Phase 2+, PWA may suffice
- AI chat assistant for needs discovery — Phase 2
- Direct integrations (Slack, WhatsApp) — Phase 2
- Advanced exportable reports — Phase 2

## Context

Shipped v1.0 with ~110K LOC (TypeScript + Python).
Tech stack: Next.js 14 (App Router) + FastAPI + Supabase (PostgreSQL + Auth + Realtime + Storage).
Hosting: Vercel (frontend), Railway (backend), Supabase (database).

**Current state:** Complete authentication system operational. Users can sign up (email or Google), verify email, log in with persistent sessions, and recover forgotten passwords. FastAPI backend has JWT validation and rate limiting ready for business endpoints. 11 database tables with RLS in place, 8 business tables (automations, requests, etc.) ready but no frontend consumer yet.

**Known tech debt (5 items, non-blocking):** middleware rename warning, summary inaccuracy in 06-01, brittle error substring match, missing server-side auth guard on /complete-registration, email_confirmed_at not checked in dashboard layout (middleware handles it).

**i18n:** next-intl configured with cookie-based locale (EN/ES), no URL routing. Translation keys cover all auth flows.

## Constraints

- **Frontend stack**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend stack**: FastAPI + Python 3.12 + Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Payments**: Stripe (checkout, customer portal, webhooks)
- **Email**: Resend for transactional emails
- **Hosting**: Vercel (frontend), Railway (backend), Supabase (database)
- **Auth**: Supabase Auth handles registration, login, OAuth, email verification
- **Realtime**: Supabase Realtime for chat and notifications
- **Budget**: ~$30-65/mo for MVP infrastructure

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for auth + DB + realtime | Single service for multiple concerns, reduces complexity | ✓ Good — auth flows work well, RLS enforces tenant isolation |
| FastAPI over Next.js API routes | Better for background jobs, Stripe webhooks, email sending, Python ecosystem | ✓ Good — JWT validation, rate limiting in place; not yet consumed by frontend (intentional) |
| shadcn/ui component library | Customizable, accessible, works with Tailwind, no vendor lock-in | ✓ Good — consistent UI across all auth pages |
| Managed service model (no DIY builder) | Core business differentiator — simplicity for customer, IP retention for AIDEAS | — Pending (validated when dashboard ships) |
| Phase 1 English only | Primary market is US/Canada, i18n built from day one but translations later | ✓ Good — i18n structure ready, EN/ES translations in place |
| next-intl with cookie-based locale | Avoids URL path routing complexity, simple NEXT_LOCALE cookie | ✓ Good — works across all pages, LanguageSwitcher implemented |
| Server-side JWT validation via supabase.auth.get_user() | Authoritative, handles expiry/revocation without local decode | ✓ Good — no JWT parsing needed, single source of truth |
| In-memory rate limiter (slowapi) | Sufficient for single Railway instance, no Redis dependency | ⚠️ Revisit — needs distributed limiter when scaling to multiple instances |
| reCAPTCHA v3 with dev bypass | Client-side "dev-bypass" token when key not configured | ✓ Good — unblocks local development without external dependency |
| handle_new_user trigger for org creation | Atomic org + profile + membership on every signup | ✓ Good — no race conditions, works for both email and OAuth |

## Current Milestone: v1.1 Core Dashboard Experience

**Goal:** Deliver the complete customer-facing dashboard — all 7 sections, Stripe integration, seed data — so customers can monitor automations, browse the catalog, purchase, and see ROI.

**Target features:**
- Dashboard home with KPIs and activity feed
- My Automations with detail views and lifecycle actions (pause/resume/cancel)
- Catalog with 66+ templates, industry/category filters, Stripe Checkout purchase
- Reports with impact metrics and value estimation
- Billing with Stripe Customer Portal integration
- Settings (profile, preferences, security)
- Notifications with unread count
- Schema migration + seed data (66+ templates, demo org data)
- FastAPI endpoints for all business writes + Stripe webhooks

**Design spec:** `docs/superpowers/specs/2026-04-09-v1.1-dashboard-design.md`

---
*Last updated: 2026-04-09 after v1.1 milestone start*
