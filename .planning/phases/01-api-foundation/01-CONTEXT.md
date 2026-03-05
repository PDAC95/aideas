# Phase 1: API Foundation - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

FastAPI backend production-ready: structured project, environment configuration, structured logging, health checks, Supabase client connection, and CORS. This is the foundation all subsequent phases build endpoints on top of. No auth logic, no database schema, no UI — just the API skeleton.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Claude's discretion on folder organization — optimize based on FastAPI conventions and existing scaffold in `api/src/`
- All API routes under `/api/v1/` prefix for future versionability
- One file per resource in routes/ (health.py, auth.py, etc.)
- Keep `requirements.txt` (base.txt + dev.txt) — no migration to pyproject.toml

### Configuration and Environment
- Claude's discretion on environment management approach (Pydantic Settings + .env recommended in requirements)
- Fail-fast on missing critical variables: app must NOT start if SUPABASE_URL, SUPABASE_KEY, or other required vars are absent — clear error message indicating which variable is missing
- Supabase project already exists with URL and keys available
- Supabase CLI already initialized in `supabase/` directory (verify during implementation)
- `.env.example` documents all required variables

### Logging and Observability
- Claude's discretion on logging library (loguru vs structlog)
- Essential log line per request: timestamp, method, route, status code, duration
- Health check at `/health` (under /api/v1/) reports both app status AND Supabase connectivity — returns "degraded" if Supabase is down, not 500
- Only Railway console logs for now — no external monitoring services (Sentry, Datadog) in this phase

### CORS and Base Security
- Allowed origins: `https://app.aideas.com` and `http://localhost:3000` — block everything else
- No rate limiting in this phase (no public endpoints yet — defer to Phase 3+)
- Claude's discretion on deploy strategy for Railway (Dockerfile vs auto-detect)
- Claude's discretion on proxy/trusted-host configuration behind Railway

### Claude's Discretion
- Exact folder structure within api/src/
- Logging library choice (loguru vs structlog)
- Deploy configuration for Railway
- Proxy/forwarded headers setup
- Environment management implementation details
- Health check response format

</decisions>

<specifics>
## Specific Ideas

- Existing scaffold at `api/` has: main.py, config.py, routes/ (health.py, auth.py), services/, models/ — build on this, don't start from scratch
- Frontend (Next.js) lives in `web/` — API runs separately
- Supabase directory at `supabase/` already initialized
- Railway is the target deployment platform

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-api-foundation*
*Context gathered: 2026-03-05*
