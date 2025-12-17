# Feature Specification: Chatbot Session-Based Authentication

**Feature Branch**: `001-fix-session-auth`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "Fix chatbot authentication by using session-based cookies instead of JWTs, and ensure chat history is properly associated with users."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Chatbot Interaction (Priority: P1)

As a logged-in user, I want to interact with the chatbot without any authentication errors, so that I can have a smooth and uninterrupted conversation.

**Why this priority**: This is the core functionality of the chatbot and is currently broken, preventing users from using the feature.

**Independent Test**: A logged-in user can open the chatbot, send a message, and receive a response without any authentication-related errors.

**Acceptance Scenarios**:

1.  **Given** a user is logged in and has a valid session cookie, **When** they send a message to the chatbot, **Then** the message is successfully processed and they receive a response.
2.  **Given** a user's session has expired, **When** they attempt to send a message to the chatbot, **Then** the system redirects them to the login page.
3.  **Given** a user is not logged in, **When** they attempt to access the chatbot, **Then** they are prompted to log in.

---

### User Story 2 - User-Specific Chat History (Priority: P2)

As a logged-in user, I want to see my own chat history, so that I can review my previous conversations with the chatbot.

**Why this priority**: This provides a personalized experience and allows users to continue previous conversations. It's a key feature for user retention.

**Independent Test**: A logged-in user can view their past chat history, and it only contains their own conversations.

**Acceptance Scenarios**:

1.  **Given** a user is logged in and has previous chat history, **When** they view their chat history, **Then** they see a list of their past conversations.
2.  **Given** a user is logged in, **When** they view their chat history, **Then** they do not see chat history from other users.
3.  **Given** a new user with no chat history is logged in, **When** they view their chat history, **Then** they see an empty state or a message indicating no history.

---

### Edge Cases

-   What happens if the session cookie is tampered with or corrupted?
-   How does the system handle concurrent requests from the same user session?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST authenticate users for chatbot interactions using the `better-auth.session_token` cookie.
-   **FR-002**: The system MUST validate the session token against the BetterAuth session database table.
-   **FR-003**: The system MUST reject requests with invalid, expired, or missing session tokens with a 401 Unauthorized status.
-   **FR-004**: The `ChatHistory` database table MUST include a `user_id` column that is NOT NULL, to associate each message with a user. Existing messages without a user_id will be considered purged or unrecoverable.
-   **FR-005**: All chat history retrieval queries MUST be filtered by the authenticated user's `user_id`.
-   **FR-006**: The frontend MUST NOT manage or store JWT tokens for chatbot authentication.
-   **FR-007**: All frontend API requests to the chatbot endpoints MUST include credentials to send cookies.

### Key Entities

-   **BetterAuthSession**: Represents a user's session in the BetterAuth system. Contains the session token and user ID.
-   **BetterAuthUser**: Represents a user in the BetterAuth system.
-   **ChatHistory**: Represents a single message in a chat conversation, linked to a user and a session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 100% of chatbot interactions for logged-in users are successfully authenticated using session cookies.
-   **SC-002**: Zero 401 Unauthorized errors are reported for users with valid sessions.
-   **SC-003**: Users can view their complete chat history across multiple sessions.
-   **SC-004**: The chat history displayed to a user must be 100% their own.
