# Actionable Tasks: Improve Chatbot UI

**Feature**: `001-chatbot-ui-redesign`

This document outlines the actionable tasks required to implement the chatbot UI redesign.

## Phase 1: Setup

- [ ] T001 [P] Install `framer-motion` for animations in `textbook/package.json`

## Phase 2: Foundational Tasks

- [ ] T002 Create a `ChatbotProvider` component in `textbook/src/lib/ChatbotProvider.tsx` to manage the chatbot's visibility state.
- [ ] T003 Wrap the root application with the `ChatbotProvider` in `textbook/src/theme/Root.tsx`.

## Phase 3: User Story 1 - Floating Chatbot Icon & Chatbot Window

**Goal**: As a user, I want to see a floating chatbot icon on the page so that I can easily access the chatbot whenever I need it. The chatbot window should open when I click the floating icon and close when I click outside of it.

**Independent Test**: The floating icon should be visible on all pages of the book. Clicking the icon should open and close the chatbot window as expected.

- [ ] T004 [US1] Create the `FloatingChatbotIcon` component in `textbook/src/components/FloatingChatbotIcon.tsx`.
- [ ] T005 [US1] Create the `ChatbotWindow` component in `textbook/src/components/ChatbotWindow.tsx`.
- [ ] T006 [US1] Implement the logic in `FloatingChatbotIcon.tsx` to toggle the chatbot window's visibility using the `ChatbotProvider`.
- [ ] T007 [US1] Implement the logic in `ChatbotWindow.tsx` to close the window when the user clicks outside of it.

## Phase 4: User Story 2 - Themed Chatbot UI & Advanced Look

**Goal**: As a user, I want the chatbot UI to match the theme of the book and look like an advanced AI chatbot, with animated avatars and message bubbles.

**Independent Test**: The chatbot UI colors, fonts, and general style should match the rest of the book's website. The chatbot should feature animated avatars and message bubbles.

- [ ] T008 [US2] Create the `AnimatedAvatar` component in `textbook/src/components/AnimatedAvatar.tsx`.
- [ ] T009 [US2] Create the `MessageBubble` component in `textbook/src/components/MessageBubble.tsx`.
- [ ] T010 [US2] Style the `ChatbotWindow` component and its children using Tailwind CSS to match the book's theme in `textbook/src/components/ChatbotWindow.tsx`.
- [ ] T011 [US2] Integrate the `AnimatedAvatar` and `MessageBubble` components into the `ChatbotWindow` component, using `framer-motion` for animations.

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T012 Verify that the chatbot is responsive and works well on different screen sizes.
- [ ] T013 Verify that the chatbot is accessible and can be used with screen readers.
- [ ] T014 Verify that the backend connection is still valid and the chatbot can send and receive messages.

## Dependencies

-   User Story 2 is dependent on User Story 1.

## Parallel Execution

-   Tasks within each user story can be executed in parallel.
-   `T001` can be executed in parallel with any other task.

## Implementation Strategy

The implementation will follow a phased approach, starting with the foundational tasks, followed by the user stories in priority order. This will ensure that we have a working MVP as soon as possible and can iterate on it.
