---
phase: 05-user-login
plan: 02
subsystem: auth
tags: [supabase, next-intl, react-hook-form, server-actions, cookies, middleware]

# Dependency graph
requires:
  - phase: 05-user-login/05-01
    provides: LoginForm with scaffolded rate limiting state, loginSchema, login i18n namespace
  - phase: 03-auth-integration
    provides: Supabase server client, middleware updateSession pattern
provides:
  - signInWithEmail Server Action with error-typed results
  - sb-remember-me cookie for 30-day vs browser-session control
  - AuthSync client component for multi-tab logout sync
  - Middleware protection extended to /app/* routes
  - Cookie maxAge overridden per sb-remember-me preference
  - Dashboard page stripped to minimal greeting + sign-out
  - DashboardNav and dashboard page fully i18n (EN/ES)
affects: [future-dashboard-phases, future-app-routes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "signInWithEmail returns typed union LoginResult — discriminated union for error handling without exceptions"
    - "sb-remember-me cookie set by Server Action, read by middleware to override Supabase cookie maxAge"
    - "Rate limit state in localStorage with count + lockedUntil — survives page refreshes, cleared on success"
    - "AuthSync renders null — client component pure side-effect via onAuthStateChange SIGNED_OUT listener"
    - "DashboardSignOut extracted as client component — Server Component dashboard page passes translated label as prop"
    - "greetingWithName / greeting separate keys — avoids ICU select syntax complexity"

key-files:
  created:
    - web/src/components/auth/auth-sync.tsx
    - web/src/components/dashboard/sign-out.tsx
  modified:
    - web/src/lib/actions/auth.ts
    - web/src/components/auth/login-form.tsx
    - web/src/lib/supabase/middleware.ts
    - web/src/app/(dashboard)/layout.tsx
    - web/src/app/(dashboard)/dashboard/page.tsx
    - web/src/components/dashboard/nav.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "LoginResult discriminated union (success: true | error: string literal) — caller pattern-matches without exceptions, consistent with signUpWithEmail convention"
  - "sb-remember-me cookie read in middleware updateSession to override Supabase cookie maxAge — remember me checked: 30 days, unchecked: undefined (session cookie)"
  - "greetingWithName and greeting as separate i18n keys — simpler than ICU select syntax, conditional rendering in Server Component"
  - "DashboardSignOut client component with label prop — lets Server Component dashboard page own translated text, keeps sign-out logic in client"
  - "Rate limit count + lockedUntil stored as JSON in localStorage — survives refresh, cleared on successful login"
  - "middleware.ts file convention deprecation warning deferred — pre-existing issue outside plan scope, entry-point rename to proxy.ts tracked in deferred-items"

patterns-established:
  - "Server Action typed result + client discriminated match — used in signInWithEmail, established for future auth actions"
  - "AuthSync in dashboard layout — all /dashboard and /app/* routes get multi-tab logout sync automatically"

requirements-completed: [LOGIN-02, LOGIN-03, LOGIN-04, LOGIN-07]

# Metrics
duration: 12min
completed: 2026-03-31
---

# Phase 5 Plan 02: User Login Summary

**signInWithEmail Server Action wired to LoginForm with typed error handling, rate limiting, remember-me session control via sb-remember-me cookie, AuthSync multi-tab logout, and bilingual dashboard**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-31T20:01:49Z
- **Completed:** 2026-03-31T20:14:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- signInWithEmail Server Action: handles invalid_credentials, email_not_verified, generic; sets sb-remember-me cookie for session duration control
- LoginForm fully wired: calls Server Action, clears password on failure, redirects unverified users to /verify-email, redirects success to /dashboard
- Rate limiting activated: 5 failures trigger 10-minute lockout stored in localStorage with countdown timer
- AuthSync component: renders null, subscribes to onAuthStateChange SIGNED_OUT, pushes all dashboard tabs to /login on logout
- Middleware updated: protects /app/* in addition to /dashboard; overrides Supabase cookie maxAge based on sb-remember-me cookie
- Dashboard page stripped to minimal greeting + sign-out per CONTEXT.md (removed stats cards, quick actions, recent activity)
- DashboardNav and dashboard page use next-intl translations from new dashboard namespace (EN + ES)
- Build succeeds: all 10 routes compiled, zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add signInWithEmail Server Action and wire LoginForm** - `6dc38be` (feat)
2. **Task 2: Auth middleware update, AuthSync component, and dashboard i18n** - `4abbe66` (feat)

**Plan metadata:** _(see final commit)_

## Files Created/Modified
- `web/src/lib/actions/auth.ts` - Added signInWithEmail Server Action + cookies import
- `web/src/components/auth/login-form.tsx` - Wired to Server Action, activated rate limiting, useRouter for redirects
- `web/src/components/auth/auth-sync.tsx` - New: multi-tab logout sync via onAuthStateChange
- `web/src/lib/supabase/middleware.ts` - Added /app/* protection, sb-remember-me cookie maxAge override
- `web/src/app/(dashboard)/layout.tsx` - Added AuthSync component
- `web/src/app/(dashboard)/dashboard/page.tsx` - Stripped to minimal greeting + sign-out, added i18n
- `web/src/components/dashboard/nav.tsx` - Added useTranslations for signOut and nav items
- `web/src/components/dashboard/sign-out.tsx` - New: client component for sign-out button with translated label
- `web/messages/en.json` - Added dashboard namespace (greeting, greetingWithName, subtitle, signOut, nav)
- `web/messages/es.json` - Added dashboard namespace with proper Spanish accents

## Decisions Made
- `LoginResult` discriminated union (`{ success: true } | { error: 'invalid_credentials' | ... }`) — type-safe caller pattern-match, consistent with existing Server Action conventions in this codebase
- `sb-remember-me` cookie approach: Server Action sets it after successful sign-in, middleware reads it to control Supabase auth cookie maxAge — implements the CONTEXT.md locked decision (30 days vs browser session)
- Separated `greeting` and `greetingWithName` i18n keys instead of ICU select syntax — simpler, no next-intl ICU edge cases, conditional in Server Component
- `DashboardSignOut` extracted to client component — Server Component dashboard page owns translated label prop, client component owns the Supabase signOut side-effect

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as specified. One out-of-scope issue was discovered and deferred:

**Deferred (out-of-scope): middleware.ts deprecation warning**
- **Found during:** Task 2 (build verification)
- **Issue:** Next.js 16 emits `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead` — the `web/src/middleware.ts` entry-point needs to be renamed to `proxy.ts`
- **Decision:** Pre-existing issue, not caused by Plan 02 changes; entry-point rename is outside this plan's file list
- **Tracked in:** `.planning/phases/05-user-login/deferred-items.md`

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan executed exactly as written.

## Issues Encountered
- Post-tool hook incorrectly flagged `web/src/lib/supabase/middleware.ts` (a utility module) as needing `proxy.ts` rename — the actual entry-point is `web/src/middleware.ts`. Confirmed by checking package.json: Next.js 16.1.6, existing `src/middleware.ts` entry-point. Warning is for entry-point rename, not utility modules.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full login flow complete end-to-end: credentials, error handling, rate limiting, session persistence, multi-tab sync, Google OAuth
- /dashboard and /app/* routes protected by middleware
- Dashboard shows bilingual greeting + sign-out — ready for real content in future phases
- Remaining pre-existing: middleware.ts → proxy.ts rename (deprecation warning only, build succeeds)

---
*Phase: 05-user-login*
*Completed: 2026-03-31*

## Self-Check: PASSED
- web/src/lib/actions/auth.ts: FOUND
- web/src/components/auth/login-form.tsx: FOUND
- web/src/components/auth/auth-sync.tsx: FOUND
- web/src/lib/supabase/middleware.ts: FOUND
- web/src/app/(dashboard)/layout.tsx: FOUND
- web/src/app/(dashboard)/dashboard/page.tsx: FOUND
- web/src/components/dashboard/nav.tsx: FOUND
- web/src/components/dashboard/sign-out.tsx: FOUND
- web/messages/en.json: FOUND
- web/messages/es.json: FOUND
- .planning/phases/05-user-login/05-02-SUMMARY.md: FOUND
- Commit 6dc38be: FOUND
- Commit 4abbe66: FOUND
