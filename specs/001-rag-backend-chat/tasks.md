# Tasks: RAG Backend API & Chat Integration

**Input**: Design documents from `/specs/001-rag-backend-chat/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: No automated tests are requested for this feature. Manual testing is required.

**Organization**: Tasks are grouped by logical phases defined in the plan.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Configuration & Structure

**Purpose**: Setup the basic project structure and configuration files for the RAG Backend API.

- [ ] T001 Create the `api/` directory at the repository root.
- [ ] T002 Create an empty `api/index.py` file to serve as the main FastAPI app entry point.
- [ ] T003 Create `api/requirements.txt` and add `fastapi`, `uvicorn`, `qdrant-client`, `google-generativeai`, `pydantic`, `python-dotenv`.
- [ ] T004 Create the `api/utils/` directory.
- [ ] T005 Create `vercel.json` in the project root with the following content to route `/api/*` requests to the Python app:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/(.*)",
          "destination": "/api"
        }
      ]
    }
    ```

---

## Phase 2: Core Utilities

**Purpose**: Implement shared logic and data models for the RAG Backend API.

- [ ] T007 Create `api/utils/models.py` defining Pydantic models for `ChatRequest`, `ChatResponse`, and `AskSelectionRequest` based on `specs/001-rag-backend-chat/data-model.md`.
- [ ] T008 Create `api/utils/config.py` to handle environment variable loading (using `python-dotenv`) for `GEMINI_API_KEY`, `QDRANT_URL`, and `QDRANT_API_KEY`. Also, initialize the Qdrant client lazily.
- [ ] T009 Create `api/utils/helpers.py` with logic for `embed_text` using Google Gemini.
- [ ] T010 Create `api/utils/tools.py` with helper functions for `search_book_content` and `format_context`.

---

## Phase 3: API Logic

**Purpose**: Implement the FastAPI routes for the RAG Backend API.

- [ ] T011 [US3] Implement the `GET /api/health` endpoint in `api/index.py` that returns `{"status": "ok"}`.
- [ ] T012 [US1] Implement the `POST /api/chat` endpoint in `api/index.py`. This includes:
    -   Accepting `ChatRequest` (Pydantic model).
    -   Retrieving context from an external, persistent Qdrant instance (with fallback for unavailability), and returns an LLM-generated answer using Google Gemini (with fallback for unresponsiveness and generic message for rate limits).
    -   Attempting to parse/cleanse invalid input (FR-014).
    -   Returning `ChatResponse` (Pydantic model).
- [ ] T013 [US2] Implement the `POST /api/ask-selection` endpoint in `api/index.py`. This includes:
    -   Accepting `AskSelectionRequest` (Pydantic model).
    -   Retrieving context from an external, persistent Qdrant instance (with fallback for unavailability), and returns a context-aware explanation using Google Gemini (with fallback for unresponsiveness and generic message for rate limits).
    -   Attempting to parse/cleanse invalid input (FR-014).
    -   Returning `ChatResponse` (Pydantic model).

---

## Phase 4: Frontend Integration

**Purpose**: Integrate the RAG Backend API with the Docusaurus frontend.

- [ ] T014 Create `textbook/src/lib/chatApi.ts` to handle fetch requests to the backend API endpoints (`/api/chat`, `/api/ask-selection`, `/api/health`).
- [ ] T015 Port the `ChatBot.tsx` component to `textbook/src/components/ChatBot.tsx` and integrate it with `textbook/src/lib/chatApi.ts`.

---

## Verification

**Purpose**: Verify the functionality of the RAG Backend API locally.

- [ ] T016 Run the FastAPI server locally: `uvicorn api/index:app --reload`.
- [ ] T017 Manually test the `GET /api/health` endpoint.
- [ ] T018 Manually test the `POST /api/chat` endpoint with a sample question.
- [ ] T019 Manually test the `POST /api/ask-selection` endpoint with a sample text snippet and question.

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Phase 1 (Configuration & Structure)**: No dependencies.
-   **Phase 2 (Core Utilities)**: Depends on Phase 1 completion.
-   **Phase 3 (API Logic)**: Depends on Phase 2 completion.
-   **Phase 4 (Frontend Integration)**: Depends on Phase 3 completion (for API endpoints to exist).
-   **Verification**: Depends on Phase 3 and Phase 4 completion.

### Parallel Opportunities

-   Tasks within Phase 1 and 2 can be parallelized where appropriate, particularly for file creation and independent utility functions.
-   Frontend integration tasks (T013, T014) can be parallelized once backend API contracts are stable.

## Implementation Strategy

The project will follow an iterative approach, completing each phase sequentially. Core backend components will be prioritized, followed by frontend integration. Verification will be performed after significant integration points.

## Summary

-   **Total Task Count**: 19
-   **Tasks per User Story**:
    -   US1 (Ask a Question): T011
    -   US2 (Get Context-Aware Explanation): T012
    -   US3 (Health Check): T010
-   **Parallel Opportunities Identified**: High parallelism within phases for independent file creation/implementation.
-   **Independent Test Criteria for Each Story**:
    -   **US1**: `POST /api/chat` returns relevant LLM answers.
    -   **US2**: `POST /api/ask-selection` returns context-aware explanations.
    -   **US3**: `GET /api/health` returns `{"status": "ok"}`.
-   **Suggested MVP Scope**: Completion of Phase 1, 2, 3, and basic Frontend Integration (Phase 4).

Validation: All tasks follow the checklist format (checkbox, ID, labels, file paths).
