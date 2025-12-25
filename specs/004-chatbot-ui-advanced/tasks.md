---
description: "Task list for Advanced Chatbot UI & Ask AI Button Enhancement feature"
---

# Tasks: Advanced Chatbot UI & Ask AI Button Enhancement

**Branch**: `004-chatbot-ui-advanced`
**Input**: Design documents from `/specs/004-chatbot-ui-advanced/`
**Prerequisites**: plan.md (complete), spec.md (complete with 4 user stories P1/P2)

**Tests**: TDD approach - Tests written FIRST and fail before implementation, then implementation makes them pass

**Organization**: Tasks are grouped by user story (US1, US2, US3, US4) to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4) - organized by priority P1, P2
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/components/`, `src/css/`, `src/contexts/`
- **Tests**: `tests/components/`, `tests/e2e/`
- This is a web application (React/Docusaurus)

---

## Phase 1: Setup & Configuration (Shared Infrastructure)

**Purpose**: Project initialization and testing infrastructure setup

- [ ] T001 Set up test environment with Jest/Vitest configuration in jest.config.js
- [ ] T002 [P] Configure React Testing Library for component testing
- [ ] T003 [P] Configure Playwright for E2E testing in playwright.config.ts
- [ ] T004 Add custom CSS animation utilities in tailwind.config.js for Material Design easing
- [ ] T005 Create test utility helpers in tests/utils/test-helpers.ts (viewport helpers, selection mocking)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create CSS keyframes file at src/css/animations.css with fadeIn and slide animations
- [ ] T007 [P] Add Material Design easing functions and prefers-reduced-motion support to custom.css
- [ ] T008 [P] Update Tailwind config to support custom color variables for dark mode (bg-primary, text-primary, etc.)
- [ ] T009 Set up mock Chat API responses in tests/mocks/chatApi.ts for testing
- [ ] T010 Create test fixtures for selected text scenarios in tests/fixtures/selections.ts

**Checkpoint**: Foundation ready - all user story implementation can now proceed in parallel

---

## Phase 3: User Story 1 - Improved Ask AI Button Positioning (Priority: P1) 🎯 MVP

**Goal**: Fix the Ask AI button positioning to appear correctly 50px above/below selected text with proper viewport constraints and green color consistency

**Independent Test**: Can select text on page and verify button appears in correct position (above or below), stays visible during scroll, and uses green color (#1cd98e)

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Unit test: TextSelectionButton positioning logic in tests/components/TextSelectionButton.positioning.test.tsx
  - Test: Selection above viewport center → button appears 50px above
  - Test: Selection below viewport center with insufficient space → button appears below
  - Test: Button constrained to viewport with 10px padding on all edges
  - Test: Debounce scroll events at 50ms intervals

- [ ] T012 [P] [US1] Unit test: TextSelectionButton color rendering in tests/components/TextSelectionButton.color.test.tsx
  - Test: Button background color is #1cd98e (light mode)
  - Test: Button background color is #d8b4fe (dark mode)
  - Test: Button does NOT use bg-primary (Docusaurus red)

- [ ] T013 [US1] Integration test: Text selection workflow in tests/integration/textSelection.integration.test.tsx
  - Test: Select text → Button appears within 500ms
  - Test: Click button → Selected text captured and passed to chatbot
  - Test: Browser selection cleared after button click
  - Test: Button disappears when selection is cleared

### Implementation for User Story 1

- [ ] T014 [P] [US1] Update TextSelectionButton.tsx color class from bg-primary to bg-[#1cd98e] with dark:bg-[#d8b4fe]

- [ ] T015 [US1] Implement viewport boundary detection in TextSelectionButton.tsx
  - Calculate selection bounding rect using Selection API
  - Implement getViewportConstrainedPosition() utility function
  - Check if proposed position (50px above) fits in viewport
  - If not, position below selection
  - Ensure minimum 10px padding from viewport edges
  - Return x, y coordinates within safe bounds

- [ ] T016 [US1] Implement scroll position debouncing in TextSelectionButton.tsx
  - Add useEffect hook to listen for scroll events
  - Implement 50ms debounce using useCallback and setTimeout
  - Update button position only when debounced scroll fires
  - Cancel pending debounce on component unmount

- [ ] T017 [US1] Add accessibility attributes to TextSelectionButton.tsx
  - Add aria-label="Ask AI about selected text"
  - Ensure proper focus indicator styling with focus:ring-2
  - Add keyboard support documentation in component comments

- [ ] T018 [US1] Update TextSelectionButton styling in src/css/custom.css
  - Add shadow-[#1cd98e]/40 for green-tinted shadow (was red-tinted)
  - Add transition-colors duration-300 for smooth color transitions
  - Add hover:scale-110 and hover:shadow-xl for interaction feedback

- [ ] T019 [US1] Test all edge cases in tests/e2e/textSelection.edge-cases.e2e.ts
  - Select text at top of viewport → button positions below
  - Select text at bottom of viewport → button positions above
  - Select text near viewport edges → button stays fully visible
  - Rapid successive selections → button debounces correctly
  - Selected text over 200 characters → truncated in context

**Checkpoint**: At this point, User Story 1 should be fully functional. Text selection triggers button appearance with correct positioning, color, and viewport constraints.

---

## Phase 4: User Story 2 - Visual Consistency & Theme Integration (Priority: P1)

**Goal**: Maintain cohesive visual identity across entire chatbot UI using green gradient theme (#1cd98e to #15a860) with proper dark mode support

**Independent Test**: Can verify entire chatbot UI (closed state, open state, messages, buttons, input area) uses consistent green palette in light mode and purple palette in dark mode with proper contrast ratios

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US2] Unit test: ChatBot color consistency in tests/components/ChatBot.colors.test.tsx
  - Test: Header gradient is from-[#1cd98e] to-[#15a860] (light mode)
  - Test: Header gradient is from-[#d8b4fe] to-[#a855f7] (dark mode)
  - Test: Send button uses green background (#1cd98e) light mode
  - Test: Send button uses purple background (#d8b4fe) dark mode
  - Test: Suggested questions use consistent green hover state

- [ ] T021 [P] [US2] Unit test: Accessibility contrast ratios in tests/components/ChatBot.contrast.test.tsx
  - Test: White text on green gradient has 4.5:1 contrast ratio (WCAG AA)
  - Test: Gray-100 background with gray-800 text has 4.5:1 contrast (messages)
  - Test: All interactive elements meet 3:1 contrast minimum

- [ ] T022 [P] [US2] Unit test: Dark mode rendering in tests/components/ChatBot.darkMode.test.tsx
  - Test: Components render with dark:bg-*, dark:text-* classes when theme is dark
  - Test: All colors have appropriate dark mode variants
  - Test: No white backgrounds appear in dark mode (use dark gray)

- [ ] T023 [US2] Integration test: Theme consistency workflow in tests/integration/themeConsistency.integration.test.tsx
  - Test: All buttons in ChatBot use same color scheme
  - Test: Hover states use consistent green tint (light) or purple tint (dark)
  - Test: Message bubbles follow color palette (green user, gray bot)

### Implementation for User Story 2

- [ ] T024 [P] [US2] Update ChatBot.tsx header gradient colors
  - Change: `from-green-400` → `from-[#1cd98e]` and `to-green-600` → `to-[#15a860]`
  - Add: `dark:from-[#d8b4fe] dark:to-[#a855f7]` for dark mode
  - Update className with both light and dark variants

- [ ] T025 [P] [US2] Update all button colors in ChatBot.tsx
  - Send button: `bg-primary` → `bg-[#1cd98e]` with `dark:bg-[#d8b4fe]`
  - Maximize button: Add hover state with green tint
  - Close button: Add hover state with green tint
  - Suggested questions: `hover:bg-green-50` → `hover:from-green-50 hover:to-emerald-50` + border-[#1cd98e]

- [ ] T026 [US2] Update message bubble styling in src/css/custom.css and MessageBubble.tsx
  - Bot messages: Ensure `bg-gray-100` text `text-gray-800` (light mode)
  - Bot messages: Ensure `dark:bg-gray-700` `dark:text-gray-100` (dark mode)
  - User messages: Keep green gradient `from-[#1cd98e] to-[#15a860]`
  - Add text color: `text-white` for user messages
  - Ensure all text has sufficient contrast (4.5:1 WCAG AA)

- [ ] T027 [US2] Update selected text context banner styling in ChatBot.tsx
  - Background: `from-blue-50 to-cyan-50` (light mode)
  - Background: `dark:from-blue-950 dark:to-cyan-950` (dark mode)
  - Border: `border-l-4 border-l-[#1cd98e]` for green accent
  - Icon styling: Ensure 📖 icon is visible in both modes
  - Text truncation: Limit to 80 visible characters with line-clamp-2

- [ ] T028 [US2] Add loading spinner styling in ChatBot.tsx and custom.css
  - Use lucide-react Loader icon with animate-spin
  - Color: `text-[#1cd98e]` (light mode) / `dark:text-[#d8b4fe]` (dark mode)
  - Add custom animation: 800ms per rotation cycle
  - Ensure spinner is centered in message area

- [ ] T029 [P] [US2] Add hover state transitions in src/css/custom.css
  - All buttons: `transition-all duration-300`
  - Hover effects: Use Material Design easing cubic-bezier(0.4, 0, 0.2, 1)
  - Shadow enhancement: `hover:shadow-xl`
  - Color transitions: Smooth 300ms color changes

- [ ] T030 [US2] Test dark mode support in tests/e2e/darkMode.e2e.ts
  - Toggle dark mode → ChatBot colors update immediately
  - All elements use dark: variants (no hardcoded light colors)
  - Contrast ratios maintained in both modes
  - No white backgrounds visible in dark mode

**Checkpoint**: At this point, User Stories 1 AND 2 are complete. Entire chatbot uses consistent green/purple theme with proper dark mode support and WCAG AA accessibility.

---

## Phase 5: User Story 3 - Advanced UI Enhancements (Priority: P2)

**Goal**: Provide smooth animations, improved loading states, and enhanced visual feedback for professional appearance

**Independent Test**: Can perform typical interactions (send message, wait for response, select text, expand/collapse chat) and verify smooth 300ms animations, clear loading indicators, and intuitive visual feedback

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US3] Unit test: MessageBubble animations in tests/components/MessageBubble.animations.test.tsx
  - Test: Message animates in with 300ms fade (opacity 0→1)
  - Test: Message animates in with slide-up (translateY 4px→0)
  - Test: Animation uses Material Design easing
  - Test: prefers-reduced-motion disables animations

- [ ] T032 [P] [US3] Unit test: Chat window expand animation in tests/components/ChatBot.expandAnimation.test.tsx
  - Test: Expand chat window triggers 300ms smooth transition
  - Test: Window grows from 384x500 to 900x600 smoothly
  - Test: No layout shift or jank during expansion

- [ ] T033 [P] [US3] Unit test: Loading indicator in tests/components/ChatBot.loadingIndicator.test.tsx
  - Test: Loading spinner appears when isLoading=true
  - Test: Spinner uses lucide-react Loader icon
  - Test: Spinner color matches theme (#1cd98e light, #d8b4fe dark)
  - Test: Spinner hides when isLoading=false

- [ ] T034 [US3] Integration test: Message animation workflow in tests/integration/messageAnimation.integration.test.tsx
  - Test: Send message → Appears in chat with animation
  - Test: Receive response → Animates in smoothly
  - Test: Multiple messages → Each animates independently

### Implementation for User Story 3

- [ ] T035 [P] [US3] Add message entry animation to MessageBubble.tsx using framer-motion
  - Import motion from framer-motion
  - Wrap message content in motion.div
  - Initial: { opacity: 0, y: 4 }
  - Animate: { opacity: 1, y: 0 }
  - Transition: { duration: 0.3, easing: "easeOut" }

- [ ] T036 [P] [US3] Create @keyframes fadeIn animation in src/css/custom.css
  - Define: 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); }
  - Duration: 300ms
  - Easing: cubic-bezier(0.4, 0, 0.2, 1) [Material Design]
  - Apply to message bubbles as fallback if framer-motion unavailable

