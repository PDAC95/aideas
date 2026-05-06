# CLAUDE.md - AIDEAS Customer Portal Development Rules

**Version:** 1.0
**Last Updated:** 2026-04-15
**Current Milestone:** v1.1 Core Dashboard Experience
**Milestone Goal:** Deliver the complete customer-facing dashboard with all sections, seed data, and mock Stripe UI

---

## LANGUAGE POLICY

- **Developer communication:** Always in Spanish (the developer speaks Spanish)
- **Code, comments, commits, documentation:** Always in English
- **UI/UX:** Bilingual (EN/ES) via next-intl — English is the primary customer language
- **i18n keys:** Always add both `en.json` and `es.json` entries for any new UI text

---

## CURRENT MILESTONE CONTEXT

### Milestone v1.1 — Core Dashboard Experience

- **Status:** 5 of 6 phases complete
- **Requirements:** 24/34 satisfied
- **Completed Phases:** 7 (Schema & Seed), 8 (Dashboard Home & Notifications), 9 (My Automations), 10 (Catalog), 11 (Reports & Billing)
- **Remaining:** Phase 12 (Settings)

### Phase 12: Settings (Not Started)

**Goal:** Users can manage their profile, preferences, and security from a single settings page

**Requirements:**
- SETT-01: Avatar upload (Supabase Storage)
- SETT-02: Edit name and company name
- SETT-03: Language switch (Espanol/English)
- SETT-04: Hourly cost setting (used in Reports estimated value)
- SETT-05: Change password
- SETT-06: Active sessions management

### Known Tech Debt (8 items)

**Phase 08:**
- Hardcoded KPI trend values (+12%, +8%, +15%) in `dashboard/page.tsx:137-143`
- Hardcoded `avgResponseTime = "< 1 min"` placeholder
- Redundant notifications query in `fetchDashboardData`

**Phase 09:**
- `updateAutomationStatus` server action lacks org ownership check (security)
- Hardcoded `"Just now"` string bypasses i18n in `[id]/page.tsx:41`

**Phase 10:**
- `operations` category in seed data has no UI tab or i18n key
- `agencias` industry in seed data has no UI chip or i18n key

### Known Integration Issues

- `activity-feed.tsx:63` links to `/dashboard/reports` (now resolved — Phase 11 shipped)
- Missing `operations` catalog tab and `agencias` industry chip (need i18n keys + UI)

---

## PROJECT OVERVIEW

**Product:** AIDEAS - AI Automation as a Service
**Model:** Managed Service — customers do NOT build automations, they request them. AIDEAS implements the solution. The portal is for monitoring and requesting, not building.
**Codebase:** ~110K LOC (TypeScript + Python), monorepo

---

## TECHNOLOGY STACK

### Frontend (`web/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.6 | App Router framework |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety (strict mode) |
| Tailwind CSS | ^4 | Utility-first styling (PostCSS) |
| shadcn/ui | latest | Component library (copy-paste, Radix-based) |
| next-intl | ^4.8.3 | i18n (cookie-based locale, EN/ES) |
| Recharts | ^3.8.1 | Charts (via shadcn/ui chart wrapper) |
| Zod | ^4.3.6 | Schema validation |
| React Hook Form | ^7.71.1 | Form state management |
| Lucide React | ^0.563.0 | Icons |
| CVA | ^0.7.1 | Component variants |
| @supabase/ssr | ^0.8.0 | Auth & session management |
| @supabase/supabase-js | ^2.95.0 | Database & realtime client |

### Backend (`api/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | latest | REST API framework |
| Python | 3.12+ | Runtime |
| supabase-py | latest | Database client |
| slowapi | latest | Rate limiting |
| stripe | 14.3.0 | Payments (schema ready, not yet wired) |

### Infrastructure

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Frontend hosting | $0-20/mo |
| Railway | Backend hosting (FastAPI) | $5-20/mo |
| Supabase | PostgreSQL + Auth + Realtime + Storage | $25/mo |

---

