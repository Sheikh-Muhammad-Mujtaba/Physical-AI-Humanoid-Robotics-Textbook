# Feature Specification: Chatbot UX with WhatsApp-Style Selection

**Feature Branch**: `003-chatbot-ux-selection`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Improve chatbot UX with WhatsApp-style selection tagging and enhanced ask-selection endpoint"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Text and Ask AI (Priority: P1)

As a student reading the Physical AI textbook, I want to select text from the book content and ask the AI tutor questions about that specific selection, so that I can get contextual explanations without having to copy/paste or retype the text.

**Why this priority**: This is the core learning interaction. Students need to quickly get help understanding specific concepts they're reading. Without this, the AI chatbot loses its primary value proposition as an in-context learning assistant.

**Independent Test**: Can be fully tested by selecting any text on a book page, clicking "Ask AI", typing a question, and receiving a relevant answer that acknowledges the selected text.

**Acceptance Scenarios**:

1. **Given** a student is reading a chapter in the textbook, **When** they select any text with their mouse, **Then** an "Ask AI" button appears near the selection.
2. **Given** the "Ask AI" button is visible, **When** the student clicks it, **Then** the chatbot opens with the selected text displayed as a quoted reference.
3. **Given** the chatbot is open with selected text displayed, **When** the student types a question and sends it, **Then** the AI responds with an explanation that acknowledges the selected content.

---

### User Story 2 - WhatsApp-Style Selection Display (Priority: P1)

As a student using the chatbot, I want to see my selected text displayed in a visually distinct "quoted" format (similar to WhatsApp reply quotes), so that I can clearly see what context my question refers to.

**Why this priority**: Visual clarity is essential for the learning experience. Students must clearly see what text they're asking about to avoid confusion and ensure the AI's response is relevant.

**Independent Test**: Can be fully tested by selecting text, opening chat, and verifying the selection appears in a distinct quoted block above the input field.

**Acceptance Scenarios**:

1. **Given** a student has selected text and opened the chatbot, **When** the chatbot loads, **Then** the selected text appears in a visually distinct "quote" block above the input field.
2. **Given** the selection quote is displayed, **When** the student views it, **Then** it shows a label indicating it's selected text from the book, the quoted text (truncated if too long), and a close/dismiss button.
3. **Given** a long text selection (more than 120 characters), **When** displayed in the quote block, **Then** it is truncated with an ellipsis to maintain UI cleanliness.

---

### User Story 3 - Clear Selection Context (Priority: P2)

As a student, I want to be able to dismiss the selected text context before asking a question, so that I can switch to asking a general question without the selection context.

**Why this priority**: Students may change their mind or want to ask unrelated questions. The ability to clear context improves usability and prevents confusion.

**Independent Test**: Can be fully tested by selecting text, opening chat, clicking the dismiss button on the quote, and verifying the quote disappears and subsequent messages go without selection context.

**Acceptance Scenarios**:

1. **Given** the chatbot has a selection quote displayed, **When** the student clicks the dismiss/close button, **Then** the quote block disappears.
2. **Given** the selection has been dismissed, **When** the student sends a message, **Then** the message is sent as a general question (not with selection context).

---

### User Story 4 - Intelligent AI Response to Selection (Priority: P1)

As a student asking about selected text, I want the AI to provide educational, contextual explanations that help me understand the concept, not just repeat the selection back to me.

**Why this priority**: The quality of AI responses is the core value. Students need helpful explanations, not robotic acknowledgments.

**Independent Test**: Can be fully tested by selecting a technical term or concept, asking "What does this mean?", and receiving an explanation with context, examples, and related concepts.

**Acceptance Scenarios**:

1. **Given** a student sends a question with selected text, **When** the AI responds, **Then** the response acknowledges what was selected and directly addresses the question.
2. **Given** the selected text contains a technical term, **When** the student asks for explanation, **Then** the AI defines the term, provides context, and may offer examples or analogies.
3. **Given** the student asks a follow-up question, **When** the AI responds, **Then** it maintains awareness of the original selection context within the conversation.

---

### User Story 5 - Auto-Scroll and Loading Feedback (Priority: P3)

As a student using the chatbot, I want the chat to auto-scroll to new messages and show clear loading indicators, so that I know when the AI is processing my question.

**Why this priority**: Basic UX polish that improves the experience but is not critical for core functionality.

**Independent Test**: Can be fully tested by sending a message and observing auto-scroll behavior and loading animation.

**Acceptance Scenarios**:

1. **Given** the student sends a message, **When** the AI is processing, **Then** a loading indicator (animated dots) appears in the chat.
2. **Given** a new message arrives (user or AI), **When** the message is added, **Then** the chat automatically scrolls to show the newest message.

---

### Edge Cases

- What happens when the student selects text inside the chatbot widget itself? (Should not trigger the "Ask AI" button)
- What happens when the student selects very long text (1000+ characters)? (Should truncate display but send full text to API)
- What happens when the API is unavailable? (Should show friendly error message)
- What happens when the student clicks "Ask AI" but closes the chat before typing? (Selection should persist for when they reopen)
- What happens when the student rapidly selects different texts? (Should update to most recent selection)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an "Ask AI" button when users select text on book pages
- **FR-002**: System MUST position the "Ask AI" button near the selected text (above the selection, centered)
- **FR-003**: System MUST open the chatbot and populate the selection context when "Ask AI" is clicked
- **FR-004**: System MUST display selected text in a visually distinct quote block above the chat input
- **FR-005**: System MUST truncate displayed selection text to a reasonable length (120 characters) with ellipsis
- **FR-006**: System MUST provide a dismiss button to clear the selection context
- **FR-007**: System MUST send the full selection text to the backend even if truncated in display
- **FR-008**: System MUST clear the selection context after the message is sent
- **FR-009**: System MUST show a loading indicator while waiting for AI response
- **FR-010**: System MUST auto-scroll the chat to show new messages
- **FR-011**: Backend MUST process selection-based questions through a dedicated endpoint
- **FR-012**: Backend MUST include educational context in the AI prompt (acknowledge selection, explain concepts, provide examples)
- **FR-013**: System MUST handle API errors gracefully with user-friendly messages
- **FR-014**: System MUST clear the browser text selection after "Ask AI" is clicked

### Key Entities

- **Selection Context**: The text selected by the user from the book, along with metadata about where it was selected
- **Chat Message**: A message in the conversation, can be from user or AI, may include selection reference
- **Session**: The user's chat session that persists across page navigation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select text and receive a contextual AI response within 10 seconds
- **SC-002**: The selection quote block is visible and clearly distinguishable from regular chat messages
- **SC-003**: 95% of AI responses to selection-based questions acknowledge the selected content in their answer
- **SC-004**: Users can dismiss selection context and send general questions without confusion
- **SC-005**: The chatbot remains responsive and usable while waiting for AI responses (loading state visible)
- **SC-006**: Chat automatically scrolls to show new messages without user intervention

## Assumptions

- Users are accessing the textbook through a web browser that supports text selection
- The backend API is deployed and accessible from the frontend
- The AI service (Gemini) is available and has sufficient quota for embeddings and chat
- Users have a stable internet connection
- The Qdrant vector database is populated with textbook content for RAG functionality

## Out of Scope

- Mobile touch-based text selection (may be addressed in future iteration)
- Multi-language selection support
- Selection persistence across browser sessions
- Rich text formatting in AI responses
- Voice input for questions
