---
phase: 01-api-foundation
plan: 02
subsystem: api
tags: [fastapi, supabase, cors, lifespan, logging, middleware, health-check]

requires:
  - 01-01 (logging_config.py, dependencies.py, config.py with cors_origins)

provides:
  - FastAPI app with lifespan-based Supabase singleton on app.state
  - Per-request structured logging middleware (method, path, status, duration)
  - Always-on OpenAPI docs at /docs and /redoc (no debug gating)
  - CORS with explicit origins from settings.cors_origins
  - Health check at /api/v1/health with Supabase connectivity probe via Depends injection
  - Auth stub at /api/v1/auth/status ready for Phase 3 implementation
  - All routes registered under /api/v1/ prefix

affects: [03-auth, all subsequent API phases]

tech-stack:
  added: []
  patterns:
    - asynccontextmanager lifespan initializes Supabase once and stores on app.state
    - Depends(get_supabase) injects shared client — never create_client() inside handlers
    - Per-request logging via @app.middleware("http") with time.perf_counter()
    - CORS allow_methods as explicit list (not wildcard) for security
    - Supabase connectivity probe: auth.get_user with dummy token; auth errors = reachable

key-files:
  modified:
    - api/src/main.py
    - api/src/routes/health.py
    - api/src/routes/auth.py

key-decisions:
  - "Always-on /docs — removed debug gating as per API-06; docs always available for Railway testing"
  - "Supabase connectivity probe uses auth.get_user with dummy token — auth errors prove reachability, network errors indicate degraded"
  - "auth.py simplified to stub — /me and UserInfo belong in Phase 3 with proper JWT middleware"
  - "Explicit CORS methods list instead of wildcard — more explicit and secure"

metrics:
  duration: 1 min
  completed: 2026-03-05
  tasks: 2
  files_modified: 3
---

# Phase 1 Plan 02: API Foundation — main.py Lifespan, CORS, Logging Middleware, Health & Auth Stubs Summary

**FastAPI app wired with Supabase singleton lifespan, per-request logging middleware, always-on OpenAPI docs, CORS with explicit origins, and Supabase-probing health check using dependency injection**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-05T21:43:32Z
- **Completed:** 2026-03-05T21:44:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Rewrote main.py with asynccontextmanager lifespan that calls setup_logging(), initializes Supabase client once, and stores it on app.state
- Moved docs_url and redoc_url from debug-gated to always-on ("/docs", "/redoc") satisfying API-06
- Added per-request logging middleware using time.perf_counter() capturing method, path, status code, and duration in ms
- Updated CORS to use explicit methods list instead of wildcard
- Rewrote health.py to use Depends(get_supabase) for injected client; probes Supabase connectivity via auth.get_user with dummy token
- Removed Kubernetes liveness/readiness probes from health.py (not needed for Railway)
- Simplified auth.py to clean stub with /status endpoint only; removed UserInfo model, per-request create_client, and /me endpoint (deferred to Phase 3)
- Registered health router at /api/v1 prefix and auth router at /api/v1/auth prefix

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor main.py with lifespan, CORS, logging middleware, always-on docs** - `0049d21` (feat)
2. **Task 2: Refine health.py with Depends injection and auth.py as stub** - `c48d1bf` (feat)

## Files Created/Modified

- `api/src/main.py` - Complete rewrite: lifespan with Supabase singleton, always-on docs, per-request logging middleware, explicit CORS methods, routes under /api/v1/
- `api/src/routes/health.py` - Rewritten with Depends(get_supabase) injection, Supabase connectivity probe, healthy/degraded without 5xx; K8s endpoints removed
- `api/src/routes/auth.py` - Simplified to stub: /status endpoint only, Phase 3 placeholder message

## Decisions Made

- Removed debug gating from docs_url/redoc_url — API-06 requires always-on docs for Railway testing workflow
- Supabase connectivity probe pattern: auth.get_user("health-check-probe") with auth error = reachable detection; avoids needing a real DB table to query
- Deferred /me endpoint and UserInfo model to Phase 3 — belongs with JWT middleware (AUTH-05, AUTH-06)
- Explicit CORS methods list ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] instead of ["*"] for production-safe configuration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Self-Check: PASSED

All claimed files exist and commits are verified:
- api/src/main.py - FOUND
- api/src/routes/health.py - FOUND
- api/src/routes/auth.py - FOUND
- Commit 0049d21 - FOUND
- Commit c48d1bf - FOUND

---
*Phase: 01-api-foundation*
*Completed: 2026-03-05*
