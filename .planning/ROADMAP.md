# Roadmap: AIDEAS Customer Portal

## Overview

This milestone delivers the backend foundation and complete authentication system for the AIDEAS customer portal. Starting from the existing Next.js and FastAPI scaffolds, we build upward in dependency order: API infrastructure first, then the database schema, then Supabase Auth wired to FastAPI, then the four user-facing auth flows (registration, login, password recovery, email verification). When complete, a user can create an account, verify their email, log in, and recover their password — and every API request is validated against a real JWT.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: API Foundation** - FastAPI app production-ready with configuration, logging, health checks, and Supabase client (completed 2026-03-05)
- [x] **Phase 2: Database Schema** - All 11 Supabase tables created with RLS policies, migrations committed, seed data available (completed 2026-03-06)
- [x] **Phase 3: Auth Integration** - Supabase Auth configured for email/password + Google OAuth, JWT validation wired into FastAPI (completed 2026-03-27)
- [x] **Phase 4: User Registration** - New users can sign up with email or Google, organization created automatically, verification email sent (completed 2026-03-31)
- [x] **Phase 5: User Login** - Users can log in and maintain persistent sessions across browser refreshes (completed 2026-03-31)
- [ ] **Phase 6: Password Recovery and Email Verification** - Users can recover a forgotten password and verify their email address

## Phase Details

### Phase 1: API Foundation
**Goal**: The FastAPI backend is production-ready — structured, configured, observable, and connected to Supabase — so all subsequent phases can build real endpoints on top of it
**Depends on**: Nothing (first phase)
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09
**Success Criteria** (what must be TRUE):
  1. `GET /health` returns a 200 response with service status and Supabase connectivity indicator
  2. `GET /docs` returns the OpenAPI UI with all registered routes visible
  3. Every request logs a structured line (timestamp, level, route, status) readable in the Railway console
  4. Supabase client connects using environment variables and rejects startup if variables are missing
  5. CORS allows requests from `app.aideas.com` and `localhost` origins and blocks all others
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project structure, configuration, Supabase client, requirements, deploy config
- [ ] 01-02-PLAN.md — Routes, middleware, logging, health check, CORS

### Phase 2: Database Schema
**Goal**: Every table the portal needs exists in Supabase with correct RLS policies, all changes live in versioned migrations, and developers can seed a local environment with realistic data
**Depends on**: Phase 1
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, DB-08, DB-09, DB-10, DB-11, DB-12, DB-13
**Success Criteria** (what must be TRUE):
  1. Running `supabase db reset` applies all migrations cleanly with zero errors
  2. An authenticated user can only read rows in `organizations` and `profiles` that belong to their own org (RLS enforced)
  3. Running the seed script creates a sample organization, two users, and at least three automation templates visible in the Supabase table editor
  4. The `chat_messages` table has Realtime enabled and a new insert appears in a subscribed client without polling
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Core identity tables (organizations, profiles, organization_members) with RLS, profiles trigger, utility functions
- [ ] 02-02-PLAN.md — Automation and business tables (automation_templates, automations, executions, requests, subscriptions) with RLS
- [ ] 02-03-PLAN.md — Communication tables (chat_messages, notifications, invitations) with RLS, Realtime, and seed script

### Phase 3: Auth Integration
**Goal**: Supabase Auth is fully configured for both email/password and Google OAuth, email templates carry AIDEAS branding, and FastAPI validates JWTs on every protected route
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. A request to a protected FastAPI endpoint with a valid Supabase JWT returns 200; without a token it returns 401
  2. Google OAuth login redirects correctly to `localhost:3000` in dev and `app.aideas.com` in production
  3. The verification email received during signup shows the AIDEAS logo and brand colors, not the Supabase default template
  4. The authenticated user's ID is extractable from `request.state.user` inside any FastAPI route handler
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Supabase Auth configuration (email/password, Google OAuth, email templates, redirect URLs)
- [ ] 03-02-PLAN.md — FastAPI JWT validation dependency, rate limiting, and protected route middleware

