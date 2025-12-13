# Implementation Tasks: Chatbot UX with WhatsApp-Style Selection

**Feature**: 003-chatbot-ux-selection
**Branch**: `003-chatbot-ux-selection`
**Date**: 2025-12-13
**Status**: COMPLETED
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Summary

| Phase | Description | Task Count | Status |
| ----- | ----------- | ---------- | ------ |
| Phase 1 | Setup | 2 | DONE |
| Phase 2 | Foundational | 3 | DONE |
| Phase 3 | US1: Select Text and Ask AI | 4 | DONE |
| Phase 4 | US2: WhatsApp-Style Selection Display | 3 | DONE |
| Phase 5 | US3: Clear Selection Context | 2 | DONE |
| Phase 6 | US4: Intelligent AI Response | 2 | DONE |
| Phase 7 | US5: Auto-Scroll and Loading | 2 | DONE |
| Phase 8 | Polish & Integration | 3 | DONE |
| **Total** | | **21** | **DONE** |

## Dependencies

```
Phase 1 (Setup) ✓
    ↓
Phase 2 (Foundational) ✓
    ↓
    ├── Phase 3 (US1) ✓ ────────────────┐
    │       ↓                           │
    ├── Phase 4 (US2) ✓ ← depends on US1│
    │       ↓                           │
    ├── Phase 5 (US3) ✓ ← depends on US2│
    │                                   │
    ├── Phase 6 (US4) ✓ ← depends on US1│
    │                                   │
    └── Phase 7 (US5) ✓ ← independent   │
                                        ↓
                               Phase 8 (Polish) ✓
```

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) delivers core functionality

---

## Phase 1: Setup

**Goal**: Ensure project structure and dependencies are ready
**Status**: COMPLETED

- [x] T001 Verify requirements.txt exists at project root with all Python dependencies
- [x] T002 Verify vercel.json is configured for Python serverless functions at `vercel.json`

---

## Phase 2: Foundational

**Goal**: Establish shared infrastructure used by all user stories
**Status**: COMPLETED

- [x] T003 Ensure ChatContext exports `handleSelection` function in `src/contexts/ChatContext.tsx`
- [x] T004 Ensure chatApi.ts has `askSelectionWithBackend` function in `src/lib/chatApi.ts`
- [x] T005 Ensure Root.tsx renders both TextSelectionButton and ChatbotWidget in `src/theme/Root.tsx`

---

## Phase 3: User Story 1 - Select Text and Ask AI (P1)

**Goal**: Users can select text and have AI respond with selection context
**Status**: COMPLETED

**Independent Test**: Select text → Click "Ask AI" → Type question → Receive contextual response

### Tasks

- [x] T006 [US1] Implement text selection detection with mouseup event listener in `src/components/TextSelectionButton.tsx`
- [x] T007 [US1] Implement button positioning above selection using getBoundingClientRect in `src/components/TextSelectionButton.tsx`
- [x] T008 [US1] Implement click handler to store selection and open chat in `src/components/TextSelectionButton.tsx`
- [x] T009 [US1] Implement selection-aware message routing in sendMessage function in `src/contexts/ChatContext.tsx`

---

## Phase 4: User Story 2 - WhatsApp-Style Selection Display (P1)

**Goal**: Selected text appears in visually distinct quote block
**Status**: COMPLETED

**Independent Test**: Open chat with selection → Quote block visible with label, text, dismiss button

**Depends on**: US1 (selection must be stored in context)

### Tasks

- [x] T010 [US2] Create WhatsApp-style quote block component with Tailwind styling in `src/components/ChatbotWidget.tsx`
- [x] T011 [US2] Implement text truncation (120 chars) with ellipsis in `src/components/ChatbotWidget.tsx`
- [x] T012 [US2] Add "Selected from book:" label and styled container in `src/components/ChatbotWidget.tsx`

---

## Phase 5: User Story 3 - Clear Selection Context (P2)

**Goal**: Users can dismiss selection before asking question
**Status**: COMPLETED

**Independent Test**: Open chat with selection → Click X → Quote disappears → Send message without context

