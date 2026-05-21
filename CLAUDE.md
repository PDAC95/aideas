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

### Milestone v1.3 — Three-Module Repo Reorganization

- **Status:** In progress on `feature/v1.3-three-module-reorg`
- **Pivot date:** 2026-05-21 — replaced original v1.3 (Public Funnel + Factory Reskin)
- **Goal:** Reorganize the repo into three independent paralel modules — `landing/`, `web/`, `api/` — and lock the hybrid API strategy.

**Phases (in execution order):**
- Phase 25 — Design System Migration (complete, stays on main)
- Phase 26 — Catalog Data Model (complete, stays on main)
- Phase 27 — Scenario Content Seed (complete, stays on main)
- Phase 28 — Landing Module: bootstrap `landing/` from Orisa template, reduce to 6 routes (Home + Index 7 hero swap, Services, Catalog, Pricing, FAQ, Contact)
- Phase 29 — Design Tokens Sync: `landing/tokens.json` extracted, mirrored to `web/tokens.json`, `scripts/sync-tokens.js` + CI guard
- Phase 30 — API Restructure: `api/src/routes/` split into `public/`, `client/`, `admin/` with auth deps at namespace level
- Phase 31 — Wire-up + Cleanup: page.tsx redirect, READMEs per module, delete old static landing + raw template + orphan planning folder

**Deferred (post-reorg, separate milestones):**
- Original Phase 28 (SSR funnel) — descarted, see `.planning/milestones/v1.3-original-archive/`
- Phase 32 (Customer Dashboard Reskin) — deferred until reorg stabilizes
- Phase 33 (Admin Dashboard Reskin) — deferred
- Phase 34 (Launch Polish — Vercel Analytics, sitemap, OG, Lighthouse ≥ 90) — deferred

### Previous milestones (shipped)

- **v1.0** (Foundation): Phases 1-6 — Supabase setup, auth, base dashboard. Archived in `.planning/milestones/v1.0-*`.
- **v1.1** (Core Dashboard Experience): Phases 7-12 — Schema, Notifications, Automations, Catalog, Reports, Settings. All 6/6 complete.
- **v1.2** (Admin Portal): Phases 13-24 — Admin foundation, catalog admin, requests inbox, automations admin, clients admin, admin home, cross-link fix. Archived.

### Known Tech Debt

All known items resolved as of 2026-05-20. See section below.

### Resolved Tech Debt (verified 2026-05-20)

- ✅ Phase 08 hardcoded KPI trends — `dashboard/page.tsx` now uses real `totalExecs`, `successRate`, `activeAutomations`
- ✅ Phase 08 `avgResponseTime = "< 1 min"` — placeholder removed
- ✅ Phase 08 redundant notifications query — `(dashboard)/layout.tsx` fetches once and passes to both header + nav
- ✅ Phase 09 `updateAutomationStatus` ownership check — `assertOrgMembership` enforced with role allowlist (owner|admin|operator), service-role write after validation, treat-as-forbidden for missing automations
- ✅ Phase 09 `"Just now"` i18n — `nowLabel` from translations replaces the `nowIso` sentinel in `buildTimeAgo`
- ✅ Phase 10 `operations` category + `agencias` industry — both have i18n keys in EN/ES and render in catalog UI
- ✅ Phase 17 admin locale switcher + dark mode toggle — added to `AdminHeader` via `AdminLocaleSwitcher` (EN|ES) + `ThemeToggle` powered by `next-themes` and a `ThemeProvider` in root layout
- ✅ Phase 19 race-condition toast disappears too fast — migrated `approve-request-button`, `reject-request-modal`, `automation-transition-buttons`, and `archive-automation-modal` from `alert()`/inline `setError` to `sonner` toasts that outlive `router.refresh()`

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

Three independent modules at the repo root, deployed separately, sharing only the Supabase database and design tokens (via `scripts/sync-tokens.js`).

