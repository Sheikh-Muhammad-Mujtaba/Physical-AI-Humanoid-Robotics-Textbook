# Tasks: UI Polish, Select-to-Ask, and Deployment Fixes

**Input**: Design documents from `/specs/001-ui-polish-select-to-ask/`

## Phase 1: Foundational (Blocking Prerequisites)

- [x] T001 [P] Create a `ChatProvider` to manage global chat state in `textbook/src/lib/ChatProvider.tsx`.
- [x] T002 [P] Refactor `textbook/src/components/ChatBot.tsx` to consume the `ChatProvider`.

## Phase 2: User Story 1 - Select-to-Ask (Priority: P1) 🎯 MVP

**Goal**: A user can highlight text to trigger an "Ask AI" button, which sends the selection to the chatbot.

**Independent Test**: Highlight text on a page, click the button, and verify the chat widget opens with the correct query.

### Implementation for User Story 1

- [x] T003 [US1] Create a `TextSelectionButton` component in `textbook/src/components/TextSelectionButton.tsx`.
- [x] T004 [US1] Implement logic to show the `TextSelectionButton` on text selection. This may involve adding a global event listener in `ChatProvider.tsx` or a similar central location.
- [x] T005 [US1] Implement the `onClick` handler for the `TextSelectionButton` to open the chat widget and call the `/api/ask-selection` endpoint with the highlighted text.

## Phase 3: User Story 2 - Floating Chat Widget (Priority: P2)

**Goal**: The chatbot is a collapsible floating widget in the bottom-right corner.

**Independent Test**: The chat widget can be collapsed and expanded.

### Implementation for User Story 2

- [x] T006 [US2] Refactor `textbook/src/components/ChatBot.tsx` into a collapsible floating widget using Tailwind CSS.
- [x] T007 [US2] Style the chat widget, bubble, and transitions using Tailwind CSS.
- [x] T008 [US2] Implement the expand/collapse functionality.

## Phase 4: User Story 3 - Vercel Deployment (Priority: P3)

**Goal**: The application builds and deploys successfully on Vercel.

**Independent Test**: A `vercel build` and `vercel deploy` command can be run.

### Implementation for User Story 3

- [x] T009 [US3] Rewrite `vercel.json` to correctly bundle the `api/utils` folder for the Python runtime.
- [ ] T010 [US3] Fix broken links in `textbook/src/pages/index.tsx`.
- [ ] T011 [US3] Remove unused dependencies from `api/requirements.txt`.

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T012 [P] Update documentation with the new features.
- [ ] T013 Run quickstart.md validation.

## Dependencies & Execution Order

- **Phase 1 (Foundational)**: Must be completed before all other phases.
- **Phase 2 (User Story 1)**: Depends on Phase 1.
- **Phase 3 (User Story 2)**: Depends on Phase 1. Can be worked on in parallel with Phase 2.
- **Phase 4 (User Story 3)**: Depends on all other phases.
- **Phase 5 (Polish)**: Depends on all other phases.
