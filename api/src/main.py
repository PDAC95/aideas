import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from supabase import create_client, Client

from .config import get_settings
from .logging_config import setup_logging, logger
from .middleware import limiter
from .routes import health
from .routes.public import public_router
from .routes.client import client_router
from .routes.admin import admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    settings = get_settings()
    app.state.supabase: Client = create_client(
        settings.supabase_url,
        settings.supabase_key,
    )
    logger.info(f"AIDEAS API starting | environment={settings.environment}")
    yield
    logger.info("AIDEAS API shutting down")


settings = get_settings()

app = FastAPI(
    title="AIDEAS API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting — in-memory, ~5/min on auth endpoints
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — explicit origins from settings (defaults to localhost:3000)
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
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.1f}ms)")
    return response


# Routes — all under /api/v1/
#
# Three audience-scoped namespaces (per .planning/REORG-V2-PLAN.md):
#
#   /api/v1/health          — system health (no auth, no rate limit)
#   /api/v1/public/*        — landing-site forms (no auth, per-endpoint rate limit)
#   /api/v1/client/*        — customer dashboard (Supabase JWT required, applied at namespace)
#   /api/v1/admin/*         — platform_staff only (JWT + role check, applied at namespace)
#
# Auth dependencies are attached at the namespace router level inside each
# package's __init__.py, NOT here, so the wiring at this file stays flat.
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(public_router, prefix="/api/v1/public")
app.include_router(client_router, prefix="/api/v1/client")
app.include_router(admin_router, prefix="/api/v1/admin")


@app.get("/")
async def root():
    return {"name": "AIDEAS API", "version": "1.0.0", "docs": "/docs"}
