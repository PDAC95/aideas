# Codebase Concerns

## Security

### HIGH: Hardcoded Fallback Secret Key
- **Location:** `api/src/config.py:9`
- **Issue:** `secret_key: str = "dev-secret-key"` provides a default that could leak to production
- **Risk:** If `SECRET_KEY` env var is not set in production, the hardcoded default is used
- **Fix:** Remove default or fail startup if not set in production

### HIGH: Service Key Fallback to Anon Key
- **Location:** `api/src/routes/auth.py:21`
- **Issue:** `settings.supabase_service_key or settings.supabase_key` falls back to anon key if service key is missing
- **Risk:** Anon key has limited permissions; silent fallback hides misconfiguration
- **Fix:** Fail explicitly if service key is not configured

### MEDIUM: Error Details Exposed in Responses
- **Location:** `api/src/routes/auth.py:52`, `api/src/routes/health.py:24`
- **Issue:** `str(e)` is returned directly in HTTP responses
- **Risk:** Internal error details (stack traces, DB errors) could be exposed to clients
- **Fix:** Return generic error messages; log details server-side

### MEDIUM: CORS Wildcard Methods and Headers
- **Location:** `api/src/main.py:33-35`
- **Issue:** `allow_methods=["*"]` and `allow_headers=["*"]` is overly permissive
- **Fix:** Restrict to actually used methods (GET, POST, PUT, DELETE) and headers

### LOW: No Rate Limiting
- **Issue:** No rate limiting on any endpoint, including auth
- **Risk:** Brute force attacks, API abuse
- **Fix:** Add rate limiting middleware (e.g., slowapi for FastAPI)

## Technical Debt

### Scaffold State
The codebase is in early scaffold stage with significant placeholder code:
- `api/src/models/` - Empty directory (only `__init__.py`)
- `api/src/services/` - Empty directory (only `__init__.py`)
- `web/src/app/page.tsx` - Default Next.js page (not customized)
- `web/src/app/layout.tsx` - Default metadata ("Create Next App")
- No frontend pages/components beyond scaffold

### New Supabase Client Per Request
- **Location:** `api/src/routes/auth.py:21`, `api/src/routes/health.py:19,46`
- **Issue:** `create_client()` is called on every request without connection pooling
- **Risk:** Performance degradation under load
- **Fix:** Create client once and reuse, or use dependency injection with FastAPI

### No Structured Logging
- **Location:** `api/src/main.py:12,15`
- **Issue:** Uses `print()` for startup/shutdown messages
- **Fix:** Use Python `logging` module or structlog for production-ready logging

## Missing Functionality

### No Frontend Auth UI
- Supabase middleware is configured but no login/signup pages exist
- `web/src/lib/supabase/middleware.ts` is imported but the file doesn't exist yet in the visible tree

### No Frontend Routes
- Only `page.tsx` (homepage) exists
- No dashboard, settings, or automation management pages

### No API Business Logic
- Only health check and basic user info endpoints exist
- No CRUD operations for automations, organizations, subscriptions, etc.

### No Stripe Implementation
- Database tables exist for subscriptions/invoices
- Config settings exist for Stripe keys
- No actual Stripe integration code

### No Email Implementation
- Resend config exists but no email sending code

### No Test Infrastructure
- No test files in `api/` or `web/`
- No test dependencies in `requirements.txt` (no pytest)
- No test scripts in `web/package.json`

## Database Concerns

### Migration Reset Risk
- **Location:** `supabase/migrations/000_drop_all.sql`
- **Issue:** A "drop all" migration exists alongside schema creation
- **Risk:** Accidental execution in production could destroy data

### RLS Policy Complexity
- 13+ RLS policies with nested subqueries on `organization_members`
- Performance could degrade with large member tables
- Consider using Supabase RLS helper functions or materialized views

### No Soft Delete
- All tables use `ON DELETE CASCADE`
- No `deleted_at` column for audit trails
- Data loss is permanent on deletion

## Performance

### No Caching Layer
- Redis is commented out in `.env.example`
- No caching strategy for frequent queries (templates, org data)
- Health check queries DB on every call

### No API Documentation in Production
- `docs_url` and `redoc_url` are disabled when `debug=false`
- Consider keeping read-only API docs available

## Fragile Areas

### Environment Configuration
- Four separate env files (`.env`, `api/.env`, `web/.env.local`, `.env.example`)
- `api/src/config.py` reads from `../.env` (relative path dependency)
- Easy to have mismatched configuration across services

### Supabase Middleware Import
- `web/src/middleware.ts` imports from `@/lib/supabase/middleware` which may not be fully set up
- Could cause runtime errors if the supabase lib utilities aren't created
