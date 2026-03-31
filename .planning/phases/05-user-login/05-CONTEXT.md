# Phase 5: User Login - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

A registered and verified user can log in with email/password or Google OAuth, land on the dashboard, and remain logged in across browser refreshes and new tabs. This phase covers the login page, authentication logic, session persistence, auth middleware, and a placeholder dashboard page.

</domain>

<decisions>
## Implementation Decisions

### Layout and design
- Reuse the same split layout from registration (branding left, form right)
- Left panel content: different from registration — Claude's discretion (e.g., welcome back message)
- Mobile: same behavior as registration (left panel hidden, form centered with logo)
- Google OAuth button: same position relative to form fields as in registration page
- Checkbox "Recordarme" (Remember me) below the password field
- Password field has show/hide toggle (eye icon)
- "¿Olvidaste tu contraseña?" link below the password field, right-aligned
- "¿No tienes cuenta? Regístrate" link below the login button, linking to /signup (canonical route from Phase 4)
- Language selector (ES | EN) identical to registration: top-right corner, auto-detect from browser

### Error handling and states
- Wrong credentials: inline red message below the form — "Email o contraseña incorrectos" — no page reload, password field cleared
- Unverified user attempts login: redirect to /verify-email (no credential error shown)
- Rate limiting: block after 5 failed attempts — show "Demasiados intentos. Inténtalo en X minutos." with countdown
- Google OAuth errors: toast notification at top, disappears in 5 seconds (consistent with registration)

### Session persistence
- "Remember me" checked: session lasts 30 days
- "Remember me" unchecked: browser session (closes when all tabs closed)
- Token storage: Claude's discretion (choose the most secure approach that works with the current stack)
- Session expiry while using app: redirect to /login with message "Tu sesión ha expirado. Inicia sesión de nuevo."
- Multi-tab sync: logout in one tab triggers redirect to /login in all other tabs
- Multi-device: unlimited simultaneous sessions allowed

### Logout
- Logout button visible in the dashboard header (top-right user menu area)
- After logout: redirect to /login
- Logout clears all session data

### Redirects and auth guard
- Successful login: always redirect to /dashboard
- Visiting /login while authenticated: immediate redirect to /dashboard
- Auth middleware protects: /dashboard and everything under /app/*
- Public routes (no auth required): /login, /register, /verify-email, /forgot-password, /reset-password

### Dashboard placeholder
- Simple page: "Bienvenido, [nombre]" greeting + logout button
- No real content — just enough to confirm login works
- Real dashboard content comes in future phases

### Google OAuth edge case (new user via login)
- If Google OAuth on login page detects a new user (no organization), redirect to company name step (same flow as registration in Phase 4)
- After org creation, redirect to /dashboard

### Internationalization (i18n)
- Same i18n setup as registration: bilingual ES/EN, auto-detect, selector in top-right corner
- All login page text, error messages, and dashboard placeholder are translatable

</decisions>

<specifics>
## Specific Ideas

- Login page should feel visually cohesive with registration — same design system, same split layout, same interaction patterns
- "Recordarme" checkbox is important for the user — they want explicit control over session duration
- Rate limiting is mandatory (5 attempts) — security is a priority

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-user-login*
*Context gathered: 2026-03-31*