- [ ] T037 [US3] Implement chat window expand animation in ChatBot.tsx
  - Add transition-all duration-300 to chat container
  - Smooth width/height changes during expand
  - Test on 60fps capable devices (verify no jank)
  - Add transform: scale-100 to prevent layout shift

- [ ] T038 [US3] Implement loading spinner in ChatBot.tsx
  - Import Loader icon from lucide-react
  - Render when isLoading === true
  - Style: `text-[#1cd98e] dark:text-[#d8b4fe] animate-spin`
  - Center in message area with proper spacing
  - Maintain 800ms rotation cycle (existing animate-spin = 1s, customize if needed)

- [ ] T039 [P] [US3] Add hover state animations to suggested questions in ChatBot.tsx
  - Hover: Background gradient changes to from-green-50 to-emerald-50 (light) / from-blue-900 to-purple-900 (dark)
  - Hover: Border color changes to border-[#1cd98e] with transition
  - Hover: Text color changes slightly for emphasis
  - All transitions: 300ms duration

- [ ] T040 [US3] Add prefers-reduced-motion accessibility in src/css/custom.css
  - @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  - Ensures users with vestibular disorders don't experience motion-triggered symptoms

- [ ] T041 [US3] Test 60fps animation performance in tests/e2e/performance.animations.e2e.ts
  - Measure frame rate during message animation (target: 60fps)
  - Measure frame rate during chat window expand (target: 60fps)
  - Measure frame rate during hover state changes (target: 60fps)
  - Report any jank or dropped frames
  - Test on simulated slow devices (throttle CPU by 4x)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 are complete. Chatbot has smooth animations, clear loading states, and professional visual feedback.

---

## Phase 6: User Story 4 - Mobile & Responsive Adaptation (Priority: P2)

**Goal**: Ensure chatbot works correctly on mobile devices with responsive sizing, touch-optimized targets, and keyboard-aware layout

**Independent Test**: Can view chatbot on mobile (375px, 768px viewports), verify text selection works, button appears correctly, and chat window is readable and functional without horizontal scrolling

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T042 [P] [US4] E2E test: Mobile text selection in tests/e2e/mobile.textSelection.e2e.ts
  - Test on 375px width (iPhone SE size)
  - Test on 768px width (iPad Mini size)
  - Test: Select text → Button appears with proper positioning
  - Test: Button remains fully visible (no overflow)
  - Test: Button is at least 44x44px for touch (accessibility)

- [ ] T043 [P] [US4] E2E test: Mobile chat window sizing in tests/e2e/mobile.chatWindow.e2e.ts
  - Test: Chat window on 375px viewport: max 90vw width, 80vh height
  - Test: Chat window on 768px viewport: adaptive sizing
  - Test: No horizontal scrolling
  - Test: Expanded chat window fits within viewport

- [ ] T044 [P] [US4] E2E test: Mobile keyboard handling in tests/e2e/mobile.keyboard.e2e.ts
  - Test: Virtual keyboard appears → Chat window shifts up
  - Test: Input field remains accessible above keyboard
  - Test: Send button is visible and clickable with keyboard active
  - Test: Message area scrolls above keyboard

- [ ] T045 [US4] E2E test: Responsive design validation in tests/e2e/responsive.layout.e2e.ts
  - Test at viewports: 320px, 375px, 768px, 1024px, 1440px
  - Verify no elements overflow at any breakpoint
  - Verify all interactive elements maintain 44x44px minimum
  - Verify text is readable (font size ≥12px)

### Implementation for User Story 4

- [ ] T046 [P] [US4] Update TextSelectionButton.tsx for mobile positioning
  - Ensure button positioning works at 375px viewport width
  - Add media query logic in positioning calculation
  - Adjust offset if needed for mobile (may need smaller offset on tiny screens)
  - Test touches don't trigger accidental selections

- [ ] T047 [P] [US4] Update ChatBot.tsx with responsive chat window sizing
  - Add responsive classes: w-[384px] sm:w-[320px] md:w-full (max)
  - Mobile: h-[500px] sm:h-[80vh] (max)
  - Desktop (≥1024px): w-[384px] h-[500px] (fixed)
  - Expanded mobile: w-[90vw] h-[80vh] with responsive constraints

- [ ] T048 [P] [US4] Update button sizing for touch targets in ChatBot.tsx and MessageBubble.tsx
  - All buttons: Minimum 44x44px for touch accessibility (WCAG 2.5.5)
  - Padding: Increase from current if needed to meet 44px minimum
  - Spacing: Ensure 8px minimum space between touch targets
  - Test with touch emulation in browser DevTools

- [ ] T049 [US4] Implement keyboard-aware layout in ChatBot.tsx
  - Detect virtual keyboard appearance (use mobile-detect library or media queries)
  - On mobile when keyboard appears:
    - Shift chat window up with transform: translateY(-50px)
    - Ensure input field is visible above keyboard
    - Auto-scroll message area to latest message
  - Use CSS: @supports (viewport-fit: cover) for notch-safe areas

- [ ] T050 [P] [US4] Add responsive typography in src/css/custom.css
  - Mobile (<768px): Base font 14px
  - Tablet (768px-1024px): Base font 15px
  - Desktop (≥1024px): Base font 16px
  - Headings scale proportionally
  - Ensure min font size 12px for accessibility

- [ ] T051 [US4] Update message bubble styling for mobile in MessageBubble.tsx
  - Max width: 90% of container on mobile
  - Max width: 80% of container on desktop
  - Padding: Slightly smaller on mobile (12px instead of 16px) if needed
  - Text wrapping: Ensure long messages wrap properly

- [ ] T052 [P] [US4] Add media query support for hover states in src/css/custom.css
  - Desktop: Hover states active (has hover capability)
  - Mobile: No hover (remove hover:* states), use active: states instead
  - @media (hover: hover) { .button:hover { ... } }
  - @media (hover: none) { .button:active { ... } }

- [ ] T053 [US4] Test responsive design across all breakpoints in tests/e2e/responsive.breakpoints.e2e.ts
  - Run tests at: 320px (old phones), 375px (iPhone), 480px, 768px (tablet), 1024px (desktop), 1440px (large)
  - Verify layout is correct at each breakpoint
  - Verify no elements overflow
  - Verify touch targets are accessible

**Checkpoint**: At this point, all 4 User Stories are complete. Chatbot is fully functional on desktop and mobile with responsive design and touch-optimized interactions.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimization, and comprehensive testing

- [ ] T054 [P] Run full E2E test suite in tests/e2e/ to verify all user stories work together

- [ ] T055 [P] Accessibility audit: Check WCAG 2.1 AA compliance
  - Color contrast validation (axe-core or Lighthouse)
  - Keyboard navigation (Tab, Arrow keys, Enter, Escape)
  - Screen reader compatibility (ARIA labels complete)
  - Report and fix any violations

- [ ] T056 [P] Bundle size analysis
  - Measure impact of framer-motion and lucide-react additions
  - Verify bundle size increase < 3MB
  - Optimize imports if needed (tree-shaking)
  - Report final bundle size change

- [ ] T057 [P] Performance optimization
  - Verify 60fps animation performance (Chrome DevTools Performance tab)
  - Verify button appearance time <500ms (95% compliance)
  - Measure Largest Contentful Paint (LCP) - should be < 2.5s
  - Check for layout shifts (Cumulative Layout Shift < 0.1)

- [ ] T058 [P] Cross-browser testing in tests/e2e/
  - Test on Chrome, Firefox, Safari, Edge (current versions)
  - Verify animations work consistently
  - Verify colors render correctly
  - Test keyboard navigation on all browsers

- [ ] T059 Documentation and code cleanup
  - Update README.md with new component behavior
  - Add inline comments for positioning algorithm
  - Add comments for Material Design easing usage
  - Document dark mode color mapping
  - Document responsive breakpoints

- [ ] T060 [P] Final validation against Success Criteria in spec.md
  - SC-001: Button appears within 500ms (95% compliance) ✓
  - SC-002: 100% correct positioning ✓
  - SC-003: 100% viewport visibility ✓
  - SC-004: <15 second complete flow ✓
  - SC-005: Zero color conflicts ✓
  - SC-006: 100% mobile functionality ✓
  - SC-007: 90% user satisfaction (manual review) ✓
  - SC-008: 60fps animation frame rate ✓
  - SC-009: WCAG AA contrast compliance ✓
  - SC-010: Full keyboard navigation ✓

- [ ] T061 Run quickstart.md validation (if available)

- [ ] T062 [P] Code review checklist
  - All files follow project conventions
  - No console.error or console.warn in production code
  - All TODOs/FIXMEs addressed or tracked in issues
  - Test coverage > 80% for modified files

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phases 3-6 (User Stories) - Can run in PARALLEL after Phase 2
    ├─ Phase 3 (US1 - P1)
    ├─ Phase 4 (US2 - P1) - Can run in parallel with US1
    ├─ Phase 5 (US3 - P2) - Can run in parallel after Phase 2
    └─ Phase 6 (US4 - P2) - Can run in parallel after Phase 2
    ↓
Phase 7 (Polish) - Depends on completing desired user stories
```

### Critical Path (Sequential MVP)

1. **Phase 1**: Setup (1-2 hours)
2. **Phase 2**: Foundational (2-3 hours) - BLOCKS all user stories
3. **Phase 3 (US1)**: Ask AI Button Positioning - P1 CRITICAL (8-10 hours)
4. **Phase 4 (US2)**: Theme Consistency - P1 CRITICAL (10-12 hours)
5. **Phase 5 (US3)**: Advanced Animations - P2 (6-8 hours)
6. **Phase 6 (US4)**: Mobile Responsiveness - P2 (8-10 hours)
7. **Phase 7**: Polish & Testing (4-6 hours)

**Total Effort**: ~40-60 developer hours

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T002, T003, T004, T005 can run in parallel [P]

**Within Phase 2 (Foundational)**:
- T006, T007, T008, T009, T010 can run in parallel [P]
- BUT T009 (API mocks) helps with testing, do early

**Within Phase 3 (US1)**:
- Tests T011, T012 can run in parallel [P]
- Implementation T014, T015, T016, T017 mostly sequential (positioning logic)
- T018 styling can run parallel with implementation

**Within Phase 4 (US2)**:
- Tests T020, T021, T022 can run in parallel [P]
- Implementation T024, T025, T026, T027, T028, T029 mostly sequential (color updates)
- T030 dark mode testing runs after implementation

**Within Phase 5 (US3)**:
- Tests T031, T032, T033 can run in parallel [P]
- Implementation T035, T036, T037, T038 sequential (animations need setup)
- T039, T040, T041 can run as final validation

**Within Phase 6 (US4)**:
- Tests T042, T043, T044, T045 can run in parallel [P]
- Implementation T046, T047, T048 can run in parallel [P]
- T049, T050, T051, T052 build on previous work

**Across User Stories** (After Phase 2 complete):
- User Stories 3 and 4 can run fully in parallel with US1 and US2
- Different team members can work on different stories simultaneously

### Team Staffing Scenarios

**1 Developer (Sequential)**:
- Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7
- Total: ~50 hours

**2 Developers (Parallel by Story)**:
- Developer 1: Phase 1+2 (setup) → Phase 3 (US1) → Phase 7 (polish)
- Developer 2: (wait for Phase 2) → Phase 5 (US3) in parallel with Dev1's US1
- Developer 1: Phase 4 (US2) after US1
- Developer 2: Phase 6 (US4) after US3
- Phase 7: Both developers
- Total: ~30 hours per developer (parallelized)

**4 Developers (Full Parallelization)**:
- Dev 1: Phase 1+2 → Phase 3 (US1)
- Dev 2: (wait) → Phase 4 (US2)
- Dev 3: (wait) → Phase 5 (US3)
- Dev 4: (wait) → Phase 6 (US4)
- All: Phase 7 (polish + validation)
- Total: ~20 hours per developer (heavily parallelized)

---

## Parallel Example: Phase 3 User Story 1

Once Phase 2 is complete, these tasks can run in parallel:

```bash
# Terminal 1
npm test -- TextSelectionButton.positioning.test.tsx  # T011
npm test -- TextSelectionButton.color.test.tsx        # T012

# Terminal 2
npm run develop -- src/components/TextSelectionButton.tsx  # T014-T017

# Terminal 3
code src/css/custom.css  # T018

# After tests FAIL and implementation is in progress
npm run test -- TextSelectionButton.positioning.test.tsx --watch  # Auto-run as code changes
```

---

## Acceptance Criteria by User Story

### User Story 1 Acceptance Criteria
✅ Text selection triggers Ask AI button within 500ms
✅ Button position: 50px above selected text (or below if insufficient space)
✅ Button remains fully visible in viewport (10px minimum padding)
✅ Button scrolls with page, position updates with 50ms debounce
✅ Button color is #1cd98e (green) in light mode, #d8b4fe (purple) in dark mode
✅ Clicking button captures selected text and opens chatbot
✅ Browser selection is cleared after button click
✅ Button has proper accessibility labels (aria-label)

### User Story 2 Acceptance Criteria
✅ Chatbot header uses green gradient (#1cd98e → #15a860) in light mode
✅ Chatbot header uses purple gradient (#d8b4fe → #a855f7) in dark mode
✅ All buttons (send, maximize, close) use green theme consistently
✅ Message bubbles: gray-100 (bot), green gradient (user)
✅ All text has WCAG AA contrast ratio (4.5:1 for text, 3:1 for UI)
✅ Hover states use consistent green or purple tint
✅ Selected text banner displays with proper styling
✅ Loading spinner appears while processing, uses theme color

### User Story 3 Acceptance Criteria
✅ Messages animate in with 300ms fade + slide-up animation
✅ Chat window expand/collapse is smooth 300ms transition
✅ Loading indicator is clear and visible
✅ Suggested questions have animated hover states
✅ No animation jank (maintains 60fps)
✅ Users with prefers-reduced-motion see no animations
✅ Animation easing follows Material Design standards

### User Story 4 Acceptance Criteria
✅ Text selection works on mobile (375px viewport)
✅ Button appears correctly on mobile viewports
✅ Chat window: max 90vw width, 80vh height on mobile
✅ No horizontal scrolling at any viewport size
✅ All buttons and interactive elements ≥44x44px for touch
✅ Virtual keyboard doesn't obscure input field
✅ Responsive typography scales appropriately
✅ Hover states replaced with active states on mobile
✅ Fully functional on iOS Safari and Android Chrome

---

## Definition of Done (Feature Complete)

- [ ] All 4 user stories completed and validated
- [ ] All acceptance criteria met for each story
- [ ] Unit test coverage > 80% for modified files
- [ ] Integration tests pass for all user workflows
- [ ] E2E tests pass on desktop, tablet, and mobile viewports
- [ ] Cross-browser testing passes (Chrome, Firefox, Safari, Edge)
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] Performance metrics met (60fps, <500ms button, <3MB bundle impact)
- [ ] Code review approved
- [ ] Documentation updated
- [ ] No console errors or warnings in production
- [ ] Bundle size impact < 3MB
- [ ] Ready for release and user acceptance testing

---

## File Modification Checklist

### Core Component Files
- [ ] src/components/TextSelectionButton.tsx (80 lines modified)
- [ ] src/components/ChatBot.tsx (150 lines modified)
- [ ] src/components/MessageBubble.tsx (30 lines modified)
- [ ] src/css/custom.css (50+ new lines for keyframes, easing, accessibility)

### Configuration Files
- [ ] jest.config.js (test setup)
- [ ] playwright.config.ts (E2E test setup)
- [ ] tailwind.config.js (animation utilities)

### Test Files
- [ ] tests/components/TextSelectionButton.positioning.test.tsx (NEW)
- [ ] tests/components/TextSelectionButton.color.test.tsx (NEW)
- [ ] tests/components/ChatBot.colors.test.tsx (NEW)
- [ ] tests/components/ChatBot.contrast.test.tsx (NEW)
- [ ] tests/components/ChatBot.darkMode.test.tsx (NEW)
- [ ] tests/components/ChatBot.expandAnimation.test.tsx (NEW)
- [ ] tests/components/ChatBot.loadingIndicator.test.tsx (NEW)
- [ ] tests/components/MessageBubble.animations.test.tsx (NEW)
- [ ] tests/integration/textSelection.integration.test.tsx (NEW)
- [ ] tests/integration/themeConsistency.integration.test.tsx (NEW)
- [ ] tests/integration/messageAnimation.integration.test.tsx (NEW)
- [ ] tests/e2e/textSelection.edge-cases.e2e.ts (NEW)
- [ ] tests/e2e/darkMode.e2e.ts (NEW)
- [ ] tests/e2e/performance.animations.e2e.ts (NEW)
- [ ] tests/e2e/mobile.textSelection.e2e.ts (NEW)
- [ ] tests/e2e/mobile.chatWindow.e2e.ts (NEW)
- [ ] tests/e2e/mobile.keyboard.e2e.ts (NEW)
- [ ] tests/e2e/responsive.layout.e2e.ts (NEW)
- [ ] tests/e2e/responsive.breakpoints.e2e.ts (NEW)

### Utility/Setup Files
- [ ] tests/utils/test-helpers.ts (NEW - viewport, selection helpers)
- [ ] tests/mocks/chatApi.ts (NEW - API mocking)
- [ ] tests/fixtures/selections.ts (NEW - test data)

### Documentation Files
- [ ] README.md (updated with new behavior)
- [ ] docs/ (inline comments in components)

---

## Summary

**Total Tasks**: 62 tasks across 7 phases
**Setup Tasks**: 5 tasks
**Foundational Tasks**: 5 tasks (blocking)
**User Story Tasks**: 47 tasks
  - US1 (P1): 9 tasks
  - US2 (P1): 7 tasks
  - US3 (P2): 7 tasks
  - US4 (P2): 8 tasks
  - Tests: 16 tasks (optional but recommended)
**Polish Tasks**: 9 tasks

**Estimated Effort**: 40-60 developer hours
**MVP Scope** (Recommended initial release): Phases 1-4 (US1 + US2) = ~20-25 hours
**Full Release Scope**: All 4 user stories (Phases 1-6) = ~40-60 hours

**Parallel Opportunities**: Significant parallelization available within phases and across user stories after Foundational phase completes.

**TDD Approach**: All test tasks (16 total) written and failing BEFORE implementation, ensuring tests drive development and validate acceptance criteria.
