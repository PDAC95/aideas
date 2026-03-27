# Phase 3: Auth Integration - Research

**Researched:** 2026-03-27
**Domain:** Supabase Auth (OAuth, email templates), FastAPI JWT middleware
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Email Template Branding**
- Dark theme only — consistent with landing page (body-dark)
- Color palette from landing: #111 (background), #fff (text), #5f5f5f (secondary text), #e0e0e0 (subtle elements)
- Use existing logos: logo.png (dark background) and logo-light.png (light background) from landing/img/
- Professional and direct tone — no excessive warmth, style like Stripe/Linear emails
- Primary language: English. Templates also provided in Spanish (bilingual)
- Footer content: Claude's discretion (brand, links, legal as appropriate)

**Google OAuth Flow**
- Extract from Google profile: display name, email, and profile photo (avatar)
- Account linking: automatic — if email matches an existing email/password account, merge identities so user can log in with either method
- Auto-create organization on Google signup (same as email/password flow)
- Google OAuth users are considered email-verified — skip verification email, go straight to onboarding
- Only Google OAuth for now — no Apple, Microsoft, or GitHub in this phase
- Organization naming: auto-create with generic name, then present a minimal onboarding step asking user to name their company (UI for this step is Phase 4)

**Route Protection (FastAPI)**
- Public routes: only GET /health and GET /docs — everything else requires JWT
- JWT claims: extract only user_id from token; query DB for profile, org, and role on each request (always fresh data)
- Error format: JSON standard — `{ "error": "unauthorized", "message": "Token expired", "status": 401 }`
- Token refresh failure: frontend redirects to /login
- Rate limiting: basic rate limiting on auth endpoints (~5 attempts/min per IP), layered on top of Supabase's built-in rate limiting
- Authorization: authentication only in this phase (is user logged in?). RBAC deferred
- Session storage: localStorage (Supabase default)

**Redirect URLs**
- Environments: Claude's discretion for dev (localhost:3000) and production (app.aideas.com), plus staging/preview URLs as appropriate
- Post email-verification: redirect to /login with success message ("Email verified, please log in")
- Post password-reset: redirect to /reset-password form where user enters new password, then redirect to /login
- Cross-device verification: if user opens verification link on different device, verify the email and show login page on that device

### Claude's Discretion
- Email footer content and structure
- Exact redirect URL configurations for staging/preview environments
- Rate limiting implementation approach (middleware vs dependency)
- Loading skeleton and error state designs for auth-related API responses

### Deferred Ideas (OUT OF SCOPE)
- **i18n framework for the app** — Phase 3.1
- **Additional OAuth providers** (Apple, Microsoft, GitHub) — future phase
- **RBAC / role-based authorization** — implement when features require it
- **httpOnly cookie session storage** — consider upgrading from localStorage if security requirements increase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Supabase Auth configured for email/password signup | Supabase config.toml `[auth.email]` settings + `enable_signup = true` already in config |
| AUTH-02 | Supabase Auth configured for Google OAuth | config.toml `[auth.external.google]` block + Google Cloud Console setup |
| AUTH-03 | Email templates customized with AIDEAS branding | config.toml `[auth.email.template.*]` with `content_path` pointing to HTML files in `supabase/templates/` |
| AUTH-04 | Redirect URLs configured for local dev and production | config.toml `site_url` + `additional_redirect_urls` + Supabase Dashboard for production |
| AUTH-05 | JWT validation dependency in FastAPI (extracts user from token) | `supabase.auth.get_user(token)` pattern via `HTTPBearer` dependency |
| AUTH-06 | Protected route middleware in FastAPI (rejects unauthenticated requests) | FastAPI `Depends(get_current_user)` on all non-public routes |
</phase_requirements>

---

## Summary

Phase 3 spans two distinct technical domains: (1) Supabase Auth configuration (email/password, Google OAuth, email templates, redirect URLs) and (2) FastAPI JWT validation middleware. Both are well-supported with clear patterns.

The Supabase side is primarily **configuration work** — edits to `supabase/config.toml` for local dev plus Dashboard settings for production. Email templates are HTML files referenced by `content_path` in config.toml, using Go template variables like `{{ .ConfirmationURL }}` and `{{ .Email }}`. Google OAuth requires setup in Google Cloud Console and the Supabase Dashboard/config.toml; automatic account linking is enabled by default (no config needed). The existing project already has `[auth]` and `[auth.email]` blocks in config.toml — this phase extends them.

