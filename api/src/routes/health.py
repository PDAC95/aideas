from fastapi import APIRouter, Depends
from supabase import Client
from ..dependencies import get_supabase

router = APIRouter()


@router.get("/health")
async def health_check(supabase: Client = Depends(get_supabase)):
    """Health check. Status: healthy | degraded. Never returns 5xx."""
    checks: dict[str, str] = {"api": "healthy", "supabase": "unknown"}

    try:
        # Use auth.get_user with dummy token to probe connectivity
        # Auth error = connected. Network error = degraded.
        supabase.auth.get_user("health-check-probe")
        checks["supabase"] = "healthy"
    except Exception as e:
        err = str(e)
        # Auth errors prove Supabase is reachable
        if "invalid" in err.lower() or "token" in err.lower() or "jwt" in err.lower() or "not authorized" in err.lower() or "unauthorized" in err.lower():
            checks["supabase"] = "healthy"
        else:
            checks["supabase"] = f"degraded: {err[:100]}"

    overall = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"
    return {
        "status": overall,
        "checks": checks,
        "version": "1.0.0",
    }
