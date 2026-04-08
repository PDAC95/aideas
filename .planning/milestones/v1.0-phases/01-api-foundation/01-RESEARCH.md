# Phase 1: API Foundation - Research

**Researched:** 2026-03-05
**Domain:** FastAPI backend foundation — configuration, logging, Supabase client, CORS, health checks, Railway deployment
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- All API routes under `/api/v1/` prefix for future versionability
- One file per resource in routes/ (health.py, auth.py, etc.)
- Keep `requirements.txt` (base.txt + dev.txt) — no migration to pyproject.toml
- Fail-fast on missing critical variables: app must NOT start if SUPABASE_URL, SUPABASE_KEY, or other required vars are absent — clear error message indicating which variable is missing
- Supabase project already exists with URL and keys available
- Supabase CLI already initialized in `supabase/` directory
- `.env.example` documents all required variables
- Allowed origins: `https://app.aideas.com` and `http://localhost:3000` — block everything else
- No rate limiting in this phase
- Health check at `/health` (under /api/v1/) reports both app status AND Supabase connectivity — returns "degraded" if Supabase is down, not 500
- Only Railway console logs for now — no external monitoring services

### Claude's Discretion
- Exact folder structure within api/src/
- Logging library choice (loguru vs structlog)
- Deploy configuration for Railway
- Proxy/forwarded headers setup
- Environment management implementation details
- Health check response format

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | FastAPI app initialized with proper folder structure (routes, services, models) | Architecture Patterns section — domain-based layout within existing api/src/ scaffold |
| API-02 | Pydantic Settings configuration with .env support | Standard Stack + Code Examples — BaseSettings with required fields triggers ValidationError at startup |
| API-03 | Supabase client configured and connected | Standard Stack + Code Examples — supabase-py 2.x create_client, singleton via lifespan |
| API-04 | CORS configured for app.aideas.com and localhost origins | Code Examples — CORSMiddleware with explicit origins list, no wildcard |
| API-05 | Health check endpoint at `/health` returns service status | Architecture Patterns — /api/v1/health returns {"status": "healthy|degraded"} with Supabase check |
| API-06 | OpenAPI docs available at `/docs` | Standard Stack — FastAPI auto-generates; docs_url always enabled (not gated by debug flag) |
| API-07 | Requirements files (base.txt, dev.txt) with pinned dependencies | Standard Stack — pinned versions table; split base/dev with -r base.txt in dev |
| API-08 | Structured logging with loguru or structlog | Standard Stack + Code Examples — loguru recommended; middleware pattern for per-request logs |
| API-09 | .env.example with all required variables documented | Code Examples — template with all required vars and descriptions |
</phase_requirements>

---

## Summary

This phase establishes the FastAPI backend skeleton that every subsequent phase builds on. An existing scaffold at `api/src/` already has `main.py`, `config.py`, `routes/health.py`, `routes/auth.py`, `services/`, and `models/` — work should refine and complete this scaffold rather than starting fresh. The key problems to solve are: fail-fast environment validation (missing SUPABASE_URL/SUPABASE_KEY must abort startup with a clear message), per-request structured logging visible in Railway console, a health endpoint that distinguishes "degraded" (Supabase unreachable) from "healthy", and correct CORS locking down to two explicit origins.

The existing `config.py` uses pydantic-settings `BaseSettings` correctly — fields declared without defaults (`supabase_url: str`, `supabase_key: str`) already cause a `ValidationError` at startup when missing. The main gaps in the current scaffold are: (1) logging is `print()` only, (2) `/docs` is gated behind `debug=True` which is wrong for production observability, (3) health check creates a new Supabase client on every request instead of using a singleton, (4) requirements.txt is not split into base/dev, (5) no `.env.example` exists, and (6) no Railway deployment configuration file.

