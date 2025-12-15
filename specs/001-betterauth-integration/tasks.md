# Implementation Tasks: API Authentication with BetterAuth

**Feature**: 001-betterauth-integration
**Branch**: `001-betterauth-integration`
**Date**: 2025-12-14
**Status**: Ready for Implementation
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Architecture Overview

This implementation uses a **3-tier architecture**:
- **React Frontend** → **BetterAuth Node.js Service** → **FastAPI Backend**
- BetterAuth handles user registration/login and issues JWTs
- FastAPI validates JWTs offline via JWKS (no direct calls to auth service)
- **Shared Neon PostgreSQL** database for auth tables AND chat history
- **No anonymous users** - all API access requires authentication
- Chat history linked to authenticated users via `user_id` column (NOT NULL)

## Task Summary

| Phase | Description | Task Count | Status |
| ----- | ----------- | ---------- | ------ |
| Phase 1 | BetterAuth Node Service Setup | 10 | ✅ Complete |
| Phase 2 | FastAPI JWT Validation + User Linkage | 9 | ✅ Complete |
| Phase 3 | React Frontend Integration | 9 | ✅ Complete |
| Phase 4 | Production Readiness | 6 | ✅ Complete |
| **Total** | | **34** | **✅ Complete** |

## Dependencies

```
Phase 1 (BetterAuth Node Service)
    ↓
Phase 2 (FastAPI JWT Validation)  ←─ Can start after Phase 1 T001-T006
    ↓
Phase 3 (React Frontend)          ←─ Can start after Phase 1 complete
    ↓
Phase 4 (Production Readiness)    ←─ Requires all phases functional
```

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 delivers complete authentication flow

---

## Phase 1: BetterAuth Node.js Service Setup

**Goal**: Create a standalone Node.js authentication service using BetterAuth with JWT + Bearer plugins
**Status**: ✅ Complete
**Location**: `auth-service/`

### Project Initialization

- [x] T001 Create `auth-service/` directory at project root
- [x] T002 Initialize Node.js project: `cd auth-service && npm init -y`
- [x] T003 Install dependencies: `npm install better-auth express dotenv pg`
- [x] T004 Install dev dependencies: `npm install -D typescript @types/node @types/express ts-node`
- [x] T005 Create `tsconfig.json` with ES2020 + NodeNext module resolution

### BetterAuth Configuration

- [x] T006 Create `auth-service/src/auth.ts` with BetterAuth configuration using **shared Neon PostgreSQL**:
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
      bearer(),
      jwt({
        jwks: {
          keyPairConfig: {
            alg: "EdDSA",
            crv: "Ed25519"
          }
        },
        jwt: {
          expirationTime: "15m",
          issuer: process.env.BETTER_AUTH_URL,
          audience: process.env.API_BASE_URL,
        }
      }),
    ],
  });
  ```

- [x] T007 Create `auth-service/src/index.ts` Express server:
  ```typescript
  import express from "express";
  import { auth } from "./auth";
  import dotenv from "dotenv";

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.json());

  // Mount BetterAuth handlers
  app.all("/api/auth/*", async (req, res) => {
    const response = await auth.handler(req);
    // Handle response appropriately
  });

  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
  ```

- [x] T008 Create `auth-service/.env` with required environment variables:
  ```env
  DATABASE_URL=<same-neon-connection-string-as-fastapi>
  BETTER_AUTH_SECRET=<generate-32-char-random-string>
  BETTER_AUTH_URL=http://localhost:3001
  API_BASE_URL=http://localhost:8000
  PORT=3001
  ```

- [x] T009 Add `auth-service/package.json` scripts:
  ```json
  {
    "scripts": {
      "dev": "ts-node src/index.ts",
      "build": "tsc",
      "start": "node dist/index.js",
      "migrate": "npx @better-auth/cli migrate"
    }
  }
  ```

- [x] T010 Run database migration: `cd auth-service && npm run migrate`

**Checkpoint**: BetterAuth service starts on port 3001, `/api/auth/jwks` returns public keys

### Phase 1 Verification Tests

```bash
# Start auth service
cd auth-service && npm run dev

# Test JWKS endpoint
curl http://localhost:3001/api/auth/jwks
# Expected: {"keys": [...]}

# Test sign-up
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expected: 200 with user data

