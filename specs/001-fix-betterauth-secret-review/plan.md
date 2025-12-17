# Implementation Plan: Fix BetterAuth Session Persistence Failure (Null Session) by Enforcing Secret and Reviewing Context7 Guidelines

**Branch**: `001-fix-betterauth-secret-review` | **Date**: December 16, 2025 | **Spec**: specs/001-fix-betterauth-secret-review/spec.md
**Input**: Feature specification from `/specs/001-fix-betterauth-secret-review/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the steps to resolve the session validation failure (`Auth handler returned null`) in the BetterAuth Backend by focusing on the `BETTER_AUTH_SECRET` consistency and adherence to Context7 guidelines. The primary goal is to ensure persistent user sessions by explicitly logging the secret's length, enforcing proper configuration, and reviewing OAuth callback logic for social logins. The repeated session failure despite successful DB connection points to a session signature mismatch, which is a symptom of an environment variable issue (`BETTER_AUTH_SECRET`). We need to add debugging safeguards to confirm the secret is being read correctly and then proceed with code cleanup based on the `context7` instructions if the secret fix fails.

## Technical Context

**Language/Version**: Python 3.10+ (for `api/`), TypeScript 5.x (for `auth-service/`).
**Primary Dependencies**: FastAPI (Python), Express.js/Next.js (TypeScript, implied in `auth-service`), `pg` (Node.js client for PostgreSQL), Pydantic (Python). BetterAuth itself.
**Storage**: PostgreSQL (Neon) is used for session and user data.
**Testing**: Standard testing frameworks for Python (e.g., `pytest`) and TypeScript (e.g., `jest`/`mocha`).
**Target Platform**: Vercel serverless functions.
**Project Type**: Web application with a Docusaurus frontend and multiple backend services (`api/` and `auth-service/`).
**Performance Goals**: Session validation should not introduce noticeable delays in the authentication flow.
**Constraints**: Cross-domain deployment. Need to consider `BETTER_AUTH_SECRET` consistency across Vercel environments.
**Scale/Scope**: Impacts all authenticated users on the Vercel deployment, particularly concerning session validation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Secure API Access (Bearer Token)**:
*   **Method**: The plan directly addresses the failure of session validation, which is a prerequisite for secure API access via Bearer tokens. By ensuring the `BETTER_AUTH_SECRET` is consistent and session validation works, the foundation for secure token-based access is strengthened.
*   **Backend Enforcement**: The core problem is the *failure* of backend enforcement due to a potential misconfiguration of `BETTER_AUTH_SECRET`. This plan aims to diagnose and rectify that.
*   **Gate Result**: Pass. The current efforts are to ensure this principle functions correctly.

**Model Context Protocol (MCP)**:
*   **Tooling**: The plan includes a "Clarification Task" to "Use `sp.clarify` to review the contents of `context7-docs-integrator.md`". This directly utilizes the MCP principle by engaging in research through a specified tool for BetterAuth guidelines.
*   **Gate Result**: Pass. This principle will be actively utilized during the planning phase.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-betterauth-secret-review/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
└── auth-service/         # Node.js/TypeScript Next.js API backend
    └── src/
        └── auth.ts       # Target for secret logging and session handling review

```

**Structure Decision**: This plan primarily impacts the existing `auth-service/` directory, specifically `auth-service/src/auth.ts`. It also involves configuration aspects across Vercel environments that affect both backend services implicitly.

## Complexity Tracking

(No violations to justify at this stage)

## Proposed Troubleshooting Steps

This section details the specific actions to be taken to diagnose and resolve the session persistence issue. These steps will guide the implementation phase.

1.  **IMPLEMENT:** Add critical logging for `BETTER_AUTH_SECRET` length and DB status to `auth-service/src/auth.ts` (Already done, but will re-implement to ensure it's in the current codebase).
2.  **IMPLEMENT:** Modify `auth-service/api/auth.ts` to log the raw cookie value for debugging the session handler.
3.  **USER ACTION (Crucial):** User must reset and verify the `BETTER_AUTH_SECRET` value on the Vercel Dashboard for the BetterAuth Backend.
4.  **VERIFY:** User performs a test login and provides new logs with secret length and cookie value.
5.  **CLARIFY:** Use `sp.clarify` to review the `context7-docs-integrator.md` file (which is currently empty in the provided state) to search for documented constraints or requirements on the authentication service.
6.  **IMPACT ASSESSMENT:** Based on the new logs and `context7` review, perform a final analysis and implement a code fix (if needed).