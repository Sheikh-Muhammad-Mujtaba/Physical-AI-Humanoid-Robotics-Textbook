# Implementation Plan: API Authentication with BetterAuth

**Branch**: `001-betterauth-integration` | **Date**: 2025-12-14 | **Spec**: [specs/001-betterauth-integration/spec.md](specs/001-betterauth-integration/spec.md)
**Input**: Feature specification from `/specs/001-betterauth-integration/spec.md`

## Summary

Implement a complete authentication system using **BetterAuth as a separate Node.js service** that issues JWT tokens, with the **FastAPI backend validating tokens via JWKS**, and the **React frontend using the BetterAuth client SDK**.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  React/Docusaurus│     │  BetterAuth Node.js │     │  FastAPI Backend │
│    Frontend      │────▶│    Auth Service     │     │   /api/*        │
│                  │     │  /api/auth/*        │     │                 │
└────────┬─────────┘     └──────────┬──────────┘     └────────┬────────┘
         │                          │                          │
         │  1. Sign in/up           │                          │
         │─────────────────────────▶│                          │
         │                          │                          │
         │  2. JWT Token returned   │                          │
         │◀─────────────────────────│                          │
         │                          │                          │
         │  3. API call with Bearer │                          │
         │  Authorization header    │                          │
         │─────────────────────────────────────────────────────▶
         │                          │                          │
         │                          │  4. Validate JWT via JWKS│
         │                          │◀─────────────────────────│
         │                          │                          │
         │  5. Response             │                          │
         │◀─────────────────────────────────────────────────────│
```

## Technical Context

| Aspect | Details |
|--------|---------|
| **Auth Service** | Node.js 18+ with BetterAuth |
| **Backend API** | Python 3.11+ with FastAPI |
| **Frontend** | React/Docusaurus with BetterAuth React client |
| **Token Type** | JWT with EdDSA (Ed25519) asymmetric signing |
| **Validation** | JWKS endpoint (`/api/auth/jwks`) |
| **Database** | **Shared Neon PostgreSQL** (same `DATABASE_URL` as existing app) |
| **Performance** | Token validation < 50ms (offline JWKS verification) |

## Database Architecture

### Shared Neon PostgreSQL

All services use the **same Neon PostgreSQL database** via `DATABASE_URL`:

```
┌─────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                          │
├─────────────────────────────────────────────────────────────┤
│  BetterAuth Tables (auto-created):                          │
│  ├── user          (id, email, name, password_hash, ...)    │
│  ├── session       (id, user_id, expires_at, ...)           │
│  ├── account       (id, user_id, provider, ...)             │
│  └── verification  (id, identifier, token, ...)             │
│                                                             │
│  Existing App Tables (updated):                             │
│  ├── chat_history  (message_id, session_id, USER_ID, ...)   │
│  └── feedback      (feedback_id, message_id, rating, ...)   │
└─────────────────────────────────────────────────────────────┘
```

### Chat History User Linkage

The `chat_history` table will be updated to link messages to authenticated users:

```sql
-- Add user_id column to chat_history (NOT NULL - authentication required)
ALTER TABLE chat_history
ADD COLUMN user_id UUID NOT NULL REFERENCES "user"(id);

-- Create index for faster user history queries
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
```

**Updated Schema** (`ChatHistory` model):
```python
class ChatHistory(Base):
    __tablename__ = "chat_history"

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)  # REQUIRED
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sender = Column(String, nullable=False)
    text = Column(Text, nullable=False)
```

**Note**: `user_id` is **required** - all API access requires authentication. Anonymous users are not supported.

## Component Details

### 1. BetterAuth Node.js Service

**Location**: `auth-service/` (new directory)

**Configuration** (`auth-service/src/auth.ts`):
```typescript
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

// Use the same DATABASE_URL as FastAPI backend (Neon PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Neon
});

export const auth = betterAuth({
  database: pool,  // Shared Neon PostgreSQL
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),  // Enable Bearer token authentication
    jwt({      // Enable JWT + JWKS endpoints
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519"
        }
      },
      jwt: {
        expirationTime: "15m",  // Short-lived access tokens
        issuer: process.env.BETTER_AUTH_URL,
        audience: process.env.API_BASE_URL,
      }
    }),
  ],
});
```

**Endpoints exposed**:
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/token` - Get JWT access token
- `GET /api/auth/jwks` - Public keys for JWT verification

### 2. FastAPI Backend JWT Validation

**New dependency** (`api/requirements.txt`):
```
PyJWT>=2.8.0
cryptography>=41.0.0
```

**JWT Validation Middleware** (`api/utils/auth.py`):
```python
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

JWKS_URL = os.getenv("BETTER_AUTH_JWKS_URL", "http://localhost:3001/api/auth/jwks")
ISSUER = os.getenv("BETTER_AUTH_ISSUER", "http://localhost:3001")
AUDIENCE = os.getenv("API_AUDIENCE", "http://localhost:8000")

security = HTTPBearer()
jwks_client = PyJWKClient(JWKS_URL)

async def validate_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Validate JWT token against BetterAuth JWKS endpoint."""
    token = credentials.credentials
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256"],
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
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
```

### 3. React Frontend Integration

**New dependency** (`package.json`):
```json
{
  "dependencies": {
    "better-auth": "^1.0.0"
  }
}
```

**Auth Client** (`src/lib/auth-client.ts`):
```typescript
import { createAuthClient } from "better-auth/react";
import { bearerClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  plugins: [
    bearerClient(),
    jwtClient(),
  ],
  fetchOptions: {
    onSuccess: (ctx) => {
      // Store JWT token when received
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("auth_token", authToken);
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

**Updated API Client** (`src/lib/chatApi.ts`):
```typescript
const API_BASE_URL = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function chatWithBackend(query: string, sessionId: string): Promise<any> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw await handleResponseError(response, 'Failed to get chat response');
  }

  return response.json();
}
```

## Environment Variables

### Shared Database (Neon PostgreSQL)
Both BetterAuth service and FastAPI use the **same `DATABASE_URL`**:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

### BetterAuth Service (`.env`)
```env
DATABASE_URL=<same-neon-connection-string>
BETTER_AUTH_SECRET=<random-32+-char-string>
BETTER_AUTH_URL=http://localhost:3001
API_BASE_URL=http://localhost:8000
```

### FastAPI Backend (`.env`)
```env
DATABASE_URL=<same-neon-connection-string>
BETTER_AUTH_JWKS_URL=http://localhost:3001/api/auth/jwks
BETTER_AUTH_ISSUER=http://localhost:3001
API_AUDIENCE=http://localhost:8000
```

### Frontend (`.env`)
```env
REACT_APP_BETTER_AUTH_URL=http://localhost:3001
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Project Structure (Updated)

```text
project-root/
├── api/                        # FastAPI backend (existing)
│   ├── index.py               # Main app, protected endpoints
│   ├── utils/
│   │   ├── auth.py            # NEW: JWT validation
│   │   └── ...
│   └── requirements.txt       # Add PyJWT, cryptography
│
├── auth-service/              # NEW: BetterAuth Node service
│   ├── package.json
│   ├── src/
│   │   ├── auth.ts            # BetterAuth configuration
│   │   └── index.ts           # Express/Hono server
│   └── .env
│
├── src/                       # React frontend (existing)
│   ├── lib/
│   │   ├── auth-client.ts     # NEW: BetterAuth client
│   │   └── chatApi.ts         # UPDATED: Use JWT tokens
│   ├── pages/
│   │   ├── login.tsx          # NEW: Login page
│   │   └── register.tsx       # NEW: Registration page
│   └── components/
│       └── AuthProvider.tsx   # NEW: Auth context provider
│
└── docker-compose.yml         # Optional: orchestrate services
```

## Implementation Phases

### Phase 1: Setup BetterAuth Node Service
1. Create `auth-service/` directory
2. Initialize Node.js project with TypeScript
3. Install BetterAuth: `npm install better-auth`
4. Configure database (SQLite for dev, PostgreSQL for prod)
5. Set up auth configuration with JWT + Bearer plugins
6. Create Express/Hono server to mount auth handlers
7. Run migrations: `npx @better-auth/cli migrate`
8. Test endpoints: sign-up, sign-in, token, jwks

### Phase 2: Update FastAPI Backend
1. Add PyJWT and cryptography to requirements.txt
2. Create `api/utils/auth.py` with JWKS-based validation
3. Update protected endpoints to use `Depends(validate_jwt)`
4. Add environment variables for JWKS URL, issuer, audience
5. Test with curl/httpie using tokens from BetterAuth

### Phase 3: Update React Frontend
1. Install BetterAuth client: `npm install better-auth`
2. Create `src/lib/auth-client.ts`
3. Create login/register pages
4. Create AuthProvider component
5. Update `chatApi.ts` to use JWT tokens from localStorage
6. Add 401 handling with redirect to login
7. Test complete flow: register → login → use chat

### Phase 4: Production Readiness
1. Configure CORS properly between services
2. Set up HTTPS for all services
3. Configure secure cookie settings
4. Set up token refresh mechanism
5. Add rate limiting
6. Create deployment documentation

## Security Considerations

- **Short-lived tokens**: 15-minute expiration for access tokens
- **Asymmetric signing**: EdDSA (Ed25519) - FastAPI only has public key
- **JWKS caching**: PyJWKClient caches keys, refreshes on `kid` mismatch
- **Key rotation**: BetterAuth supports automatic key rotation with grace period
- **Token storage**: localStorage (acceptable for SPAs; consider HttpOnly cookies for stricter requirements)

## Acceptance Criteria

- [ ] Users can register via `/api/auth/sign-up/email`
- [ ] Users can login via `/api/auth/sign-in/email`
- [ ] JWT tokens are issued with proper claims (sub, exp, iat, iss, aud)
- [ ] JWKS endpoint returns public keys at `/api/auth/jwks`
- [ ] FastAPI validates tokens offline using JWKS
- [ ] Protected endpoints return 401 without valid token
- [ ] Protected endpoints work with valid token
- [ ] Frontend handles 401 by redirecting to login
- [ ] Token validation adds < 50ms latency

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Two backends increase complexity | Use Docker Compose for local dev; clear separation of concerns |
| JWKS endpoint availability | Cache JWKS keys; graceful degradation |
| Clock skew between services | 30-second leeway in token validation |
| Token storage in localStorage | XSS vulnerability - sanitize inputs; consider HttpOnly cookies |

---

## Phase 2: Implementation & Testing

Details for Phase 2 will be generated by the `/sp.tasks` command after this plan is approved.
