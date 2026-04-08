# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Backend Foundation + Auth

**Shipped:** 2026-04-08
**Phases:** 6 | **Plans:** 16 | **Commits:** 111

### What Was Built
- Production-ready FastAPI backend with Supabase client, CORS, structured logging, health checks, Docker/Railway config
- 11 Supabase tables with RLS policies, versioned migrations, comprehensive seed data with realistic test state
- Complete authentication system: email/password signup, Google OAuth, email verification, login with session persistence, password recovery
- Bilingual (EN/ES) AIDEAS-branded email templates for all auth flows
- Middleware-based auth guards with remember-me cookie support and multi-tab sync
- Branded landing page (React conversion from static HTML/jQuery)

### What Worked
- **Dependency-ordered phasing:** Building API → DB → Auth → Registration → Login → Recovery avoided circular dependencies and each phase had a stable foundation
- **GSD workflow discipline:** Plan → Execute → Verify → UAT cycle caught real issues (PKCE cookie bug, NEXT_PUBLIC_SITE_URL missing, reCAPTCHA blocking local dev)
- **Quick tasks for ad-hoc fixes:** 3 quick tasks handled production bugs (password reset link, PKCE cookie, landing page) without disrupting phase flow
- **Supabase handle_new_user trigger:** Atomic org + profile + membership creation on signup eliminated race conditions
- **i18n from day one:** next-intl cookie-based locale with no URL routing kept things simple while supporting EN/ES from the start

### What Was Inefficient
- **SUMMARY.md one-liner fields not populated:** Extracting accomplishments at milestone completion required manual reading of 16 SUMMARY files instead of automated extraction
- **Phase 5-6 plans not numbered in ROADMAP.md:** Earlier phases had `XX-YY-PLAN.md` naming but Phase 5-6 used different conventions, causing minor inconsistency
- **UAT gap closure as separate plan (06-03):** Environment variable and reCAPTCHA issues could have been caught earlier with a local-dev smoke test checklist in earlier phases
- **FastAPI JWT + frontend not connected:** Built JWT validation infrastructure (Phase 3) that won't be consumed until v2 — acceptable for foundation but added scope to v1

### Patterns Established
- **Server Actions for auth:** All auth operations (signup, login, password reset) use Next.js Server Actions with typed return values (discriminated unions)
- **Zod schemas shared between form and action:** Single schema for client validation and server validation
- **Middleware email verification gate:** Defense-in-depth pattern — middleware checks email_confirmed_at in addition to client-side checks
- **SECURITY DEFINER triggers with `SET search_path = ''`:** Security best practice for all PostgreSQL trigger functions
- **RLS via organization_members join:** Business tables check access through membership rather than direct org_id column

### Key Lessons
1. **Always set NEXT_PUBLIC_SITE_URL in local dev** — Supabase `redirectTo` evaluates to undefined without it, causing password reset links to break silently
2. **reCAPTCHA needs a dev bypass strategy** — Third-party dependencies that block form submission in local dev should have graceful degradation from the start
3. **PKCE cookies are browser-context sensitive** — Password reset links opened in a different browser context (email client webview) lose the PKCE cookie, requiring the code_verifier flow instead
4. **Seed data needs auth.identities rows** — Supabase local dev requires seeding auth.identities alongside auth.users for email login to work
5. **`z.enum().default()` in Zod v4 causes type mismatch with react-hook-form** — Use `.optional()` with form `defaultValues` instead

### Cost Observations
- Model mix: Primarily Opus for planning/execution, Sonnet for subagents (research, verification)
- Sessions: ~15-20 across the milestone
- Notable: Phases 1-2 (infrastructure) were fastest (~2-3 min/plan); Phase 4 (registration UI) was slowest (~6 min/plan) due to component complexity

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 111 | 6 | Established GSD plan-execute-verify-UAT cycle |

### Cumulative Quality

| Milestone | Verification Score | Requirements | Tech Debt Items |
|-----------|-------------------|--------------|-----------------|
| v1.0 | 51/54 integration | 54/54 | 5 (non-blocking) |

### Top Lessons (Verified Across Milestones)

1. Environment variables for third-party services need local-dev defaults from the first plan that uses them
2. Auth flows must be tested in the actual browser context (not just dev tools) to catch cookie/session issues
