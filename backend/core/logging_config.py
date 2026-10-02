import logging
import json
import os
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler

BASE_LOG_DIR = "logs"


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, timezone.utc)
            .isoformat(timespec="milliseconds")
            .replace("+00:00", "Z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in (
            "request_id",
            "method",
            "path",
            "status_code",
            "client_ip",
            "user_agent",
            "duration_ms",
        ):
            value = getattr(record, field, None)
            if value is not None:
                log_entry[field] = value

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False, default=str)


def _configure_logger(name: str, level: int, filename: str) -> None:
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False

    if any(getattr(handler, "_ecommerce_logging_handler", False) for handler in logger.handlers):
        return

    handler = RotatingFileHandler(
        filename,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    handler.setFormatter(JsonLogFormatter())
    handler._ecommerce_logging_handler = True
    logger.addHandler(handler)


def setup_logging() -> None:

    os.makedirs(f"{BASE_LOG_DIR}/requests", exist_ok=True)
    os.makedirs(f"{BASE_LOG_DIR}/errors", exist_ok=True)
    os.makedirs(f"{BASE_LOG_DIR}/auth", exist_ok=True)
    os.makedirs(f"{BASE_LOG_DIR}/application", exist_ok=True)

    _configure_logger("request", logging.INFO, "logs/requests/requests.log")
    _configure_logger("error", logging.ERROR, "logs/errors/errors.log")
