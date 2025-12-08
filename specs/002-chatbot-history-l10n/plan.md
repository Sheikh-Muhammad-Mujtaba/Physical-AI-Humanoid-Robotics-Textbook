# Implementation Plan: Chatbot with History (Neon Postgres) and Urdu Localization

**Branch**: `002-chatbot-history-l10n` | **Date**: 2025-12-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-chatbot-history-l10n/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the upgrade of the Docusaurus site and Python backend to support persistent chat history using Neon PostgreSQL and Urdu localization. This involves integrating new database capabilities into the backend, enhancing the frontend Chat UI for persistence, and configuring Docusaurus for internationalization and Right-to-Left (RTL) support.

## Technical Context

**Language/Version**: Python 3.10+ (for FastAPI backend), TypeScript (for frontend integration).
**Primary Dependencies**: `fastapi`, `uvicorn`, `qdrant-client`, `google-generativeai`, `pydantic`, `python-dotenv`, `sqlalchemy`, `psycopg2-binary` (for backend); React, Docusaurus (for frontend).
**Storage**: Qdrant (vector database), PostgreSQL (Neon) for chat history.
**Testing**: Unit tests for backend logic, integration tests for API endpoints, frontend component testing.
**Target Platform**: Backend: Vercel Serverless Functions. Frontend: Docusaurus (web).
**Project Type**: Web application (frontend) with a separate API backend.
**Performance Goals**: Chat history retrieval/persistence within 2 seconds. Feedback recording within 1 second.
**Constraints**: Serverless compatibility, stateless backend, lazy initialization for Qdrant, environment variable configuration for sensitive data.
**Scale/Scope**: Designed to serve chat history and localization for the textbook RAG chatbot.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Educational Clarity**: N/A for this feature.
- **Docusaurus-First Architecture**: Will configure Docusaurus i18n and integrate ChatBot into the layout.
- **Modular Content**: N/A for this feature.
- **Single Source of Truth**: N/A for this feature.
- **Asset Management**: N/A for this feature.
- **Serverless Compatibility**: Backend continues to be stateless and compatible with Vercel Serverless Functions.
- **Type Safety**: All backend data exchange will continue to use Pydantic models.
- **Modular Utilities**: Shared logic (database connection, SQL models) will be separated into `utils/`.
- **Secure Configuration**: `DATABASE_URL` and other sensitive configurations will be loaded from environment variables.
- **Frontend/Backend Separation**: Frontend will communicate solely via `/api` endpoints.

## Project Structure

### Documentation (this feature)

```text
specs/002-chatbot-history-l10n/
├── plan.md              # This file
├── research.md          # Not needed for Phase 1, but may be added later for advanced features
├── data-model.md        # To be generated
├── quickstart.md        # To be generated
└── contracts/           # To be generated
```

### Source Code (repository root)

```text
api/
├── index.py
├── utils/
│   ├── config.py
│   ├── models.py
│   ├── database.py   # New
│   ├── sql_models.py # New
│   ├── tools.py
│   └── helpers.py
└── requirements.txt

textbook/
├── src/
│   ├── components/
│   │   └── ChatBot.tsx
│   └── lib/
│       └── chatApi.ts
├── i18n/             # New
│   └── ur/           # New
│       └── docusaurus-plugin-content-docs/
│           └── current.json
└── vercel.json
```

**Structure Decision**: The project will maintain a clear separation between the `api/` (backend) and `textbook/` (frontend Docusaurus project).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |
```