**Primary recommendation:** Use loguru for structured logging with a FastAPI HTTP middleware that logs timestamp, method, route, status code, and duration on every request. Manage the Supabase client as a singleton initialized in the `lifespan` context manager and stored on `app.state`. Always expose `/docs` regardless of environment — Railway has no publicly-routable URL without authentication anyway, and OpenAPI docs are needed for API-06.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fastapi | >=0.115.0 | ASGI web framework | Project already uses it; industry standard for Python APIs |
| uvicorn[standard] | >=0.30.0 | ASGI server | Pairs with FastAPI; `[standard]` adds uvloop + httptools for speed |
| pydantic-settings | >=2.2.0 | Settings from env vars | Already in scaffold; BaseSettings with required fields = automatic fail-fast |
| supabase | >=2.3.0 | Supabase client | Already in scaffold; version 2.x is current stable API |
| loguru | >=0.7.2 | Structured logging | Simpler than structlog for Railway console output; excellent FastAPI middleware support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python-dotenv | >=1.0.0 | Load .env in dev | Already in scaffold; pydantic-settings calls it automatically |
| httpx | >=0.27.0 | Async HTTP client | Already in scaffold; used by supabase-py internally |
| python-multipart | >=0.0.9 | Form data parsing | Already in scaffold; needed for future file uploads |

### Dev-only
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pytest | >=8.0.0 | Test runner | Dev dependencies; not needed in production image |
| pytest-asyncio | >=0.23.0 | Async test support | FastAPI test helpers require async test support |
| httpx | >=0.27.0 | TestClient transport | httpx is already in base; TestClient uses it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| loguru | structlog | structlog provides more powerful structured JSON output, better for ELK/Datadog. Loguru is simpler to configure for Railway console. Since no external monitoring in this phase, loguru wins. |
| uvicorn direct | gunicorn + uvicorn workers | Gunicorn adds multi-worker process management. Railway handles container restarts, so single uvicorn process is fine for this phase. |
| pydantic-settings | python-decouple | pydantic-settings already in scaffold and provides type coercion + validation for free. |

**Installation (requirements/base.txt):**
```bash
pip install fastapi>=0.115.0 "uvicorn[standard]>=0.30.0" pydantic-settings>=2.2.0 supabase>=2.3.0 loguru>=0.7.2 python-dotenv>=1.0.0 httpx>=0.27.0 python-multipart>=0.0.9
```

---

## Architecture Patterns

### Recommended Project Structure

The existing scaffold already has the right skeleton. Additions needed:

```
api/
├── Dockerfile                   # Railway deployment (NEW)
├── railway.json                 # Railway config — health check, restart policy (NEW)
├── requirements/
│   ├── base.txt                 # Production deps (RESTRUCTURE from requirements.txt)
│   └── dev.txt                  # Dev/test deps, includes -r base.txt (NEW)
├── .env.example                 # All required vars documented (NEW)
└── src/
    ├── main.py                  # App factory, lifespan, middleware registration (REFINE)
    ├── config.py                # Settings class — pydantic-settings (REFINE)
    ├── logging_config.py        # Loguru configuration + intercept stdlib (NEW)
    ├── dependencies.py          # Reusable FastAPI Depends() — get_supabase_client (NEW)
    ├── routes/
    │   ├── __init__.py
    │   ├── health.py            # GET /api/v1/health (REFINE — use app.state client)
    │   └── auth.py              # Stub only — auth logic is Phase 3 (REFINE)
    ├── services/
    │   └── __init__.py
    └── models/
        └── __init__.py
```

### Pattern 1: Fail-Fast Settings with Required Fields

**What:** Fields declared without default values in BaseSettings raise `pydantic.ValidationError` at import time if the env var is missing. pydantic-settings formats the error with field names.

**When to use:** Every critical variable that must exist for the app to function (SUPABASE_URL, SUPABASE_KEY).

**Example:**
```python
# api/src/config.py
# Source: https://fastapi.tiangolo.com/advanced/settings/ + pydantic-settings docs
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    environment: str = "development"
    debug: bool = False  # Default False — docs always shown regardless (see API-06 note)
    secret_key: str = "dev-secret-key-change-in-production"

    # Required — no default = fail-fast if missing
    supabase_url: str
    supabase_key: str

    # Optional — have defaults
    supabase_service_key: str = ""

    # CORS — comma-separated string in env, parsed to list
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

**Note on API-06:** The current scaffold gates `/docs` behind `debug=True`. This is wrong. The requirement is that `/docs` always returns the OpenAPI UI. Change `docs_url="/docs" if settings.debug else None` to always `docs_url="/docs"`.

### Pattern 2: Supabase Singleton via Lifespan

**What:** Create one Supabase client at startup, store on `app.state`, inject via `Depends()`. Avoids creating a new connection on every request.

**When to use:** Any resource that should be shared across requests (DB clients, HTTP clients).

**Example:**
```python
# api/src/main.py  (lifespan section)
# Source: FastAPI docs — https://fastapi.tiangolo.com/advanced/events/
from contextlib import asynccontextmanager
from fastapi import FastAPI
from supabase import create_client, Client
from .config import get_settings
from .logging_config import setup_logging, logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    settings = get_settings()

    # Initialize Supabase client — supabase_url/key already validated by pydantic
    app.state.supabase: Client = create_client(
        settings.supabase_url,
        settings.supabase_key,
    )
    logger.info("Supabase client initialized", url=settings.supabase_url)
    logger.info(f"AIDEAS API starting in {settings.environment} environment")

    yield  # App runs here

    logger.info("AIDEAS API shutting down")
