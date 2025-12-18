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

async def validate_session(request: Request, db: Session) -> dict:
    """
    Validate BetterAuth session from cookie.

    This is the RECOMMENDED authentication method for chatbot endpoints.
    Uses session cookies instead of JWT tokens for simpler, more reliable auth.

    Args:
        request: FastAPI request object (to read cookies)
        db: Database session (to query BetterAuth session table)

    Returns:
        dict with user_id and session_id

    Raises:
        HTTPException 401 if session is invalid or expired
    """
    from sql_models import BetterAuthSession

    # Get session token from cookie
    # BetterAuth stores session token in "better-auth.session_token" cookie
    session_token = request.cookies.get("better-auth.session_token")

    if not session_token:
        logger.error("Session validation failed: No session token in cookies")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please sign in.",
        )

    # Query BetterAuth session table
    try:
        session = db.query(BetterAuthSession).filter(
            BetterAuthSession.token == session_token
        ).first()
    except Exception as e:
        logger.error(f"Database error while validating session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error",
        )

    if not session:
        logger.error(f"Session validation failed: Session not found for token: {session_token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please sign in again.",
        )

    # Check if session is expired
    now = datetime.now(timezone.utc)

    # Make expiresAt timezone-aware if it isn't already
    expires_at = session.expiresAt
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        logger.error(f"Session validation failed: Session expired at {expires_at}, current time: {now}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    logger.info(f"Session validated successfully for user: {session.userId}")

    return {
        "user_id": session.userId,
        "session_id": session.id,
    }


async def get_current_user_from_session(
    request: Request,
    db: Session = Depends(get_db)
) -> str:
    """
    Dependency to get current user ID from session cookie.

    Use this in chatbot endpoints instead of get_current_user_id.

    Example:
        @app.post("/api/chat")
        async def chat(
            user_id: str = Depends(get_current_user_from_session),
        ):
            # user_id is now available
    """
    session_data = await validate_session(request, db)
    return session_data["user_id"]