# Test sign-in
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expected: 200 with session and token
```

---

## Phase 2: FastAPI JWT Validation + User Linkage

**Goal**: Update FastAPI backend to validate JWTs from BetterAuth using JWKS AND link chat history to authenticated users
**Status**: ✅ Complete
**Location**: `api/`

### Dependencies

- [x] T011 Add JWT dependencies to `api/requirements.txt`:
  ```
  PyJWT>=2.8.0
  cryptography>=41.0.0
  ```

- [x] T012 Install new dependencies: `pip install -r api/requirements.txt`

### Database Schema Update (User Linkage)

- [x] T013 Update `api/utils/sql_models.py` to add `user_id` column to `ChatHistory`:
  ```python
  class ChatHistory(Base):
      __tablename__ = "chat_history"

      message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
      session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
      user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # REQUIRED: Link to BetterAuth user
      timestamp = Column(DateTime(timezone=True), server_default=func.now())
      sender = Column(String, nullable=False)
      text = Column(Text, nullable=False)
  ```

- [x] T014 Run database migration to add `user_id` column (NOT NULL - auth required):
  ```sql
  -- Run via Neon console or migration script
  -- NOTE: If existing data exists, you'll need to either:
  -- 1. Delete existing chat_history data, OR
  -- 2. Add column as nullable first, backfill, then alter to NOT NULL
  ALTER TABLE chat_history ADD COLUMN user_id UUID NOT NULL;
  CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
  ```

### JWT Validation Module

- [x] T015 Create `api/utils/auth.py` with JWKS-based JWT validation:
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
              leeway=30,
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

  def get_current_user_id(payload: dict = Depends(validate_jwt)) -> str:
      """Extract user ID from validated JWT payload."""
      return payload.get("sub")
  ```

### Update Protected Endpoints

- [x] T016 Update `api/index.py` imports:
  ```python
  # Replace old security imports with:
  from utils.auth import validate_jwt, get_current_user_id
  ```

- [x] T017 Update protected endpoints in `api/index.py` to use `validate_jwt` AND save `user_id`:
  ```python
  @app.post("/api/chat", response_model=ChatResponse)
  async def chat(request: ChatRequest, db: Session = Depends(get_db), payload: dict = Depends(validate_jwt)):
      user_id = payload.get("sub")  # Extract user_id from JWT

      user_message = ChatHistory(
          session_id=request.session_id,
          user_id=user_id,  # NEW: Link to authenticated user
          sender="user",
          text=request.query
      )
      # ... rest of endpoint
  ```
  - Update `/api/chat`, `/api/ask-selection`, `/api/feedback` endpoints similarly

- [x] T018 Add new endpoint to get user's chat history across all sessions:
  ```python
  @app.get("/api/user/history", response_model=List[HistoryMessage])
  async def get_user_history(db: Session = Depends(get_db), payload: dict = Depends(validate_jwt)):
      user_id = payload.get("sub")
      history = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.timestamp.desc()).limit(100).all()
      return history
  ```

- [x] T019 Add environment variables to `api/.env` or project root `.env`:
  ```env
  BETTER_AUTH_JWKS_URL=http://localhost:3001/api/auth/jwks
  BETTER_AUTH_ISSUER=http://localhost:3001
  API_AUDIENCE=http://localhost:8000
  ```

**Checkpoint**: FastAPI validates JWTs from BetterAuth, links chat history to user_id, returns 401 for invalid/expired tokens

### Phase 2 Verification Tests

```bash
# Get a token from BetterAuth (after sign-in)
TOKEN="<jwt-from-sign-in-response>"

# Test protected endpoint with valid token
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "test", "session_id": "123e4567-e89b-12d3-a456-426614174000"}'
# Expected: 200 with response

# Test without token
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "session_id": "123e4567-e89b-12d3-a456-426614174000"}'
# Expected: 401 Unauthorized

# Test with invalid token
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"query": "test", "session_id": "123e4567-e89b-12d3-a456-426614174000"}'
# Expected: 401 Unauthorized
```

---

## Phase 3: React Frontend Integration

**Goal**: Integrate BetterAuth client SDK for user authentication and token management
**Status**: ✅ Complete
**Location**: `src/`

### Dependencies

- [x] T020 Install BetterAuth client: `npm install better-auth`

### Auth Client Setup

- [x] T021 Create `src/lib/auth-client.ts`:
  ```typescript
  import { createAuthClient } from "better-auth/react";
  import { bearerClient } from "better-auth/client/plugins";
  import { jwtClient } from "better-auth/client/plugins";

  const BETTER_AUTH_URL = process.env.REACT_APP_BETTER_AUTH_URL || "http://localhost:3001";

  export const authClient = createAuthClient({
    baseURL: BETTER_AUTH_URL,
    plugins: [
      bearerClient(),
      jwtClient(),
    ],
    fetchOptions: {
      onSuccess: (ctx) => {
        const authToken = ctx.response.headers.get("set-auth-token");
        if (authToken) {
          localStorage.setItem("auth_token", authToken);
        }
      },
    },
  });

  export const { signIn, signUp, signOut, useSession } = authClient;

  export function getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  export function clearAuthToken(): void {
    localStorage.removeItem("auth_token");
  }
  ```

