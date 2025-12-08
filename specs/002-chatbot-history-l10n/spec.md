# Feature Specification: Chatbot with History (Neon Postgres) and Urdu Localization

**Feature Branch**: `002-chatbot-history-l10n`
**Created**: 2025-12-07
**Status**: Draft
**Input**: User description: "Feature: Chatbot with History (Neon Postgres) and Urdu Localization

I want to upgrade the current Docusaurus site and Python backend to support persistent chat history and Urdu translation.

**1. Backend Requirements (Hybrid Database):**
* **Vector DB**: Continue using Qdrant for RAG.
* **Relational DB**: Use **PostgreSQL (via Neon)**. Do NOT use SQLite.
* **Database Driver**: Use `psycopg2-binary` for the connection.
* **Configuration**: The app MUST connect using the `DATABASE_URL` environment variable provided by Neon.
* **New Functionality**:
    * Store chat logs/history in the `chat_history` table in Postgres.
    * Add a `POST /api/feedback` endpoint to rate answers.

**2. Frontend Requirements (Chat UI):**
* **Component**: Integrate the `ChatBot.tsx` component into the Docusaurus layout (global wrapper).
* **Persistence**: The chat UI should generate a `sessionId` (UUID) and send it with requests to track conversation history.

**3. Localization (Urdu):**
* **Docusaurus i18n**: Configure `docusaurus.config.ts` to support English (`en`) as default and Urdu (`ur`) as a second language.
* **RTL Support**: Ensure the layout switches to Right-to-Left (RTL) when Urdu is selected.
* **Translation**: Setup the folder structure (`i18n/ur/`) for manual translation.

**Success Criteria:**
* The backend connects successfully to the Neon Postgres instance.
* Chat history is persisted across reloads (fetched from Postgres).
* Switching to Urdu changes the site direction to RTL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persist Chat History (Priority: P1)

As a user, I want my chat conversations with the AI assistant to be saved and loaded across sessions, so that I can continue my interactions seamlessly and review past discussions.

**Why this priority**: Core functionality for an enhanced chatbot experience.

**Independent Test**: Initiate a chat, refresh the page, and verify that previous messages are loaded from the database.

**Acceptance Scenarios**:

1.  **Given** I have a `sessionId` and have sent messages, **When** I reload the chat interface, **Then** my previous messages for that `sessionId` are displayed in chronological order.
2.  **Given** I am a new user without a `sessionId`, **When** I start a chat, **Then** a new `sessionId` is generated and associated with my conversation.

### User Story 2 - Provide Feedback on Answers (Priority: P2)

As a user, I want to provide feedback (e.g., thumbs up/down) on the AI assistant's answers, so that the system can learn and improve the quality of responses over time.

**Why this priority**: Essential for iterative improvement of the RAG system.

**Independent Test**: Send feedback to the `/api/feedback` endpoint and verify that the feedback is recorded in the database.

**Acceptance Scenarios**:

1.  **Given** I receive an AI answer, **When** I click a feedback button (e.g., thumbs up), **Then** a POST request is sent to `/api/feedback` with the answer ID and feedback value, and the feedback is stored in the database.

### User Story 3 - Localize Site to Urdu (Priority: P1)

As an Urdu-speaking user, I want to view the Docusaurus site and chatbot interface in Urdu, with correct Right-to-Left (RTL) layout, so that I can comfortably interact with the content in my native language.

**Why this priority**: Critical for accessibility and expanding user base.

**Independent Test**: Switch the Docusaurus site language to Urdu and verify that the UI text is translated and the layout changes to RTL.

**Acceptance Scenarios**:

1.  **Given** the Docusaurus site is configured for i18n with Urdu, **When** I select "Urdu" as the language, **Then** all static UI elements (e.g., navigation, button labels) are displayed in Urdu.
2.  **Given** the Urdu language is selected, **When** I view any page, **Then** the text direction is correctly set to Right-to-Left (RTL).
3.  **Given** the Urdu language is selected, **When** I interact with the chatbot, **Then** the chatbot UI elements (e.g., input placeholder, send button) are translated to Urdu.

## Edge Cases

-   What happens if the Postgres database is unavailable?
-   How is concurrent chat history access handled?
-   What happens if a user provides feedback on a non-existent answer ID?
-   How are partial translations handled if some strings are missing in Urdu?
-   What happens if the `sessionId` is malformed or missing in a request?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The backend MUST persist chat history logs in a PostgreSQL database (via Neon).
-   **FR-002**: The backend MUST store chat history in a table named `chat_history`.
-   **FR-003**: The backend MUST use `psycopg2-binary` for PostgreSQL database connections.
-   **FR-004**: The backend MUST connect to PostgreSQL using the `DATABASE_URL` environment variable.
-   **FR-005**: The backend MUST expose a `POST /api/feedback` endpoint to receive and store user ratings for answers.
-   **FR-006**: The frontend Chat UI (`ChatBot.tsx`) MUST generate a UUID `sessionId` for each new user/session.
-   **FR-007**: The frontend Chat UI MUST send the `sessionId` with all backend chat requests (`/api/chat`, `/api/ask-selection`).
-   **FR-008**: The Docusaurus site MUST be configured to support English (`en`) as default and Urdu (`ur`) as a second language using i18n.
-   **FR-009**: The Docusaurus site MUST automatically enable Right-to-Left (RTL) layout when Urdu is selected.
-   **FR-010**: The Docusaurus project MUST have the necessary folder structure (`i18n/ur/`) for manual translation.
-   **FR-011**: The frontend MUST integrate the `ChatBot.tsx` component into the Docusaurus layout (global wrapper).

### Key Entities *(include if feature involves data)*

-   **ChatHistory**: Represents a stored chat message.
    -   `session_id` (UUID): Unique identifier for the chat session.
    -   `message_id` (UUID): Unique identifier for the message.
    -   `timestamp` (datetime): Time the message was sent/received.
    -   `sender` (enum: 'user', 'bot'): Who sent the message.
    -   `text` (string): The content of the message.
    -   `feedback` (integer, optional: -1, 0, 1): User feedback on bot answers.
-   **FeedbackRequest**: Pydantic model for `/api/feedback` endpoint.
    -   `message_id` (UUID): The ID of the message being rated.
    -   `rating` (integer): The rating (e.g., -1 for thumbs down, 1 for thumbs up).

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: Backend successfully connects to Neon Postgres via `DATABASE_URL`.
-   **SC-002**: Chat history for a `sessionId` is retrieved from Postgres and displayed in the UI within 2 seconds of loading a session.
-   **SC-003**: Feedback submitted via `/api/feedback` is recorded in Postgres within 1 second.
-   **SC-004**: Switching to Urdu language displays at least 80% of UI elements in Urdu and correctly applies RTL layout.
-   **SC-005**: Chatbot conversations, including history, persist and load correctly across browser sessions for a given `sessionId`.
```