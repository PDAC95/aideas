"""Client namespace — authenticated routes for the customer dashboard.

All routes in this package require a valid Supabase session (Bearer JWT).
The auth dependency is attached at the namespace-router level here so
every sub-router automatically inherits it without having to add
`Depends(get_current_user)` to each endpoint.

Mounting point in main.py:
    app.include_router(client_router, prefix="/api/v1/client", tags=["client"])

Resulting URLs:
    /api/v1/client/auth/status
    /api/v1/client/<future-endpoints>
"""
from fastapi import APIRouter, Depends

from ...dependencies import get_current_user
from . import auth

client_router = APIRouter(dependencies=[Depends(get_current_user)])
client_router.include_router(auth.router, prefix="/auth", tags=["client-auth"])

__all__ = ["client_router"]
