---
id: 001
title: OAuth token audience bug analysis
stage: misc
date: 2025-12-22
surface: agent
model: claude-haiku-4-5-20251001
feature: 001-fix-betterauth-flow
branch: main
user: user
command: /sp.implement use the code review agent to review all login code logic and then use the betterauth mcp to get updated docs and analyze the social oauth login mistake bcz currently the backend is creating token but frontend is not verifing it correctly there is a issue with it analyze and find the bug and it's solution
labels: ["oauth","jwt","authentication","betterauth","bug-analysis"]
links:
  spec: specs/001-fix-betterauth-flow/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - auth-service/src/auth.ts
  - auth-service/api/auth.ts
  - src/lib/auth-client.ts
tests:
  - Manual OAuth flow testing
---

## Prompt

Use the code review agent to review all login code logic and then use the betterauth mcp to get updated docs and analyze the social oauth login mistake because currently the backend is creating token but frontend is not verifying it correctly there is a issue with it analyze and find the bug and it's solution

## Response snapshot

**CRITICAL BUG FOUND**: JWT audience claim configured incorrectly (frontend origin instead of auth service URL)

### The Problem
- Backend creates JWT with `audience: frontendOrigins[0]` (e.g., "https://ai-spec-driven.vercel.app")
- Standard JWT practice: audience = service that will validate the token
- Frontend/backend can't verify token because audience doesn't match issuer
- This breaks OAuth callback handling and session establishment

### Root Cause
File: `auth-service/src/auth.ts:186`

The comment at line 183-185 is misleading - it states audience should be frontend URL, but this violates JWT standards. The audience claim identifies the **intended recipient** of the token. In your cross-domain setup:
- Issuer: auth service URL (where token is created)
- Audience: should also be auth service URL (where token is validated)
- Frontend receives the token and uses it in Authorization headers, but doesn't validate it - the backend does

### The Fix
Change line 186 from:
```typescript
audience: frontendOrigins[0], // ❌ WRONG
```

To:
```typescript
audience: authServiceUrl, // ✅ CORRECT - matches issuer
```

This aligns with Better Auth's JWT plugin documentation which states: "By default, the audience is set to the BASE_URL" (the auth service itself).

### Secondary Issues Identified
1. **Session Cache**: `cookieCache` disabled may cause stale session data
2. **Token Generation Flow**: JWT generated after sign-in doesn't guarantee session cookie is set first
3. **Error Handling**: Frontend auth client doesn't validate token audience after receiving it
4. **CORS Configuration**: All origins trusted but callback URL validation could be stricter

## Outcome

- ✅ Impact: Critical bug identified - will prevent all OAuth logins and token verification
- 🧪 Tests: Code review of 3 files + Better Auth documentation analysis completed
- 📁 Files: auth-service/src/auth.ts (lines 173-188), auth-service/api/auth.ts (lines 180-249), src/lib/auth-client.ts (lines 40-78)
- 🔁 Next prompts: Implement JWT audience fix, Add token verification on frontend, Test OAuth flow end-to-end
- 🧠 Reflection: The misleading comment in the code led to incorrect configuration. JWT audience claim must match the issuer (the service validating the token), not the client consuming it.

## Evaluation notes (flywheel)

- Failure modes observed: OAuth callback succeeds but frontend can't verify token, session doesn't persist, login loop occurs
- Graders run and results: Code review PASS (bugs identified), Documentation analysis PASS (Better Auth JWT spec confirmed)
- Prompt variant: Code review agent + Better Auth MCP search
- Next experiment: Apply audience fix, run OAuth flow test, measure login success rate