### Update API Client

- [x] T022 Update `src/lib/chatApi.ts` to use dynamic tokens:
  ```typescript
  import { getAuthToken, clearAuthToken } from './auth-client';

  // Remove: const AUTH_TOKEN = "DEV_TOKEN";

  // Update fetch calls to:
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Add 401 handling:
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
    throw new Error("Session expired");
  }
  ```

### Auth UI Components

- [x] T023 Create `src/components/AuthProvider.tsx`:
  ```typescript
  import React, { createContext, useContext, ReactNode } from 'react';
  import { useSession } from '../lib/auth-client';

  interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending } = useSession();

    return (
      <AuthContext.Provider value={{
        user: session?.user ?? null,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
  }
  ```

- [x] T024 Create `src/pages/login.tsx`:
  ```typescript
  import React, { useState } from 'react';
  import { signIn } from '../lib/auth-client';
  import { useHistory } from '@docusaurus/router';

  export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const result = await signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else {
        history.push('/');
      }
    };

    return (
      <div className="login-container">
        <h1>Sign In</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
    );
  }
  ```

- [x] T025 Create `src/pages/register.tsx`:
  ```typescript
  import React, { useState } from 'react';
  import { signUp } from '../lib/auth-client';
  import { useHistory } from '@docusaurus/router';

  export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const result = await signUp.email({ email, password, name });

      if (result.error) {
        setError(result.error.message);
      } else {
        history.push('/login');
      }
    };

    return (
      <div className="register-container">
        <h1>Create Account</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Create Account</button>
        </form>
        <p>Already have an account? <a href="/login">Sign In</a></p>
      </div>
    );
  }
  ```

- [x] T026 Add environment variables to frontend (via docusaurus.config.ts customFields):
  ```env
  REACT_APP_BETTER_AUTH_URL=http://localhost:3001
  REACT_APP_API_BASE_URL=http://localhost:8000
  ```

### Protected Route Wrapper

- [x] T027 Create `src/components/ProtectedRoute.tsx`:
  ```typescript
  import React from 'react';
  import { useAuth } from './AuthProvider';
  import { Redirect } from '@docusaurus/router';

  export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }

    return <>{children}</>;
  }
  ```

- [x] T028 Update main App or layout to include AuthProvider wrapper (updated `src/theme/Root.tsx`)

**Checkpoint**: Users can register, login, and access protected features with JWT authentication

### Phase 3 Verification Tests

```
1. Navigate to /register
2. Create account with email/password
3. Navigate to /login
4. Sign in with credentials
5. Access chatbot feature
6. Verify API calls include Authorization header
7. Sign out and verify redirect to login
```

---

## Phase 4: Production Readiness

**Goal**: Ensure the authentication system is secure, performant, and production-ready
**Status**: ✅ Complete

### CORS Configuration

- [x] T029 Update `auth-service/src/index.ts` CORS configuration:
  ```typescript
  import cors from "cors";

  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  ```

