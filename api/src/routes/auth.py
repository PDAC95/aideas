from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def auth_status():
    """Auth routes placeholder. Full implementation in Phase 3."""
    return {"auth": "not_configured", "message": "Auth endpoints will be added in Phase 3"}
