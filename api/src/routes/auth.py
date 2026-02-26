from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from ..config import get_settings
from supabase import create_client

router = APIRouter()
settings = get_settings()


class UserInfo(BaseModel):
    """User information response."""
    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    company: str | None = None


def get_supabase():
    """Get Supabase client."""
    return create_client(settings.supabase_url, settings.supabase_service_key or settings.supabase_key)


@router.get("/me")
async def get_current_user(authorization: str = None):
    """
    Get current user info.
    Expects Authorization header with Bearer token from Supabase.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        supabase = get_supabase()
        # Verify the token and get user
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = response.user
        return UserInfo(
            id=user.id,
            email=user.email or "",
            first_name=user.user_metadata.get("first_name"),
            last_name=user.user_metadata.get("last_name"),
            company=user.user_metadata.get("company"),
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
