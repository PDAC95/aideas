# Phase 3: Auth Integration - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Supabase Auth for email/password and Google OAuth, customize email templates with AIDEAS branding (bilingual EN/ES), and wire JWT validation into FastAPI so every protected route verifies the caller's identity. This phase delivers auth infrastructure only — no user-facing UI pages (those are Phase 4+).

Additionally: i18n framework for the full app (Next.js routing, dictionaries) is deferred to Phase 3.1. This phase only handles bilingual email templates.

</domain>

<decisions>
## Implementation Decisions

### Email Template Branding
- Dark theme only — consistent with landing page (body-dark)
- Color palette from landing: #111 (background), #fff (text), #5f5f5f (secondary text), #e0e0e0 (subtle elements)
- Use existing logos: logo.png (dark background) and logo-light.png (light background) from landing/img/
- Professional and direct tone — no excessive warmth, style like Stripe/Linear emails
- Primary language: English. Templates also provided in Spanish (bilingual)
- Footer content: Claude's discretion (brand, links, legal as appropriate)

### Google OAuth Flow
- Extract from Google profile: display name, email, and profile photo (avatar)
- Account linking: automatic — if email matches an existing email/password account, merge identities so user can log in with either method
- Auto-create organization on Google signup (same as email/password flow)
- Google OAuth users are considered email-verified — skip verification email, go straight to onboarding
- Only Google OAuth for now — no Apple, Microsoft, or GitHub in this phase
- Organization naming: auto-create with generic name, then present a minimal onboarding step asking user to name their company (UI for this step is Phase 4)

### Route Protection (FastAPI)
- Public routes: only GET /health and GET /docs — everything else requires JWT
- JWT claims: extract only user_id from token; query DB for profile, org, and role on each request (always fresh data)
- Error format: JSON standard — `{ "error": "unauthorized", "message": "Token expired", "status": 401 }`
- Token refresh failure: frontend redirects to /login
- Rate limiting: basic rate limiting on auth endpoints (~5 attempts/min per IP), layered on top of Supabase's built-in rate limiting
- Authorization: authentication only in this phase (is user logged in?). RBAC (role-based access control) deferred to when features need it
- Session storage: localStorage (Supabase default) — sufficient for customer portal

### Redirect URLs
- Environments: Claude's discretion for dev (localhost:3000) and production (app.aideas.com), plus any staging/preview URLs as appropriate
- Post email-verification: redirect to /login with success message ("Email verified, please log in")
- Post password-reset: redirect to /reset-password form where user enters new password, then redirect to /login
- Cross-device verification: if user opens verification link on different device, verify the email and show login page on that device

### Claude's Discretion
- Email footer content and structure
- Exact redirect URL configurations for staging/preview environments
- Rate limiting implementation approach (middleware vs dependency)
- Loading skeleton and error state designs for auth-related API responses

</decisions>

<specifics>
## Specific Ideas

- Email design should follow the landing page aesthetic — the same dark, minimal, professional look
- Landing has two versions (index.html = dark, index-light.html = light) but emails use dark only for consistency and simplicity
- The onboarding step to name the organization happens right after first login — org is auto-created with a placeholder name at registration time, user customizes it immediately after (UI in Phase 4)

</specifics>

<deferred>
## Deferred Ideas

- **i18n framework for the app** — Phase 3.1: Configure next-intl or similar, routing by language, translation dictionaries. Must be ready before Phase 4 so registration UI supports EN/ES
- **Additional OAuth providers** (Apple, Microsoft, GitHub) — future phase if needed
- **RBAC / role-based authorization** — implement when features require permission differentiation (admin vs member)
- **httpOnly cookie session storage** — consider upgrading from localStorage if security requirements increase

</deferred>

---

*Phase: 03-auth-integration*
*Context gathered: 2026-03-27*