The FastAPI side is **Python code** — a `get_current_user` dependency that extracts the Bearer token from the Authorization header and calls `supabase.auth.get_user(token)` to validate it. This approach is simpler than manual JWT decoding (no need to manage JWKS) because the Supabase client handles all cryptographic validation. The dependency attaches `user_id` to `request.state` for use in route handlers. Rate limiting on auth endpoints is handled with `slowapi` (FastAPI-native, wraps limits-library).

The project already has significant scaffolding: OAuth callback route at `/auth/callback` in Next.js, Supabase browser/server clients configured with `@supabase/ssr`, Next.js middleware for session refresh, and a stub `auth.py` in FastAPI awaiting Phase 3 implementation.

**Primary recommendation:** Use `supabase.auth.get_user(token)` for JWT validation (not manual PyJWT decoding) — it handles JWKS verification internally and surfaces standardized auth errors. For email templates, store HTML files at `supabase/templates/` and reference them in config.toml.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| supabase-py | >=2.3.0 (already installed) | JWT validation via `auth.get_user()`, Supabase client in FastAPI | Already in base.txt; official client handles JWKS internally |
| fastapi | >=0.115.0 (already installed) | HTTP security scheme (`HTTPBearer`), `Depends()` for dependency injection | Already in stack |
| slowapi | ~0.1.9 | Rate limiting on FastAPI endpoints (wraps `limits` library) | Standard FastAPI rate limiting, Starlette-compatible |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PyJWT | >=2.8.0 | Direct JWT decode (fallback only) | Only if `auth.get_user()` proves too slow (extra round-trip per request) |
| limits | ~3.6 | In-memory or Redis backend for slowapi | Used by slowapi; in-memory is sufficient for Phase 3 (Redis deferred) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `supabase.auth.get_user(token)` | PyJWT with manual JWKS | `get_user()` is simpler, always authoritative, no key management. PyJWT is faster (no network call) but adds key rotation complexity |
| slowapi (rate limiting) | fastapi-limiter (Redis) | slowapi is in-memory and simpler for Phase 3; fastapi-limiter needs Redis |
| `Depends(get_current_user)` per-route | Global middleware | Per-route dependency is more explicit, easier to mark routes public, standard FastAPI pattern |

**Installation:**
```bash
pip install slowapi
# PyJWT is optional — only if performance profiling shows get_user() is a bottleneck
```

---

## Architecture Patterns

### Recommended Project Structure

```
api/src/
├── dependencies.py          # ADD: get_current_user() dependency (already has get_supabase)
├── middleware.py             # ADD: rate limiting setup (slowapi Limiter)
├── routes/
│   ├── auth.py              # REPLACE stub with /status endpoint (Phase 3 scope)
│   └── health.py            # UNCHANGED — public route
supabase/
├── config.toml              # EXTEND: [auth.external.google], email template paths, redirect URLs
└── templates/               # CREATE: HTML email template files
    ├── confirmation.html
    ├── recovery.html
    ├── invite.html
    ├── magic_link.html
    └── email_change.html
```

### Pattern 1: FastAPI JWT Dependency

**What:** A reusable `Depends()` function that extracts the Bearer token from Authorization header and validates it via `supabase.auth.get_user()`.

**When to use:** On every protected route. The health and docs routes are excluded at the router level.

```python
# Source: https://supabase.com/docs/reference/python/auth-getuser
# api/src/dependencies.py

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
) -> dict:
    """Validates Supabase JWT and returns user payload. Raises 401 if invalid."""
    token = credentials.credentials
    supabase: Client = request.app.state.supabase

    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if user is None:
            raise HTTPException(
                status_code=401,
                detail={"error": "unauthorized", "message": "Invalid token", "status": 401}
            )
        # Attach user_id to request state for downstream handlers
        request.state.user_id = user.id
        return {"id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e).lower()
        if "expired" in err_msg:
            msg = "Token expired"
        elif "invalid" in err_msg or "jwt" in err_msg:
            msg = "Invalid token"
        else:
            msg = "Authentication failed"
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": msg, "status": 401}
        )
```

### Pattern 2: Protected Router with Dependency

**What:** Apply `get_current_user` as a router-level dependency so all routes in that router are protected.

**When to use:** For every router except health. Cleaner than adding `Depends` to each individual route.

```python
# api/src/routes/example_protected.py
from fastapi import APIRouter, Depends, Request
from ..dependencies import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/dashboard")
async def dashboard(request: Request):
    user_id = request.state.user_id  # Set by get_current_user
    return {"user_id": user_id}
```

### Pattern 3: Rate Limiting with slowapi

**What:** Decorator-based rate limiting on auth-sensitive endpoints.

**When to use:** On any endpoint that accepts credentials (sign-in, password reset). Applied per-IP.

