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
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])


@app.get("/")
async def root():
    return {"name": "AIDEAS API", "version": "1.0.0", "docs": "/docs"}
