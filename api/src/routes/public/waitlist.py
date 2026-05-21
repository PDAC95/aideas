"""POST /api/v1/public/waitlist — landing page email capture.

Stub endpoint for the email-gate / waitlist signup on the landing.

Phase 30 scope: structure only — validates input, applies rate limit,
logs the lead, returns 200. Persistence wiring lands in Phase 31
together with the `leads` table migration and Resend transactional
email setup.
"""
from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field
from supabase import Client

from ...middleware import limiter
from ...logging_config import logger

router = APIRouter()


class WaitlistEntry(BaseModel):
    """Payload accepted by POST /public/waitlist."""

    email: EmailStr
    locale: str = Field(default="en", pattern=r"^(en|es)$")
    # Optional context — caller may include the scenarios the visitor
    # picked or the source page. Untyped JSON for now; Phase 31 will
    # formalise the shape together with the ROI calculator.
    context: dict | None = None
    # Honeypot
    website: str | None = None


@router.post("/waitlist")
@limiter.limit("5/minute")
async def submit_waitlist(request: Request, payload: WaitlistEntry):
    """Accept a waitlist signup.

    Rate-limited to 5 requests per minute per IP. Returns 200 on success.

    Persistence is deferred to Phase 31. For now we log the entry so
    submissions can be reconstructed from log search if needed during
    the migration window.
    """
    if payload.website:
        logger.warning(
            "[public.waitlist] honeypot tripped",
            extra={"email": payload.email, "website": payload.website[:40]},
        )
        return {"ok": True}

    # supabase = request.app.state.supabase  # wired in Phase 31
    _ = request.app.state.supabase  # touch state so we fail early if lifespan broke

    logger.info(
        "[public.waitlist] received",
        extra={
            "email": payload.email,
            "locale": payload.locale,
            "has_context": payload.context is not None,
        },
    )
    return {"ok": True, "persisted": False}
