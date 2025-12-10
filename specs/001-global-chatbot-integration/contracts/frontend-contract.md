# Frontend Contracts: Global Chatbot Integration (Root Architecture)

**Feature Branch**: `001-global-chatbot-integration`
**Created**: 2025-12-10

## Chat Context Interface

This document describes the interface for the global Chat Context, which is the centralized state management system for the chatbot UI. This context provides the necessary data and functions for any component in the application to interact with and control the chatbot.

### State (`ChatContextState`)

The `ChatContextState` represents the data managed by the global Chat Context.

*   `isOpen`: `boolean`
    *   **Description**: Indicates whether the chatbot UI is currently expanded (`true`) or collapsed (`false`).
*   `sessionId`: `string | null`
    *   **Description**: A unique identifier for the current chat session. `null` if no session is active.
*   `messages`: `Array<ChatMessage>`
    *   **Description**: An ordered list of `ChatMessage` objects representing the conversation history.
*   `selectedText`: `string | null`
    *   **Description**: The text currently selected by the user, if any. `null` if no text is selected.

### Functions (`ChatContextFunctions`)

The `ChatContextFunctions` are the methods exposed by the global Chat Context for other components to interact with the chatbot state and functionality.

*   `openChat()`: `() => void`
    *   **Description**: Expands the chatbot UI, setting `isOpen` to `true`.
*   `closeChat()`: `() => void`
    *   **Description**: Collapses the chatbot UI, setting `isOpen` to `false`.
*   `handleSelection(text: string | null)`: `(text: string | null) => void`
    *   **Description**: Updates the `selectedText` in the context. If `text` is not `null`, it may also trigger `openChat()`.
*   `sendMessage(text: string)`: `(text: string) => Promise<void>`
    *   **Description**: Adds a new user message to the `messages` array and dispatches it to the backend chat service. Returns a Promise that resolves when the message is sent.

### Backend Communication (`BackendChatService` - Existing)

This feature *preserves* the existing backend communication. The global Chat Context will internally utilize an existing `BackendChatService` (or similar mechanism) for:

*   Retrieving historical chat messages for a given `sessionId`.
*   Sending user messages to the AI model.
*   Receiving AI responses.
*   Handling feedback mechanisms.

**Note**: This contract describes the frontend-facing interface of the new global chatbot state. Specific backend API endpoints are assumed to exist and are not defined here.
