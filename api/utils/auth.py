"""
Authentication module for BetterAuth integration.
Supports both JWT token validation and session-based authentication.
"""

import os
import logging
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import jwt
from jwt import PyJWKClient

logger = logging.getLogger(__name__)

# BetterAuth JWKS configuration
JWKS_URL = os.getenv("BETTER_AUTH_JWKS_URL", "http://localhost:3001/api/auth/jwks")
ISSUER = os.getenv("BETTER_AUTH_ISSUER", "http://localhost:3001")
AUDIENCE = os.getenv("API_AUDIENCE", "http://localhost:8000")

# Security scheme
security = HTTPBearer()

# JWKS client with caching (automatically refreshes on kid mismatch)
jwks_client = PyJWKClient(JWKS_URL)


async def validate_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validate JWT token against BetterAuth JWKS endpoint.

    Returns the decoded JWT payload containing user information.
    Raises HTTPException 401 if token is invalid or expired.
    """
    token = credentials.credentials
    try:
        # Get the signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and validate the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256", "ES256"],
            audience=AUDIENCE,
            issuer=ISSUER,
            options={"require": ["exp", "iat", "sub"]},
            leeway=30,  # 30 seconds clock skew tolerance
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.error(f"JWT validation failed: Token has expired. Token preview: {token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.InvalidAudienceError:
        logger.error(f"JWT validation failed: Invalid token audience. Expected: {AUDIENCE}, Token preview: {token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.InvalidIssuerError:
        logger.error(f"JWT validation failed: Invalid token issuer. Expected: {ISSUER}, Token preview: {token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.PyJWTError as e:
        logger.error(f"JWT validation failed: {e}. Token preview: {token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )


def get_current_user_id(payload: dict = Depends(validate_jwt)) -> str:
    """
    Extract user ID from validated JWT payload.

    The 'sub' claim contains the user ID from BetterAuth.
    """
    user_id = payload.get("sub")
    if not user_id:
        logger.error("JWT payload missing user identifier ('sub' claim).")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    return user_id


# ============================================================================
# SESSION-BASED AUTHENTICATION (RECOMMENDED FOR CHATBOT)
# ============================================================================

def get_user_id_from_header(request: Request) -> str:
    """
    Extract user ID from X-User-ID header.

    This is sent by the frontend after BetterAuth authentication.
    The frontend obtains the user ID from BetterAuth and includes it in all API requests.

    Args:
        request: FastAPI request object

    Returns:
        str: The authenticated user ID

    Raises:
        HTTPException 401 if user ID header is missing or invalid
    """
    user_id = request.headers.get("X-User-ID")

    if not user_id:
        logger.error("Authentication failed: X-User-ID header missing")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please sign in.",
        )

    # Basic validation - user_id should not be empty
    if not user_id.strip():
        logger.error("Authentication failed: X-User-ID header is empty")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID.",
        )

    logger.info(f"User authenticated: {user_id}")
    return user_id


def get_current_user_from_session(request: Request) -> str:
    """
    Dependency to get current user ID from authentication header.

    The frontend sends the user ID in the X-User-ID header after authenticating with BetterAuth.
    This avoids cross-domain session cookie issues.

    Use this in API endpoints:
        @app.post("/api/chat")
        async def chat(
            chat_request: ChatRequest,
            user_id: str = Depends(get_current_user_from_session),
            db: Session = Depends(get_db)
        ):
            # user_id is now available
    """
    return get_user_id_from_header(request)
