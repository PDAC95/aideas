import logging
import sys
from loguru import logger


class InterceptHandler(logging.Handler):
    """Routes stdlib logging records through loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        # Get corresponding loguru level
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where logged message originated
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging(log_level: str = "INFO") -> None:
    """Configure loguru with stdlib intercept for Railway-compatible structured logging."""
    # Remove default loguru handler
    logger.remove()

    # Add stdout handler — colorize=False for Railway log aggregation
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {message}",
        level=log_level,
        colorize=False,
    )

    # Install InterceptHandler on stdlib root logger
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Explicitly intercept uvicorn and fastapi loggers
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        lib_logger = logging.getLogger(name)
        lib_logger.handlers = [InterceptHandler()]
        lib_logger.propagate = False


__all__ = ["logger", "setup_logging", "InterceptHandler"]
