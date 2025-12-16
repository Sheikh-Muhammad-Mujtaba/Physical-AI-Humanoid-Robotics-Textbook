import os
import logging

logger = logging.getLogger(__name__)

class Config:
    DATABASE_URL: str
    BETTER_AUTH_ISSUER: str
    BETTER_AUTH_JWKS_URL: str

    def __init__(self):
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.BETTER_AUTH_ISSUER = os.getenv("BETTER_AUTH_ISSUER")
        self.BETTER_AUTH_JWKS_URL = os.getenv("BETTER_AUTH_JWKS_URL")
        self._validate()

    def _validate(self):
        errors = []
        if not self.DATABASE_URL:
            errors.append("Missing environment variable: DATABASE_URL")
        if not self.BETTER_AUTH_ISSUER:
            errors.append("Missing environment variable: BETTER_AUTH_ISSUER")
        if not self.BETTER_AUTH_JWKS_URL:
            errors.append("Missing environment variable: BETTER_AUTH_JWKS_URL")

        if errors:
            for error in errors:
                logger.error(error)
            raise EnvironmentError("Critical environment variables are missing. Please check your .env file or Vercel configuration.")

config = Config()
