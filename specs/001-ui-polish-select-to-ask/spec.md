# Feature Specification: UI Polish, Select-to-Ask, and Deployment Fixes

**Feature Branch**: `001-ui-polish-select-to-ask`
**Created**: 2025-12-09
**Status**: Draft
**Input**: User description: "I want to complete the application by adding the missing frontend features and fixing the deployment config, while preserving the existing OpenAI-based backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select-to-Ask (Priority: P1)

A user browsing the textbook content can highlight any piece of text, which will cause a floating "Ask AI" button to appear. Clicking this button will open the chat widget and automatically submit the highlighted text as a query to the AI.

**Why this priority**: This is a core feature that provides the primary value proposition of the RAG chatbot.

**Independent Test**: Can be fully tested by highlighting text on a page, clicking the button, and verifying the chat widget opens with the correct query.

**Acceptance Scenarios**:

1. **Given** a user is on a textbook page, **When** they highlight a piece of text, **Then** a floating "Ask AI" button appears near the cursor.
2. **Given** the "Ask AI" button is visible, **When** the user clicks it, **Then** the chat widget opens and the highlighted text is sent as a query.

### User Story 2 - Floating Chat Widget (Priority: P2)

The chatbot is presented as a floating widget in the bottom-right corner of the screen, which can be collapsed and expanded.

**Why this priority**: Provides a modern, non-intrusive user experience for the chatbot.

**Independent Test**: The chat widget's collapsed and expanded states can be tested independently of any other feature.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** the page loads, **Then** a floating chat bubble is visible in the bottom-right corner.
2. **Given** the chat bubble is visible, **When** the user clicks it, **Then** the chat widget expands to its full view.
3. **Given** the chat widget is open, **When** the user clicks the close button, **Then** the widget collapses back into a bubble.

### User Story 3 - Vercel Deployment (Priority: P3)

The entire application (frontend and backend) can be successfully built and deployed on Vercel.

**Why this priority**: Ensures the application is deliverable and accessible to users.

**Independent Test**: A `vercel build` and `vercel deploy` can be run to test this independently.

**Acceptance Scenarios**:

1. **Given** the latest code is on the `main` branch, **When** a Vercel deployment is triggered, **Then** the build succeeds without errors.
2. **Given** the deployment is successful, **When** a user accesses the deployed URL, **Then** both the textbook and the API are functional.

### Edge Cases

- What happens when a user highlights text that includes interactive elements (e.g., links, buttons)?
- How does the system handle API errors when the "Select-to-Ask" feature is used?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a floating "Ask AI" button when text is selected.
- **FR-002**: The system MUST open the chat widget and query the AI with the selected text when the "Ask AI" button is clicked.
- **FR-003**: The chatbot MUST be a collapsible floating widget.
- **FR-004**: The Vercel configuration MUST correctly bundle the `api/utils` folder for the Python runtime.
- **FR-005**: All broken links in `textbook/src/pages/index.tsx` MUST be fixed.
- **FR-006**: The backend MUST continue to use the OpenAI SDK pattern.
- **FR-007**: Unused Python dependencies MUST be removed from `api/requirements.txt`.

### Key Entities *(include if feature involves data)*

- **Query**: The text highlighted by the user to be sent to the AI.
- **Chat State**: The current state of the chat widget (open/closed, conversation history).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The "Ask AI" button appears within 200ms of text selection.
- **SC-002**: The Vercel build completes in under 5 minutes.
- **SC-003**: The application achieves a Lighthouse performance score of 85 or higher.
- **SC-004**: 100% of P1 user stories are successfully implemented and pass all acceptance scenarios.