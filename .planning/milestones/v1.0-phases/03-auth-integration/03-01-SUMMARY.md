---
phase: 03-auth-integration
plan: 01
subsystem: auth
tags: [supabase, google-oauth, email-templates, html-email, jwt]

# Dependency graph
requires:
  - phase: 02-database-schema
    provides: users, organizations, organization_members tables with RLS policies
provides:
  - supabase/config.toml with email/password auth, Google OAuth, 10 email template paths, redirect URLs for localhost and production
  - 10 AIDEAS-branded HTML email templates (5 EN + 5 ES) with dark theme
  - web/public/logo.png served by Next.js for production email template images
affects: [03-02-fastapi-jwt, 04-auth-pages, future-email-flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase email templates use Go template syntax: {{ .ConfirmationURL }}, {{ .Email }}"
    - "Email templates use table-based layout with inline styles only (no external CSS)"
    - "Google OAuth secrets referenced via env() in config.toml — never hardcoded"
    - "Spanish template variants suffixed with _es for bilingual support"

key-files:
  created:
    - supabase/templates/confirmation.html
    - supabase/templates/recovery.html
    - supabase/templates/invite.html
    - supabase/templates/magic_link.html
    - supabase/templates/email_change.html
    - supabase/templates/confirmation_es.html
    - supabase/templates/recovery_es.html
    - supabase/templates/invite_es.html
    - supabase/templates/magic_link_es.html
    - supabase/templates/email_change_es.html
    - web/public/logo.png
  modified:
    - supabase/config.toml

key-decisions:
  - "Google OAuth client_id and secret use env() references in config.toml — secrets never committed to version control"
  - "10 email template paths registered (5 EN + 5 ES) — bilingual from day one"
  - "Logo copied from landing/img to web/public for Next.js to serve at production URL"
  - "Supabase Inbucket (local dev) does not load external images — expected behavior, not a bug"

patterns-established:
  - "Email templates: table-based layout, inline styles, #111 dark background, white CTA button"
  - "Go template vars: {{ .ConfirmationURL }} for action link, {{ .Email }} in footer sent-to line"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 3 Plan 01: Auth Config and Email Templates Summary

**Supabase Auth configured for email/password and Google OAuth with 10 AIDEAS dark-theme HTML email templates (5 EN + 5 ES) and redirect URLs for localhost and production**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T21:09:33Z
- **Completed:** 2026-03-27T21:12:31Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Extended supabase/config.toml: 6 redirect URLs (localhost + app.aideas.com), Google OAuth with env() references, 10 email template content_path entries
- Created 5 EN email templates (confirmation, recovery, invite, magic_link, email_change) with AIDEAS dark branding and Go template variables
- Created 5 ES email templates (confirmation_es, recovery_es, invite_es, magic_link_es, email_change_es) — identical design, Spanish copy
- Copied logo.png to web/public/ for Next.js to serve at production URL referenced by templates

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Supabase Auth** - `3f024e7` (feat)
2. **Task 2: Create email templates (EN + ES)** - `e017db9` (feat)

## Files Created/Modified
- `supabase/config.toml` - Auth config: email/password enabled, Google OAuth with env() refs, 10 template paths, 6 redirect URLs
- `supabase/templates/confirmation.html` - Email confirmation template, dark theme, EN
- `supabase/templates/recovery.html` - Password reset template, dark theme, EN
- `supabase/templates/invite.html` - Team invitation template, dark theme, EN
- `supabase/templates/magic_link.html` - Magic link sign-in template, dark theme, EN
- `supabase/templates/email_change.html` - Email change confirmation template, dark theme, EN
- `supabase/templates/confirmation_es.html` - Email confirmation template, dark theme, ES
- `supabase/templates/recovery_es.html` - Password reset template, dark theme, ES
- `supabase/templates/invite_es.html` - Team invitation template, dark theme, ES
- `supabase/templates/magic_link_es.html` - Magic link sign-in template, dark theme, ES
- `supabase/templates/email_change_es.html` - Email change confirmation template, dark theme, ES
- `web/public/logo.png` - AIDEAS logo copied from landing/img for Next.js serving

## Decisions Made
- Google OAuth secrets use `env()` references in config.toml — secrets are never stored in version control
- All 10 email templates registered from day one (5 EN + 5 ES) — bilingual support built in at auth layer
- Logo sourced from landing/img/logo.png which already existed in the repo
- Supabase Inbucket (local dev email testing) does not render external images — this is expected and acceptable

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

External services require manual configuration before Google OAuth works:

**Google Cloud Console:**
1. Create OAuth 2.0 Client ID (Web application type) at Google Cloud Console -> APIs & Services -> Credentials
2. Add authorized JavaScript origins: `http://localhost:3000`, `https://app.aideas.com`
3. Add authorized redirect URIs: `http://127.0.0.1:54321/auth/v1/callback` (local), `https://<project-ref>.supabase.co/auth/v1/callback` (production)
4. Set environment variables: `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`

**Supabase Dashboard (production):**
1. Add redirect URLs at Authentication -> URL Configuration -> Redirect URLs
2. Enable Google OAuth and add client ID/secret at Authentication -> Providers -> Google

## Next Phase Readiness
- Auth infrastructure is ready: Supabase Auth accepts email/password signup with email confirmation enabled
- Google OAuth config.toml is ready — only needs real credentials from Google Cloud Console
- All 10 email templates are in place and pointed to by config.toml
- FastAPI JWT validation (Plan 02) can now proceed — Supabase JWTs will be issued by this auth setup

---
*Phase: 03-auth-integration*
*Completed: 2026-03-27*
