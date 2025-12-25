---
id: 0002
title: Plan Advanced Chatbot UI
stage: plan
date: 2025-12-26
surface: agent
model: claude-haiku-4-5-20251001
feature: 004-chatbot-ui-advanced
branch: 004-chatbot-ui-advanced
user: developer
command: /sp.plan
labels: ["architecture", "component-design", "frontend", "ui-enhancement"]
links:
  spec: specs/004-chatbot-ui-advanced/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-chatbot-ui-advanced/plan.md
tests:
  - Constitution Check (2 gates - both PASS)
  - Component Architecture Design
  - Risk Analysis (5 identified risks with mitigation)
---

## Prompt

Generate detailed implementation architecture and task breakdown for Advanced Chatbot UI & Ask AI Button Enhancement feature.

## Response snapshot

Created comprehensive implementation plan for 004-chatbot-ui-advanced with:

**Constitution Check**: ✅ All gates PASS
- Gate 1 (Bearer Token): Frontend-only, existing auth sufficient
- Gate 2 (MCP): No external protocol calls needed

**Technical Context**:
- Language: TypeScript 5.x + React 18+
- Dependencies: Tailwind CSS 3.4.18, lucide-react, framer-motion, better-auth
- Target: Web browsers (Chrome, Firefox, Safari, Edge)
- Performance: 60fps animations, 500ms button appearance

**Component Architecture**:
- TextSelectionButton.tsx (P1) - Fix positioning and color
- ChatBot.tsx (P1) - Update colors and add animations
- MessageBubble.tsx (P2) - Smooth animations
- custom.css (new) - Keyframes and theme support

**Key Design Decisions** (4 major):
1. Color Scheme: Green (#1cd98e/#15a860) for consistency
2. Positioning: Viewport boundary detection with 50ms debounce
3. Animation: Tailwind + framer-motion for 60fps performance
4. Theme Mode: Tailwind dark: prefix with CSS variables

**Component Changes**:
- TextSelectionButton: ~80 lines (color fix, positioning logic)
- ChatBot: ~150 lines (gradients, buttons, loading states)
- MessageBubble: ~30 lines (animations, dark mode)
- custom.css: ~50 new lines (keyframes, accessibility)

**Testing Strategy**:
- Unit tests: Positioning, colors, animations
- Integration tests: Text selection flow
- E2E tests: Desktop, mobile, dark mode, keyboard nav
- Performance tests: 60fps, <500ms appearance, <3MB bundle impact

**Risk Analysis**: 5 risks identified with mitigation strategies
- Animation performance on low-end devices (Medium)
- Color change user expectations (Low)
- Dark mode contrast violations (Low)
- Positioning edge cases (Medium)
- Mobile viewport calculations (Medium)

**Rollout**: Two phases (P1 critical fixes, P2 enhancements)
**Estimated Effort**: 40-60 developer hours

## Outcome

- ✅ Impact: Detailed architecture ready for task generation; all gates passed; no blocking issues identified
- 🧪 Tests: Constitution gates verified (2/2 PASS); testing strategy documented with 4 test types
- 📁 Files: 1 file updated (plan.md - 303 lines, comprehensive)
- 🔁 Next prompts: Run `/sp.tasks` to generate granular implementation tasks
- 🧠 Reflection: Plan is complete and actionable; decisions well-justified based on existing codebase; risk analysis provides clear mitigation paths

## Evaluation notes (flywheel)

- Failure modes observed: None - plan is comprehensive with no missing sections
- Graders run and results (PASS/FAIL): Constitution Check - PASS (both gates); All required sections complete - PASS
- Prompt variant (if applicable): None
- Next experiment: Proceed to `/sp.tasks` for task breakdown
