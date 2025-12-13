# Research: Chatbot UX with WhatsApp-Style Selection

**Feature**: 003-chatbot-ux-selection
**Date**: 2025-12-13
**Status**: Complete

## Research Questions

### 1. Text Selection Detection in React

**Decision**: Use native browser `mouseup` event listener with `window.getSelection()` API

**Rationale**:
- Native browser API provides reliable cross-browser text selection
- No additional library dependencies required
- `getBoundingClientRect()` on selection range provides accurate positioning
- React `useCallback` and `useEffect` hooks manage event listeners cleanly

**Alternatives Considered**:
| Alternative | Why Rejected |
| ----------- | ------------ |
| Selection library (rangy.js) | Overkill for simple selection detection, adds bundle size |
| MutationObserver | More complex, designed for DOM changes not selection |
| Touch events | Out of scope for initial implementation (desktop-first) |

### 2. WhatsApp-Style Quote Block Design

**Decision**: Use Tailwind CSS with left border accent, light background, and compact layout

**Rationale**:
- WhatsApp pattern is universally recognized by users
- Left border (4px) provides clear visual distinction
- Blue accent color matches primary brand color
- Truncation with ellipsis keeps UI clean for long selections
- Close button (X icon) provides clear dismiss affordance

**Design Specifications**:
```
- Container: bg-blue-50 dark:bg-blue-900/30, rounded-lg, p-2
- Left border: border-l-4 border-primary (4px solid)
- Label: text-xs, font-medium, text-primary
- Quote text: text-xs, italic, text-gray-600, line-clamp-2
- Close button: 16x16 icon, absolute position top-right
```

**Alternatives Considered**:
| Alternative | Why Rejected |
| ----------- | ------------ |
| Modal/popup for selection | Interrupts reading flow, bad UX |
| Inline highlight | Complex to implement, selection disappears on click |
| Separate selection panel | Takes up too much screen space |

### 3. Selection Context State Management

**Decision**: Store selection in existing ChatContext, clear after message sent

**Rationale**:
- Reuses existing context infrastructure
- Single source of truth for selection state
- Natural lifecycle: select → display → send → clear
- Allows user to dismiss selection before sending

**State Flow**:
```
1. User selects text → handleSelection(text) → selectedText set
2. User clicks "Ask AI" → openChat() → chat opens with quote visible
3. User types question → sendMessage(text)
4. If selectedText exists → call askSelectionWithBackend() → clear selectedText
5. If no selectedText → call chatWithBackend()
```

**Alternatives Considered**:
| Alternative | Why Rejected |
| ----------- | ------------ |
| Separate SelectionContext | Unnecessary complexity, tightly coupled to chat |
| localStorage persistence | Out of scope, selection is ephemeral |
| URL parameter | Complicates navigation, not needed |

### 4. Backend Prompt Engineering for Educational Responses

**Decision**: Comprehensive system prompt with explicit instructions for educational responses

**Rationale**:
- AI needs clear guidance to act as tutor, not just Q&A bot
- Structured instructions ensure consistent response quality
- Explicit mention of analogies/examples encourages helpful responses
- RAG integration via search_tool provides textbook context

**Prompt Structure**:
```
1. Role definition: "expert AI tutor"
2. Context: Display the selected text
3. Question: User's specific question
4. Instructions:
   - Acknowledge selection
   - Answer directly
   - Explain in simple terms
   - Provide examples/analogies
   - Define technical terms
   - Use search_tool for additional context
```

**Alternatives Considered**:
| Alternative | Why Rejected |
| ----------- | ------------ |
| Minimal prompt | Responses too generic, not educational |
| Few-shot examples | Increases token usage, maintenance burden |
| Fine-tuned model | Out of scope, requires training infrastructure |

### 5. Loading State UX

**Decision**: Animated bouncing dots indicator with disabled input

**Rationale**:
- Bouncing dots is a familiar chat loading pattern
- Disabling input prevents duplicate submissions
- Animation provides visual feedback that system is working
- Lightweight CSS animation, no JS timer overhead

**Implementation**:
```tsx
// Three dots with staggered animation delays
<span className="animate-bounce" style={{ animationDelay: '0ms' }}></span>
<span className="animate-bounce" style={{ animationDelay: '150ms' }}></span>
<span className="animate-bounce" style={{ animationDelay: '300ms' }}></span>
```

**Alternatives Considered**:
| Alternative | Why Rejected |
| ----------- | ------------ |
| Skeleton loader | Overkill for single message response |
| Spinner icon | Less contextual for chat interface |
| Progress bar | AI response time unpredictable |

## Technology Decisions Summary

| Component | Technology | Justification |
| --------- | ---------- | ------------- |
| Selection detection | Native browser API | No dependencies, reliable |
| Quote styling | Tailwind CSS | Consistent with project, responsive |
| State management | React Context | Existing infrastructure |
| API communication | Fetch API | Existing chatApi.ts patterns |
| Loading animation | CSS keyframes | Lightweight, no JS overhead |
| Backend prompt | Structured system prompt | Explicit educational guidance |

## Resolved Clarifications

All technical decisions have been made. No outstanding clarifications needed.

## Next Steps

Proceed to Phase 1: Data Model and API Contracts