```
12ai/
├── landing/                      # Public marketing site (aideas.ca)
│   ├── public/assets/            # Orisa template CSS, fonts, imgs, scripts
│   ├── src/
│   │   ├── App.tsx               # 7 routes (Home, Services, Catalog, Pricing, FAQ, Contact, 404)
│   │   ├── main.tsx
│   │   ├── layouts/MainLayout.tsx
│   │   ├── pages/                # HomePage, CatalogPage, ServicesPage, etc.
│   │   ├── shared/
│   │   │   ├── header/Header2.tsx
│   │   │   ├── footer/Footer2.tsx
│   │   │   ├── sections/         # Reduced set of Orisa sections (about-1/4, about-3/5+7,
│   │   │   │                     # contact-1, faqs, index-1, index-2, index-7, portfolio-1,
│   │   │   │                     # portfolio-3, services-1, services-details)
│   │   │   ├── components/, effects/, elements/, hooks/, ...
│   │   ├── seo/PageMeta.tsx
│   │   └── types/
│   ├── tokens.json               # SINGLE SOURCE OF TRUTH for design tokens
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── web/                          # Dashboard (app.aideas.ca)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Root redirect (auth→/dashboard, unauth→NEXT_PUBLIC_LANDING_URL)
│   │   │   ├── globals.css       # Tailwind 4 @theme inline + Factory.ai palette
│   │   │   ├── (auth)/           # login, signup, verify-email, forgot-password, reset-password
│   │   │   ├── (dashboard)/      # 7 customer surfaces
│   │   │   ├── (admin)/          # 5 platform_staff surfaces
│   │   │   └── (legal)/          # terms, privacy
│   │   ├── components/
│   │   │   ├── ui/               # shadcn primitives
│   │   │   ├── auth/, dashboard/, admin/
│   │   ├── lib/
│   │   │   ├── actions/          # Server Actions
│   │   │   ├── supabase/         # client.ts, server.ts, middleware.ts
│   │   │   ├── dashboard/        # queries.ts + types.ts
│   │   │   ├── admin/, auth/
│   │   │   ├── validations/      # Zod schemas
│   │   │   └── utils.ts          # cn()
│   │   ├── i18n/                 # next-intl config
│   │   └── middleware.ts         # auth gates + dashboard/admin split
│   ├── messages/en.json + es.json
│   ├── tokens.json               # Byte-identical mirror of landing/tokens.json
│   ├── next.config.ts, postcss.config.mjs, tsconfig.json, package.json
│
├── api/                          # FastAPI backend (api.aideas.ca)
│   ├── src/
│   │   ├── main.py               # CORS + lifespan + namespace router include
│   │   ├── config.py             # Pydantic settings
│   │   ├── dependencies.py       # get_supabase, get_current_user, get_platform_staff
│   │   ├── middleware.py         # slowapi limiter
│   │   ├── logging_config.py
│   │   ├── routes/
│   │   │   ├── health.py         # GET /api/v1/health
│   │   │   ├── public/           # contact + waitlist (no auth)
│   │   │   ├── client/           # auth + future customer endpoints (JWT at router level)
│   │   │   └── admin/            # future staff endpoints (JWT + role at router level)
│   │   ├── services/
│   │   └── models/
│   ├── requirements/             # base.txt, dev.txt, prod.txt
│   ├── Dockerfile
│   └── .env.example
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── scripts/
│   ├── sync-tokens.js            # landing/tokens.json → web/tokens.json
│   └── check-tokens-sync.js      # CI guard against token drift
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .planning/                    # GSD methodology
│   ├── PROJECT.md
│   ├── ROADMAP.md
│   ├── REORG-V2-PLAN.md          # v1.3 reorg execution plan
│   ├── phases/                   # active milestone phases
│   └── milestones/               # archived milestones (v1.0..v1.3-original)
│
├── README.md                     # Top-level overview + quick start
└── CLAUDE.md                     # This file — global rules for AI-assisted work
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

### API Strategy (locked 2026-05-21, v1.3 reorg)

Hybrid pragmatic — two backends coexist on purpose.

**Next.js Server Components / Server Actions handle:**

1. Reading data to render dashboard pages (queries simple enough to fit in a server component)
2. Mutating the authenticated user's own state (profile edits, automation status toggles, etc.)
3. Zod-validated form submissions that map cleanly to one Supabase write
4. Anything already implemented today — do NOT migrate working code without a reason

**FastAPI (`api/`) handles:**

1. **All public endpoints.** The landing module (`landing/`) is forbidden from talking to Supabase directly. Anything the landing site posts (contact form, waitlist, lead capture) MUST go through `POST /api/v1/public/*`.
2. **External webhooks.** Stripe, n8n, Resend, any third-party callback.
3. **Long-running jobs** (anything that might take more than ~5 seconds). PDF generation, scraping, batch operations, automation execution triggers.
4. **Secret-bearing integrations.** When an operation needs an API key the browser must never see, the endpoint lives in FastAPI.
5. **Operations a future mobile or B2B client would need.** When designing a new feature, ask: "would an iOS app need this endpoint?" If yes → FastAPI from the start.

**Rule of thumb:** if in doubt, FastAPI. Migrating from Server Action → FastAPI later is trivial (rewrite 20 lines). Migrating away from FastAPI is harder.

**Namespace layout in `api/`:**

```
api/src/routes/
├── health.py                  → GET  /api/v1/health
├── public/                    → no auth, per-endpoint rate limit
│   ├── contact.py             → POST /api/v1/public/contact
│   └── waitlist.py            → POST /api/v1/public/waitlist
├── client/                    → Supabase JWT required (attached at namespace level)
│   └── auth.py                → GET  /api/v1/client/auth/status
└── admin/                     → JWT + platform_staff role required
    └── (sub-routers as needed)
```

The `dependencies=[Depends(get_current_user)]` and `dependencies=[Depends(get_platform_staff)]` attachments live in the namespace `__init__.py` files — never duplicate them in individual route files.

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

Each module has its own `.env.example`. Never commit `.env`, `.env.local`, or any file with real keys.

### Landing (`landing/.env.local`)

```bash
VITE_APP_URL=                     # Dashboard URL — "Log in" / "Sign up" CTAs
                                  #   dev:  http://localhost:3000
                                  #   prod: https://app.aideas.ca
VITE_API_URL=                     # FastAPI backend URL — public contact + waitlist
                                  #   dev:  http://localhost:8000
                                  #   prod: https://api.aideas.ca
```

### Dashboard (`web/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY=        # Admin key (server-only, NEVER expose)
NEXT_PUBLIC_SITE_URL=             # This app's URL (OAuth callbacks)
NEXT_PUBLIC_LANDING_URL=          # Where the landing module is served — unauth `/` redirects here
                                  #   dev:  http://localhost:5173
                                  #   prod: https://aideas.ca
NEXT_PUBLIC_API_URL=              # FastAPI backend URL
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=   # reCAPTCHA v3 (optional, dev bypass)
RECAPTCHA_SECRET_KEY=             # Server-side reCAPTCHA verification
```

### Backend (`api/.env`)

```bash
SUPABASE_URL=                     # Supabase project URL
SUPABASE_KEY=                     # Supabase anonymous key
SUPABASE_SERVICE_KEY=             # Service role key (server-only)
ALLOWED_ORIGINS=                  # Comma-separated CORS list — must include both frontends
                                  #   dev:  http://localhost:5173,http://localhost:3000
                                  #   prod: https://aideas.ca,https://app.aideas.ca
STRIPE_SECRET_KEY=                # Stripe secret (v1.4+)
STRIPE_WEBHOOK_SECRET=            # Stripe webhook secret (v1.4+)
RESEND_API_KEY=                   # Resend email service (Phase 31+)
```

**CRITICAL:** Never commit `.env` files. Use each module's `.env.example` as template.

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

### Branching Strategy (MANDATORY)

**Every phase MUST be developed on its own feature branch. Never commit phase work directly to `main`.**

#### Branch Naming

```
feature/phase-XX-<phase-slug>
```

**Examples:**
- `feature/phase-18-catalog-admin`
- `feature/phase-19-requests-inbox`
- `feature/phase-20-automations-admin`

For hotfixes outside the phase flow:
- `fix/<short-description>` (e.g., `fix/auth-callback-cookies`)

#### Phase Lifecycle (MANDATORY)

1. **Before starting a phase**: ensure `main` is clean (`git status` empty), pull latest (`git pull origin main`)
2. **Create the branch**: `git checkout -b feature/phase-XX-<slug>`
3. **Develop on the branch**: every commit during the phase goes here, never to `main`
4. **Push the branch frequently**: `git push -u origin feature/phase-XX-<slug>` (so work is backed up and visible)
5. **When phase verification PASSES**: open a PR (or merge locally if solo)
6. **Merge to main**:
   - Solo dev: `git checkout main && git merge --no-ff feature/phase-XX-<slug>` (preserves phase history)
   - Team: open a PR, get review, squash-merge or merge-commit per repo convention
7. **Push main**: `git push origin main`
8. **Delete the branch**: `git branch -d feature/phase-XX-<slug>` and `git push origin --delete feature/phase-XX-<slug>`
9. **Tag if it closes a milestone**: `git tag -a vX.Y -m "..."` then `git push origin vX.Y`

#### Pre-Merge Checklist (MUST be true before merging to main)

- [ ] All phase plans have SUMMARY.md
- [ ] VERIFICATION.md status is `passed` (or `human_needed` and human UAT done)
- [ ] `npm run build` passes locally
- [ ] `npm run lint` passes locally
- [ ] Manual UAT completed (golden path + responsive + dark mode + EN/ES)
- [ ] No leftover `console.log`, `TODO` markers, or commented-out code
- [ ] No secrets, `.env*`, or large binary files staged
- [ ] All staged files reviewed with `git diff --cached`

### Working Tree Hygiene (MANDATORY)

- **Never start a new phase if `git status` is dirty.** Clean up first: commit, stash, or discard.
- **Never let modified files accumulate across sessions.** Triage and commit/discard at end of each session.
- **Never modify an already-committed migration file.** If a migration has a bug, write a new fix migration with a later timestamp (`YYYYMMDDHHMMSS_fix_<description>.sql`).
- **Never commit local CLI artifacts.** `supabase/.branches/`, `supabase/snippets/`, `.next/`, `node_modules/` must be in `.gitignore`.

### Push & Remote Discipline

- **Push frequently** to backup work (at least daily, ideally per commit)
- **Never let local main get more than ~5 commits ahead of origin/main** without pushing
- **Never push to `main` if branch protection is on** — open a PR
- **Never force-push to `main` or `develop`** under any circumstance
- **Force-push to feature branches** only with `--force-with-lease` (safer than `--force`)

### When Things Go Wrong

| Situation | Action |
|-----------|--------|
| Committed to wrong branch | `git reset HEAD~N` to unstage, `git checkout correct-branch`, re-commit |
| Committed sensitive data | STOP, do NOT push. Reset and rewrite. If already pushed, rotate the secret and use `git filter-repo` |
| Merge conflict | Resolve manually, never `git checkout --theirs/--ours` blindly |
| Want to undo a public commit | `git revert <sha>` (creates a new commit), never rewrite published history |

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

**Architecture:** Three-module repo — `landing/` (Vite + React + Bootstrap, aideas.ca) + `web/` (Next.js + Tailwind + shadcn, app.aideas.ca) + `api/` (FastAPI, api.aideas.ca).
**Database:** Shared Supabase project (managed Postgres + Auth + Realtime + Storage).
**Auth:** Supabase Auth (email + Google OAuth, cookies via @supabase/ssr).
**i18n:** next-intl in `web/` (EN/ES, cookie-based). `landing/` is English-only for now.
**Charts:** Recharts via shadcn/ui in `web/`.
**State:** Next.js Server Components + Supabase Realtime (no React Query).
**API strategy:** Hybrid pragmatic — existing dashboard Server Components keep reading Supabase directly; all new public/webhook/long-job/secret work goes to FastAPI. Rule: "if in doubt, FastAPI."
**Hosting:** Vercel (`landing/` + `web/`), Railway or Fly (`api/`), Supabase (DB).
**Design tokens:** `landing/tokens.json` → `web/tokens.json` via `scripts/sync-tokens.js` (CI guard: `scripts/check-tokens-sync.js`). Dashboard does not consume tokens yet — Factory.ai palette stays in `web/src/app/globals.css` until a future reskin phase.
**Methodology:** GSD with phase-based planning under `.planning/`.

**Current focus:** v1.3 three-module reorg (phases 28-31). See `.planning/ROADMAP.md` and `.planning/REORG-V2-PLAN.md`.
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
