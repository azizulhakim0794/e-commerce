import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("request")
error_logger = logging.getLogger("error")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")[:512] or None
        status_code = 500
        log_fields = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "client_ip": client_ip,
            "user_agent": user_agent,
        }

        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception:
            error_logger.exception(
                "request failed",
                extra={**log_fields, "status_code": status_code},
            )
            raise
        finally:
            duration = time.perf_counter() - start_time
            logger.info(
                "request completed",
                extra={
                    **log_fields,
                    "status_code": status_code,
                    "duration_ms": round(duration * 1000, 2),
                },
            )
