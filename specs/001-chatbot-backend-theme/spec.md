# Feature Specification: Chatbot Backend Connection and Themed UI

**Feature Branch**: `001-chatbot-backend-theme`  
**Created**: December 10, 2025  
**Status**: Draft  
**Input**: User description: "Feature: Chatbot Backend Connection and Themed UI

I need to connect the frontend to the real backend and polish the UI to match the book.

**1. Backend Connection (Logic):**
* **Target**: `textbook/src/contexts/ChatContext.tsx`.
* **Requirement**: Replace the `setTimeout` mock in `sendMessage` with a real call to `chatWithBackend` (from `../lib/chatApi`).
* **Selection Support**: If `selectedText` is present, call `askSelectionWithBackend` instead of the standard chat.

**2. UI Polish (Theming):**
* **Target**: `textbook/src/components/ChatbotWidget.tsx` (and `TextSelectionButton.tsx`).
* **Light Mode**: White backgrounds, dark text, gray borders.
* **Dark Mode**: Dark gray/black backgrounds (`dark:bg-gray-900`), white text (`dark:text-gray-100`), subtle borders (`dark:border-gray-700`).
* **Primary Color**: Use the Docusaurus primary color for the "Send" button and the Chat Bubble icon.

**Success Criteria:**
* Sending a message triggers a network request to `/api/chat`.
* The Chatbot background changes automatically when toggling the Docusaurus Dark Mode switch."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect Chatbot to Real Backend (Priority: P1)

As a user, I want the chatbot to communicate with the actual backend API, so that I can get real responses to my queries.

**Why this priority**: Essential for the chatbot's core functionality and delivering value to the user.

**Independent Test**: Can be fully tested by sending messages in the chatbot and observing network requests and backend responses.

**Acceptance Scenarios**:

1.  **Given** the chatbot is open and I type a message, **When** I send the message, **Then** a network request is triggered to `/api/chat` and I receive a response from the backend.
2.  **Given** text is selected on the page, **When** I trigger a chat interaction with the selected text, **Then** a network request is triggered to `/api/ask-selection` and I receive a context-aware response from the backend.

---

### User Story 2 - Chatbot UI Theming (Priority: P1)

As a user, I want the chatbot's appearance to match the Docusaurus light and dark themes, so that it integrates seamlessly with the rest of the application.

**Why this priority**: Crucial for a consistent and professional user experience.

**Independent Test**: Can be fully tested by toggling Docusaurus's dark mode and verifying the chatbot's visual changes, and by observing the color of interactive elements.

**Acceptance Scenarios**:

1.  **Given** the Docusaurus theme is set to Light Mode, **When** the chatbot is displayed, **Then** its background is white, text is dark, and borders are gray.
2.  **Given** the Docusaurus theme is set to Dark Mode, **When** the chatbot is displayed, **Then** its background is dark gray/black (`dark:bg-gray-900`), white text (`dark:text-gray-100`), and borders are subtle (`dark:border-gray-700`).
3.  **Given** the chatbot "Send" button and Chat Bubble icon are displayed, **When** the Docusaurus primary color is changed, **Then** their color updates to match the new Docusaurus primary color.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The `sendMessage` function within `textbook/src/contexts/ChatContext.tsx` MUST replace the `setTimeout` mock with a real call to `chatWithBackend` from `../lib/chatApi`.
-   **FR-002**: If `selectedText` is present in the `ChatContext`, the `sendMessage` function MUST call `askSelectionWithBackend` from `../lib/chatApi` instead of `chatWithBackend`.
-   **FR-003**: The `textbook/src/components/ChatbotWidget.tsx` and `TextSelectionButton.tsx` components MUST adapt their styling for Light Mode: white backgrounds, dark text, gray borders.
-   **FR-004**: The `textbook/src/components/ChatbotWidget.tsx` and `TextSelectionButton.tsx` components MUST adapt their styling for Dark Mode using Tailwind's `dark:` modifier: `dark:bg-gray-900` for backgrounds, `dark:text-gray-100` for text, and `dark:border-gray-700` for borders.
-   **FR-005**: The "Send" button and Chat Bubble icon in `textbook/src/components/ChatbotWidget.tsx` (and `TextSelectionButton.tsx` if applicable) MUST use the Docusaurus primary color (`var(--ifm-color-primary)` or equivalent Tailwind class).

### Key Entities *(include if feature involves data)*

-   **ChatContext**: Manages the chatbot's state, including `selectedText` and functions for sending messages.
-   **ChatbotWidget**: The main UI component for the chatbot interaction.
-   **TextSelectionButton**: UI component that might trigger chat interactions based on selected text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: Sending a message in the chatbot successfully triggers a network request to `/api/chat` or `/api/ask-selection`.
-   **SC-002**: Toggling the Docusaurus Dark Mode switch automatically changes the chatbot background and text colors according to the specified light/dark mode themes.
-   **SC-003**: The "Send" button and Chat Bubble icon consistently display the Docusaurus primary brand color.