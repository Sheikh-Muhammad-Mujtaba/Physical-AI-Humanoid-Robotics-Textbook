"""
JWT validation module for BetterAuth integration.
Validates JWT tokens from BetterAuth service using JWKS endpoint.
"""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.PyJWTError as e:
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    return user_id
