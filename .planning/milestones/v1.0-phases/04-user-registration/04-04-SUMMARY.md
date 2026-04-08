---
phase: 04-user-registration
plan: "04"
subsystem: web/auth
tags: [verify-email, legal-pages, i18n, next-intl, supabase-auth]
dependency_graph:
  requires: [04-01, 04-02, 04-03]
  provides: [verify-email-page, legal-pages]
  affects: [web/src/app/(auth)/verify-email, web/src/app/(legal)]
tech_stack:
  added: []
  patterns: [server-component, client-component, next-intl-translations, supabase-sign-out]
key_files:
  created:
    - web/src/app/(auth)/verify-email/page.tsx
    - web/src/components/auth/resend-email-timer.tsx
    - web/src/components/auth/sign-out-button.tsx
    - web/src/app/(legal)/terms/page.tsx
    - web/src/app/(legal)/privacy/page.tsx
  modified:
    - web/messages/en.json
    - web/messages/es.json
decisions:
  - "[04-04]: verify-email page reads email from searchParams — no session required, works immediately after signup redirect"
  - "[04-04]: ResendEmailTimer uses setInterval with ref cleanup — prevents memory leak on unmount"
  - "[04-04]: SignOutButton uses router.push after signOut — ensures full navigation reset to /signup"
  - "[04-04]: Legal pages placed in (legal) route group — no shared layout needed, inherits root layout"
metrics:
  duration: "2 min"
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_changed: 7
---

# Phase 4 Plan 4: Verify-Email Page and Legal Placeholders Summary

**One-liner:** Verify-email waiting room with ResendEmailTimer (60s countdown), SignOutButton, and placeholder /terms and /privacy pages with full EN/ES i18n.

## What Was Built

### Task 1: Verify-email page with resend timer and sign-out button

The `/verify-email` page serves as a post-signup waiting room. It:
- Displays the user's email address (passed via `?email=` searchParam)
- Shows a setup-pending variant when `?setup=pending` is present
- Renders `ResendEmailTimer` — a client component with 60-second cooldown after each resend attempt
- Renders `SignOutButton` — allows users to sign out and return to /signup to use a different account
- Shows a spam folder tip
- Uses `MailCheck` icon from lucide-react at 64px in a primary-tinted circle

The `ResendEmailTimer` component calls `resendVerificationEmail` Server Action, then starts a 60-second `setInterval` countdown. The interval ref is cleaned up on unmount.

The `SignOutButton` component calls `supabase.auth.signOut()` and uses `router.push` for navigation.

All text uses `useTranslations('verifyEmail')` — keys already existed in both `en.json` and `es.json` from prior plan work.

### Task 2: Placeholder legal pages with i18n

Created `(legal)` route group with:
- `/terms` — Terms of Service placeholder page
- `/privacy` — Privacy Policy placeholder page

Both pages use consistent card layout matching auth pages, show last-updated date, and include a back-to-signup link with `ArrowLeft` icon. Added `legal.*` translation keys to both `en.json` and `es.json`.

## Deviations from Plan

### Pre-existing work

Task 1 files were already created during execution of Plan 04-03 (or an earlier session) but not committed under this plan. The verify-email page, resend-email-timer, and sign-out-button were all found as untracked files matching the exact spec. Committed them as Task 1 of this plan.

No other deviations — plan executed as written.

## Verification

- `next build` passes with 12 pages including `/terms`, `/privacy`, and `/verify-email`
- All 5 key files created and committed
- Translation keys added for both EN and ES

## Self-Check: PASSED

Files exist:
- FOUND: web/src/app/(auth)/verify-email/page.tsx
- FOUND: web/src/components/auth/resend-email-timer.tsx
- FOUND: web/src/components/auth/sign-out-button.tsx
- FOUND: web/src/app/(legal)/terms/page.tsx
- FOUND: web/src/app/(legal)/privacy/page.tsx

Commits:
- 2e06f37: feat(04-04): verify-email page with resend timer and sign-out button
- 7e39684: feat(04-04): create placeholder legal pages and add legal translation keys
