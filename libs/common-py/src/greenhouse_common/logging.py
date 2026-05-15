"""Structured logging shared by the Python services.

Uses structlog with JSON rendering so Python logs match the JSON format
emitted by the Go services' slog logger.
"""

import structlog


def get_logger(service: str) -> structlog.stdlib.BoundLogger:
    """Return a JSON structured logger tagged with the service name."""
    structlog.configure(
        processors=[
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ]
    )
    return structlog.get_logger().bind(service=service)