```python
# api/src/middleware.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# api/src/main.py
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .middleware import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# On a route:
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

### Pattern 4: Supabase Email Templates (config.toml)

**What:** Point Supabase to custom HTML files for each email type. Go template variables are injected at send time.

**When to use:** All auth-related emails (confirmation, recovery, invite, magic link, email change).

```toml
# supabase/config.toml — add to [auth] section
[auth.email.template.confirmation]
subject = "Confirm your AIDEAS account"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset your AIDEAS password"
content_path = "./supabase/templates/recovery.html"

[auth.email.template.invite]
subject = "You've been invited to AIDEAS"
content_path = "./supabase/templates/invite.html"

[auth.email.template.magic_link]
subject = "Your AIDEAS sign-in link"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.email_change]
subject = "Confirm your new AIDEAS email"
content_path = "./supabase/templates/email_change.html"
```

Available template variables (Go template syntax `{{ .VarName }}`):
- `{{ .ConfirmationURL }}` — full link with token (use for magic link / OAuth callbacks)
- `{{ .Token }}` — 6-digit OTP (alternative to URL)
- `{{ .TokenHash }}` — hashed token for PKCE flows
- `{{ .SiteURL }}` — app's site URL (e.g., http://localhost:3000)
- `{{ .Email }}` — recipient's email address
- `{{ .NewEmail }}` / `{{ .OldEmail }}` — for email change template

**PKCE flow note:** For server-side rendering, Supabase recommends using `TokenHash` instead of `ConfirmationURL`:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```
The existing `/auth/callback` route in `web/src/app/(auth)/auth/callback/route.ts` already handles `exchangeCodeForSession(code)` — compatible with both approaches.

### Pattern 5: Google OAuth config.toml

```toml
# supabase/config.toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

Google Cloud Console setup required:
- Authorized JavaScript origins: `http://localhost:3000`, `https://app.aideas.com`
- Authorized redirect URIs: `http://127.0.0.1:54321/auth/v1/callback` (local), `https://<project-ref>.supabase.co/auth/v1/callback` (production)

### Pattern 6: Redirect URL Configuration

```toml
# supabase/config.toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/login",
  "http://localhost:3000/reset-password",
  "https://app.aideas.com/auth/callback",
  "https://app.aideas.com/login",
  "https://app.aideas.com/reset-password"
]
```

Production Supabase Dashboard: Authentication > URL Configuration > Redirect URLs. Must explicitly add every allowed redirect URL — Supabase rejects unlisted URLs.

### Anti-Patterns to Avoid

- **Decoding JWT manually with PyJWT as the primary path:** Supabase JWTs can use asymmetric keys (RS256/ES256 via JWKS) — manual HS256 decoding only works if the project still uses the legacy shared secret. Use `auth.get_user(token)` to avoid algorithm confusion.
- **Using `supabase.auth.get_session()` server-side:** It does not revalidate the JWT. Only `get_user(token)` makes an authoritative server-side check.
- **Catching all exceptions silently in the JWT dependency:** Distinguish between "expired" and "invalid" — surfaces clearer error messages to frontend.
- **Wildcard redirect URLs (`*`):** Supabase does not support wildcard patterns. Every redirect URL must be listed explicitly.
- **Storing Google client secret in config.toml directly:** Use `env(VAR_NAME)` reference syntax to keep secrets out of version control.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT signature verification | Custom JWKS fetcher + PyJWT verification | `supabase.auth.get_user(token)` | Supabase handles key rotation, algorithm selection, and clock skew internally |
| Rate limiting | Custom request counter in Redis/memory | `slowapi` | Handles IP extraction, burst vs sustained limits, concurrent requests correctly |
| Email HTML | Inline-style injector for each template | HTML file with `{{ .Variable }}` Go templates | Supabase's template engine handles variable injection; just write clean HTML |
| OAuth PKCE flow | Custom code verifier / code challenge | Supabase's built-in PKCE (already in `/auth/callback`) | Already implemented in `web/src/app/(auth)/auth/callback/route.ts` |

**Key insight:** The Supabase client is the verification oracle — trust it rather than re-implementing JWT cryptography.

---

## Common Pitfalls

### Pitfall 1: `get_user()` Makes a Network Round-Trip Per Request

**What goes wrong:** `supabase.auth.get_user(token)` calls Supabase's `/auth/v1/user` endpoint on every request. At scale this adds latency.

**Why it happens:** The method validates against the server rather than caching JWKS.

**How to avoid:** For Phase 3, this is acceptable — the AIDEAS portal has low traffic. If performance becomes an issue, add JWKS-based local validation (PyJWT + cached public keys from `/.well-known/jwks.json`). Do not pre-optimize.