## DATABASE SCHEMA

### 14 Tables

**Core Identity:**
- `organizations` — Tenants (id, name, slug, settings JSONB)
- `profiles` — User profiles (id FK->auth.users, email, full_name, org_id)
- `organization_members` — Membership + roles (owner/admin/operator/viewer)

**Automation Business:**
- `automation_templates` — 66+ templates catalog (8 categories, 6 industries, pricing)
- `automations` — Customer automations (status: draft/pending_review/active/paused/failed/archived/in_setup)
- `automation_executions` — Execution log (immutable, no updated_at)
- `automation_requests` — Customer requests (includes Stripe checkout fields)
- `subscriptions` — Stripe subscription tracking (1 per org)

**Communication:**
- `chat_messages` — Realtime chat (immutable, realtime enabled)
- `notifications` — User notifications (type: info/warning/success/action_required)
- `invitations` — Team invitations (token-based, expirable)

**Security:** All tables have RLS enabled. Service role handles writes; authenticated users mostly read-only scoped to their organization.

**Triggers:**
- `handle_new_user()` — Atomically creates org + profile + owner membership on signup
- `update_updated_at_column()` — Auto-updates timestamps

---

## REPOSITORY STRUCTURE

```
12ai/
├── web/                          # Next.js frontend (app.aideas.com)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Auth routes (login, signup, verify-email, etc.)
│   │   │   ├── (dashboard)/      # Protected routes (dashboard, automations, catalog, etc.)
│   │   │   ├── (legal)/          # Terms, privacy
│   │   │   ├── layout.tsx        # Root layout (fonts, i18n provider)
│   │   │   ├── page.tsx          # Root redirect (auth→dashboard, unauth→landing)
│   │   │   └── globals.css       # Tailwind + CSS variables (OKLCH theme)
│   │   ├── components/
│   │   │   ├── auth/             # Auth components (12 files)
│   │   │   ├── dashboard/        # Dashboard components (28+ files)
│   │   │   ├── landing/          # Landing page components
│   │   │   └── ui/               # shadcn/ui primitives (Button, Card, Input, Label, Form)
│   │   ├── lib/
│   │   │   ├── actions/          # Server actions (auth.ts)
│   │   │   ├── dashboard/        # Queries (queries.ts) + Types (types.ts)
│   │   │   ├── supabase/         # Client configs (client.ts, server.ts, middleware.ts)
│   │   │   ├── validations/      # Zod schemas (login.ts, signup.ts, etc.)
│   │   │   └── utils.ts          # cn() utility (clsx + twMerge)
│   │   └── i18n/                 # next-intl config (request.ts)
│   ├── messages/
│   │   ├── en.json               # English translations
│   │   └── es.json               # Spanish translations
│   ├── public/
│   │   └── landing/              # Static landing page (HTML/CSS/JS)
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── api/                          # FastAPI backend (api.aideas.com)
│   ├── src/
│   │   ├── main.py               # App entry (CORS, rate limiting)
│   │   ├── config.py             # Pydantic settings
│   │   ├── routes/               # Auth, health endpoints
│   │   └── services/
│   ├── requirements/             # Python deps (base, dev, prod)
│   └── Dockerfile
│
├── supabase/
│   ├── migrations/               # 5 migration files
│   ├── seed.sql                  # Demo data (2 orgs, 66+ templates, 500+ executions)
│   └── config.toml               # Supabase local config
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .planning/                    # GSD methodology planning files
│   ├── PROJECT.md
│   ├── ROADMAP.md
│   ├── phases/                   # Phase planning (07-12)
│   └── milestones/               # v1.0 archived phases (01-06)
│
└── CLAUDE.md                     # This file
```

---

