from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .routes import health, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AIDEAS API...")
    yield
    # Shutdown
    print("Shutting down AIDEAS API...")


settings = get_settings()

app = FastAPI(
    title="AIDEAS API",
    description="AI Automation Solutions API",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])


@app.get("/")
async def root():
    return {
        "name": "AIDEAS API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else None,
    }
