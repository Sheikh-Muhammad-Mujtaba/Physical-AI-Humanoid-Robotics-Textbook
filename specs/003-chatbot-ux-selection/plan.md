# Implementation Plan: Chatbot UX with WhatsApp-Style Selection

**Branch**: `003-chatbot-ux-selection` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-chatbot-ux-selection/spec.md`

## Summary

Implement an enhanced chatbot UX that enables students to select text from the Physical AI textbook and ask contextual questions about that selection. The implementation includes a WhatsApp-style quoted message display for selections, an improved backend prompt for educational responses, and UX polish including auto-scroll and loading indicators.

**Key Components**:
1. TextSelectionButton - Floating "Ask AI" button on text selection
2. ChatbotWidget - WhatsApp-style selection quote display with dismiss functionality
3. ChatContext - State management for selection context and API routing
4. Backend API - Enhanced `/api/ask-selection` endpoint with educational system prompt

## Technical Context

**Language/Version**: TypeScript 5.6 (Frontend), Python 3.11 (Backend)
**Primary Dependencies**:
- Frontend: React 19, Docusaurus 3.9, Tailwind CSS 3.4, Framer Motion
- Backend: FastAPI, OpenAI Agents SDK, Qdrant Client, SQLAlchemy
**Storage**: PostgreSQL (chat history), Qdrant (vector embeddings for RAG)
**Testing**: Manual testing (no automated test framework currently configured)
**Target Platform**: Web browsers (desktop-first, responsive)
**Project Type**: Web application (Docusaurus frontend + Python API backend)
**Performance Goals**: AI response within 10 seconds, UI remains responsive during loading
**Constraints**: Gemini API quota limits, Vercel serverless function timeout (60s max)
**Scale/Scope**: Single textbook, multiple concurrent users via session-based chat

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is currently a template (not project-specific). Applying general best practices:

| Principle | Status | Notes |
| --------- | ------ | ----- |
| Simplicity | PASS | Minimal changes to existing components |
| Test Coverage | WARN | No automated tests - manual testing required |
| Code Quality | PASS | TypeScript strict mode, type-safe components |
| Security | PASS | No sensitive data exposed, API uses session-based auth |

## Project Structure

### Documentation (this feature)

```text
specs/003-chatbot-ux-selection/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
├── checklists/          # Validation checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Frontend (Docusaurus + React)
src/
├── components/
│   ├── ChatbotWidget.tsx       # Main chat UI with WhatsApp-style quote
│   ├── TextSelectionButton.tsx # Floating "Ask AI" button
│   ├── MessageBubble.tsx       # Chat message display
│   └── AnimatedAvatar.tsx      # AI avatar animation
├── contexts/
│   └── ChatContext.tsx         # Chat state management
├── lib/
│   ├── chatApi.ts              # API client functions
│   └── ChatProvider.tsx        # Context provider wrapper
├── theme/
│   └── Root.tsx                # Global component injection
└── css/
    └── custom.css              # Tailwind + custom styles

# Backend (Python FastAPI)
api/
├── index.py                    # Main FastAPI app with endpoints
├── utils/
│   ├── config.py               # Environment configuration
│   ├── database.py             # Database connection
│   ├── models.py               # Pydantic request/response models
│   ├── sql_models.py           # SQLAlchemy ORM models
│   └── tools.py                # RAG search tools
└── requirements.txt            # Python dependencies

# Root level
├── requirements.txt            # Vercel Python dependencies
├── vercel.json                 # Vercel deployment config
└── package.json                # Node.js dependencies
```

**Structure Decision**: Web application structure with Docusaurus frontend and FastAPI backend. Frontend components in `src/`, backend API in `api/`. This matches the existing project layout.

## Implementation Approach

### Phase 1: Frontend Components

**1.1 TextSelectionButton Component**
- Detect mouse selection events on document
- Calculate button position (above selection, centered)
- On click: store selection in context, open chat, clear browser selection
- Hide button when clicking elsewhere or when selection is empty

**1.2 ChatbotWidget Component**
- Display WhatsApp-style quote block when `selectedText` exists in context
- Quote block shows: label, truncated text (120 chars), dismiss button
- Input placeholder changes based on selection state
- Auto-scroll to bottom on new messages
- Animated loading indicator (bouncing dots)
- Wider chat window (384px) for better readability

**1.3 ChatContext Updates**
- Track `selectedText` in context state
- Route messages to appropriate API endpoint based on selection
- Clear selection after sending message with context
- Display selection reference in user message bubble

### Phase 2: Backend API

**2.1 Enhanced Ask-Selection Endpoint**
- Comprehensive educational system prompt
- Instructions to: acknowledge selection, answer question, explain concepts, provide examples
- Use search_tool for RAG context retrieval
- Store conversation in chat history

**2.2 API Contract**
```
POST /api/ask-selection
Request: { selection: string, question: string, session_id: string }
Response: { message_id: string, answer: string, context: array }
```

### Phase 3: Integration & Polish

**3.1 Component Integration**
- TextSelectionButton injected via Root.tsx
- ChatbotWidget always visible (collapsed by default)
- Smooth transitions between states

**3.2 UX Polish**
- Loading state with animated dots
- Auto-scroll behavior
- Error handling with friendly messages
- Responsive design adjustments

## Complexity Tracking

No constitution violations requiring justification. Implementation follows existing patterns.

## Risk Assessment

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| API quota exceeded | High | Graceful error message, retry guidance |
| Long AI response time | Medium | Loading indicator, timeout handling |
| Selection in chatbot itself | Low | Selection button only triggers outside chat |
| Very long selections | Low | Truncate display, send full text to API |

## Dependencies

- Existing ChatContext and chatApi infrastructure
- Vercel deployment configuration
- Gemini API access (via GEMINI_API_KEY)
- Qdrant vector database (for RAG)
- PostgreSQL database (for chat history)
