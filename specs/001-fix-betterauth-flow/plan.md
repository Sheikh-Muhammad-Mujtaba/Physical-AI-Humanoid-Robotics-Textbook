# Implementation Plan: Fix BetterAuth Authentication Flow

**Branch**: `001-fix-betterauth-flow` | **Date**: 2025-12-16 | **Spec**: [specs/001-fix-betterauth-flow/spec.md](specs/001-fix-betterauth-flow/spec.md)
**Input**: Feature specification from `specs/001-fix-betterauth-flow/spec.md`

## Summary

The primary requirement is to fix the broken cross-domain authentication flow between the Docusaurus frontend and the BetterAuth serverless backend. The technical approach involves updating the backend to correctly handle cross-origin requests by enabling `crossDomain` and `allowedOrigins` settings, and configuring the frontend to send credentials with its API requests. The frontend will also be made more robust to prevent crashes on null authentication responses.

## Technical Context

**Language/Version**: TypeScript (Frontend/Backend)
**Primary Dependencies**: BetterAuth, Docusaurus, React
**Storage**: N/A (Session storage is handled by BetterAuth)
**Testing**: Manual E2E testing of the login flow
**Target Platform**: Vercel (Serverless Functions for backend, Static hosting for frontend)
**Project Type**: Web application (frontend + backend)
**Constraints**: The solution must work within the Vercel serverless environment and handle cross-origin requests between two different Vercel project domains.

## Constitution Check

*This check is based on the general principles of good software design, as no formal constitution file was provided for this specific check.*

- **Simplicity**: The proposed changes are configuration-based and localized to the authentication logic, avoiding large-scale refactoring. **[PASS]**
- **Clarity**: The plan directly addresses the specific errors (401 Unauthorized, frontend TypeError) identified in the problem description. **[PASS]**
- **Testability**: The success of the fix can be clearly verified by attempting a login and confirming the absence of errors. **[PASS]**

*All gates pass.*

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-betterauth-flow/
├── plan.md              # This file
├── research.md          # Research on file locations and config
├── data-model.md        # Confirms no data model changes
├── contracts/           # API interaction for /api/auth/token
│   └── auth-token-api.md
└── tasks.md             # To be created by /sp.tasks
```

### Source Code (repository root)

```text
auth-service/
├── src/
│   └── auth.ts      # Backend: Core BetterAuth configuration
└── api/
    └── auth.ts      # Backend: Vercel serverless function handler

src/
└── lib/
    └── auth-client.ts # Frontend: Client-side auth logic
```

**Structure Decision**: The project is a web application with a separate frontend (`src/`) and backend (`auth-service/`). The plan targets specific files within this existing structure to implement the fix.

## Complexity Tracking

No violations to report.