**Depends on**: US2 (quote block must exist to dismiss)

### Tasks

- [x] T013 [US3] Add dismiss button (X icon) to quote block in `src/components/ChatbotWidget.tsx`
- [x] T014 [US3] Implement clearSelection handler calling handleSelection(null) in `src/components/ChatbotWidget.tsx`

---

## Phase 6: User Story 4 - Intelligent AI Response (P1)

**Goal**: AI provides educational, contextual explanations
**Status**: COMPLETED

**Independent Test**: Ask "What does this mean?" about selection → Response acknowledges selection, explains concept, provides examples

**Depends on**: US1 (selection must be sent to backend)

### Tasks

- [x] T015 [US4] Implement comprehensive educational system prompt in `/api/ask-selection` endpoint in `api/index.py`
- [x] T016 [US4] Add instructions for acknowledging selection, explaining concepts, providing examples in `api/index.py`

---

## Phase 7: User Story 5 - Auto-Scroll and Loading (P3)

**Goal**: Chat auto-scrolls and shows loading indicator
**Status**: COMPLETED

**Independent Test**: Send message → See loading dots → Response appears → Chat scrolls to bottom

**Independent**: No dependencies on other user stories

### Tasks

- [x] T017 [P] [US5] Implement auto-scroll using useRef and scrollIntoView in `src/components/ChatbotWidget.tsx`
- [x] T018 [P] [US5] Add animated loading dots with staggered bounce animation in `src/components/ChatbotWidget.tsx`

---

## Phase 8: Polish & Integration

**Goal**: Final integration, edge cases, and UX polish
**Status**: COMPLETED

### Tasks

- [x] T019 Clear browser text selection after "Ask AI" click in `src/components/TextSelectionButton.tsx`
- [x] T020 Add dynamic placeholder text based on selection state in `src/components/ChatbotWidget.tsx`
- [x] T021 Test full flow: select → ask → respond → dismiss → general question

---

## Parallel Execution Opportunities

### Within Phase 3 (US1)
- T006 and T007 can run in parallel (both modify TextSelectionButton but different functions)

### Within Phase 7 (US5)
- T017 and T018 can run in parallel (different features in same file)

### Across Phases
- Phase 6 (US4 - backend) can run in parallel with Phase 4 (US2 - frontend quote display)
- Phase 7 (US5 - loading/scroll) can run in parallel with Phase 5 (US3 - dismiss)

---

## Implementation Strategy

### MVP Delivery (Phases 1-3)
Delivers core value: Users can select text and get AI responses

### Incremental Delivery
1. **MVP**: Phases 1-3 (core selection + AI response) ✓
2. **Visual Polish**: Phase 4 (WhatsApp-style display) ✓
3. **UX Enhancement**: Phase 5 (dismiss selection) ✓
4. **AI Quality**: Phase 6 (better prompts) ✓
5. **Final Polish**: Phases 7-8 (loading states, integration) ✓

---

## Validation Checklist

Feature completion verification:

- [x] Text selection triggers "Ask AI" button
- [x] Button positioned correctly above selection
- [x] Clicking button opens chat with selection context
- [x] Quote block displays with proper styling
- [x] Long text truncated with ellipsis
- [x] Dismiss button clears selection
- [x] Messages route to correct API endpoint
- [x] AI responses acknowledge selection content
- [x] Loading indicator visible during API call
- [x] Chat auto-scrolls to new messages
- [x] Error messages are user-friendly

---

## Implementation Notes

**Completed**: 2025-12-13

All tasks were implemented in the following files:
- `src/components/TextSelectionButton.tsx` - Selection detection and "Ask AI" button
- `src/components/ChatbotWidget.tsx` - WhatsApp-style quote, loading, auto-scroll
- `src/contexts/ChatContext.tsx` - Selection state management and API routing
- `api/index.py` - Enhanced `/api/ask-selection` endpoint with educational prompt

**Pending**: Qdrant RAG ingestion (blocked by Google API quota - run `python scripts/ingest_qdrant.py` when quota resets)
