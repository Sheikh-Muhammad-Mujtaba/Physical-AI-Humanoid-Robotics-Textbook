import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from typing import Optional

# Load environment variables from .env file
load_dotenv()

class Config:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")

    # Lazy initialization for Qdrant client
    _qdrant_client: Optional[QdrantClient] = None

    @classmethod
    def get_qdrant_client(cls) -> QdrantClient:
        if cls._qdrant_client is None:
            if not cls.QDRANT_URL or not cls.QDRANT_API_KEY:
                raise ValueError("Qdrant URL and API Key must be set in environment variables")
            cls._qdrant_client = QdrantClient(
                url=cls.QDRANT_URL,
                api_key=cls.QDRANT_API_KEY,
            )
        return cls._qdrant_client

# Ensure config is loaded when imported
config = Config()