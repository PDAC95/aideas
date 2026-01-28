"""
Custom exception classes for the API.
"""

from typing import Any


class APIException(Exception):
    """Base API exception."""

    def __init__(
        self,
        message: str,
        code: str = "API_ERROR",
        status_code: int = 500,
        details: list[dict[str, Any]] | None = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []
        super().__init__(message)


class NotFoundException(APIException):
    """Resource not found exception."""

    def __init__(
        self,
        message: str = "Resource not found",
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details=details,
        )


class ValidationException(APIException):
    """Validation error exception."""

    def __init__(
        self,
        message: str = "Validation failed",
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            details=details,
        )


class UnauthorizedException(APIException):
    """Unauthorized access exception."""

    def __init__(
        self,
        message: str = "Unauthorized",
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=401,
            details=details,
        )


class ForbiddenException(APIException):
    """Forbidden access exception."""

    def __init__(
        self,
        message: str = "Forbidden",
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=403,
            details=details,
        )


class ConflictException(APIException):
    """Resource conflict exception."""

    def __init__(
        self,
        message: str = "Resource conflict",
        details: list[dict[str, Any]] | None = None,
    ):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=409,
            details=details,
        )
