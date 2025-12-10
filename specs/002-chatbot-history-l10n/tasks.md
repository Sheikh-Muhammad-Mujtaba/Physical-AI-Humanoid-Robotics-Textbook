# Tasks: Chatbot with History (Neon Postgres) and Urdu Localization

**Input**: Design documents from `/specs/002-chatbot-history-l10n/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency configuration.

- [X] T001 [P] Add `sqlalchemy` and `psycopg2-binary` to `api/requirements.txt`.
- [X] T002 [P] Ensure a `.env` file is present in the `api/` directory with the `DATABASE_URL` variable for local development.

---

## Phase 2: Foundational Backend (Blocking Prerequisites)

**Purpose**: Core database infrastructure that MUST be complete before chat history and feedback stories can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `api/utils/database.py` to manage the SQLAlchemy engine and session, ensuring lazy initialization for serverless compatibility.
- [X] T004 Create `api/utils/sql_models.py` to define the SQLAlchemy models for `ChatHistory` and `Feedback` tables based on the data model.
- [X] T005 In `api/index.py`, add a FastAPI `startup_event` to initialize the database connection and create tables.

---

## Phase 3: User Story 1 - Persist Chat History (Priority: P1) 🎯 MVP

**Goal**: Save and load chat conversations across sessions to provide a seamless user experience.

**Independent Test**: Initiate a chat, refresh the page, and verify that previous messages are loaded from the database for the same `sessionId`.

### Implementation for User Story 1

- [X] T006 [US1] In `api/index.py`, implement a `GET /api/history/{session_id}` endpoint to retrieve chat history from the `chat_history` table.
- [X] T007 [US1] In `api/index.py`, modify the `/api/chat` endpoint to save the user's message and the bot's response to the `chat_history` table.
- [X] T008 [US1] In `api/index.py`, modify the `/api/ask-selection` endpoint to save the user's message and the bot's response to the `chat_history` table.
- [X] T009 [P] [US1] In `textbook/src/lib/chatApi.ts`, add a function to fetch chat history for a given `session_id`.
- [X] T010 [US1] In `textbook/src/components/ChatBot.tsx`, generate and persist a `sessionId` using `localStorage`.
- [X] T011 [US1] In `textbook/src/components/ChatBot.tsx`, on component mount, call the new API function to load the chat history.
- [X] T012 [US1] In `textbook/src/components/ChatBot.tsx`, include the `sessionId` in all requests to `/api/chat` and `/api/ask-selection`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 3 - Localize Site to Urdu (Priority: P1)

**Goal**: Make the Docusaurus site and chatbot interface available in Urdu with correct Right-to-Left (RTL) layout.

**Independent Test**: Switch the site language to Urdu and verify that the UI text is translated and the layout changes to RTL.

### Implementation for User Story 3

- [X] T013 [US3] In `textbook/docusaurus.config.ts`, configure the `i18n` property to support English (`en`) and Urdu (`ur`), setting `direction: 'rtl'` for Urdu.
- [X] T014 [US3] In the `textbook/` directory, run `npm run write-translations` to generate the `i18n/ur/` folder and translation files.
- [X] T015 [P] [US3] In `textbook/i18n/ur/`, provide placeholder translations for key UI elements in the generated JSON files.
- [ ] T016 [US3] In the `textbook/` directory, run `npm run swizzle @docusaurus/theme-classic Root -- --wrap` to create a custom layout wrapper.
- [ ] T017 [US3] Move the `ChatBot.tsx` component into the new `textbook/src/theme/Root.tsx` to make it a persistent floating widget across all pages.

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently.

---

## Phase 5: User Story 2 - Provide Feedback on Answers (Priority: P2)

**Goal**: Allow users to provide feedback on the AI assistant's answers to help improve response quality.

**Independent Test**: Click a feedback button on a bot message and verify the feedback is recorded in the database via the `/api/feedback` endpoint.

### Implementation for User Story 2

- [ ] T018 [US2] In `api/index.py`, implement the `POST /api/feedback` endpoint to store the `message_id` and `rating` in the `feedback` table.
- [ ] T019 [P] [US2] In `textbook/src/lib/chatApi.ts`, add a function to send feedback to the `/api/feedback` endpoint.
- [ ] T020 [US2] In `textbook/src/components/ChatBot.tsx`, add "thumbs up" and "thumbs down" buttons to messages from the bot.
- [ ] T021 [US2] In `textbook/src/components/ChatBot.tsx`, implement the `onClick` handler for the feedback buttons to call the feedback API function.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T022 [P] Update `README.md` and `quickstart.md` with the new setup and environment variable requirements (`DATABASE_URL`).
- [ ] T023 Review error handling for database connection failures and API requests.
- [ ] T024 Manually verify the complete end-to-end flow for all user stories.
- [ ] T025 Run `lighthouserc.js` to check for performance regressions in the `textbook` application.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational Backend (Phase 2)**: Depends on Setup completion. BLOCKS user stories 1 and 2.
- **User Stories (Phase 3+)**:
  - **US1 (History)**: Depends on Foundational Backend completion.
  - **US3 (i18n)**: Does not depend on the backend. Can be worked on in parallel after frontend setup.
  - **US2 (Feedback)**: Depends on Foundational Backend completion. It is best implemented after US1 as it relies on `message_id` from chat history.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).
- **User Story 3 (P1)**: Can start at any time.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2).

### Parallel Opportunities

- Backend (Phase 2) and Frontend i18n setup (US3) can be started in parallel.
- Once the foundational backend is complete, US1 and US2 backend tasks can be worked on.
- Frontend work for US1, US2, and US3 can be parallelized.

---

## Implementation Strategy

### MVP First (User Stories 1 & 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3 (User Story 1) and Phase 4 (User Story 3).
4. **STOP and VALIDATE**: Test User Stories 1 and 3 independently.
5. Deploy/demo if ready.

### Incremental Delivery

1. Complete MVP (US1 + US3).
2. Add Phase 5 (User Story 2).
3. Test independently and integrate.
4. Deploy/demo.
