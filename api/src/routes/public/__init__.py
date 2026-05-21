"""Public namespace — unauthenticated routes for the landing site.

These endpoints are reachable WITHOUT a Supabase session. They are the
only routes the landing module (https://aideas.ca) calls. Each endpoint
must apply its own rate limiting and input validation — there is no
auth dependency to lean on.

Mounting point in main.py:
    app.include_router(public_router, prefix="/api/v1/public", tags=["public"])

Resulting URLs:
    /api/v1/public/contact     (landing contact form)
    /api/v1/public/waitlist    (landing email capture)
"""
from fastapi import APIRouter

from . import contact, waitlist

public_router = APIRouter()
public_router.include_router(contact.router, tags=["public-contact"])
public_router.include_router(waitlist.router, tags=["public-waitlist"])

__all__ = ["public_router"]
