# Feature Specification: Reference Parity and Bug Fixes

**Feature Branch**: `001-ref-parity-fixes`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "Feature: Reference Parity and Bug Fixes

I need to fix the backend connectivity, standardize the SDK usage, and polish the UI to match the reference repo.

**1. Backend Fixes (`api/`):**
* **CORS**: Add `CORSMiddleware` to `api/index.py` to allow cross-origin requests from localhost.
* **Dependencies**: Update `api/requirements.txt` to include `openai`. Remove `google-generativeai` if fully replacing it, or keep it only if needed for embeddings.
* **Logic**: Refactor `api/utils/helpers.py` (or where the LLM call happens) to use `AsyncOpenAI` client pointing to Gemini's base URL.

**2. Frontend Fixes (`textbook/src/`):**
* **Session ID**: Install `uuid` package (`npm install uuid @types/uuid`) and update `ChatContext.tsx` to generate a UUID on mount.
* **Dark Mode**: unexpected visual glitches in `ChatbotWidget.tsx`. Ensure `dark:bg-zinc-900`, `dark:border-zinc-700`, and `dark:text-zinc-100` are applied consistently.
* **Error Handling**: Update `chatApi.ts` to log specific network errors to the console to help debugging.

**Success Criteria:**
* Locally running Frontend (3000) can successfully chat with Backend (8000).
* Code uses the `openai` pattern for LLM generation."

## Assumptions

- The user has a `GOOGLE_API_KEY` available as an environment variable.
- The user is working in a development environment where allowing all origins for CORS is acceptable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Connectivity (Priority: P1)

As a developer, I want the frontend to be able to communicate with the backend API, so that I can test the application end-to-end.

**Why this priority**: This is a critical-path item that blocks all other development and testing.

**Independent Test**: The frontend application running on `localhost:3000` can successfully send a message to the backend API running on `localhost:8000` and receive a response.

**Acceptance Scenarios**:

1. **Given** the frontend and backend servers are running, **When** a user sends a message in the chat widget, **Then** the message is successfully received by the backend API.
2. **Given** the backend processes the message, **When** it sends a response, **Then** the frontend receives and displays the response in the chat widget.

---

### User Story 2 - Standardized SDK Usage (Priority: P1)

As a developer, I want the backend to use the `openai` SDK for all LLM interactions, so that the codebase is consistent and maintainable.

**Why this priority**: This ensures the project adheres to the architectural principles defined in the constitution.

**Independent Test**: All code that communicates with the LLM uses the `openai` Python library.

**Acceptance Scenarios**:

1. **Given** the backend code, **When** inspecting the LLM interaction logic, **Then** it uses the `AsyncOpenAI` client.
2. **Given** the `api/requirements.txt` file, **When** inspected, **Then** it includes the `openai` library.

---

### User Story 3 - UI Polishing (Priority: P2)

As a user, I want the chatbot UI to be visually consistent with the rest of the application, so that I have a seamless user experience.

**Why this priority**: A consistent UI improves user trust and satisfaction.

**Independent Test**: The chatbot widget's colors and styles match the application's theme in both light and dark modes.

**Acceptance Scenarios**:

1. **Given** the application is in dark mode, **When** the chatbot is open, **Then** it uses the `dark:bg-zinc-900`, `dark:border-zinc-700`, and `dark:text-zinc-100` styles.
2. **Given** the application is in light mode, **When** the chatbot is open, **Then** it uses the default light mode styles.

---

### Edge Cases

- What happens when the backend API is not running? The frontend should display a user-friendly error message.
- What happens if the `GOOGLE_API_KEY` is invalid? The backend should log an authentication error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST allow cross-origin requests from `localhost`.
- **FR-002**: The backend MUST use the `openai` Python library for all LLM interactions.
- **FR-003**: The backend MUST use an `AsyncOpenAI` client pointing to Gemini's base URL.
- **FR-004**: The frontend MUST generate a version-4 UUID for each chat session.
- **FR-005**: The chatbot UI MUST use Tailwind `dark:` variants for dark mode styling.
- **FR-006**: The frontend MUST log specific network errors to the console.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The frontend application running on `localhost:3000` can successfully send and receive messages from the backend API running on `localhost:8000`.
- **SC-002**: The backend consistently uses a standardized interface for all LLM interactions.
- **SC-003**: The chatbot UI is visually consistent with the application theme in both light and dark modes.