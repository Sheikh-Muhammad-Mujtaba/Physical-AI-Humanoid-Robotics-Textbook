# Data Model: Global Chatbot Integration (Root Architecture)

**Feature Branch**: `001-global-chatbot-integration`
**Created**: 2025-12-10

## Entities

### Chatbot Widget

*   **Description**: The interactive, globally accessible UI component that serves as the primary interface for user interaction with the AI assistant. It can be expanded to show conversation history or collapsed into a floating action button.
*   **Attributes**:
    *   `isVisible` (boolean): Controls the overall display of the widget (collapsed or expanded).
    *   `position` (enum: `bottom-right`): Fixed position on the screen.
    *   `toggleState` (enum: `expanded`, `collapsed`): Current visual state of the widget.
*   **Relationships**: Controlled by `Chat Context`. Displays `Chat Message`s.

### Text Selection Button

*   **Description**: A transient UI element that appears when a user selects text on a page. Its purpose is to invoke the global chatbot instance with the selected text as context.
*   **Attributes**:
    *   `isVisible` (boolean): Controls the visibility of the button, typically only when text is selected.
    *   `selectedText` (string): The text highlighted by the user.
*   **Relationships**: Triggers actions in `Chat Context`.

### Chat Context

*   **Description**: A centralized data store responsible for managing the global state and behavior of the chatbot across the entire application. It acts as the single source of truth for all chatbot-related data.
*   **Attributes**:
    *   `isOpen` (boolean): Indicates whether the chatbot UI is expanded (`true`) or collapsed (`false`).
    *   `sessionId` (string): A unique identifier for the current chat session, ensuring conversation continuity.
    *   `messages` (array of `Chat Message`): The historical record of the current conversation.
    *   `selectedText` (string): Stores the text that was last selected by the user, if any, to provide context for new conversations.
*   **Operations (Exposed Functions)**:
    *   `openChat()`: Sets `isOpen` to `true`, expanding the chatbot UI.
    *   `handleSelection(text: string)`: Updates `selectedText` and potentially triggers `openChat()`.
    *   `sendMessage(text: string)`: Adds a new user `Chat Message` to `messages`, and sends it to the backend.
*   **Relationships**: Manages `Chatbot Widget` state. Contains `Chat Message`s.

### Chat Message

*   **Description**: Represents a single turn in the conversation between the user and the AI.
*   **Attributes**:
    *   `content` (string): The actual text of the message.
    *   `sender` (enum: `user`, `ai`): Identifies who sent the message.
    *   `timestamp` (datetime): The time when the message was sent or received.
    *   `status` (enum: `sent`, `received`, `pending`, `error`): Current status of the message transmission.
*   **Relationships**: Contained within `Chat Context`.

### Session ID

*   **Description**: A unique identifier that tracks a continuous conversation session with the AI backend. It ensures that context is maintained across multiple user interactions and page navigations.
*   **Attributes**:
    *   `value` (string): The actual unique identifier.
*   **Relationships**: Managed by `Chat Context`. Used in communication with the `Existing Backend Chat Service`.