## NAMING CONVENTIONS

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case | `kpi-cards.tsx`, `notification-bell.tsx` |
| Pages | `page.tsx` in route folder | `app/(dashboard)/dashboard/page.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Server actions | kebab-case in `lib/actions/` | `auth.ts` |
| Query files | kebab-case in `lib/dashboard/` | `queries.ts`, `types.ts` |
| Validation schemas | kebab-case in `lib/validations/` | `login.ts`, `signup.ts` |
| Route groups | parentheses | `(auth)`, `(dashboard)`, `(legal)` |

### Code

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `KpiCards`, `NotificationBell` |
| Functions | camelCase | `fetchDashboardData`, `buildTimeAgo` |
| Props interfaces | PascalCase + Props | `KpiCardsProps`, `AutomationListProps` |
| Types | PascalCase + Data/Entry | `DashboardAutomation`, `ReportsData` |
| Zod schemas | camelCase + Schema | `loginSchema`, `signupSchema` |
| Server actions | camelCase verb prefix | `signUpWithEmail`, `resetPassword` |
| Query functions | `fetch` prefix | `fetchAutomationsPage`, `fetchBillingData` |
| CSS utility | `cn()` | `cn("base-class", condition && "conditional-class")` |

### Git Commits

**Format:** Conventional Commits with phase scope

```
<type>(<scope>): <imperative description>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
**Scopes:** Phase numbers (`11-02`, `phase-11`) or feature areas (`auth`, `dashboard`, `catalog`)

**Examples:**
```
feat(11-02): create reports KPI cards, weekly chart, and breakdown table
fix(10): resolve i18n interpolation errors and industry chip toggle
docs(phase-11): complete phase execution
refactor(auth): simplify middleware redirect logic
```

---

## ARCHITECTURE PATTERNS

### Data Fetching

1. **Server Components** (default) — Direct Supabase queries in page/layout components
2. **Server Actions** — Form mutations marked with `'use server'`
3. **Parallel Queries** — `Promise.all()` for independent data fetches
4. **No React Query/SWR** — Supabase Realtime handles live updates

### Component Architecture

1. **Server-first rendering** — RSC by default, `"use client"` only when needed (forms, state, browser APIs)
2. **Props-based translations** — Server fetches translations via `getTranslations()`, passes to client components as props
3. **Data enrichment server-side** — Time-ago strings, trends, daily counts computed before sending to client
4. **Organization-scoped** — All dashboard data filtered by user's `organization_id`

### Auth Flow

1. User hits any route → middleware (`updateSession`) checks auth state
2. Protected routes (`/dashboard/*`) → redirect unauthenticated to `/login`
3. Email verification gate → unverified users redirected to `/verify-email`
4. Auth pages → redirect authenticated users to `/dashboard`
5. Root `/` → auth users to `/dashboard`, unauth rewrite to `/landing/index.html`
6. Remember-me via `sb-remember-me` cookie (30 days vs session-only)

### Supabase Client Usage

- **Server components/actions:** `createClient()` from `@/lib/supabase/server` (cookie-based)
- **Client components:** `createClient()` from `@/lib/supabase/client` (browser)
- **Admin operations:** `SUPABASE_SERVICE_ROLE_KEY` for org creation during signup
- **Auth validation:** `supabase.auth.getUser()` (server-side, authoritative)

### Styling

- **Tailwind CSS v4** with PostCSS
- **OKLCH color variables** in `globals.css` (`:root` and `.dark`)
- **`cn()` utility** — `clsx` + `twMerge` for intelligent class merging
- **CVA** for component variants (Button, Badge)
- **Dark mode** via `.dark` class variant
- **Responsive** — Mobile-first with `lg:` breakpoints (sidebar collapses on mobile)
- **Fonts:** Geist Sans + Geist Mono

---

## ENVIRONMENT VARIABLES

