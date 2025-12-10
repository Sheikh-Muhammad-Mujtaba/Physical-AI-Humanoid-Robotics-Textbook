# Implementation Tasks: Global Chatbot Integration (Root Architecture)

**Branch**: `001-global-chatbot-integration` | **Date**: 2025-12-10 | **Spec**: /specs/001-global-chatbot-integration/spec.md
**Input**: Feature specification, plan, research, data model, contracts, quickstart

**Note**: This document outlines actionable, dependency-ordered tasks based on available design artifacts.

## Phase 1: Setup

These tasks prepare the environment and project structure for the new feature.

- [X] T001 Verify all project dependencies are installed by running `npm install` in `textbook/`
- [X] T002 Ensure local Docusaurus development server can start successfully by running `npm start` in `textbook/`
- [X] T003 Create `textbook/src/contexts/` directory for new global state management context.

## Phase 2: Foundational (Blocking Prerequisites)

These tasks establish the core architecture for the global chatbot.

- [X] T004 Create `ChatContext.ts` (or `.tsx`) in `textbook/src/contexts/` to define the `ChatContextState` and `ChatContextFunctions` interfaces as per `frontend-contract.md`.
- [X] T005 Implement `ChatProvider` in `textbook/src/contexts/ChatContext.tsx` to manage chatbot's global state (`isOpen`, `sessionId`, `messages`, `selectedText`) and expose functions (`openChat`, `closeChat`, `handleSelection`, `sendMessage`).
- [X] T006 Integrate `ChatProvider` into `textbook/src/theme/Root.tsx` to make the chatbot context globally available across the application.
- [X] T007 Modify `textbook/src/theme/Root.tsx` to conditionally render the main Chatbot Widget, ensuring it is present at the highest level of the UI hierarchy and effectively wraps the application content.

## Phase 3: User Story 1 - Global Chatbot Accessibility (Priority: P1)

Goal: The chatbot is available on every page and maintains its state across navigation.
Independent Test: Navigate between pages; chatbot remains visible and in its previous state.

- [X] T008 [US1] Create a new `ChatbotWidget.tsx` component in `textbook/src/components/` that consumes `ChatContext` for its state and functions.
- [X] T009 [US1] Implement the visual rendering for the collapsed state of the Chatbot Widget (floating action button).
- [X] T010 [US1] Implement the visual rendering for the expanded state of the Chatbot Widget (popup dialog) within `ChatbotWidget.tsx`.
- [X] T011 [US1] Add basic styling to `ChatbotWidget.tsx` using Tailwind CSS to ensure fixed bottom-right position and toggling between expanded/collapsed states.
- [X] T012 [US1] Ensure `ChatbotWidget.tsx` displays the message history from `ChatContext`.
- [X] T013 [US1] Remove all existing `<ChatBot />` tags from `textbook/src/pages/index.tsx` and any relevant `docs/` Markdown files.

## Phase 4: User Story 2 - Contextual Chatbot Invocation (Priority: P1)

Goal: Users can initiate chat by selecting text, opening the chatbot with that context.
Independent Test: Select text, click "Ask AI", verify chatbot opens with selected text.

- [X] T014 [US2] Create a new `TextSelectionButton.tsx` component in `textbook/src/components/`.
- [X] T015 [US2] Implement logic in `TextSelectionButton.tsx` to detect text selection and display itself as a transient "Ask AI" button.
- [X] T016 [US2] Integrate `TextSelectionButton.tsx` into `textbook/src/theme/Root.tsx` so it can listen for text selections globally.
- [X] T017 [US2] Implement click handler for "Ask AI" button in `TextSelectionButton.tsx` that calls `handleSelection()` and `openChat()` from `ChatContext`.
- [X] T018 [US2] Modify `ChatbotWidget.tsx` to display `selectedText` from `ChatContext` appropriately (e.g., as an initial message or prompt).

## Phase 5: User Story 3 - Refactored Chatbot Interaction (Priority: P2)

Goal: Interact with a refactored chatbot UI that functions as a fixed-position popup with clear state management.
Independent Test: Expand/collapse chatbot, observe fixed position, send/receive messages.

- [X] T019 [US3] Refactor input mechanism in `ChatbotWidget.tsx` to allow users to type and send messages, calling `sendMessage()` from `ChatContext`.
- [ ] T020 [US3] Implement visual indicator (e.g., "typing...") in `ChatbotWidget.tsx` when `sendMessage()` is processing.
- [ ] T021 [US3] Ensure all styling in `ChatbotWidget.tsx` strictly uses Tailwind CSS classes and contains no inline styles.
- [ ] T022 [US3] Implement logic to handle `closeChat()` from `ChatContext` when the chatbot UI is collapsed.

## Final Phase: Polish & Cross-Cutting Concerns

These tasks ensure the feature is robust, performs well, and integrates seamlessly.

- [ ] T023 Implement integration tests for `ChatContext` and its exposed functions.
- [ ] T024 Write UI tests for `ChatbotWidget.tsx` and `TextSelectionButton.tsx` to verify visual consistency and interaction.
- [ ] T025 Conduct manual end-to-end testing following `quickstart.md` scenarios to ensure all success criteria are met.
- [ ] T026 Update `textbook/` documentation (e.g., `README.md`) if necessary, to reflect the new global chatbot architecture.
- [ ] T027 Ensure `npm run build` passes successfully in `textbook/` after all changes.
- [ ] T028 Review code for adherence to project style guides and best practices.

## Dependency Graph

- Phase 1 (Setup) -> Phase 2 (Foundational)
- Phase 2 (Foundational) -> Phase 3 (US1)
- Phase 2 (Foundational) -> Phase 4 (US2)
- Phase 3 (US1) -> Phase 5 (US3) (US3 refactors US1's UI, so US1 needs to exist first)
- Phase 4 (US2) -> Phase 5 (US3) (US3 also refactors components related to US2's interaction)
- All Phases -> Final Phase (Polish & Cross-Cutting Concerns)

## Parallel Execution Examples

- After Phase 2 is complete, elements of Phase 3 (US1) and Phase 4 (US2) can begin in parallel.
    - Example: T008 (create `ChatbotWidget`) can be done in parallel with T014 (create `TextSelectionButton`).
- Within Phase 3 (US1), T009, T010, T011, T012 can be worked on concurrently by different developers.
- Within Phase 4 (US2), T015, T016, T017, T018 can be worked on concurrently.

## Implementation Strategy

This feature will be implemented using an iterative and incremental approach, prioritizing the most critical user experiences first.

1.  **Minimum Viable Product (MVP)**: Focus initially on completing User Story 1 (Global Chatbot Accessibility) and its foundational requirements. This ensures a persistent, functional chatbot widget across the application.
2.  **Incremental Delivery**: Once US1 is stable, proceed with User Story 2 (Contextual Chatbot Invocation) to enable the "Select-to-Ask" functionality.
3.  **Refinement**: Finally, implement User Story 3 (Refactored Chatbot Interaction) to polish the UI and ensure adherence to best practices.
4.  **Continuous Testing**: Integrate testing throughout the development lifecycle, starting with unit tests for individual components and contexts, and progressing to integration and end-to-end testing.
5.  **Clean Code Practices**: Emphasize clean code, modularity, and adherence to project style guides (e.g., Tailwind CSS, no inline styles) from the outset.
