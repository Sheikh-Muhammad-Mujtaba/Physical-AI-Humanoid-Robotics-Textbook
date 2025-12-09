# Implementation Plan: Chatbot with History (Neon Postgres) and Urdu Localization

**Branch**: `002-chatbot-history-l10n` | **Date**: 2025-12-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-chatbot-history-l10n/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the upgrade of the Docusaurus site and Python backend to support persistent chat history using Neon PostgreSQL and Urdu localization. This involves integrating new database capabilities into the backend, enhancing the frontend Chat UI for persistence, and configuring Docusaurus for internationalization and Right-to-Left (RTL) support.

## Technical Context

**Language/Version**: Python 3.10+ (for FastAPI backend), TypeScript (for frontend integration).
**Primary Dependencies**: `fastapi`, `uvicorn`, `qdrant-client`, `google-generativeai`, `pydantic`, `python-dotenv`, `sqlalchemy`, `psycopg2-binary` (for backend); React, Docusaurus (for frontend).
**Storage**: Qdrant (vector database), PostgreSQL (Neon) for chat history. Neon Postgres connection will leverage `DATABASE_URL` and handle SSL based on standard `psycopg2-binary` behavior.
**Testing**: Unit tests for backend logic, integration tests for API endpoints, frontend component testing.
**Target Platform**: Backend: Vercel Serverless Functions. Frontend: Docusaurus (web).
**Project Type**: Web application (frontend) with a separate API backend.
**Performance Goals**: Chat history retrieval/persistence within 2 seconds. Feedback recording within 1 second.
**Constraints**: Serverless compatibility, stateless backend, lazy initialization for Qdrant and SQLAlchemy database clients, environment variable configuration for sensitive data. Database connection failure should result in app error (fail-fast).
**Scale/Scope**: Designed to serve chat history and localization for the textbook RAG chatbot.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Educational Clarity**: N/A for this feature.
- **Docusaurus-First Architecture**: Will configure Docusaurus i18n and integrate ChatBot into the layout as a floating widget.
- **Modular Content**: N/A for this feature.
- **Single Source of Truth**: N/A for this feature.
- **Asset Management**: Images and static assets MUST be stored in `textbook/static/img` and referenced with relative paths (updated to reflect current constitution).
- **Serverless Compatibility**: Backend will be stateless and `api/index.py` structured for Vercel Serverless Functions. Global variables for database clients (SQLAlchemy engine/session) will use lazy initialization within a FastAPI `startup_event`.
- **Type Safety**: All backend data exchange will use Pydantic models.
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
│           └── current.json # Example, actual content will vary
└── vercel.json
```

**Structure Decision**: The project will maintain a clear separation between the `api/` (backend) and `textbook/` (frontend Docusaurus project).

## Phases

### Phase 1: Backend Upgrade (Neon Integration)

**Purpose**: Integrate Neon PostgreSQL for chat history persistence and feedback.

-   **Dependencies**: Add `sqlalchemy` and `psycopg2-binary` to `api/requirements.txt`.
-   **Infrastructure**:
    -   Create `api/utils/database.py`: Implement the SQLAlchemy engine and session. Ensure lazy initialization of the engine/session within a FastAPI `startup_event` to comply with serverless compatibility. The connection string should use `os.getenv("DATABASE_URL")` with `psycopg2-binary` (e.g., `postgresql+psycopg2://...`). SSL handling will be managed by `psycopg2-binary`'s default behavior, which typically handles SSL negotiation with Neon.
    -   Create `api/utils/sql_models.py`: Define SQLAlchemy models for `ChatHistory` and `Feedback` tables based on `specs/002-chatbot-history-l10n/data-model.md`.
-   **API Update (`api/index.py` modifications)**:
    -   Initialize the Postgres connection on application startup using a FastAPI `startup_event`. The application MUST fail fast if `DATABASE_URL` is missing or the initial connection fails.
    -   Implement logic to write user and bot messages (including `sessionId` and `message_id`) to the `ChatHistory` table during `/api/chat` and `/api/ask-selection` requests.
    -   Implement the `POST /api/feedback` endpoint to receive `FeedbackRequest` and record the rating in the `Feedback` table, linked to the `message_id`.

### Phase 2: Frontend Chat Integration

**Purpose**: Enhance the Docusaurus Chat UI to support chat history and integrate with the new backend features.

-   **Swizzle**: Use `npm run swizzle @docusaurus/theme-classic Root -- --wrap` within the `textbook/` directory to create a custom `Root.tsx` layout wrapper.
-   **Context**: Update `textbook/src/theme/Root.tsx` to include the `ChatBot.tsx` component as a persistent floating widget (e.g., bottom-right corner) and pass necessary context (like `sessionId`).
-   **Chat UI Update**: Modify `textbook/src/components/ChatBot.tsx` to:
    -   Generate a UUID `sessionId` for new users/sessions.
    -   Load existing chat history for the `sessionId` from the backend upon component mount.
    -   Send `sessionId` with all backend requests (`/api/chat`, `/api/ask-selection`).
    -   Display feedback buttons for bot messages and send feedback to `POST /api/feedback`.

### Phase 3: Urdu Localization (i18n)

**Purpose**: Configure Docusaurus for multi-language support with Urdu.

-   **Config**: Update `textbook/docusaurus.config.ts` with `i18n` settings to support English (`en`) as default and Urdu (`ur`) as a second language. Ensure `direction: 'rtl'` is set for the Urdu locale.
-   **Setup**: Run `npm run write-translations` within the `textbook/` directory. This will generate the `textbook/i18n/ur/` folder structure, including `textbook/i18n/ur/docusaurus-plugin-content-docs/current.json` and other translation files.
-   **Content**: Manually translate key static strings in the generated `.json` files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |
```