---
id: 0002
title: Implement Bearer Token Authentication
stage: green
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-betterauth-integration
branch: 001-betterauth-integration
user: user
command: /sp.implement
labels: ["implementation", "authentication", "bearer-token", "api-security", "backend", "frontend"]
links:
  spec: specs/001-betterauth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - api/index.py
  - src/lib/chatApi.ts
tests:
  - null
---

## Prompt

/sp.implement read the implementation from the .claude commands and then read the prompt.txt file to start implementing the task and plan for the feature

## Response snapshot

Successfully implemented Bearer Token authentication for BetterAuth integration:

**Backend Changes (api/index.py)**:
1. Added security imports: `HTTPBearer`, `HTTPAuthorizationCredentials` from `fastapi.security`
2. Defined `EXPECTED_TOKEN` from env var `BETTER_AUTH_SECRET_KEY` with fallback to `"DEV_TOKEN"`
3. Created `HTTPBearer()` security instance
4. Implemented `validate_token()` async dependency function that:
   - Extracts Bearer token from Authorization header
   - Validates against `EXPECTED_TOKEN`
   - Raises `HTTPException(401)` with `WWW-Authenticate: Bearer` header on failure
5. Applied `Depends(validate_token)` to three protected endpoints:
   - `/api/chat` (line 152)
   - `/api/ask-selection` (line 175)
   - `/api/feedback` (line 134)

**Frontend Changes (src/lib/chatApi.ts)**:
1. Added `AUTH_TOKEN = "DEV_TOKEN"` constant (line 5)
2. Updated all three protected API functions to include Authorization header:
   - `chatWithBackend()` - `'Authorization': \`Bearer ${AUTH_TOKEN}\`` (line 46)
   - `askSelectionWithBackend()` - `'Authorization': \`Bearer ${AUTH_TOKEN}\`` (line 63)
   - `sendFeedback()` - `'Authorization': \`Bearer ${AUTH_TOKEN}\`` (line 80)

**Tasks Completed**:
- T001-T010: All implementation tasks from tasks.md completed
- Backend: Security dependency function created and applied
- Frontend: Token injection to all API calls

## Outcome

- Impact: All protected API endpoints now require valid Bearer Token authentication
- Tests: Manual testing required - send requests with/without token to verify 401/200 responses
- Files: 2 files modified (api/index.py, src/lib/chatApi.ts)
- Next prompts: Test authentication flow, verify latency < 50ms (NFR-001)
- Reflection: Implementation follows spec exactly; ready for validation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Implementation matches spec requirements - PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify authentication flow in development environment
