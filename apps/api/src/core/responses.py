"""
Standard API response schemas.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    total_pages: int


class Meta(BaseModel):
    """Response metadata."""

    pagination: PaginationMeta | None = None


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response."""

    success: bool = True
    data: T
    meta: Meta | None = None


class ErrorDetail(BaseModel):
    """Error detail."""

    field: str | None = None
    message: str


class ErrorInfo(BaseModel):
    """Error information."""

    code: str
    message: str
    details: list[ErrorDetail] = []


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: ErrorInfo


def success_response(
    data: Any,
    pagination: PaginationMeta | None = None,
) -> dict[str, Any]:
    """Create a success response."""
    response = {"success": True, "data": data}
    if pagination:
        response["meta"] = {"pagination": pagination.model_dump()}
    return response


def error_response(
    code: str,
    message: str,
    details: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create an error response."""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        },
    }