### Phase 4: User Registration
**Goal**: A new visitor can create an account using email/password or Google, land on the verify-email holding page, and find their organization automatically created
**Depends on**: Phase 3
**Requirements**: REG-01, REG-02, REG-03, REG-04, REG-05, REG-06, REG-07, REG-08
**Success Criteria** (what must be TRUE):
  1. A visitor fills in name, company, email, and password on `/signup` and is redirected to `/verify-email` within 3 seconds
  2. After signup, a new row exists in `organizations` and `profiles` linked to the new user's auth UID
  3. Submitting the signup form with an already-registered email shows an inline error message without a page reload
  4. Clicking "Continue with Google" on the signup page completes the OAuth flow and lands the user on `/verify-email`
  5. Leaving the password field empty or using a short password shows a Zod validation error before the form submits
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Database migration (profiles extension, owner role, org-creation trigger) + i18n foundation + Zod schema
- [ ] 04-02-PLAN.md — Signup page UI (split layout, form with blur validation, password strength bar, Google OAuth button, language switcher)
- [ ] 04-03-PLAN.md — Registration logic (Server Actions, reCAPTCHA, disposable email blocking, auth callback update, complete-registration page)
- [ ] 04-04-PLAN.md — Verify-email waiting page (resend timer, logout, tips) + legal placeholder pages

### Phase 5: User Login
**Goal**: A registered and verified user can log in with email/password or Google, land on the dashboard, and remain logged in across browser refreshes and new tabs
**Depends on**: Phase 4
**Requirements**: LOGIN-01, LOGIN-02, LOGIN-03, LOGIN-04, LOGIN-05, LOGIN-06, LOGIN-07
**Success Criteria** (what must be TRUE):
  1. A verified user enters correct credentials on `/login` and lands on `/dashboard` within 3 seconds
  2. Closing and reopening the browser returns the user to `/dashboard` without re-entering credentials
  3. Entering a wrong password shows an inline "Invalid email or password" message without a full page reload
  4. Clicking "Continue with Google" on the login page completes OAuth and lands on `/dashboard`
  5. Visiting `/login` while already authenticated redirects immediately to `/dashboard`
**Plans**: TBD

Plans:
- [ ] 05-01: Login page UI (form, error states, Google OAuth button, link to forgot-password)
- [ ] 05-02: Login logic (Supabase Auth call, JWT cookie persistence, redirect to dashboard, middleware auth guard)

### Phase 6: Password Recovery and Email Verification
**Goal**: A user who forgot their password can reset it via email link, and a newly registered user can verify their email and gain access to the portal
**Depends on**: Phase 5
**Requirements**: PWD-01, PWD-02, PWD-03, PWD-04, PWD-05, PWD-06, VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04, VERIFY-05
**Success Criteria** (what must be TRUE):
  1. A user enters their email on `/forgot-password` and receives a reset link email within 60 seconds
  2. Clicking the reset link opens `/reset-password`, the user sets a new password, sees a confirmation message, and is redirected to `/login`
  3. A newly registered user on `/verify-email` can click "Resend verification email" and receive a new email immediately
  4. Clicking the verification link in the email marks the account as verified and allows login; an unverified user who tries to log in is redirected to `/verify-email`
  5. The reset password form rejects passwords below the minimum strength requirement before submitting
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Auth callback extension, Server Actions, Zod schemas, forgot-password page, reset-password page, i18n
- [ ] 06-02-PLAN.md — Middleware email verification gate, verify-email page enhancements, login page verified banner

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Foundation | 2/2 | Complete   | 2026-03-05 |
| 2. Database Schema | 3/3 | Complete   | 2026-03-06 |
| 3. Auth Integration | 2/2 | Complete   | 2026-03-27 |
| 4. User Registration | 4/4 | Complete   | 2026-03-31 |
| 5. User Login | 2/2 | Complete   | 2026-03-31 |
| 6. Password Recovery and Email Verification | 0/2 | Not started | - |
