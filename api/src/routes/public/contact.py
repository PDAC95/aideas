"""POST /api/v1/public/contact — landing page contact form intake.

Accepts a contact submission from the landing site (no auth required),
validates input, applies rate limiting, and persists to Supabase.

Phase 30 scope: validation + rate limit + stub persistence.
Future phases will:
  - Wire reCAPTCHA v3 verification (env var: RECAPTCHA_SECRET_KEY)
  - Send an internal notification email via Resend (env var: RESEND_API_KEY)
  - Sync the lead into the admin/leads view (Phase 31)
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr, Field
from supabase import Client

from ...middleware import limiter
from ...logging_config import logger

router = APIRouter()


class ContactSubmission(BaseModel):
    """Payload accepted by POST /public/contact."""

    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: str | None = Field(default=None, max_length=160)
    message: str = Field(..., min_length=10, max_length=2000)
    # Honeypot — humans leave it empty; bots fill it. If non-empty, we
    # silently accept (return 200) but never persist. Prevents bots from
    # adapting to a clear rejection.
    website: str | None = None


@router.post("/contact")
@limiter.limit("3/minute")
async def submit_contact(request: Request, payload: ContactSubmission):
    """Persist a contact submission from the landing page.

    Rate-limited to 3 requests per minute per IP. Validation errors
    return 422 (FastAPI default for Pydantic). Returns 200 on success
    with a minimal acknowledgement (no echo of submitted data to prevent
    accidental information disclosure).
    """
    if payload.website:
        # Honeypot tripped — pretend we accepted to deny the bot signal.
        logger.warning(
            "[public.contact] honeypot tripped",
            extra={"email": payload.email, "website": payload.website[:40]},
        )
        return {"ok": True}

    supabase: Client = request.app.state.supabase

    try:
        # NOTE: the `contact_submissions` table is not yet created.
        # Phase 31 (Lead Capture) will add a migration. Until then this
        # branch raises and we degrade gracefully.
        supabase.table("contact_submissions").insert(
            {
                "name": payload.name,
                "email": payload.email,
                "company": payload.company,
                "message": payload.message,
                "source": "landing-contact-form",
            }
        ).execute()
    except Exception as e:
        # We don't want a missing table to break the form. Log loudly
        # and surface a generic success so the user isn't blocked.
        logger.error(
            "[public.contact] persistence failed (likely missing table) — degrading to no-op",
            extra={"error": str(e)[:200]},
        )
        # Intentionally NOT raising 5xx — the form must keep working
        # during the migration window. Phase 31 closes this gap.
        return {"ok": True, "persisted": False}

    logger.info("[public.contact] received", extra={"email": payload.email})
    return {"ok": True, "persisted": True}