### Frontend (`web/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY=        # Admin key (server-only, NEVER expose)
NEXT_PUBLIC_SITE_URL=             # App URL for auth redirects
NEXT_PUBLIC_API_URL=              # FastAPI backend URL
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=   # reCAPTCHA v3 (optional, dev bypass available)
```

### Backend (`api/.env`)

```bash
SUPABASE_URL=                     # Supabase project URL
SUPABASE_KEY=                     # Supabase anonymous key
SUPABASE_SERVICE_KEY=             # Service role key
STRIPE_SECRET_KEY=                # Stripe secret (Phase 3, not yet wired)
STRIPE_WEBHOOK_SECRET=            # Stripe webhook secret
RESEND_API_KEY=                   # Resend email service
```

**CRITICAL:** Never commit `.env` files. Use `.env.example` as template.

---

## METHODOLOGY: GSD (Get Stuff Done)

This project uses the GSD planning methodology. All planning artifacts live in `.planning/`.

### Phase Workflow

1. `/gsd:discuss-phase` — Gather context through questioning
2. `/gsd:plan-phase` — Create detailed PLAN.md with verification loop
3. `/gsd:execute-phase` — Execute plans with atomic commits and state tracking
4. `/gsd:verify-work` — Validate features through UAT
5. `/gsd:audit-milestone` — Audit milestone completion

### Planning Structure

```
.planning/
├── PROJECT.md          # Project overview and requirements
├── ROADMAP.md          # Phase roadmap with progress
├── phases/             # Active milestone phases (07-12)
│   └── XX-name/
│       ├── XX-CONTEXT.md
│       ├── XX-RESEARCH.md
│       ├── XX-01-PLAN.md ... XX-NN-PLAN.md
│       ├── XX-01-SUMMARY.md ... XX-NN-SUMMARY.md
│       └── XX-VERIFICATION.md
└── milestones/         # Archived milestone (v1.0, phases 01-06)
```

### Key Rules

- Always check `ROADMAP.md` for current phase status before starting work
- Follow the phase plan — do not improvise unless plan is clearly wrong
- Atomic commits per plan completion
- Update SUMMARY.md and VERIFICATION.md after each phase

---

## MANDATORY WORKFLOW

### Start of Every Session

1. Read this file (`CLAUDE.md`)
2. Check `ROADMAP.md` for current milestone/phase status
3. Check for any in-progress or blocked phases
4. Announce work plan in Spanish to the developer

### Before Writing Code

1. Verify you are working on the correct phase/task
2. Announce what you will modify and why
3. Check it follows the conventions in this document
4. Check it respects the folder structure

### While Coding

**ALWAYS:**
- Follow the naming conventions above exactly
- Use TypeScript strict mode — no `any` types
- Add i18n keys to BOTH `en.json` and `es.json` for any new UI text
- Use `cn()` for Tailwind class merging
- Use Server Components by default, `"use client"` only when necessary
- Use `@/` import aliases (never relative imports like `../../`)
- Validate inputs with Zod at system boundaries
- Use RLS-compliant queries scoped to organization
- Handle errors with discriminated unions (`{ error: string } | { success: boolean }`)

**NEVER:**
- Skip error handling on async operations
- Hardcode strings in UI — always use i18n keys
- Use `console.log` in production code
- Commit `.env` files or hardcode secrets
- Add npm packages without announcing them first
- Modify database schema without a migration file
- Work outside the current phase scope unless explicitly asked
- Use React Query, SWR, or other data-fetching libraries (use Supabase Realtime)
- Create a DIY automation builder — this is a managed service platform

### After Completing Work

1. Test the change (dev server, manual verification)
2. Run `npm run lint` to check for ESLint errors
3. Run `npm run build` to verify no TypeScript/build errors
4. Commit with conventional commit format
5. Update GSD planning files (SUMMARY.md, VERIFICATION.md) if completing a phase plan

### Commit Discipline

- **Frequent, atomic commits** — one logical change per commit
- **Conventional Commits** format with scope
- **Never skip hooks** (`--no-verify`)
- **Never force push** without explicit permission
- **Stage specific files** — avoid `git add .` or `git add -A`

---

## TESTING STRATEGY

### Manual Testing (Required)

- Test the golden path in browser after every UI change
- Test edge cases (empty states, loading states, error states)
- Test in both EN and ES locales
- Test responsive layout (mobile + desktop)
- Test dark mode if touching styles

### Automated Testing (When Available)

- Playwright for E2E tests (infrastructure ready, not yet configured)
- ESLint for static analysis (`npm run lint`)
- TypeScript compiler for type checking (`npm run build`)

### Before Marking Complete

- [ ] Code runs without errors
- [ ] All acceptance criteria met
- [ ] i18n keys added for both EN and ES
- [ ] No hardcoded strings in UI
- [ ] No `console.log` left in code
- [ ] TypeScript types used (no `any`)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Tested in browser (golden path + edge cases)

---

## SECURITY RULES

1. **Auth:** Supabase Auth (JWT-based, httpOnly cookies, auto-refresh)
2. **RLS:** All tables have Row Level Security — never bypass it
3. **Service Role Key:** Only use `SUPABASE_SERVICE_ROLE_KEY` for admin operations (org creation). NEVER expose to client
4. **Input Validation:** Zod schemas at all system boundaries
5. **reCAPTCHA:** v3 on signup (dev bypass when key not configured)
6. **No secrets in code:** All credentials in `.env` files
7. **Org-scoped data:** All queries must filter by `organization_id`
8. **Sanitize user input:** Before any database operation

---

## BUSINESS RULES

1. **Managed Service Model:** Customers request automations, AIDEAS implements them. The portal is for monitoring and requesting — NEVER for building.
2. **Template Catalog:** 66+ pre-built automation templates. Customers browse and request from the catalog, or describe a custom need.
3. **Organization-Based Access:** Every user belongs to one organization. All data is org-scoped.
4. **Roles:** owner > admin > operator > viewer. Permission hierarchy enforced by RLS.
5. **Stripe Integration (v1.2):** All payment UI in v1.1 uses mock/seed data. Stripe Checkout and Customer Portal will be wired in v1.2.
6. **Bilingual:** Primary language is English (US/Canada market). Spanish fully supported via i18n.

---

## SENSITIVE AREAS — Handle With Care

| Area | Risk | Rule |
|------|------|------|
| `web/src/lib/supabase/middleware.ts` | Auth routing, session management | Test thoroughly, never break auth flow |
| `web/src/lib/actions/auth.ts` | Server actions with admin client | Never expose service role key |
| `supabase/migrations/` | Database schema | Always create new migration files, never edit existing ones |
| `supabase/seed.sql` | Demo data integrity | Test seed after any schema change |
| `web/src/middleware.ts` | Request interception | Minimal changes, test all route patterns |
| `supabase/config.toml` | Auth, email templates, RLS | Changes affect all environments |

---

## EXTERNAL SERVICES

| Service | Purpose | Config Location |
|---------|---------|----------------|
| Supabase | Auth + DB + Realtime + Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Stripe | Payments (schema ready, not wired) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | Transactional emails | `RESEND_API_KEY` |
| Google reCAPTCHA v3 | Bot protection on signup | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` |
| Google OAuth | Social login | Configured in Supabase dashboard |
| Vercel | Frontend hosting + analytics | Auto-deploy from `main` |
| Railway | Backend hosting | Docker-based deploy |

---

## QUICK REFERENCE

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Supabase + FastAPI
**Auth:** Supabase Auth (email + Google OAuth)
**i18n:** next-intl (EN/ES, cookie-based)
**Charts:** Recharts via shadcn/ui
**State:** Server Components + Supabase Realtime (no React Query)
**Hosting:** Vercel + Railway + Supabase
**Methodology:** GSD with phase-based planning

**Current Focus:** Phase 12 (Settings) — last phase of v1.1
**Monthly Infra Cost:** ~$30-65

---

## DOCUMENT UPDATES

This document is updated:
- At the start of each new milestone
- When the tech stack changes
- When project-specific rules change

**Created:** 2026-04-15 (v1.1, Phase 12 pending)
**Next Update:** v1.2 milestone start

---

*This is your source of truth. Follow it strictly. When in doubt, refer back to this document.*
*Communicate with the developer in Spanish. Write code and documentation in English.*