```

```python
# api/src/dependencies.py
from fastapi import Request
from supabase import Client

def get_supabase(request: Request) -> Client:
    """Inject the shared Supabase client from app state."""
    return request.app.state.supabase
```

### Pattern 3: Per-Request Logging Middleware

**What:** `@app.middleware("http")` wraps every request, capturing method, path, status, and duration.

**When to use:** Always — this provides the essential observability log line for Railway console.

**Example:**
```python
# api/src/main.py  (middleware section)
# Source: https://mahdijafaridev.medium.com/log-like-a-legend-power-up-fastapi-with-loguru
import time
from fastapi import Request
from .logging_config import logger

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.1f}ms)"
    )
    return response
```

### Pattern 4: Loguru Configuration with stdlib Intercept

**What:** Loguru does not automatically intercept Python's standard `logging` module. Uvicorn and other libraries use stdlib logging. Without interception, you get two different log streams.

**When to use:** Any production FastAPI app using loguru — mandatory to capture uvicorn access logs.

**Example:**
```python
# api/src/logging_config.py
# Source: https://gist.github.com/nkhitrov/a3e31cfcc1b19cba8e1b626276148c49
import logging
import sys
from loguru import logger


class InterceptHandler(logging.Handler):
    """Route stdlib logging through loguru."""
    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging(log_level: str = "INFO") -> None:
    """Configure loguru and intercept stdlib logging."""
    # Remove default loguru handler
    logger.remove()
    # Add stdout handler — Railway captures stdout as console logs
    logger.add(
        sys.stdout,
        level=log_level,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {message}",
        colorize=False,  # Railway console does not render ANSI colors well
    )
    # Intercept all stdlib logging (uvicorn, supabase internals, etc.)
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        logging.getLogger(logger_name).handlers = [InterceptHandler()]
```

### Pattern 5: Health Check with Supabase Probe

**What:** Health endpoint uses injected Supabase client to run a lightweight query. Returns "degraded" (not 500) if Supabase is unreachable. This keeps the app loadbalancer-healthy while signaling a dependency problem.

**When to use:** Always for production health checks on apps with external dependencies.

**Example:**
```python
# api/src/routes/health.py
from fastapi import APIRouter, Depends
from supabase import Client
from ..dependencies import get_supabase

router = APIRouter()


@router.get("/health")
async def health_check(supabase: Client = Depends(get_supabase)):
    """
    Returns service health.
    Status: healthy | degraded
    Never returns 5xx — degraded means Supabase is unreachable but API is up.
    """
    checks: dict[str, str] = {"api": "healthy", "supabase": "unknown"}

    try:
        # Lightweight check — auth.getUser with a dummy token will fail fast
        # Alternative: use service key and query a system table
        supabase.table("_health_check_nonexistent").select("id").limit(1).execute()
        checks["supabase"] = "healthy"
    except Exception as e:
        err = str(e)
        # 404 from Supabase means connected but table doesn't exist — still connected
        if "does not exist" in err or "relation" in err or "404" in err:
            checks["supabase"] = "healthy"
        else:
            checks["supabase"] = f"degraded: {err[:100]}"

    overall = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"
    return {
        "status": overall,
        "checks": checks,
        "version": "1.0.0",
    }
```

**Note:** A better health check strategy is to use the Supabase service key and call `supabase.auth.get_session()` or any lightweight admin endpoint. The nonexistent table trick above works but produces noisy logs. Prefer using `supabase.auth.admin.list_users(page=1, per_page=1)` with the service key if available.

### Pattern 6: CORS Locked to Explicit Origins

**What:** CORSMiddleware with an explicit list. Never use `["*"]` — it disables `allow_credentials=True`.

**Example:**
```python
# api/src/main.py
from fastapi.middleware.cors import CORSMiddleware

