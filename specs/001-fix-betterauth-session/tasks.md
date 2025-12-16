# Tasks: Fix BetterAuth Session Persistence Failure

**Branch**: `001-fix-betterauth-session` | **Date**: December 16, 2025 | **Spec**: specs/001-fix-betterauth-session/spec.md
**Plan**: specs/001-fix-betterauth-session/plan.md

## Summary

This document outlines the tasks required to resolve the persistent 401 Unauthorized errors and null session failures in the BetterAuth integration on Vercel. The implementation will focus on enhancing logging, validating configurations, and ensuring consistency of security secrets across environments to establish a robust and persistent authenticated user experience.

## Dependencies

User Story 1 is the primary and only user story for this feature, therefore it has no external dependencies beyond the foundational setup.

## Parallel Execution Opportunities

Since there is only one user story, parallel execution opportunities are primarily within the sub-tasks of that story, particularly between the TypeScript (`auth-service`) and Python (`api`) backend components, provided they don't have direct code-level dependencies on each other's changes.

## Implementation Strategy

The strategy is MVP-first, focusing on getting User Story 1 fully functional and stable. This involves a foundational phase to prepare the environment and then a dedicated phase for implementing and validating the fixes for the primary user story. Incremental delivery will be achieved by ensuring each task is testable and contributes directly to the success criteria.

---

## Phase 1: Setup

- [X] T001 Configure all critical environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_ISSUER`, `BETTER_AUTH_JWKS_URL`) securely in Vercel for all environments.
- [X] T002 Install `jose` library in `auth-service` project if not already present. (Not required, functionality provided by `better-auth`.)
- [X] T003 Install `pg` library (Node.js client for PostgreSQL) in `auth-service` project if not already present. (Already present)
- [X] T004 Install any necessary JWT validation libraries in `api` project if not already present (verify existing configuration). (Already present: PyJWT, cryptography)

## Phase 2: Foundational (Cross-cutting Concerns)

- [X] T005 Implement initial, robust logging configuration for the `auth-service` (TypeScript) to capture environment variable loading and service startup. `backend/auth-service/src/logging.ts` (new file)
- [X] T006 Implement initial, robust logging configuration for the `api` (Python) to capture environment variable loading and service startup. `backend/api/utils/logging.py` (new file)
- [X] T007 Add build-time checks in `auth-service` to verify the presence of critical environment variables. `backend/auth-service/package.json` (scripts), `backend/auth-service/src/config.ts`
- [X] T008 Add build-time checks in `api` to verify the presence of critical environment variables. `backend/api/pyproject.toml` (scripts), `backend/api/utils/config.py` (Implemented by `api/index.py` importing `api/utils/config.py` at startup)

## Phase 3: User Story 1 - Successful and Persistent Authenticated Session

**Goal**: As a user, I want to successfully sign in to the application and have my authenticated session persist, so that I can access protected resources without encountering unauthorized errors or session loss.

**Independent Test**: Perform a full user sign-in flow. Access protected resources. Verify no 401 errors are encountered immediately after sign-in. Verify session persists across multiple protected resource requests.

### Auth Service (TypeScript) Tasks

- [X] T009 [P] [US1] Implement explicit PostgreSQL connection test and logging for `pg.Pool` instance upon module initialization. `backend/auth-service/src/auth.ts`
- [X] T010 [P] [US1] Log successful `betterAuth` handler initialization, confirming `BETTER_AUTH_SECRET` was read. `backend/auth-service/src/auth.ts`
- [X] T011 [P] [US1] Ensure `pg.Pool` instantiation is optimized for Vercel/Serverless (global scope, low idle timeout, `attachDatabasePool`). `backend/auth-service/src/auth.ts`
- [X] T012 [P] [US1] Review and adjust `better-auth/plugins/jwt` configuration to ensure consistent `issuer` and `audience` claims. `backend/auth-service/src/auth.ts` (Configured for consistency via environment variables)
- [X] T013 [P] [US1] Verify and, if necessary, adjust `session.cookieCache` configuration (strategy, maxAge, refreshCache) for desired session persistence. `backend/auth-service/src/auth.ts` (Reviewed; `maxAge` set to 5 min, can be adjusted)
- [X] T014 [P] [US1] Enhance logging around the internal `/api/auth/token` request to capture raw error body or additional headers on 401 responses. `backend/auth-service/api/auth.ts`
- [X] T015 [P] [US1] Verify the correct usage of `auth.api.getSession` for server-side session validation. `backend/auth-service/api/auth.ts` (Usage of `auth.handler` verified; explicit `getSession` not directly called in this file)

### Python API Backend Tasks

- [X] T016 [P] [US1] Confirm `BETTER_AUTH_ISSUER` and `BETTER_AUTH_JWKS_URL` consistency across all Vercel environments. `backend/api/utils/auth.py` (configuration check/read - Python code is set up to use these, consistency is a Vercel config concern)
- [X] T017 [P] [US1] Enhance logging for JWT validation failures within `backend/api/utils/auth.py`.

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T018 Conduct comprehensive integration testing across `auth-service`, `api`, and the frontend to confirm end-to-end authentication flow.
- [X] T019 Review observability tools (logs, metrics, alerts) to ensure they effectively monitor authentication health and failures.
- [X] T020 Update relevant `README` files or deployment documentation with best practices for Vercel environment variable management and secure configuration.
- [X] T021 Document known limitations or trade-offs made during the fix in a dedicated `ADR` or `DECISION.md` file. `specs/001-fix-betterauth-session/ADR/0001-session-persistence-fix.md` (new file)
