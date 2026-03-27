from fastapi import APIRouter, Depends, Request

from ..dependencies import get_current_user
from ..middleware import limiter

router = APIRouter()


@router.get("/status")
@limiter.limit("5/minute")
async def auth_status(request: Request, user: dict = Depends(get_current_user)):
    """Returns the authenticated user's basic info.

    Protected endpoint — requires valid Supabase JWT in Authorization header.
    Rate-limited to 5 requests per minute per IP.

    This endpoint serves two purposes:
    1. Frontend can verify token validity (200 = valid, 401 = invalid/expired)
    2. Returns user_id and email for the current session
    """
    return {
        "authenticated": True,
        "user_id": str(user["id"]),
        "email": user["email"],
    }
