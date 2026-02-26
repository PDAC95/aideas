from fastapi import APIRouter, HTTPException
from ..config import get_settings
from supabase import create_client

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    checks = {
        "api": "healthy",
        "database": "unknown",
    }

    # Check Supabase connection
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_key)
        # Simple query to check connection
        supabase.table("organizations").select("id").limit(1).execute()
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"

    # Overall status
    all_healthy = all(v == "healthy" for v in checks.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
        "environment": settings.environment,
    }


@router.get("/health/live")
async def liveness():
    """Kubernetes liveness probe."""
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness():
    """Kubernetes readiness probe."""
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_key)
        supabase.table("organizations").select("id").limit(1).execute()
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database not ready")
