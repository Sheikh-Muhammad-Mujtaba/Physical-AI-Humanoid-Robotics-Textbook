import os
import logging
from qdrant_client import QdrantClient
from huggingface_hub import InferenceClient

logger = logging.getLogger(__name__)

class Config:
    DATABASE_URL: str
    BETTER_AUTH_ISSUER: str
    BETTER_AUTH_JWKS_URL: str
    GEMINI_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str
    HUGGINGFACE_API_KEY: str
    _qdrant_client: QdrantClient = None
    _inference_client: InferenceClient = None

    def __init__(self):
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.BETTER_AUTH_ISSUER = os.getenv("BETTER_AUTH_ISSUER")
        self.BETTER_AUTH_JWKS_URL = os.getenv("BETTER_AUTH_JWKS_URL")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.QDRANT_URL = os.getenv("QDRANT_URL")
        self.QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
        self.QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "textbook_chunks")
        self.HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
        self._validate()

    def _validate(self):
        errors = []
        if not self.DATABASE_URL:
            errors.append("Missing environment variable: DATABASE_URL")
        if not self.BETTER_AUTH_ISSUER:
            errors.append("Missing environment variable: BETTER_AUTH_ISSUER")
        if not self.BETTER_AUTH_JWKS_URL:
            errors.append("Missing environment variable: BETTER_AUTH_JWKS_URL")
        if not self.GEMINI_API_KEY:
            errors.append("Missing environment variable: GEMINI_API_KEY")
        if not self.QDRANT_URL:
            errors.append("Missing environment variable: QDRANT_URL")
        if not self.QDRANT_API_KEY:
            errors.append("Missing environment variable: QDRANT_API_KEY")
        if not self.HUGGINGFACE_API_KEY:
            errors.append("Missing environment variable: HUGGINGFACE_API_KEY")

        if errors:
            for error in errors:
                logger.error(error)
            raise EnvironmentError("Critical environment variables are missing. Please check your .env file or Vercel configuration.")

    def get_qdrant_client(self) -> QdrantClient:
        """Get or create Qdrant client (singleton pattern)."""
        if self._qdrant_client is None:
            try:
                self._qdrant_client = QdrantClient(
                    url=self.QDRANT_URL,
                    api_key=self.QDRANT_API_KEY,
                    prefer_grpc=False,
                    timeout=30
                )
                logger.info("Successfully initialized Qdrant client")
            except Exception as e:
                logger.error(f"Failed to initialize Qdrant client: {str(e)}")
                raise
        return self._qdrant_client

    def get_inference_client(self) -> InferenceClient:
        """Get or create Hugging Face Inference client (singleton pattern)."""
        if self._inference_client is None:
            try:
                self._inference_client = InferenceClient(api_key=self.HUGGINGFACE_API_KEY)
                logger.info("Successfully initialized Hugging Face Inference client")
            except Exception as e:
                logger.error(f"Failed to initialize Hugging Face Inference client: {str(e)}")
                raise
        return self._inference_client

config = Config()
