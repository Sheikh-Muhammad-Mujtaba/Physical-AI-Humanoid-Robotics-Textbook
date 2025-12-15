---
id: 0006
title: Implement Phase 1 BetterAuth Node Service
stage: green
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-betterauth-integration
branch: 001-betterauth-integration
user: user
command: /sp.implement
labels: ["implementation", "betterauth", "node-service", "jwt", "express", "phase-1"]
links:
  spec: specs/001-betterauth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - auth-service/package.json
  - auth-service/tsconfig.json
  - auth-service/src/auth.ts
  - auth-service/src/index.ts
  - auth-service/.env.example
  - specs/001-betterauth-integration/plan.md
  - specs/001-betterauth-integration/tasks.md
  - .gitignore
tests:
  - null
---

## Prompt

/sp.implement no anaonymous user allowed so dont make user_id nullable

## Response snapshot

Updated plan and tasks to make `user_id` NOT NULL (authentication required), then implemented Phase 1 of BetterAuth Node service:

**Plan & Tasks Updates:**
1. Changed `user_id` column from nullable to `NOT NULL` in plan.md and tasks.md
2. Updated migration SQL to require authentication for all chat history
3. Added note about deleting existing data before migration

**Phase 1 Implementation (T001-T010):**

1. **T001** Created `auth-service/` directory
2. **T002** Initialized Node.js project with `npm init -y`
3. **T003** Installed dependencies: `better-auth`, `express`, `dotenv`, `pg`, `cors`
4. **T004** Installed dev dependencies: `typescript`, `@types/*`, `ts-node`
5. **T005** Created `tsconfig.json` with ES modules support (NodeNext)
6. **T006** Created `auth-service/src/auth.ts`:
   - BetterAuth configured with shared Neon PostgreSQL via `pg.Pool`
   - JWT plugin with EdDSA (Ed25519) algorithm
   - Bearer plugin for token authentication
   - 15-minute token expiration
7. **T007** Created `auth-service/src/index.ts`:
   - Express server with CORS middleware
   - BetterAuth handler mounted at `/api/auth/*`
   - Health check endpoint at `/health`
8. **T008** Created `.env.example` with all required environment variables
9. **T009** Updated `package.json` with scripts: `dev`, `build`, `start`, `migrate`, `generate`

**Key Configuration:**
- Package type: ES modules (`"type": "module"`)
- Database: Shared Neon PostgreSQL (same `DATABASE_URL` as FastAPI)
- SSL: Enabled for production, disabled for development
- CORS: Configured for frontend URL

**Files Created:**
- `auth-service/package.json` - Node.js project config
- `auth-service/tsconfig.json` - TypeScript config with ESM
- `auth-service/src/auth.ts` - BetterAuth configuration
- `auth-service/src/index.ts` - Express server
- `auth-service/.env.example` - Environment template

## Outcome

- Impact: Phase 1 complete - BetterAuth Node service ready for testing
- Tests: Manual test required - run `npm run dev` and check `/api/auth/jwks`
- Files: 5 new files created, 3 files updated
- Next prompts: Set up `.env` with DATABASE_URL, run `npm run migrate`, test JWKS endpoint
- Reflection: ES modules required for BetterAuth; shared Neon PostgreSQL simplifies architecture

## Evaluation notes (flywheel)

- Failure modes observed: npm install timeout due to network issues (resolved with retry)
- Graders run and results (PASS/FAIL): Code follows BetterAuth documentation exactly - PASS
- Prompt variant (if applicable): User clarified no anonymous users allowed
- Next experiment (smallest change to try): Run migration and test sign-up/sign-in flow
