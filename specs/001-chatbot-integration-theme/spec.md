# Feature Specification: Fix Build Imports, Connect Backend, and Theme UI

**Feature Branch**: `001-chatbot-integration-theme`  
**Created**: December 10, 2025  
**Status**: Draft  
**Input**: User description: "Feature: Fix Build Imports, Connect Backend, and Theme UI

I need to resolve the build errors and connect the frontend to the backend.

**1. Fix Import Paths (Priority: Critical)**
* **Target**: `textbook/src/theme/Root.tsx`, `textbook/src/components/ChatbotWidget.tsx`, `textbook/src/components/TextSelectionButton.tsx`.
* **Requirement**: Audit all `import` statements. Remove `.tsx` extensions from module paths.

**2. Connect ChatContext to API**
* **Target**: `textbook/src/contexts/ChatContext.tsx`.
* **Requirement**:
    * Import `chatWithBackend` and `askSelectionWithBackend` from `../lib/chatApi`.
    * Replace the `setTimeout` mock logic in `sendMessage` with the real API call.
    * Handle `isLoading` and error states properly.

**3. Apply Dark Mode Styling**
* **Target**: `textbook/src/components/ChatbotWidget.tsx`.
* **Requirement**:
    * Container: `bg-white dark:bg-[#1b1b1d] border-gray-200 dark:border-gray-700`.
    * Text: `text-gray-900 dark:text-gray-100`.
    * Input: `bg-gray-100 dark:bg-gray-800`.

**Success Criteria:**
* `npm run build` passes with NO errors.
* Sending a message in the chatbot results in a real HTTP request to `/api/chat`.
* Toggling Docusaurus "Dark Mode" instantly updates the Chatbot colors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build Project Without Errors (Priority: P1)

As a developer, I want the project to build successfully, so that I can deploy the application without encountering import-related issues.

**Why this priority**: Resolving critical build errors is foundational for any development and deployment.

**Independent Test**: The `npm run build` command can be executed, and its output checked for the absence of import-related errors.

**Acceptance Scenarios**:

1.  **Given** all necessary dependencies are installed, **When** `npm run build` is executed, **Then** the build process completes with no errors related to import paths (`.tsx` extensions).

---

### User Story 2 - Interact with Backend API (Priority: P1)

As a user, I want the chatbot to send messages to and receive responses from the real backend API, so that my interactions are functional and accurate.

**Why this priority**: Core functionality of the chatbot relies on successful backend communication.

**Independent Test**: A message can be sent in the chatbot, and network requests can be observed to confirm communication with `/api/chat` and a valid response is received.

**Acceptance Scenarios**:

1.  **Given** the chatbot is open and I type a message, **When** I send the message, **Then** an HTTP request is sent to `/api/chat` and a valid response is received and displayed in the chat.
2.  **Given** text is selected on the page, **When** I click "Ask AI", **Then** an HTTP request is sent to `/api/ask-selection` with the selected text and a valid response is received and displayed.

---

### User Story 3 - Themed Chatbot UI (Priority: P1)

As a user, I want the chatbot's interface to adapt to Docusaurus's light and dark modes, so that the visual experience is consistent with the rest of the application.

**Why this priority**: Ensures a polished and integrated user experience.

**Independent Test**: Toggling the Docusaurus "Dark Mode" switch should instantly change the chatbot's colors as specified, without any layout shifts or visual glitches.

**Acceptance Scenarios**:

1.  **Given** the Docusaurus theme is set to Light Mode, **When** the chatbot is displayed, **Then** its container has a `bg-white` background, `text-gray-900` text, and `border-gray-200` borders.
2.  **Given** the Docusaurus theme is set to Dark Mode, **When** the chatbot is displayed, **Then** its container has a `dark:bg-[#1b1b1d]` background, `dark:text-gray-100` text, and `dark:border-gray-700` borders.
3.  **Given** the chatbot input field is displayed, **When** the theme changes to Light Mode, **Then** its background is `bg-gray-100`.
4.  **Given** the chatbot input field is displayed, **When** the theme changes to Dark Mode, **Then** its background is `dark:bg-gray-800`.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: All `import` statements in `textbook/src/theme/Root.tsx`, `textbook/src/components/ChatbotWidget.tsx`, and `textbook/src/components/TextSelectionButton.tsx` MUST omit `.tsx` extensions from module paths.
-   **FR-002**: The `ChatContext` in `textbook/src/contexts/ChatContext.tsx` MUST import `chatWithBackend` and `askSelectionWithBackend` from `../lib/chatApi`.
-   **FR-003**: The `sendMessage` function in `textbook/src/contexts/ChatContext.tsx` MUST replace `setTimeout` mock logic with actual calls to `chatWithBackend` or `askSelectionWithBackend` based on context.
-   **FR-004**: The `sendMessage` function MUST correctly handle `isLoading` and error states during API calls, displaying a user-friendly error message if the API call fails.
-   **FR-005**: The chatbot container in `textbook/src/components/ChatbotWidget.tsx` MUST apply `bg-white dark:bg-[#1b1b1d]` for its background and `border-gray-200 dark:border-gray-700` for its borders.
-   **FR-006**: The chatbot text elements in `textbook/src/components/ChatbotWidget.tsx` MUST use `text-gray-900 dark:text-gray-100`.
-   **FR-007**: The chatbot input field in `textbook/src/components/ChatbotWidget.tsx` MUST use `bg-gray-100 dark:bg-gray-800`.

### Key Entities *(include if feature involves data)*

-   **Root Component**: The main entry point (`Root.tsx`) responsible for overall application structure.
-   **ChatContext**: Manages chatbot state and communication logic, including message history and loading states.
-   **ChatbotWidget**: The primary UI component for chatbot interaction, displaying messages and an input field.
-   **TextSelectionButton**: UI component for triggering chat based on selected text from the page.
-   **chatApi**: Library for backend API interactions (`chatWithBackend`, `askSelectionWithBackend`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: `npm run build` completes successfully with an exit code of 0, indicating no build errors.
-   **SC-002**: Sending a message in the chatbot successfully initiates an HTTP POST request to `/api/chat` (or `/api/ask-selection` if text is selected) and receives a valid JSON response from the backend.
-   **SC-003**: Toggling Docusaurus "Dark Mode" on/off results in an immediate and correct visual theme change for the chatbot's container background, text color, and input field background, matching the specified Tailwind classes.
-   **SC-004**: The `isLoading` state is correctly reflected in the UI (e.g., a typing indicator).
-   **SC-005**: API call failures are gracefully handled and displayed as user-friendly error messages within the chat window.