**Warning signs:** P95 API latency consistently > 200ms on authenticated endpoints.

### Pitfall 2: Email Template Content Path is Relative to Project Root

**What goes wrong:** The `content_path` in config.toml is relative to the Supabase project root, not the config file location.

**Why it happens:** Supabase CLI resolves paths relative to where `supabase start` is run (typically project root `/c/dev/12ai`).

**How to avoid:** Use path `./supabase/templates/confirmation.html` (starting from project root), not `./templates/confirmation.html`. Verify with `supabase stop && supabase start` after any template change.

**Warning signs:** Template email still shows Supabase default branding despite config changes.

### Pitfall 3: Google OAuth Callback URL Mismatch

**What goes wrong:** OAuth returns a redirect_uri_mismatch error from Google.

**Why it happens:** The callback URL registered in Google Cloud Console must exactly match what Supabase sends. Local Supabase uses `http://127.0.0.1:54321/auth/v1/callback` (note: `127.0.0.1`, not `localhost`).

**How to avoid:** In Google Cloud Console, register both:
- `http://127.0.0.1:54321/auth/v1/callback` (local)
- `https://<project-ref>.supabase.co/auth/v1/callback` (production)

**Warning signs:** Google OAuth popup closes immediately with an error, or user sees "Error 400: redirect_uri_mismatch".

### Pitfall 4: Automatic Account Linking Requires Email Confirmed on Existing Account

**What goes wrong:** A Google OAuth user with the same email as an email/password user does NOT get automatically linked if the email/password account is unconfirmed.

**Why it happens:** Supabase's automatic linking security model: only confirmed email identities are eligible for linking, to prevent pre-account takeover attacks.

**How to avoid:** Ensure the seed data for development uses confirmed users (the existing seed script already sets `email_confirmed_at`). In production, this is the correct behavior — no workaround needed.

**Warning signs:** Two separate user records exist for the same email — one with email/password identity and one with Google identity.

### Pitfall 5: HTTPBearer Returns 403 (Not 401) by Default When No Token

**What goes wrong:** FastAPI's `HTTPBearer()` returns a 403 Forbidden when no Authorization header is present, instead of 401 Unauthorized.

**Why it happens:** FastAPI's default HTTPBearer security scheme raises 403 for missing credentials.

**How to avoid:** Use `HTTPBearer(auto_error=False)` and handle the None case manually to return a proper 401 with the standard error JSON format.

```python
security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    ...
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "No token provided", "status": 401}
        )
```

**Warning signs:** Unauthenticated requests return 403 instead of 401.

### Pitfall 6: Email Templates Require `supabase stop && supabase start`

**What goes wrong:** Template changes are not reflected in sent emails during local development.

**Why it happens:** Supabase loads email templates at container startup; they are not hot-reloaded.

**How to avoid:** Always restart containers after template changes: `supabase stop && supabase start`. This is a known Supabase CLI behavior.

---

## Code Examples

### JWT Dependency — Full Implementation

```python
# Source: https://supabase.com/docs/reference/python/auth-getuser + project patterns
# api/src/dependencies.py

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "No token provided", "status": 401}
        )

    token = credentials.credentials
    supabase: Client = request.app.state.supabase

    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if user is None:
            raise HTTPException(
                status_code=401,
                detail={"error": "unauthorized", "message": "Invalid token", "status": 401}
            )
        request.state.user_id = user.id
        return {"id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        err = str(e).lower()
        msg = "Token expired" if "expired" in err else "Invalid token"
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": msg, "status": 401}
        )
```

### main.py Update — Protect All Non-Public Routes

```python
# api/src/main.py (additions)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Routes — health is public, auth checks itself, all others get the dependency
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# Future protected routers will use:
# router = APIRouter(dependencies=[Depends(get_current_user)])
```

### Email Template — Confirmation (Dark Theme)

