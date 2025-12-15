<!--
SYNC IMPACT REPORT
==================
Version Change: none -> 1.0.0
Added Principles:
- Secure API Access (Bearer Token)
- Model Context Protocol (MCP)
Templates Requiring Updates:
- ⚠ .specify/templates/plan-template.md (Needs constitution check section updated for security)
- ⚠ .specify/templates/spec-template.md (Needs to prompt for security requirements)
- ⚠ .specify/templates/tasks-template.md (Needs to include security-related task types)
Follow-up TODOs:
- RATIFICATION_DATE: Set initial adoption date
-->
# AI-Spec-Driven Constitution

## Core Principles

### Secure API Access (Bearer Token)
1.  **Method**: All requests from the chatbot frontend to protected backend endpoints (`/api/chat`, `/api/ask-selection`, `/api/feedback`) MUST include an `Authorization: Bearer <TOKEN>` header.
2.  **Backend Enforcement**: The FastAPI server (`api/index.py`) MUST implement a dependency injection (`fastapi.security.HTTPBearer`) to validate the token against an environment variable (`BETTER_AUTH_SECRET_KEY`). Invalid or missing tokens must return a 401 Unauthorized response.

### Model Context Protocol (MCP)
1.  **Tooling**: use context7 mcp to get updated betterauth `https://www.better-auth.com/` documentaion for the implementation

## Governance
This constitution is the supreme source of truth for project standards. All development, reviews, and artifacts must comply with its principles.

Amendments require a formal proposal, review, and an update to the version number. All pull requests must verify compliance with the constitution.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set initial adoption date | **Last Amended**: 2025-12-13