"""Admin namespace — routes restricted to platform_staff users.

All routes in this package require:
  1. A valid Supabase session (Bearer JWT) — same as the client namespace.
  2. The authenticated user_id to exist in the `platform_staff` table
     with role `super_admin` or `operator`.

The `get_platform_staff` dependency enforces (2) on top of (1). It is
attached at the namespace-router level here so every sub-router
automatically inherits both checks.

Mounting point in main.py:
    app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

Resulting URLs (when sub-routers are added):
    /api/v1/admin/<future-endpoints>

This namespace is intentionally empty in Phase 30. Admin endpoints
land here as they're needed (e.g. lead inbox, customer provisioning).
"""
from fastapi import APIRouter, Depends

from ...dependencies import get_platform_staff

admin_router = APIRouter(dependencies=[Depends(get_platform_staff)])

# Future sub-routers will be included here, e.g.:
# from . import leads
# admin_router.include_router(leads.router, prefix="/leads", tags=["admin-leads"])

__all__ = ["admin_router"]
