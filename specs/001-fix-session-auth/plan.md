# Implementation Plan: Chatbot Session-Based Authentication

**Branch**: `001-fix-session-auth` | **Date**: 2025-12-18 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/001-fix-session-auth/spec.md`

## Summary

This plan outlines the technical implementation for fixing the chatbot authentication issue by transitioning from JWT Bearer Tokens to session-based authentication using BetterAuth cookies. It also includes the necessary database migration to add a `user_id` to the `ChatHistory` table to support user-specific chat history.

## Technical Context

**Language/Version**: Python 3.10+, TypeScript 5.x
**Primary Dependencies**: FastAPI, React, Docusaurus, SQLAlchemy, BetterAuth
**Storage**: PostgreSQL (for user data and chat history), Qdrant (for vector search)
**Testing**: `npm test && npm run lint`
**Target Platform**: Vercel
**Project Type**: Web application (frontend + backend)
**Performance Goals**: N/A
**Constraints**: The solution must integrate with the existing BetterAuth session management.
**Scale/Scope**: The solution should support the existing user base and scale with future growth.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Secure API Access (Bearer Token)**: **VIOLATION**. This plan explicitly moves *away* from Bearer Token authentication in favor of session-based cookies for the chatbot API. This is a justified violation, as outlined in the Complexity Tracking section below.
- **Model Context Protocol (MCP)**: **PASS**. The MCP principle is acknowledged.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-session-auth/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: The project already follows a frontend/backend structure. This plan will modify files within the existing `api` (backend) and `src` (frontend) directories.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Secure API Access (Bearer Token) | The Bearer Token approach is the root cause of the authentication bug, due to the difficulty of managing token expiration on the frontend. Session-based auth is a more robust and reliable solution for a same-origin web application. | The simpler alternative (Bearer Tokens) is the one being replaced. Sticking with it would mean implementing a complex token refresh and expiration checking mechanism on the frontend, which is more complex and error-prone than using the browser's native cookie handling for sessions. |