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


async def get_platform_staff(
    user: dict = Depends(get_current_user),
    request: Request = None,
) -> dict:
    """Validates the authenticated user is in `platform_staff` and returns their role.

    Used by the admin/ namespace router. Layered on top of get_current_user
    so the JWT is verified first; only then do we hit the platform_staff
    table.

    Returns: dict with 'id', 'email', 'role' (super_admin | operator).
    Raises: HTTPException 403 if user is authenticated but not staff.

    Note: this dependency expects `user` from get_current_user. Because
    FastAPI dedupes dependencies by callable identity, attaching both at
    the router level only runs get_current_user once per request.
    """
    supabase: Client = request.app.state.supabase

    try:
        result = (
            supabase.table("platform_staff")
            .select("role")
            .eq("user_id", user["id"])
            .single()
            .execute()
        )
    except Exception:
        # `.single()` raises when zero rows match; treat as not_staff.
        raise HTTPException(
            status_code=403,
            detail={"error": "forbidden", "message": "Not authorized for admin endpoints", "status": 403},
        )

    if not result.data:
        raise HTTPException(
            status_code=403,
            detail={"error": "forbidden", "message": "Not authorized for admin endpoints", "status": 403},
        )

    role = result.data.get("role")
    if role not in ("super_admin", "operator"):
        raise HTTPException(
            status_code=403,
            detail={"error": "forbidden", "message": "Invalid staff role", "status": 403},
        )

    return {"id": user["id"], "email": user["email"], "role": role}


__all__ = ["get_supabase", "get_current_user", "get_platform_staff"]
