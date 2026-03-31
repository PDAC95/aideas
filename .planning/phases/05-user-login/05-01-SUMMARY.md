---
phase: 05-user-login
plan: 01
subsystem: auth
tags: [next-intl, zod, react-hook-form, lucide-react, tailwind]

# Dependency graph
requires:
  - phase: 04-user-registration
    provides: SignupForm pattern, GoogleOAuthButton, LanguageSwitcher, split layout design, i18n message structure
provides:
  - Login page at /login with split layout matching signup design
  - LoginForm client component with full form fields and validation
  - loginSchema Zod schema with email/password/rememberMe
  - login namespace in en.json and es.json
  - Session-expired and auth-error dismissible banners (auto-dismiss 5s)
  - Rate limiting state scaffolding ready for Plan 02
affects: [05-02-user-login-action, future-auth-flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "z.input<typeof schema> for LoginFormData — input/output type alignment with useForm (same as signup fix)"
    - "searchParams as Promise<> with await — Next.js 16 async params pattern"
    - "Auto-dismiss banners using useState + useEffect setTimeout (5s)"
    - "Rate limiting state scaffolded in form component, activated by Plan 02"

key-files:
  created:
    - web/src/lib/validations/login.ts
    - web/src/components/auth/login-form.tsx
  modified:
    - web/src/app/(auth)/login/page.tsx
    - web/messages/en.json
    - web/messages/es.json
    - web/src/lib/validations/signup.ts

key-decisions:
  - "LoginFormData uses z.input<typeof loginSchema> — consistent with Phase 4 decision on input/output type mismatch with zodResolver"
  - "handleFormSubmit is a console.log placeholder — Plan 02 wires the Server Action"
  - "searchParams typed as Promise<{...}> and awaited — Next.js 16 async searchParams requirement"
  - "Auto-dismiss after 5 seconds for both auth-error and session-expired banners via useEffect"

patterns-established:
  - "Server Component login page reads searchParams as Promise, passes flags to Client Form"
  - "Client Form handles banner lifecycle (show/hide/auto-dismiss) as local state"

requirements-completed: [LOGIN-01, LOGIN-04, LOGIN-05, LOGIN-06]

# Metrics
duration: 4min
completed: 2026-03-31
---

# Phase 5 Plan 01: User Login Summary

**Login page with split layout, LoginForm with Zod validation, Google OAuth, i18n EN/ES, and auto-dismiss error banners**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-31T15:34:10Z
- **Completed:** 2026-03-31T15:37:51Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Production login page at /login matching signup split layout (dark left panel, form right)
- LoginForm client component: email + password (show/hide), remember me, forgot password link, Google OAuth, signup link
- loginSchema (Zod) with email transform, password, rememberMe using z.input type
- Bilingual i18n: login namespace added to en.json and es.json with all required keys
- Dismissible session-expired (blue) and auth-error (red) banners with 5-second auto-dismiss
- Rate limiting state scaffolded (failedAttempts, lockedUntil) ready for Plan 02 activation
- Build succeeds with /login route compiled and all 12 pages generating

## Task Commits

Each task was committed atomically:

1. **Task 1: Create login Zod schema and i18n translations** - `9b660fb` (feat)
2. **Task 2: Build LoginForm component and replace login page** - `8d46137` (feat)

**Plan metadata:** _(see final commit)_

## Files Created/Modified
- `web/src/lib/validations/login.ts` - loginSchema + LoginFormData export (z.input)
- `web/src/components/auth/login-form.tsx` - Client component with full form, banners, rate limiting scaffolding
- `web/src/app/(auth)/login/page.tsx` - Replaced placeholder with async Server Component split layout
- `web/messages/en.json` - Added login namespace (title, form fields, errors, branding)
- `web/messages/es.json` - Added login namespace with proper Spanish accents
- `web/src/lib/validations/signup.ts` - Fixed SignupFormData to use z.input (Rule 1 auto-fix)

## Decisions Made
- `LoginFormData = z.input<typeof loginSchema>` — consistent with Phase 4 decision; zodResolver requires input type alignment with useForm generic
- `handleFormSubmit` is a placeholder (`console.log`) — Plan 02 wires the actual Supabase Server Action
- `searchParams: Promise<{...}>` awaited in page — Next.js 16 async params requirement
- Auto-dismiss uses `useState` + `useEffect` with `setTimeout(5000)` — keeps form component self-contained

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SignupFormData type from z.infer to z.input in signup.ts**
- **Found during:** Task 2 (build verification)
- **Issue:** `signup-form.tsx` had pre-existing zodResolver type mismatch — `z.coerce.boolean()` creates input/output mismatch; `SignupFormData = z.infer<>` used output type (`boolean`) but zodResolver saw `unknown`, blocking the production build
- **Fix:** Changed `SignupFormData = z.infer<typeof signupSchema>` to `z.input<typeof signupSchema>` in `signup.ts`
- **Files modified:** `web/src/lib/validations/signup.ts`
- **Verification:** `npx tsc --noEmit` — zero errors; `npm run build` — succeeds with all 12 pages
- **Committed in:** `8d46137` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Essential fix — build was blocked by pre-existing type error. No scope creep.

## Issues Encountered
- Pre-existing zodResolver type error in signup-form.tsx blocked production build. Root cause: `z.coerce.boolean()` creates different input (`unknown`) and output (`boolean`) types, and `z.infer` captures output type which mismatches useForm's generic parameter. Fixed by switching to `z.input`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Login page UI complete — ready for Plan 02 to wire `signInWithEmail` Server Action
- `handleFormSubmit` in LoginForm has stubs for `setFailedAttempts`, `setLockedUntil`, `setValue`, `setError` — Plan 02 activates rate limiting and error propagation
- GoogleOAuthButton renders with `redirectTo="/dashboard"` — Plan 02 may confirm or adjust this redirect

---
*Phase: 05-user-login*
*Completed: 2026-03-31*

## Self-Check: PASSED
- web/src/lib/validations/login.ts: FOUND
- web/src/components/auth/login-form.tsx: FOUND
- web/src/app/(auth)/login/page.tsx: FOUND
- .planning/phases/05-user-login/05-01-SUMMARY.md: FOUND
- Commit 9b660fb: FOUND
- Commit 8d46137: FOUND
