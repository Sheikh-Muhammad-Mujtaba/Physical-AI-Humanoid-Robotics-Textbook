# Implementation Tasks: Ask AI Button Full-Page Integration

**Feature**: 002-chatbot-ask-ai-improvements
**Status**: Ready for Implementation
**Priority**: High
**Estimated Effort**: 4-6 hours

---

## Task Breakdown

### Phase 1: Core Text Selection Button Refactor

#### Task 1.1: Refactor Button State Management
**Objective**: Convert separate state variables to atomic state object
**File**: `src/components/TextSelectionButton.tsx`
**Acceptance Criteria**:
- [ ] Single `buttonState` object exists with `{position, text, top, left}`
- [ ] All state updates use `setButtonState()` atomically
- [ ] Button only renders when both `left` and `top` are not null
- [ ] No separate calls to multiple setState functions
**Subtasks**:
- [ ] Read current TextSelectionButton implementation
- [ ] Create new state structure definition
- [ ] Update useState hook to new structure
- [ ] Update all setState calls to use new structure
- [ ] Test in browser - button should render

**Time Estimate**: 30 min
**Complexity**: Low

---

#### Task 1.2: Implement Viewport-Relative Coordinates
**Objective**: Fix positioning to use viewport coordinates instead of scroll-based
**File**: `src/components/TextSelectionButton.tsx` (getSelectionCoords function)
**Acceptance Criteria**:
- [ ] `getBoundingClientRect()` used directly without scroll calculations
- [ ] `left` = rect.left + rect.width / 2 (centered)
- [ ] `top` = rect.top - 50 (above selection)
- [ ] Fallback to `top` = rect.bottom + 10 if above goes off-screen
- [ ] Viewport boundary checks prevent button going outside window
- [ ] Console logs show correct viewport coordinates
**Subtasks**:
- [ ] Remove all `scrollX` and `scrollY` calculations
- [ ] Implement viewport-relative positioning logic
- [ ] Add fallback positioning (above → below)
- [ ] Add viewport boundary checks
- [ ] Add debug logging
- [ ] Test positioning at top, middle, bottom of page

**Time Estimate**: 45 min
**Complexity**: Medium

---

#### Task 1.3: Fix Scroll Handler to Not Clear Button
**Objective**: Scroll handler should update position, not clear button
**File**: `src/components/TextSelectionButton.tsx` (useEffect with scroll listener)
**Acceptance Criteria**:
- [ ] Scroll handler checks if button is visible first
- [ ] Button position updated via `getSelectionCoords()` while scrolling
- [ ] Button only cleared if `getSelectionCoords()` returns null
- [ ] Debounce set to 50ms
- [ ] Console logs show position updates on scroll
**Subtasks**:
- [ ] Read current scroll handler implementation
- [ ] Change logic from "clear if no selection" to "only clear if coords fail"
- [ ] Update `setButtonState()` to include new left/top values
- [ ] Test scrolling after selection - button should stay visible
- [ ] Test scrolling while button tracks selected text

**Time Estimate**: 30 min
**Complexity**: Low

---

#### Task 1.4: Add Multiple Event Listeners
**Objective**: Detect text selection via multiple methods
**File**: `src/components/TextSelectionButton.tsx` (useEffect)
**Acceptance Criteria**:
- [ ] `mouseup` event listener added
- [ ] `touchend` event listener added (mobile support)
- [ ] `selectionchange` event listener added
- [ ] `keyup` event listener added (Shift+Arrow detection)
- [ ] All listeners properly cleaned up in useEffect cleanup
- [ ] Console logs for each event type
**Subtasks**:
- [ ] Add touchend listener
- [ ] Add selectionchange listener with 50ms setTimeout
- [ ] Add keyup listener for Shift+Arrow combinations
- [ ] Update cleanup function to remove all listeners
- [ ] Test each selection method

**Time Estimate**: 30 min
**Complexity**: Low

---

#### Task 1.5: Update Button Rendering
**Objective**: Render button with correct fixed positioning and styling
**File**: `src/components/TextSelectionButton.tsx` (render section)
**Acceptance Criteria**:
- [ ] Button renders only if `left` and `top` exist
- [ ] Uses `position: fixed` with viewport coordinates
- [ ] `left` style uses `${buttonState.left}px`
- [ ] `top` style uses `${buttonState.top}px`
- [ ] Transform: `translateX(-50%)` centers horizontally
- [ ] z-index: `z-[9999]` ensures visibility
- [ ] Button appears above text when clicking
**Subtasks**:
- [ ] Update render condition check
- [ ] Update style object with new coordinate names
- [ ] Verify CSS classes and styling
- [ ] Test rendering at different screen positions

**Time Estimate**: 20 min
**Complexity**: Low

---

### Phase 2: Chat Auto-Mention Feature

