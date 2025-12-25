# Feature Specification: Advanced Chatbot UI & Ask AI Button Enhancement

**Feature Branch**: `004-chatbot-ui-advanced`
**Created**: 2025-12-26
**Status**: Draft
**Input**: Improve chatbot UI, make it advanced, fix ask AI button to correctly appear on text selection, provide recommendations based on current theme

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Improved Ask AI Button Positioning (Priority: P1)

Students select important text while reading the textbook and need quick access to ask questions about that text. The "Ask AI" button must appear in a visually consistent, accessible position that doesn't obscure the selected text or interfere with normal reading flow.

**Why this priority**: This is the highest priority because it directly addresses a documented bug (TextSelectionButton positioning issue). Students rely on this feature to get contextual help, and incorrect positioning breaks the user experience.

**Independent Test**: Can be fully tested by selecting text on the page and verifying the button appears in the correct position (above or below selection), stays visible during scroll, uses consistent theme colors, and clicking it correctly captures the selection.

**Acceptance Scenarios**:

1. **Given** a student selects text from the textbook, **When** the selection completes, **Then** the "Ask AI" button appears exactly 50px above the selection or below if space is insufficient
2. **Given** the floating button is positioned near viewport edges, **When** the button is placed, **Then** it remains fully visible within the viewport with minimum 10px padding from edges
3. **Given** a student scrolls the page while the button is visible, **When** scroll occurs, **Then** the button position updates to stay aligned with selected text (debounced at 50ms intervals)
4. **Given** the "Ask AI" button is visible, **When** a student clicks it, **Then** the button uses the green accent color (#1cd98e) matching the chatbot theme, not conflicting red color
5. **Given** a student clicks the "Ask AI" button, **When** the click is processed, **Then** the selected text is captured and sent to the chatbot, and the browser selection is cleared

---

### User Story 2 - Visual Consistency & Theme Integration (Priority: P1)

The chatbot UI needs to maintain a cohesive visual identity aligned with the existing green gradient theme (#1cd98e to #15a860). All interactive elements should use consistent colors, spacing, and visual hierarchy to create a professional, modern appearance.

**Why this priority**: Visual consistency is foundational to professional UX. The current implementation has color inconsistencies (red "Ask AI" button conflicting with green chatbot theme) that create a disjointed experience. This affects user perception of quality and usability.

**Independent Test**: Can be fully tested by reviewing the entire chatbot UI (closed state, open state, messages, input area, Ask AI button) and verifying all primary action colors use the green palette, secondary elements use gray correctly, and spacing follows the 4px grid system.

**Acceptance Scenarios**:

1. **Given** the chatbot is in closed state, **When** displayed, **Then** the floating action button uses the green gradient from #1cd98e to #15a860 with consistent shadow styling
2. **Given** the chatbot is open, **When** displayed, **Then** all interactive elements (send button, suggested questions, message bubbles) use the established green and gray palette
3. **Given** a user hovers over interactive elements, **When** hover state is triggered, **Then** visual feedback uses consistent green tint or opacity changes (not conflicting colors)
4. **Given** the page is in dark mode, **When** displayed, **Then** the chatbot uses dark mode color variables (purple #d8b4fe primary, dark backgrounds) consistently across all components
5. **Given** a user reads a message from the bot, **When** viewing the message, **Then** the message bubble uses gray-100 background with gray-800 text, with proper contrast for accessibility

---

### User Story 3 - Advanced UI Enhancements (Priority: P2)

The chatbot interface should provide enhanced visual feedback, improved animations, and better information hierarchy to make interactions feel smooth and professional. This includes refined message animations, loading states, and visual indicators for different contexts (selected text, loading, ready).

**Why this priority**: These enhancements improve perceived performance and user satisfaction. While P1 features establish the baseline, P2 features refine the experience and create a polished, professional appearance that differentiates the product.

**Independent Test**: Can be fully tested by performing typical user interactions (typing messages, waiting for responses, selecting text, expanding/collapsing chat) and verifying smooth animations, clear visual feedback, and intuitive loading indicators appear.

**Acceptance Scenarios**:

1. **Given** the user sends a message, **When** the message appears in chat, **Then** it animates in with a 300ms fade and slide-up animation (opacity 0→1, translateY 4px→0)
2. **Given** the chatbot is processing a response, **When** loading occurs, **Then** a visual loading indicator (animated dots or spinner) appears with clear visual hierarchy
3. **Given** the user selects text from the page, **When** the selection is captured and displayed in the chatbot, **Then** a blue banner with "Selected from book" indicator appears above the input field
4. **Given** the user maximizes the chat window, **When** the expanded view is shown, **Then** the window scales smoothly with a transition animation (duration 300ms)
5. **Given** the chatbot is displaying suggested questions, **When** the user hovers over a question, **Then** the button animates with a gradient background change and border color update

---

### User Story 4 - Mobile & Responsive Adaptation (Priority: P2)

The chatbot UI must work correctly on mobile devices and adapt to different screen sizes. The Ask AI button must position correctly on mobile, and the chat window must be appropriately sized for smaller viewports.

**Why this priority**: Mobile users represent a significant portion of textbook readers. While P1 features focus on core functionality, P2 ensures the experience works across all devices without breaking layout or functionality.

**Independent Test**: Can be fully tested by viewing the chatbot on mobile devices or emulated viewports (320px to 768px widths) and verifying text selection triggers work, button appears correctly, and chat window is readable and interactive.

**Acceptance Scenarios**:

1. **Given** the viewport width is less than 768px (mobile), **When** the user selects text, **Then** the "Ask AI" button appears with proper positioning and remains fully visible
2. **Given** the chat window is open on mobile, **When** displayed, **Then** the window size is constrained to fit the viewport (no larger than 90vw width and 80vh height)
3. **Given** the user is typing on mobile, **When** the virtual keyboard appears, **Then** the chat window and input field remain accessible above the keyboard
4. **Given** the user is on a small screen, **When** the expanded chat view is activated, **Then** the expanded size adapts to the available space without causing horizontal overflow

---

### Edge Cases

- What happens when a user selects text while the chat window is open? (Button should still appear; clicking should update the chatbot context)
- How does the system handle multiple rapid text selections? (Button should debounce and position correctly for the latest selection)
- What happens when selected text is extremely long (200+ characters)? (Text should be truncated or handled gracefully in the context banner)
- How does the button behave when selected text is at page edges or bottom of viewport? (Button must stay fully visible within safe viewport area)
- What if both selected text and a chat message exist simultaneously? (Context banner should display selected text above message input)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Ask AI button MUST appear within 500ms of text selection completion
- **FR-002**: The Ask AI button MUST position 50px above the selected text, or below if insufficient space above
- **FR-003**: The Ask AI button MUST remain fully visible within the viewport at all times with minimum 10px padding from edges
- **FR-004**: The Ask AI button MUST use the green accent color (#1cd98e) consistently across all themes
- **FR-005**: The Ask AI button MUST trigger a debounced position update (50ms) when the page is scrolled while button is visible
- **FR-006**: Clicking the Ask AI button MUST capture the selected text and open the chatbot context
- **FR-007**: The chatbot header MUST display the green gradient background (from #1cd98e to #15a860)
- **FR-008**: All interactive buttons (send, maximize, close, suggested questions) MUST use consistent green accent styling
- **FR-009**: Message bubbles MUST use gray-100 background for bot messages and green gradient for user messages
- **FR-010**: The chatbot MUST display a loading indicator while waiting for API responses
- **FR-011**: Selected text context MUST display in a blue banner with "Selected from book" indicator above the message input
- **FR-012**: The chatbot MUST support dark mode with purple (#d8b4fe) primary color and dark backgrounds
- **FR-013**: All animations MUST be smooth (300ms transitions) and use consistent easing functions
- **FR-014**: The chat window MUST adapt dimensions on mobile (max 90vw width, 80vh height)
- **FR-015**: Text selection detection MUST work on mouseup, touchend, keyboard selection (Shift+Arrow), and selectionchange events

### Key Entities

- **Selected Text Context**: The text snippet a user selects from the page, displayed with source indicator ("Selected from book"), limited to 80 characters visible with truncation
- **Chat Message**: Contains sender (user/bot), text content, timestamp, animation state; user messages use green styling, bot messages use gray styling
- **UI State**: Includes chat window visibility, expanded/collapsed state, loading state, theme mode (light/dark)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Ask AI button appears within 500ms of text selection 95% of the time (measured across all devices and browsers)
- **SC-002**: 100% of Ask AI button instances display in the correct position (above or below selection) as specified in FR-002
- **SC-003**: Ask AI button remains fully visible in viewport 100% of the time (no overflow or clipping)
- **SC-004**: Users can complete a text-to-question flow (select text → click button → receive AI response) in under 15 seconds
- **SC-005**: All chatbot interactive elements use consistent theme colors with zero color conflicts (verified through visual inspection)
- **SC-006**: The chatbot UI works correctly on mobile viewports (320px-480px width) with 100% functionality preserved
- **SC-007**: 90% of users rate the visual design as "professional and polished" in user testing
- **SC-008**: Animation frame rate is stable at 60fps during all interactive transitions
- **SC-009**: Color contrast ratios meet WCAG AA standards (4.5:1 for text, 3:1 for UI components)
- **SC-010**: Keyboard navigation works for all chatbot controls (Tab to navigate, Enter to send, Space/Enter to activate buttons)

## Design Recommendations

Based on analysis of your current theme and implementation, here are specific recommendations:

### Color & Visual Hierarchy

**Recommendation 1.1 - Ask AI Button**: Update TextSelectionButton to use `bg-[#1cd98e]` instead of `bg-primary`. Add a subtle box-shadow with green tint: `shadow-[#1cd98e]/40`.
- Current: Red (#ff0000) from Docusaurus primary color
- Recommended: Green (#1cd98e) to match chatbot theme
- Impact: Creates visual consistency and improves user recognition

**Recommendation 1.2 - Gradient Consistency**: Ensure all gradient elements use the same start/end colors:
- Start: `from-[#1cd98e]`
- End: `to-[#15a860]`
- Direction: `gradient-to-r` for buttons, `gradient-to-b` for backgrounds

**Recommendation 1.3 - Dark Mode Support**: Implement CSS custom properties for theme-aware colors to support both light and dark modes seamlessly.

### Spacing & Layout

**Recommendation 2.1 - 4px Grid System**: Use consistent spacing based on 4px increments:
- Compact: 2px, 4px (internal elements)
- Standard: 8px, 12px, 16px (padding, margins)
- Large: 24px, 32px (section spacing)

**Recommendation 2.2 - Ask AI Button Offset**: Maintain 50px vertical offset from selection with 10px minimum viewport padding.

### Typography & Readability

**Recommendation 3.1 - Message Typography**:
- User/bot message text: 14px, line-height 1.6, appropriate color based on theme
- Timestamp/metadata: 12px, color gray-500, opacity-70
- Suggested questions: 13px, line-height 1.5

**Recommendation 3.2 - Accessibility**: Add `prefers-reduced-motion` media query support to disable animations for users who prefer minimal motion.

### Animation & Interaction

**Recommendation 4.1 - Message Animation**: Implement smooth entry animations with 300ms duration and Material Design easing.

**Recommendation 4.2 - Loading Indicator**: Use professional animated dots or spinner from lucide-react with 800ms per cycle.

**Recommendation 4.3 - Hover States**: Use consistent patterns with shadow enhancement, color tint, and gradient background changes.

### Component Architecture

**Recommendation 5.1 - Consolidate Chat Implementation**: Keep ChatBot.tsx as primary implementation. Remove unused ChatbotWidget.tsx to reduce code duplication.

**Recommendation 5.2 - State Management**: Consider integrating ChatBot component with ChatContext to unify state between Ask AI button and chat window.

**Recommendation 5.3 - Component Composition**: Extract reusable sub-components for ChatHeader, LoadingIndicator, and SelectedTextBanner.

### Mobile Responsiveness

**Recommendation 6.1 - Adaptive Chat Window**:
- Desktop (≥1024px): 384px × 500px (expanded: 900px × 600px)
- Tablet (768-1023px): 320px × 450px (expanded: 750px × 550px)
- Mobile (<768px): max 90vw × 80vh (min 280px width, 400px height)

**Recommendation 6.2 - Touch Optimization**: Increase touch targets to minimum 44×44px for all buttons on mobile devices.

**Recommendation 6.3 - Keyboard Handling**: Adjust chat window position when virtual keyboard appears on mobile to keep input field visible.

### Accessibility Enhancements

**Recommendation 7.1 - ARIA Labels**: Ensure all interactive elements have descriptive labels (Send message, Close chat, Expand chat window, Ask AI about selected text).

**Recommendation 7.2 - Focus Management**:
- Return focus to triggering element when closing chat
- Visible focus indicators on all interactive elements
- Consider focus trapping for modal behavior

**Recommendation 7.3 - Semantic HTML**: Use proper heading hierarchy and semantic tags (`<article>`, `<section>`) appropriately.

## Assumptions

1. **Color Values**: Using existing theme colors (#1cd98e, #15a860, #d8b4fe) without requiring new color additions
2. **Animation Performance**: Animations will run at 60fps without performance degradation on modern devices
3. **Selection Behavior**: Text selection follows browser-standard behavior; edge cases (iframe selections, shadow DOM) are out of scope for P1
4. **Mobile Viewport**: Mobile-first design assumes standard iOS/Android viewports; unusual aspect ratios are edge cases
5. **Browser Support**: Chrome, Firefox, Safari, and Edge (current versions); IE11 and older browsers are not supported
6. **Accessibility**: WCAG 2.1 AA standard is the target; AAA enhancements are future considerations

## Clarifications

### Session 2025-12-26

- **Q1: AI Assistant Capabilities** → A: Q/A Mode with Interactive MCQs - User asks questions, gets answers, then chatbot automatically offers multiple-choice questions to reinforce learning
- **Q2: MCQ Presentation & Integration** → A: Inline Interactive MCQs with Immediate Feedback - MCQs appear directly in chat with clickable options, immediate feedback (✓/✗), user can continue or ask more questions
- **Q3: MCQ Trigger & Frequency** → A: User Opt-In MCQs - Chatbot asks "Would you like a quiz question?" and waits for user response before showing MCQ
- **Q4: MCQ Difficulty & Progression** → A: Adaptive Difficulty - Start with comprehension questions, progress to application/analysis based on correct answers, adapt to user performance
- **Q5: MCQ Visual Presentation** → A: Green-Themed Card with Color-Coded Feedback - MCQ in bordered card with green accent border; options as buttons with green hover state; correct = green checkmark, incorrect = red X

---

### User Story 5 - Interactive MCQ Learning Mode (Priority: P2, NEW)

Students complete their learning by reinforcing understanding through interactive multiple-choice questions. After receiving an explanation from the AI, students can opt-in to answer quiz questions that test comprehension, then progress to application-level questions.

**Why this priority**: P2 Enhancement - Transforms the chatbot from a simple Q/A tool into an interactive learning platform. Reinforces knowledge retention and provides immediate feedback for deeper learning outcomes.

**Independent Test**: Can be fully tested by asking the chatbot a question, receiving an explanation, being offered a quiz, selecting to participate, answering MCQs, and receiving immediate visual feedback with adaptive difficulty progression.

**Acceptance Scenarios**:

1. **Given** the chatbot provides an explanation (>2 sentences), **When** the response completes, **Then** chatbot displays "Would you like a quiz question on this topic?" with Yes/No buttons
2. **Given** the user selects "Yes" for a quiz question, **When** the MCQ is displayed, **Then** it appears in a green-bordered card with 4 multiple-choice options as clickable buttons
3. **Given** the user answers an MCQ correctly, **When** the answer is submitted, **Then** a green checkmark (✓) appears with "Correct!" feedback
4. **Given** the user answers an MCQ incorrectly, **When** the answer is submitted, **Then** a red X (✗) appears with "Try again" or explanation of correct answer
5. **Given** the user answers multiple MCQs correctly, **When** subsequent questions are offered, **Then** the chatbot automatically increases difficulty from comprehension to application/analysis level questions
6. **Given** the user completes an MCQ, **When** feedback is displayed, **Then** the chatbot offers options to "Ask more about this topic" or "Next question" or "Return to chat"

---

## Out of Scope

- Internationalization (i18n) or localization (l10n) of UI strings (handled by separate feature)
- Chat history persistence across sessions (handled by backend, not UI)
- Custom theme editor or color picker
- Advanced animations (3D transforms, complex parallax)
- Voice/audio input for chat
- Collaborative chat or multi-user scenarios
- MCQ storage/analytics (tracking quiz performance across sessions)
