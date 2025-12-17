# Tasks: Fix BetterAuth Secret and Context7 Review

**Branch**: `001-fix-betterauth-secret-review` | **Date**: December 16, 2025 | **Spec**: specs/001-fix-betterauth-secret-review/spec.md
**Plan**: specs/001-fix-betterauth-secret-review/plan.md

## Summary

This document outlines the tasks required to diagnose and resolve the session validation failure (`Auth handler returned null`) in the BetterAuth Backend. The focus is on verifying the `BETTER_AUTH_SECRET` consistency and reviewing BetterAuth setup guidelines from Context7.

## Dependencies

Tasks in Phase 2 are prerequisites for Phase 3. Task T003 is a crucial user action required before verification can proceed.

## Parallel Execution Opportunities

Tasks T001 and T002 can be implemented in parallel as they modify different files within the `auth-service`.

## Implementation Strategy

The strategy is iterative debugging. First, implement enhanced logging to gather critical information about the `BETTER_AUTH_SECRET` and session cookies. Then, the user will perform a key action (resetting the secret) and verification. A clarification step will then be used to review external documentation, followed by a final impact assessment and potential code fixes.

---

## Phase 2: Foundational (Cross-cutting Concerns - Debugging & Verification)

- [X] T001 [P] [US1] Add critical logging for `BETTER_AUTH_SECRET` length to `auth-service/src/auth.ts` to verify its presence and consistency.
- [X] T002 [P] [US1] Modify `auth-service/api/auth.ts` to log the raw cookie value (decoded, if possible, for debugging) received by the session handler.

## Phase 3: User Story 1 - Resolve Null Session After Login (P1)

**Goal**: As a user, I want my authenticated session to be correctly recognized after a successful login, so that I can maintain persistent access to the application without my session being reported as null.

**Independent Test**: Perform a user login. Verify that the session is not reported as null by the authentication handler in the logs.

- [X] T003 [US1] **USER ACTION (Crucial):** The user MUST reset and verify the `BETTER_AUTH_SECRET` value on the Vercel Dashboard for the BetterAuth Backend to ensure no hidden/extra characters.
- [X] T004 [US1] **VERIFY:** The user performs a test login and provides new logs containing the secret length and cookie value for analysis.
- [X] T005 [US1] **CLARIFY:** Use `sp.clarify` to review the contents of `context7-docs-integrator.md` (or search Context7 for BetterAuth setup instructions) to identify any specific BetterAuth setup instructions (like middleware dependencies or custom database schemas) that might be missing or misconfigured in the service architecture. (Research completed, findings in research.md)
- [X] T006 [US1] **IMPACT ASSESSMENT:** Based on the new logs and `context7` review, perform a final analysis and implement a code fix (if needed) for `auth-service/src/auth.ts` or `auth-service/api/auth.ts`. (Pending user logs for final analysis and potential code fix)