#### Task 2.1: Add Auto-Insert useEffect in ChatbotWidget
**Objective**: Auto-insert selected text into chat input when chat opens
**File**: `src/components/ChatbotWidget.tsx`
**Acceptance Criteria**:
- [ ] useEffect triggers when `isOpen && selectedText && !inputMessage`
- [ ] Mention format: `📌 "{text...}"\n`
- [ ] Text truncated at 100 characters with ellipsis
- [ ] Only inserts if input is empty (doesn't override user text)
- [ ] Console log confirms insertion
**Subtasks**:
- [ ] Add useEffect after auto-scroll useEffect
- [ ] Implement mention text formatting
- [ ] Add text truncation logic
- [ ] Test opening chat with selected text
- [ ] Test that existing input isn't overwritten

**Time Estimate**: 20 min
**Complexity**: Low

---

#### Task 2.2: Update ChatContext Message Formatting
**Objective**: Format message with visible mention when selected text exists
**File**: `src/contexts/ChatContext.tsx` (sendMessage function)
**Acceptance Criteria**:
- [ ] `selectedText` captured as `currentSelectedText` before clearing
- [ ] Message format: `📌 "{text}"\n\nQ: {message}`
- [ ] Text truncated at 80 characters
- [ ] Both paths (with/without selection) work correctly
- [ ] Debug logging shows captured text and formatted message
**Subtasks**:
- [ ] Add empty message validation
- [ ] Capture selectedText before it might clear
- [ ] Update userMessageContent formatting
- [ ] Update both selectedText and non-selectedText paths
- [ ] Add comprehensive logging
- [ ] Test sending message with and without selection

**Time Estimate**: 30 min
**Complexity**: Medium

---

### Phase 3: Testing & Validation

#### Task 3.1: Unit Tests
**Objective**: Create unit tests for positioning and state logic
**File**: `src/components/__tests__/TextSelectionButton.test.tsx`
**Acceptance Criteria**:
- [ ] Test `getSelectionCoords()` returns correct coordinates
- [ ] Test button renders only with both left and top
- [ ] Test scroll handler updates position
- [ ] Test scroll handler only clears on selection loss
- [ ] Test state object updates atomically
**Subtasks**:
- [ ] Set up test file and imports
- [ ] Create mock Selection API
- [ ] Write positioning tests
- [ ] Write state management tests
- [ ] Run tests and verify passing

**Time Estimate**: 1 hour
**Complexity**: Medium

---

#### Task 3.2: Integration Tests
**Objective**: Test complete flow from selection to chat message
**File**: `src/__tests__/integration/ask-ai-flow.test.tsx`
**Acceptance Criteria**:
- [ ] Text selection → button appears
- [ ] Button click → chat opens with mention in input
- [ ] User types → mention + question in input
- [ ] Send message → API receives both
**Subtasks**:
- [ ] Set up integration test environment
- [ ] Mock chat API calls
- [ ] Write end-to-end flow test
- [ ] Run and verify

**Time Estimate**: 1 hour
**Complexity**: Medium

---

#### Task 3.3: Manual Testing Protocol
**Objective**: Execute comprehensive manual testing across devices
**Acceptance Criteria**:
- [ ] Desktop browser: text selection at top/middle/bottom
- [ ] Desktop browser: scrolling with selected text
- [ ] Desktop browser: mobile touch simulation
- [ ] Mobile device: actual touch selection
- [ ] Keyboard selection (Shift+Arrow) works
- [ ] Button styling and visibility correct
- [ ] No console errors
**Test Cases**:
1. Select text at top → button above
2. Select text at bottom → button below (visible)
3. Select text, scroll → button follows
4. Click button → chat opens
5. Type question → mention auto-included
6. Send → backend receives mention
7. Test on actual mobile device
8. Test on different browsers (Chrome, Firefox, Safari)

**Time Estimate**: 1.5 hours
**Complexity**: Low

---

### Phase 4: Documentation & Deployment

#### Task 4.1: Update Code Comments
**Objective**: Add inline documentation for complex logic
**Files**:
- `src/components/TextSelectionButton.tsx`
- `src/components/ChatbotWidget.tsx`
- `src/contexts/ChatContext.tsx`
**Acceptance Criteria**:
- [ ] Explain why viewport coordinates instead of scroll-based
- [ ] Document state object structure
- [ ] Explain scroll handler logic
- [ ] Explain auto-insert timing
**Time Estimate**: 20 min
**Complexity**: Low

---

#### Task 4.2: Create PHR (Prompt History Record)
**Objective**: Document implementation in PHR format
**File**: `history/prompts/002-chatbot-ask-ai-improvements/003-implement-final-fixes.green.prompt.md`
**Acceptance Criteria**:
- [ ] PHR file created in correct directory
- [ ] All YAML fields filled (id, title, stage, date, etc.)
- [ ] Prompt section includes all requirements
- [ ] Response section documents implementation details
- [ ] Outcome section lists success criteria
**Time Estimate**: 20 min
**Complexity**: Low

---

#### Task 4.3: Final Commit & Push
**Objective**: Commit all changes and push to main
**Acceptance Criteria**:
- [ ] All changes staged
- [ ] Commit message follows convention
- [ ] Includes fixed issues (button at bottom, scrolling, auto-mention)
- [ ] Pushed to origin/main
- [ ] No merge conflicts
**Time Estimate**: 10 min
**Complexity**: Low

---

## Task Dependencies

```
Task 1.1 (State)
    ↓
Task 1.2 (Positioning)
    ↓
Task 1.3 (Scroll Handler) → Task 1.4 (Event Listeners) [parallel]
    ↓
Task 1.5 (Rendering)
    ↓
Task 2.1 (Auto-Insert) [parallel with Task 3.1]
    ↓
Task 2.2 (Message Format) [parallel with Task 3.2]
    ↓
Task 3.3 (Manual Testing)
    ↓
Task 4.1 (Documentation) [parallel with Task 4.2]
    ↓
Task 4.3 (Commit & Push)
```

---

## Success Metrics

- All tasks completed
- All tests passing (unit and integration)
- Manual testing passes on desktop and mobile
- Zero console errors
- Code review approved
- Deployed to production
- No regression issues reported

---

## Notes

- Viewport-relative coordinates are critical for this implementation
- State atomicity prevents race conditions
- Proper scroll handling ensures smooth UX
- Multiple event listeners improve coverage
- Auto-mention improves user workflow
