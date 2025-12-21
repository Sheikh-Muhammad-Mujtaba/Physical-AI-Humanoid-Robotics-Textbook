# Implementation Plan: Fix Auth and L10n

**Branch**: `001-fix-auth-and-l10n` | **Date**: 2025-12-21 | **Spec**: [specs/001-fix-auth-and-l10n/spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-auth-and-l10n/spec.md`

## Summary

Address unreliability in BetterAuth session-based login and signup, fix social OAuth login/signup, and complete Urdu localization. This involves aligning the authentication implementation strictly with the latest BetterAuth documentation, using Context7 MCP and BetterAuth MCP for reference, and utilizing Gemini AI for high-quality Urdu translations within Docusaurus i18n.

## Technical Context

**Language/Version**: Python 3.10+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, React, Docusaurus, Tailwind CSS, BetterAuth, Gemini SDK, Qdrant client
**Storage**: PostgreSQL (for user data), Qdrant (for vectors)
**Testing**: npm test && npm run lint (Frontend), pytest (Backend)
**Target Platform**: Vercel
**Project Type**: Web application (Frontend & Backend)
**Performance Goals**: NEEDS CLARIFICATION (not explicitly defined in spec, will target standard web application responsiveness for authentication flows and localization loading times).
**Constraints**:
- Align implementation strictly with the latest BetterAuth documentation.
- Use Gemini AI for high-quality Urdu translations.
- No UI redesign unless required for auth correctness.
- No custom auth logic outside BetterAuth unless explicitly required by docs.
**Scale/Scope**: Existing Docusaurus application with authentication and localization requiring fixes and completeness.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Secure API Access (Bearer Token)
- **Principle 1.1 (Method)**: All requests from the chatbot frontend to protected backend endpoints (`/api/chat`, `/api/ask-selection`, `/api/feedback`) MUST include an `Authorization: Bearer <TOKEN>` header.
  - **Compliance**: The authentication fix must ensure that the generated sessions and tokens (if any are still used internally by BetterAuth) adhere to this principle for protected endpoints. The fix should specifically focus on how the frontend obtains and uses this token.
- **Principle 1.2 (Backend Enforcement)**: The FastAPI server (`api/index.py`) MUST implement a dependency injection (`fastapi.security.HTTPBearer`) to validate the token against an environment variable (`BETTER_AUTH_SECRET_KEY`). Invalid or missing tokens must return a 401 Unauthorized response.
  - **Compliance**: The backend authentication logic, especially related to session validation and any token exchange, must strictly follow this enforcement mechanism. The fix will need to ensure `api/index.py` correctly handles `BETTER_AUTH_SECRET_KEY` and token validation.

### Model Context Protocol (MCP)
- **Principle 2.1 (Tooling)**: Use Context7 MCP to get updated BetterAuth `https://www.better-auth.com/` documentation for the implementation.
  - **Compliance**: The planning and implementation phases will actively leverage Context7 MCP and BetterAuth MCP as specified in the feature goals to ensure alignment with the latest BetterAuth docs. This will be a key part of the research phase (Phase 0).

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-auth-and-l10n/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/ (or api/ - using existing `api/` folder for backend)
├── api/
│   ├── index.py
│   └── utils/
│       ├── auth.py # Expected to be modified for BetterAuth integration
│       └── ...
└── tests/ # (assuming tests exist or will be added for backend)

frontend/ (Docusaurus/React related files)
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/ # Likely affected by auth and i18n
│   ├── lib/
│   ├── plugins/
│   └── theme/
├── i18n/ # Affected by localization
│   ├── en/
│   └── ur/ # Affected by localization
└── tests/ # (assuming tests exist or will be added for frontend)
```

**Structure Decision**: The project uses a hybrid structure with a dedicated `api/` directory for the Python backend and Docusaurus/React files in the root and `src/` for the frontend. We will continue to use this existing structure. The `auth.py` in `api/utils/` will be a key area for backend auth changes, and `i18n/ur/` for localization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |