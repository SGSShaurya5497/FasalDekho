"""
Structured JSON Logging Module.
Formats logs as JSON objects with timestamps, levels, user IDs, response times, and stack traces.
Logs to console and daily rotating file handler (logs/backend.log).
"""
import os
import logging
from logging.handlers import TimedRotatingFileHandler
from pythonjsonlogger import json as jsonlogger

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "backend.log")

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        if not log_record.get("timestamp"):
            log_record["timestamp"] = record.created
        if log_record.get("level"):
            log_record["level"] = log_record["level"].upper()
        else:
            log_record["level"] = record.levelname.upper()
        log_record["logger"] = record.name

def setup_logging():
    """Initializes root logger with JSON console and file handlers."""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    formatter = CustomJsonFormatter("%(timestamp)s %(level)s %(logger)s %(message)s")

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Daily Rotating File Handler
    file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=30)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

backend_logger = setup_logging()