- [x] T030 Update `api/index.py` CORS to restrict origins in production:
  ```python
  origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

  app.add_middleware(
      CORSMiddleware,
      allow_origins=origins,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### Security Hardening

- [x] T031 Add rate limiting to auth endpoints (auth-service):
  ```typescript
  import rateLimit from "express-rate-limit";

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: "Too many authentication attempts",
  });

  app.use("/api/auth/sign-in", authLimiter);
  app.use("/api/auth/sign-up", authLimiter);
  ```

- [x] T032 Configure secure cookie settings for production in `auth-service/src/auth.ts`:
  ```typescript
  export const auth = betterAuth({
    // ... existing config
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
    },
  });
  ```

### Deployment Configuration

- [ ] T033 Create `docker-compose.yml` for local development (OPTIONAL - not required for MVP):
  ```yaml
  version: '3.8'
  services:
    auth-service:
      build: ./auth-service
      ports:
        - "3001:3001"
      environment:
        - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
        - BETTER_AUTH_URL=http://auth-service:3001
        - API_BASE_URL=http://api:8000
      depends_on:
        - postgres

    api:
      build: ./api
      ports:
        - "8000:8000"
      environment:
        - BETTER_AUTH_JWKS_URL=http://auth-service:3001/api/auth/jwks
        - BETTER_AUTH_ISSUER=http://auth-service:3001

    postgres:
      image: postgres:15
      environment:
        - POSTGRES_DB=auth_db
        - POSTGRES_USER=auth_user
        - POSTGRES_PASSWORD=${DB_PASSWORD}
      volumes:
        - postgres_data:/var/lib/postgresql/data

  volumes:
    postgres_data:
  ```

- [ ] T034 Create deployment documentation in `docs/deployment.md` (OPTIONAL - not required for MVP):
  - Environment variable reference
  - Production checklist (HTTPS, secure cookies, CORS origins)
  - Service startup order
  - Health check endpoints
  - Troubleshooting guide

**Checkpoint**: All services configured for secure production deployment

---

## Parallel Execution Opportunities

### Within Phase 1
- T001-T005 must run sequentially (project setup)
- T006-T009 can run after T005 completes

### Phase 1 + Phase 2 Overlap
- T011-T013 (FastAPI JWT module) can start after T006 (BetterAuth config)
- T014-T016 require T001-T010 to be complete

### Phase 1 + Phase 3 Overlap
- T017-T019 (frontend dependencies and auth client) can start after T006
- T020-T025 (UI components) require T018 (auth-client.ts) complete

### Within Phase 4
- T026-T027 (CORS) can run in parallel
- T028-T029 (security) can run in parallel
- T030-T031 can run after T026-T029

---

## Validation Checklist

### Phase 1 - BetterAuth Service
- [x] `auth-service/` directory exists with proper structure
- [x] `npm run dev` starts service on port 3001
- [x] `/api/auth/jwks` returns valid JWKS JSON
- [x] User can sign up via `/api/auth/sign-up/email`
- [x] User can sign in via `/api/auth/sign-in/email`
- [x] JWT token is returned on successful sign-in

### Phase 2 - FastAPI JWT Validation + User Linkage
- [x] `api/utils/auth.py` exists with `validate_jwt` function
- [x] `PyJWT` and `cryptography` installed
- [x] `chat_history` table has `user_id` column
- [x] Chat messages are saved with `user_id` from JWT
- [x] `/api/user/history` endpoint returns user's history across all sessions
- [x] Protected endpoints return 401 without valid token
- [x] Protected endpoints return 200 with valid JWT
- [x] Expired tokens are properly rejected

### Phase 3 - React Frontend
- [x] `src/lib/auth-client.ts` exports `signIn`, `signUp`, `signOut`
- [x] Login page functions correctly
- [x] Registration page functions correctly
- [x] Token is stored in localStorage after sign-in
- [x] API calls include Authorization header
- [x] 401 responses redirect to login

### Phase 4 - Production Readiness
- [x] CORS configured for specific origins
- [x] Rate limiting on auth endpoints
- [x] Secure cookies in production mode
- [ ] Docker Compose file works for local dev (OPTIONAL)
- [ ] Deployment documentation complete (OPTIONAL)

---

## File Reference

| Component | File | Phase |
| --------- | ---- | ----- |
| BetterAuth Config | `auth-service/src/auth.ts` | 1 |
| Auth Express Server | `auth-service/src/index.ts` | 1 |
| Auth Service Env | `auth-service/.env` | 1 |
| SQL Models (user_id) | `api/utils/sql_models.py` | 2 |
| FastAPI JWT Validation | `api/utils/auth.py` | 2 |
| Backend API | `api/index.py` | 2 |
| Backend Dependencies | `api/requirements.txt` | 2 |
| Auth Client | `src/lib/auth-client.ts` | 3 |
| API Client | `src/lib/chatApi.ts` | 3 |
| Auth Provider | `src/components/AuthProvider.tsx` | 3 |
| Login Page | `src/pages/login.tsx` | 3 |
| Register Page | `src/pages/register.tsx` | 3 |
| Protected Route | `src/components/ProtectedRoute.tsx` | 3 |
| Docker Compose | `docker-compose.yml` | 4 |
| Deployment Docs | `docs/deployment.md` | 4 |

---

## Notes

- **Shared Database**: Both BetterAuth and FastAPI use the same Neon PostgreSQL via `DATABASE_URL`
- **User Linkage**: Chat history is linked to authenticated users via `user_id` column (NOT NULL - auth required)
- **No Anonymous Users**: All API endpoints require authentication; `user_id` is mandatory
- **Token Expiration**: Access tokens expire in 15 minutes; implement token refresh for better UX
- **JWKS Caching**: PyJWKClient caches keys automatically; refreshes on `kid` mismatch
- **Security**: Never commit `.env` files; use secrets management in production
- **DEV_TOKEN Cleanup**: Remove old DEV_TOKEN implementation from `api/index.py` and `src/lib/chatApi.ts` after Phase 2-3 complete
- **Migration**: Run `ALTER TABLE chat_history ADD COLUMN user_id UUID NOT NULL;` on Neon before Phase 2 (delete existing data first if needed)
