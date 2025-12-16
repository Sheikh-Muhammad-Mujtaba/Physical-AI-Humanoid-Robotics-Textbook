# Implementation Plan: Fix BetterAuth Session Persistence Failure (401/Null Session) on Vercel

**Branch**: `001-fix-betterauth-session` | **Date**: December 16, 2025 | **Spec**: specs/001-fix-betterauth-session/spec.md
**Input**: Feature specification from `/specs/001-fix-betterauth-session/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the steps to resolve the persistent 401 Unauthorized errors and null session failures occurring after successful sign-in in the BetterAuth integration on Vercel. The primary goal is to ensure reliable session storage and retrieval, enabling persistent, authenticated access for users. The plan will focus on enhancing logging, validating configurations, and ensuring consistency of security secrets across environments to diagnose and fix the root causes related to database connectivity and secret mismatches.

## Technical Context

**Language/Version**: Python 3.10+ (for `api/`), TypeScript 5.x (for `auth-service/`).
**Primary Dependencies**: FastAPI (Python), Express.js/Next.js (TypeScript, implied in `auth-service`), `pg` (Node.js client for PostgreSQL), Pydantic (Python).
**Storage**: PostgreSQL (Neon) is used for session and user data.
**Testing**: Standard testing frameworks for Python (e.g., `pytest`) and TypeScript (e.g., `jest`/`mocha`).
**Target Platform**: Vercel serverless functions.
**Project Type**: Web application with a Docusaurus frontend and multiple backend services (`api/` and `auth-service/`).
**Performance Goals**: Session establishment and retrieval should be near real-time, not introducing noticeable delays for users.
**Constraints**: Cross-domain deployment. Session cookie handling must comply with `Secure; SameSite=None; Partitioned`.
**Scale/Scope**: Impacts all authenticated users on the Vercel deployment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Secure API Access (Bearer Token)**:
*   **Method**: The system is designed to use Bearer tokens for secure API access, with internal token requests observed to return 401 Unauthorized errors. The plan aims to fix the underlying validation and persistence issues related to these tokens, aligning with the principle.
*   **Backend Enforcement**: The system has backend enforcement for JWT validation, but it is failing due to potential misconfiguration of `BETTER_AUTH_SECRET` and environment variables. The plan addresses these issues.
*   **Gate Result**: Pass. The current efforts are to ensure this principle functions correctly.

**Model Context Protocol (MCP)**:
*   **Tooling**: The plan will incorporate research into BetterAuth documentation using Context7 MCP to ensure the implementation aligns with best practices and updated information.
*   **Gate Result**: Pass. This principle will be actively utilized during the planning and implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-betterauth-session/
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
├── api/                  # Python FastAPI backend
│   └── utils/
│       └── auth.py       # Target for Secret/JWKS Consistency Check
└── auth-service/         # Node.js/TypeScript Next.js API backend
    ├── api/
    │   └── auth.ts       # Target for JWT Generation Logging enhancements
    └── src/
        └── auth.ts       # Target for DB Connection Validation, Configuration Validation, Structure Validation

frontend/ (Root)
├── src/
│   └── ... (Docusaurus/React components - implicitly affected by auth fix, no direct code changes planned)
```

**Structure Decision**: The project already uses a multi-backend structure. This plan will involve modifications within the existing `api/` (Python) and `auth-service/` (TypeScript) directories, impacting `api/utils/auth.py`, `auth-service/api/auth.ts`, and `auth-service/src/auth.ts`.

## Complexity Tracking

(No violations to justify at this stage)