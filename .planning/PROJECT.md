# AIDEAS Customer Portal

## What This Is

A customer portal (app.aideas.com) for AIDEAS — an AI automation managed service for SMBs. The portal lets customers monitor their automations, browse the catalog, request new automations, communicate with the AIDEAS team via real-time chat, manage their team, and handle billing. Built with Next.js 14 + FastAPI + Supabase.

## Core Value

Customers can monitor their automations' performance, request new ones, and communicate with the AIDEAS team — all from a single dashboard that proves the ROI of their subscription.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] FastAPI backend with Supabase integration, CORS, health checks, structured logging
- [ ] Database schema: organizations, users, automation_templates, automations, executions, requests, subscriptions, chat_messages, notifications, invitations
- [ ] RLS policies and Supabase migrations
- [ ] Supabase Auth integration (email/password + Google OAuth)
- [ ] JWT validation in FastAPI endpoints
- [ ] User registration with email verification
- [ ] User login with session persistence
- [ ] Password recovery flow
- [ ] Email verification flow
- [ ] Dashboard with automation metrics and status overview
- [ ] Automation catalog with search/filter
- [ ] Request automation workflow
- [ ] My automations list with real-time status
- [ ] Real-time chat with AIDEAS team
- [ ] Team management (invite, roles, remove)
- [ ] Billing integration (Stripe checkout, portal, invoices)
- [ ] Profile and settings management
- [ ] In-app notifications

### Out of Scope

- Self-service automation builder — NOT the AIDEAS model, customers don't build automations
- Admin panel — Phase 2 (US-5.x)
- Public API — Phase 2+
- Mobile app — Phase 2+
- AI chat assistant for needs discovery — Phase 2
- Direct integrations (Slack, WhatsApp) — Phase 2
- Advanced exportable reports — Phase 2

## Context

**Monorepo structure:** AIDEAS is a monorepo with `landing/` (static marketing site), `web/` (Next.js portal), `api/` (FastAPI backend), and `supabase/` (migrations).

**Existing scaffold:**
- `web/`: Next.js 14 with App Router, login/signup page shells, dashboard layout shell, Supabase client/server utilities, middleware for auth, 5 shadcn/ui components (button, card, input, label, form)
- `api/`: FastAPI with main.py, config.py (Pydantic Settings), health route, auth route skeleton, empty models/ and services/ dirs
- `supabase/`: Empty migrations directory

**Service model:** AIDEAS is a managed service — customers describe their problem, AIDEAS builds and maintains the automation. The portal is for monitoring and communication, NOT for building automations.

**Business model:** Dual revenue — one-time setup fee + recurring monthly subscription (Starter/Pro/Business plans).

**Target market:** Phase 1 = US/Canada (English). Phase 2 = LATAM (Spanish), Brazil (Portuguese), Europe (French).

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
| Supabase for auth + DB + realtime | Single service for multiple concerns, reduces complexity | — Pending |
| FastAPI over Next.js API routes | Better for background jobs, Stripe webhooks, email sending, Python ecosystem | — Pending |
| shadcn/ui component library | Customizable, accessible, works with Tailwind, no vendor lock-in | — Pending |
| Managed service model (no DIY builder) | Core business differentiator — simplicity for customer, IP retention for AIDEAS | — Pending |
| Phase 1 English only | Primary market is US/Canada, i18n built from day one but translations later | — Pending |

---
*Last updated: 2026-03-05 after initialization*