CORS_ORIGINS = [
    "https://app.aideas.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**Note on settings.cors_origins:** The current scaffold reads CORS from settings, which is correct for configurability. However, ensure the production Railway env var `ALLOWED_ORIGINS` is set to `https://app.aideas.com,http://localhost:3000`. The default in code should remain localhost-only for safety.

### Anti-Patterns to Avoid

- **Creating Supabase client per-request:** The current `health.py` does `create_client()` inside every request handler. This is wasteful and can exhaust connection pools. Use the singleton on `app.state`.
- **Gating `/docs` behind `debug=True`:** API-06 requires docs always available. Remove the conditional.
- **Using `print()` for logging:** Current `main.py` uses `print("Starting AIDEAS API...")`. Replace with `logger.info()`.
- **Committing real `.env` to git:** Only `.env.example` with placeholder values goes to git.
- **Catching all exceptions in health check and hiding them:** The health route must distinguish "connected but table missing" from "cannot reach Supabase at all" — these require different handling.
- **Using `allow_origins=["*"]` with `allow_credentials=True`:** This is a CORS spec violation — browsers will reject credentials responses. Always use explicit origins when credentials are needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment validation | Custom required-field checker | pydantic-settings BaseSettings with no-default fields | pydantic handles type coercion, error message formatting, and multiple source priority automatically |
| Per-request logging | Custom log formatter | loguru + `@app.middleware("http")` pattern | Thread/async safety, log rotation, multiple sinks already solved |
| CORS header management | Custom CORS middleware | FastAPI's `CORSMiddleware` | Preflight handling, credential support, header negotiation are subtle and already solved |
| Supabase auth token verification | Custom JWT decode + Supabase secret | `supabase.auth.get_user(token)` | Supabase handles key rotation, revocation lists, and token format changes |
| Health check HTTP client | `requests` or `httpx` calls to self | Direct Supabase client method call | Lower overhead, reuses existing authenticated client |

**Key insight:** pydantic-settings + FastAPI middleware cover 90% of the "boilerplate" problems in this phase. The remaining 10% (logging intercept, Railway PORT) are solved by well-established community patterns, not custom code.

---

## Common Pitfalls

### Pitfall 1: lru_cache Prevents Settings Reload in Tests
**What goes wrong:** `@lru_cache()` on `get_settings()` means test overrides via `monkeypatch.setenv()` are ignored if Settings was already instantiated.
**Why it happens:** lru_cache caches the first call result forever within the process.
**How to avoid:** In tests, call `get_settings.cache_clear()` before each test that changes env vars. Or use FastAPI's `app.dependency_overrides` to replace `get_settings` entirely.
**Warning signs:** Tests pass locally with real `.env` but fail in CI with mocked env vars.

### Pitfall 2: Loguru Does Not Intercept Uvicorn Access Logs by Default
**What goes wrong:** Loguru gets your app logs; uvicorn still writes access logs through stdlib logging, creating two separate log streams or losing uvicorn logs entirely.
**Why it happens:** Loguru replaces the root logger handler but does not monkey-patch stdlib logging handlers already attached to named loggers.
**How to avoid:** Implement `InterceptHandler` (see Pattern 4) and explicitly reassign handlers on `uvicorn`, `uvicorn.error`, and `uvicorn.access` loggers.
**Warning signs:** Railway console shows either duplicate logs or missing uvicorn startup/access messages.

### Pitfall 3: Railway Binds to PORT Environment Variable
**What goes wrong:** App starts fine locally on port 8000 but Railway can't route traffic to it because Railway injects a dynamic `PORT` env var that must be used.
**Why it happens:** Railway's networking layer maps the service's public URL to `$PORT` on the container. If uvicorn is hardcoded to 8000, no traffic reaches it.
**How to avoid:** Dockerfile CMD must use `${PORT:-8000}`:
```dockerfile
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```
Or in `railway.json` startCommand. Never hardcode port 8000 in the start command.
**Warning signs:** App shows "running" in Railway dashboard but returns 502/timeout on every request.

### Pitfall 4: Supabase Client Created Before Settings Validated
**What goes wrong:** If `create_client()` is called at module import time (e.g., top-level in `routes/health.py`), it runs before pydantic validates settings, potentially with empty strings.
**Why it happens:** Module-level code runs at import, before the lifespan context manager.
**How to avoid:** Only create the Supabase client inside the `lifespan` function or inside request handlers via `Depends(get_supabase)`. Never at module level.
**Warning signs:** App starts without error even when SUPABASE_URL is missing from env.

### Pitfall 5: CORS Blocks Requests from Supabase Auth Redirects
**What goes wrong:** Supabase Auth redirects back to your frontend with query params. If the redirect URL domain is not in the CORS allow list, browsers block the subsequent API calls.
**Why it happens:** The redirect lands on a slightly different URL (e.g., with trailing slash, or different port) than what's in the allow list.
**How to avoid:** CORS origins must exactly match what the browser sends as `Origin` header — no trailing slashes, exact protocol (http vs https). For localhost dev, ensure `http://localhost:3000` (not `http://localhost:3000/`) is listed.
**Warning signs:** Auth works server-side but browser console shows CORS errors on authenticated API calls.

### Pitfall 6: Missing requirements/base.txt Split Causes Production Bloat
**What goes wrong:** Current scaffold has a single `requirements.txt` with everything. If test tools (pytest, etc.) land in the Docker image, the image is larger and has unnecessary attack surface.
**Why it happens:** Single requirements file is the easiest starting point.
**How to avoid:** Split into `requirements/base.txt` (production) and `requirements/dev.txt` (includes `-r base.txt` + test tools). Dockerfile `COPY requirements/base.txt` only.

---

## Code Examples

### Complete .env.example
```bash
# .env.example — Copy to .env and fill in real values
# Required — app will NOT start without these
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Optional — defaults shown
ENVIRONMENT=development
DEBUG=false
SECRET_KEY=change-this-in-production

# CORS — comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://app.aideas.com

# Email (Phase 3+)
RESEND_API_KEY=
EMAIL_FROM=noreply@aideas.com

# Stripe (Phase 5+)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Dockerfile for Railway
```dockerfile
# Dockerfile
# Source: https://www.codingforentrepreneurs.com/blog/deploy-fastapi-to-railway-with-this-dockerfile
FROM python:3.12-slim-bookworm

WORKDIR /app

# Install OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (production only)
COPY requirements/base.txt requirements/base.txt
RUN pip install --no-cache-dir -r requirements/base.txt

# Copy source
COPY src/ src/

# Railway injects PORT — default to 8000 for local
EXPOSE 8000
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### Complete main.py (reference)
```python
# api/src/main.py
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

from .config import get_settings
from .logging_config import setup_logging, logger
from .routes import health, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — settings already validated by pydantic at import time
    setup_logging()
    settings = get_settings()

    app.state.supabase: Client = create_client(
        settings.supabase_url,
        settings.supabase_key,
    )
    logger.info(f"AIDEAS API starting | environment={settings.environment}")

    yield  # Application runs

    logger.info("AIDEAS API shutting down")


settings = get_settings()

app = FastAPI(
    title="AIDEAS API",
    description="AI Automation Solutions API",
    version="1.0.0",
    docs_url="/docs",      # Always enabled — required by API-06
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — explicit origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.1f}ms)"
    )
    return response


# Register routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])


@app.get("/")
async def root():
    return {"name": "AIDEAS API", "version": "1.0.0", "docs": "/docs"}
```

### requirements/base.txt
```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic-settings>=2.2.0
supabase>=2.3.0
loguru>=0.7.2
python-dotenv>=1.0.0
httpx>=0.27.0
python-multipart>=0.0.9
```

### requirements/dev.txt
```
-r base.txt
pytest>=8.0.0
pytest-asyncio>=0.23.0
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pydantic.BaseSettings` (v1) | `pydantic_settings.BaseSettings` (separate package) | pydantic v2 (2023) | Must install `pydantic-settings` separately; `model_config = SettingsConfigDict(...)` replaces inner `class Config` |
| `class Config` inside BaseSettings | `model_config = SettingsConfigDict(...)` | pydantic v2 | Existing scaffold uses old `class Config` pattern — it still works but is deprecated |
| `from pydantic import BaseSettings` | `from pydantic_settings import BaseSettings` | pydantic v2 | Import path changed |
| Supabase Python sync-only client | supabase-py 2.x with `acreate_client()` for async | 2023 | Sync client still works for this phase; async needed for Realtime in later phases |

**Deprecated/outdated in existing scaffold:**
- `class Config` in `config.py`: Works but uses pydantic v1 style. Replace with `model_config = SettingsConfigDict(...)` for v2 compatibility.
- `print("Starting AIDEAS API...")` in `main.py`: Replace with `logger.info()`.
- `docs_url="/docs" if settings.debug else None`: This gates docs on debug flag. Change to always `"/docs"` per API-06 requirement.
- Creating `supabase = create_client(...)` inside each route handler: Move to singleton on `app.state`.
- `env_file = "../.env"`: This is a relative path from the working directory at runtime, not from the file. Works when running from `api/` but breaks when running from `api/src/`. Use `Path(__file__).parent.parent / ".env"` for reliability.

---

## Open Questions

1. **Health check Supabase probe strategy**
   - What we know: The current scaffold queries `organizations` table — this table won't exist until Phase 2 migrations run. This will cause the health check to show "degraded" or error during Phase 1.
   - What's unclear: What lightweight Supabase endpoint is reliably available without any schema setup?
   - Recommendation: Use `supabase.auth.get_user("dummy-token")` — it will return an auth error (not a network error), which proves Supabase connectivity. Catch auth errors as "connected" and network errors as "degraded". This works before any tables exist.

2. **Supabase service key vs anon key for health check**
   - What we know: Health check in scaffold uses `supabase_key` (anon key). The service key bypasses RLS.
   - What's unclear: Which key should health check use? Using anon key + org table query will fail due to RLS restrictions even when connected.
   - Recommendation: Use `supabase_key` (anon key) for health check but call `supabase.auth.get_user("dummy")` rather than querying a table. This avoids RLS issues entirely.

3. **ProxyHeadersMiddleware for Railway**
   - What we know: Railway terminates TLS and forwards via proxy. `request.client.host` will show Railway's internal IP, not the real client IP.
   - What's unclear: Whether this matters for Phase 1 logging (probably not) and whether it breaks anything.
   - Recommendation: Add `uvicorn --forwarded-allow-ips='*'` or `TrustedHostMiddleware` in Phase 1 if request.client.host accuracy is needed. Defer if not needed for logging requirements.

---

## Sources

### Primary (HIGH confidence)
- FastAPI official docs — settings, middleware, lifespan: https://fastapi.tiangolo.com/advanced/settings/
- FastAPI best practices repo (zhanymkanov) — project structure, dependency injection patterns: https://github.com/zhanymkanov/fastapi-best-practices
- Railway FastAPI guide — deployment configuration, PORT variable: https://docs.railway.com/guides/fastapi
- Railway Dockerfile blog — PORT env var handling `${PORT:-8000}`, railway.json: https://www.codingforentrepreneurs.com/blog/deploy-fastapi-to-railway-with-this-dockerfile

### Secondary (MEDIUM confidence)
- Loguru FastAPI integration guide — InterceptHandler pattern, middleware logging: https://mahdijafaridev.medium.com/log-like-a-legend-power-up-fastapi-with-loguru-for-real-world-logging-bc0f10834eb4
- Loguru/uvicorn intercept gist (nkhitrov): https://gist.github.com/nkhitrov/a3e31cfcc1b19cba8e1b626276148c49
- Supabase Python docs — create_client, async client: https://supabase.com/docs/reference/python/initializing
- pydantic-settings BaseSettings — required fields, fail-fast: https://docs.pydantic.dev/latest/concepts/pydantic_settings/

### Tertiary (LOW confidence)
- loguru vs structlog comparison (betterstack.com) — community comparison, not official: https://betterstack.com/community/guides/logging/best-python-logging-libraries/

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — pydantic-settings, FastAPI, supabase-py, loguru are all well-established with official docs
- Architecture: HIGH — patterns verified against official FastAPI docs and community best practices repo
- Pitfalls: MEDIUM — lru_cache/test issue and loguru intercept verified; Railway PORT behavior verified via Railway docs; health check probe strategy is inferred from Supabase docs
- Railway deployment: HIGH — official Railway FastAPI guide consulted directly

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable ecosystem; supabase-py and loguru versions change slowly)
