# Implementation Tasks: Chatbot Session-Based Authentication

**Feature Branch**: `001-fix-session-auth` | **Date**: 2025-12-18 | **Plan**: [link](./plan.md)

This task list is generated from the implementation plan and feature specification.

## Phase 1: Foundational Tasks

- [ ] T001 [P] Create a database migration script to add a `user_id` column to the `ChatHistory` table in `api/utils/sql_models.py`. The column should be a `String` and `NOT NULL`.
- [ ] T002 [P] In `api/utils/sql_models.py`, add the `BetterAuthSession` and `BetterAuthUser` models to represent the BetterAuth database schema.
- [ ] T003 In `api/utils/auth.py`, implement the `validate_session` function to validate the `better-auth.session_token` cookie against the `BetterAuthSession` table.
- [ ] T004 In `api/utils/auth.py`, implement the `get_current_user_from_session` dependency to be used in API endpoints.

## Phase 2: User Story 1 - Seamless Chatbot Interaction

**Goal**: A logged-in user can interact with the chatbot without any authentication errors.
**Independent Test**: A logged-in user can send a message and receive a response without any authentication-related errors.

- [ ] T005 [US1] In `api/index.py`, update the `/api/chat` and `/api/ask-selection` endpoints to use the `get_current_user_from_session` dependency for authentication.
- [ ] T006 [US1] In `api/index.py`, update the `/api/chat` and `/api/ask-selection` endpoints to associate the `user_id` with the `ChatHistory` entries.
- [ ] T007 [P] [US1] In `src/lib/chatApi.ts`, remove all JWT-related logic, including `ensureJWTToken` and `clearAuthToken`.
- [ ] T008 [P] [US1] In `src/lib/chatApi.ts`, update the `chatWithBackend` and `askSelectionWithBackend` functions to remove the `authServiceUrl` parameter and include `credentials: 'include'`.

## Phase 3: User Story 2 - User-Specific Chat History

**Goal**: A logged-in user can see their own chat history.
**Independent Test**: A logged-in user can view their past chat history, and it only contains their own conversations.

- [ ] T009 [US2] In `api/index.py`, update the `/api/history/{session_id}` and `/api/user/history` endpoints to use the `get_current_user_from_session` dependency.
- [ ] T010 [US2] In `api/index.py`, update the `/api/history/{session_id}` and `/api/user/history` endpoints to filter `ChatHistory` by the `user_id`.
- [ ] T011 [P] [US2] In `src/lib/chatApi.ts`, update the `getHistory` function to remove the `authServiceUrl` parameter and include `credentials: 'include'`.

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T012 Update the `sendFeedback` function in `src/lib/chatApi.ts` and the corresponding endpoint in `api/index.py` to use session-based authentication.
- [ ] T013 Review all modified files for code quality, comments, and style consistency.
- [ ] T014 Manually test the entire authentication and chat workflow to ensure all requirements from the spec are met.

## Dependencies

- **User Story 1** is a prerequisite for **User Story 2**.
- **Phase 1** tasks must be completed before starting **Phase 2**.

## Parallel Execution

- Within Phase 1, T001 and T002 can be done in parallel.
- Within Phase 2, backend tasks (T005, T006) and frontend tasks (T007, T008) can be done in parallel.
- Within Phase 3, backend tasks (T009, T010) and the frontend task (T011) can be done in parallel.
