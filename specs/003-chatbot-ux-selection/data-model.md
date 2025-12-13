# Data Model: Chatbot UX with WhatsApp-Style Selection

**Feature**: 003-chatbot-ux-selection
**Date**: 2025-12-13

## Entities

### 1. Selection Context (Frontend State)

Represents the text selected by the user from the textbook.

| Field | Type | Description |
| ----- | ---- | ----------- |
| selectedText | string \| null | The text content selected by the user |

**State Transitions**:
```
null → string    : User selects text and clicks "Ask AI"
string → string  : User selects different text
string → null    : User dismisses selection OR message sent
```

**Validation Rules**:
- Must be non-empty string when set
- Whitespace-only selections are treated as null

---

### 2. Chat Message (Frontend State)

Represents a message in the chat conversation.

| Field | Type | Description |
| ----- | ---- | ----------- |
| content | string | Message text content |
| sender | 'user' \| 'ai' | Who sent the message |
| timestamp | Date | When message was created |
| status | 'sent' \| 'received' \| 'pending' \| 'error' | Message delivery status |

**Validation Rules**:
- content must be non-empty
- sender must be valid enum value
- timestamp must be valid Date

---

### 3. Chat Session (Frontend State)

Represents the user's chat session.

| Field | Type | Description |
| ----- | ---- | ----------- |
| sessionId | string (UUID) | Unique session identifier |
| isOpen | boolean | Whether chat widget is expanded |
| messages | ChatMessage[] | Conversation history |
| isLoading | boolean | Whether waiting for AI response |

**Lifecycle**:
- sessionId generated on first load (UUID v4)
- Persists in memory during page session
- Not persisted across browser sessions (by design)

---

### 4. Chat History (Backend Database)

Persisted chat messages in PostgreSQL.

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| message_id | UUID | Primary Key, auto-generated |
| session_id | UUID | Not Null, indexed |
| sender | string | 'user' or 'bot' |
| text | text | Message content |
| timestamp | datetime | Default: now() |

**Relationships**:
- Many messages per session (session_id)
- Feedback links to message_id

---

### 5. Feedback (Backend Database)

User feedback on AI responses.

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| feedback_id | UUID | Primary Key, auto-generated |
| message_id | UUID | Foreign Key → ChatHistory |
| rating | integer | 1-5 scale |
| created_at | datetime | Default: now() |

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Select Text   │    │ Click Ask AI  │    │ Send Message  │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Show Button   │    │ Store in      │    │ Check for     │
│ at Selection  │    │ Context +     │    │ Selection     │
└───────────────┘    │ Open Chat     │    └───────┬───────┘
                     └───────────────┘            │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                   ┌───────────┐   ┌───────────┐
                                   │ Has       │   │ No        │
                                   │ Selection │   │ Selection │
                                   └─────┬─────┘   └─────┬─────┘
                                         │               │
                                         ▼               ▼
                                   ┌───────────┐   ┌───────────┐
                                   │ POST      │   │ POST      │
                                   │ /ask-     │   │ /chat     │
                                   │ selection │   │           │
                                   └─────┬─────┘   └─────┬─────┘
                                         │               │
                                         └───────┬───────┘
                                                 ▼
                                         ┌───────────────┐
                                         │ Clear         │
                                         │ Selection     │
                                         │ Show Response │
                                         └───────────────┘
```

## API Data Contracts

See `contracts/` directory for OpenAPI specifications.

### Request/Response Summary

| Endpoint | Request | Response |
| -------- | ------- | -------- |
| POST /api/chat | `{ query, session_id }` | `{ message_id, answer, context }` |
| POST /api/ask-selection | `{ selection, question, session_id }` | `{ message_id, answer, context }` |
| GET /api/history/{session_id} | - | `[{ message_id, sender, text, timestamp }]` |
| POST /api/feedback | `{ message_id, rating }` | `{ status }` |
