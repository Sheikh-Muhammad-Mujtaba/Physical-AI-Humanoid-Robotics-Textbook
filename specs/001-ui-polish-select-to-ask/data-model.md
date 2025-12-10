# Data Model: UI Polish, Select-to-Ask, and Deployment Fixes

This feature introduces two key data entities.

## Query

- **Description**: Represents the text highlighted by the user to be sent to the AI.
- **Attributes**:
  - `text`: string - The highlighted text.
- **Validation**:
  - The `text` attribute must not be empty.

## Chat State

- **Description**: Represents the current state of the chat widget.
- **Attributes**:
  - `isOpen`: boolean - Whether the chat widget is open or closed.
  - `conversation`: Array of `Message` objects - The history of the conversation.
- **State Transitions**:
  - The `isOpen` attribute can be toggled by the user clicking the chat bubble or the close button.

## Message

- **Description**: Represents a single message in the conversation.
- **Attributes**:
  - `sender`: string ("user" or "ai") - The sender of the message.
  - `text`: string - The content of the message.
