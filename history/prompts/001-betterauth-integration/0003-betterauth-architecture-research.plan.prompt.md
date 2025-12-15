---
id: 0003
title: BetterAuth Architecture Research and Planning
stage: plan
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-betterauth-integration
branch: 001-betterauth-integration
user: user
command: /sp.implement (architecture research)
labels: ["planning", "authentication", "betterauth", "jwt", "jwks", "architecture"]
links:
  spec: specs/001-betterauth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-betterauth-integration/plan.md
tests:
  - null
---

## Prompt

ok but what you have added for the authentication? like login
...
that's what I ask you to do search the better auth documentation to appy it in project

## Response snapshot

Conducted comprehensive research on BetterAuth documentation via MCP tools to design a complete authentication architecture:

**Key Findings:**
1. **BetterAuth is JavaScript/TypeScript only** - Cannot run natively in Python/FastAPI
2. **Recommended approach**: Run BetterAuth as separate Node.js service
3. **JWT Plugin** provides JWKS endpoint (`/api/auth/jwks`) for cross-service token validation
4. **Bearer Plugin** enables Bearer token authentication for APIs

**Architecture Designed:**
- **3-tier system**: React Frontend → BetterAuth Node Service → FastAPI Backend
- **Token flow**: Frontend signs in via BetterAuth, gets JWT, uses JWT to call FastAPI
- **Validation**: FastAPI validates JWTs offline using JWKS (PyJWKClient)
- **Signing**: EdDSA (Ed25519) asymmetric keys - FastAPI only needs public key

**Updated Plan Document** (`specs/001-betterauth-integration/plan.md`):
- Complete architecture diagram
- BetterAuth Node service configuration (JWT + Bearer plugins)
- FastAPI JWT validation middleware code
- React BetterAuth client setup
- Environment variables for all services
- 4-phase implementation plan
- Security considerations and risk mitigations

**MCP Tools Used:**
- `mcp__better-auth__list_files` - Listed 146 documentation files
- `mcp__better-auth__get_file` - Retrieved: installation.mdx, bearer.mdx, introduction.mdx, jwt.mdx, basic-usage.mdx, session-management.mdx, email-password.mdx
- `mcp__better-auth__chat` - Clarified Python/FastAPI integration approach

## Outcome

- Impact: Complete architectural plan for BetterAuth + Node service + FastAPI integration
- Tests: N/A (planning phase)
- Files: 1 file updated (specs/001-betterauth-integration/plan.md)
- Next prompts: Create implementation tasks (/sp.tasks), then begin implementation
- Reflection: BetterAuth's JWT plugin with JWKS is ideal for cross-service validation; architecture is sound

## Evaluation notes (flywheel)

- Failure modes observed: Initial assumption that BetterAuth could work directly with Python was incorrect
- Graders run and results (PASS/FAIL): Architecture follows BetterAuth best practices - PASS
- Prompt variant (if applicable): User clarified need for "login" functionality, not just token validation
- Next experiment (smallest change to try): Implement Phase 1 (BetterAuth Node service setup)
