from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

security = HTTPBearer(auto_error=False)
# auto_error=False is CRITICAL — default HTTPBearer returns 403 on missing token,
# but we need 401 per CONTEXT.md error format specification.


def get_supabase(request: Request) -> Client:
    """FastAPI dependency that returns the Supabase client from app state.

    Usage in route handlers:
        supabase: Client = Depends(get_supabase)

    The client is initialized during app startup (lifespan) and stored at
    app.state.supabase (wired in Plan 02 — main.py update).
    """
    return request.app.state.supabase


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
) -> dict:
    """Validates Supabase JWT and returns user payload.

    Extracts Bearer token from Authorization header, validates via
    supabase.auth.get_user(token) (server-authoritative, not local decode).
    Attaches user_id to request.state for downstream route handlers.

    Returns: dict with 'id' and 'email' keys.
    Raises: HTTPException 401 with standard error JSON format.
    """
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": "No token provided", "status": 401},
        )

    token = credentials.credentials
    supabase: Client = request.app.state.supabase

    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if user is None:
            raise HTTPException(
                status_code=401,
                detail={"error": "unauthorized", "message": "Invalid token", "status": 401},
            )
        # Attach user_id to request.state — per CONTEXT.md requirement
        # Route handlers access via request.state.user_id
        request.state.user_id = user.id
        return {"id": user.id, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        err = str(e).lower()
        if "expired" in err:
            msg = "Token expired"
        elif "invalid" in err or "jwt" in err:
            msg = "Invalid token"
        else:
            msg = "Authentication failed"
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthorized", "message": msg, "status": 401},
        )


__all__ = ["get_supabase", "get_current_user"]