```html
<!-- supabase/templates/confirmation.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your AIDEAS account</title>
</head>
<body style="background-color:#111;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <img src="https://app.aideas.com/logo.png" alt="AIDEAS" height="32" style="display:block;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="color:#fff;font-size:16px;line-height:1.6;padding-bottom:24px;">
              <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Confirm your email</p>
              <p style="margin:0 0 24px;color:#e0e0e0;">Click the button below to verify your email address and activate your AIDEAS account.</p>
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block;background-color:#fff;color:#111;font-weight:600;font-size:14px;padding:12px 24px;text-decoration:none;border-radius:6px;">
                Confirm email
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #222;color:#5f5f5f;font-size:12px;line-height:1.5;">
              <p style="margin:0 0 4px;">AIDEAS — AI Automation as a Service</p>
              <p style="margin:0;color:#5f5f5f;">This email was sent to {{ .Email }}. If you didn't create an account, you can ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Google OAuth — Client-Side Trigger (Next.js)

```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
// web/src/lib/supabase/client.ts pattern

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `jwt.decode()` with shared secret (HS256) | `supabase.auth.get_user(token)` — server-authoritative | Supabase added asymmetric JWT support | Shared secret decode is fragile; use auth.get_user() |
| Supabase legacy JWT secret (HS256) | JWKS-based asymmetric keys (RS256/ES256) | Late 2024 | Local dev still uses HS256 via legacy secret; managed projects can opt into asymmetric |
| `supabase.auth.getSession()` server-side | `supabase.auth.getUser()` server-side | Supabase SSR guidance update | getSession() trusts client-provided session and is insecure server-side |
| Email templates via Supabase Dashboard only | `config.toml` `content_path` + local HTML files | Supabase CLI maturity | Version-controllable templates, local dev parity |

**Deprecated/outdated:**
- `HTTPBearer()` with `auto_error=True` (default): Returns 403 on missing token — use `auto_error=False` and return 401 explicitly.
- Accessing `request.state.user` directly without the dependency: No type safety; always use `Depends(get_current_user)`.

---

## Open Questions

1. **Logo URL in email templates — CDN vs hosted**
   - What we know: Logo files exist at `landing/img/logo.png` and `logo-light.png`
   - What's unclear: Email clients cannot load `localhost` images. The logo needs a publicly accessible URL for production emails. During local dev, Supabase's Inbucket (email testing) renders without loading images.
   - Recommendation: Use absolute production URL (`https://app.aideas.com/logo.png`) or a CDN URL in email templates. Planner should add a task to host the logo publicly (can be in `web/public/` so Next.js serves it).

2. **Bilingual email templates — one file or two?**
   - What we know: CONTEXT.md says "Templates also provided in Spanish (bilingual)" but templates support only one language per template slot in config.toml
   - What's unclear: Does "bilingual" mean one template with both languages stacked, or separate Spanish template files pointed to by separate config entries?
   - Recommendation: Two files per template type (`confirmation.html` EN + `confirmation_es.html` ES), with separate config.toml entries. Supabase does not support per-user language selection at this layer — the language would need to be selected at send time via template name. For Phase 3, ship EN only and add ES templates as a sub-task. This aligns with the deferred i18n framework in Phase 3.1.

3. **Rate limiting storage — in-memory vs Redis**
   - What we know: CONTEXT.md says ~5 attempts/min per IP; Supabase has its own built-in rate limiting on auth endpoints
   - What's unclear: In-memory rate limiting resets on process restart and doesn't work across multiple API instances
   - Recommendation: Use slowapi with in-memory storage for Phase 3. The AIDEAS portal is single-instance on Railway for v1. Add Redis backing when horizontal scaling is needed.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set in `.planning/config.json` — skipping this section.

---

## Sources

### Primary (HIGH confidence)
- `/websites/supabase` (Context7) — email template config.toml syntax, template variables, Google OAuth config, redirect URLs, automatic identity linking behavior
- `/jpadilla/pyjwt` (Context7) — JWT decode API, HS256 pattern
- `https://supabase.com/docs/reference/python/auth-getuser` — `get_user(token)` FastAPI pattern (WebFetch)
- `https://supabase.com/docs/guides/auth/auth-identity-linking` — automatic linking is default (no config needed), security behavior (WebFetch)
- `https://supabase.com/docs/guides/local-development/customizing-email-templates` — all 6 template types, available variables, config.toml syntax (WebFetch)
- `https://supabase.com/docs/guides/auth/social-login/auth-google` — config.toml `[auth.external.google]` syntax, Google Cloud Console setup (WebFetch)

### Secondary (MEDIUM confidence)
- `https://supabase.com/docs/guides/auth/jwts` — JWT claims structure (`sub`, `role`, `email`, `iss`, `exp`); asymmetric vs HS256 algorithm discussion (WebFetch — page had limited detail)

### Tertiary (LOW confidence)
- `supabase.com/docs/guides/auth/sessions` — JWT secret location in Dashboard (referenced but not fully documented in fetched page)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project or well-documented official packages
- Architecture: HIGH — patterns verified against official Supabase docs and existing project code
- Pitfalls: HIGH (HTTPBearer 403→401, template restart) / MEDIUM (JWKS performance) — verified against docs and code inspection

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (Supabase config.toml API is stable; JWT handling patterns rarely change)
