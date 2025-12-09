# Data Model: Chatbot with History (Neon Postgres) and Urdu Localization

This document defines the SQL models and Pydantic models used for data persistence and exchange in the Chatbot with History and Urdu Localization feature.

## SQL Models (for PostgreSQL via SQLAlchemy)

### ChatHistory Table

-   **Description**: Stores individual chat messages for conversation history.
-   **Table Name**: `chat_history`
-   **Fields**:
    -   `message_id` (UUID, Primary Key): Globally unique identifier for the message.
    -   `session_id` (UUID, Not Null, Index): Identifier for the chat session.
    -   `timestamp` (DateTime, Not Null): Timestamp of the message creation.
    -   `sender` (String, Not Null): 'user' or 'bot'.
    -   `text` (Text, Not Null): Content of the chat message.
    -   `feedback` (Integer, Optional): User feedback (-1, 0, or 1) on bot messages.

### Feedback Table

-   **Description**: Stores user feedback on bot answers.
-   **Table Name**: `feedback`
-   **Fields**:
    -   `feedback_id` (UUID, Primary Key): Unique identifier for the feedback entry.
    -   `message_id` (UUID, Foreign Key to ChatHistory, Not Null): The ID of the message being rated.
    -   `rating` (Integer, Not Null): The rating (-1 for thumbs down, 1 for thumbs up).
    -   `timestamp` (DateTime, Not Null): Timestamp of when the feedback was provided.

## Pydantic Models (for API Request/Response)

### ChatRequest (Updated)

-   **Description**: Represents a request to the `/api/chat` endpoint, now including `session_id`.
-   **Fields**:
    -   `query` (string): The user's question or prompt.
    -   `session_id` (UUID): Unique identifier for the chat session.

### ChatResponse (Updated)

-   **Description**: Represents a response from the `/api/chat` endpoint, now including `message_id` for feedback.
-   **Fields**:
    -   `message_id` (UUID): Globally unique identifier for the bot's response message.
    -   `answer` (string): The LLM-generated answer.
    -   `context` (List[string]): A list of text snippets used as context for the answer.

### AskSelectionRequest (Updated)

-   **Description**: Represents a request to the `/api/ask-selection` endpoint, now including `session_id`.
-   **Fields**:
    -   `selection` (string): The user-selected text snippet from the textbook.
    -   `question` (string): A specific question about the selected text.
    -   `session_id` (UUID): Unique identifier for the chat session.

### FeedbackRequest (Updated)

-   **Description**: Pydantic model for `/api/feedback` endpoint.
-   **Fields**:
    -   `message_id` (UUID): The globally unique ID of the message being rated.
    -   `rating` (integer): The rating (-1 for thumbs down, 1 for thumbs up).
