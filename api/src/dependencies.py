from fastapi import Request
from supabase import Client


def get_supabase(request: Request) -> Client:
    """FastAPI dependency that returns the Supabase client from app state.

    Usage in route handlers:
        supabase: Client = Depends(get_supabase)

    The client is initialized during app startup (lifespan) and stored at
    app.state.supabase (wired in Plan 02 — main.py update).
    """
    return request.app.state.supabase


__all__ = ["get_supabase"]
