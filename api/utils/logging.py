import logging
import os

def setup_logging():
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler()
        ]
    )
    logging.getLogger(__name__).info(f"Logging initialized with level: {log_level}")

# Example usage (can be called at application startup)
if __name__ == "__main__":
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.debug("Debug message from logging.py")
    logger.info("Info message from logging.py")
    logger.warning("Warning message from logging.py")
    logger.error("Error message from logging.py")
