---
id: 0001
title: Chatbot Backend Connection and Themed UI Spec
stage: spec
date: 2025-12-10
surface: CLI
model: gemini-pro
feature: 001-chatbot-backend-theme
branch: 001-chatbot-backend-theme
user: agent
command: /sp.specify "run cat prompt.txt again and read spects to update new spects"
labels: ["spec-generation", "chatbot", "backend-integration", "ui-theming"]
links:
  spec: specs/001-chatbot-backend-theme/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/001-chatbot-backend-theme/spec.md
    description: Generated feature specification.
  - path: specs/001-chatbot-backend-theme/checklists/requirements.md
    description: Specification quality checklist.
tests: N/A
---

## Prompt

```text
Feature: Chatbot Backend Connection and Themed UI

I need to connect the frontend to the real backend and polish the UI to match the book.

**1. Backend Connection (Logic):**
* **Target**: `textbook/src/contexts/ChatContext.tsx`.
* **Requirement**: Replace the `setTimeout` mock in `sendMessage` with a real call to `chatWithBackend` (from `../lib/chatApi`).
* **Selection Support**: If `selectedText` is present, call `askSelectionWithBackend` instead of the standard chat.

**2. UI Polish (Theming):**
* **Target**: `textbook/src/components/ChatbotWidget.tsx` (and `TextSelectionButton.tsx`).
* **Light Mode**: White backgrounds, dark text, gray borders.
* **Dark Mode**: Dark gray/black backgrounds (`dark:bg-gray-900`), white text (`dark:text-gray-100`), subtle borders (`dark:border-gray-700`).
* **Primary Color**: Use the Docusaurus primary color for the "Send" button and the Chat Bubble icon.

**Success Criteria:**
* Sending a message triggers a network request to `/api/chat`.
* The Chatbot background changes automatically when toggling the Docusaurus Dark Mode switch.
```

## Response snapshot

Generated feature specification `specs/001-chatbot-backend-theme/spec.md` and a corresponding quality checklist `specs/001-chatbot-backend-theme/checklists/requirements.md`. Noted technical debt in spec due to highly technical user input.

## Outcome

- ✅ Impact: Specification for chatbot backend connection and themed UI generated.
- 🧪 Tests: N/A
- 📁 Files: Created spec.md and requirements.md.
- 🔁 Next prompts: /sp.plan
- 🧠 Reflection: The initial user input was an instruction to read another file for the actual feature description, and the feature description itself was highly technical. This led to a spec that, while accurate to the request, violated principles of high-level, non-technical specification. The create-new-feature.sh script also produced many warnings/errors when parsing the multi-line description, but it still successfully created the feature structure.

## Evaluation notes (flywheel)

- Failure modes observed: create-new-feature.sh produced parsing errors for multi-line description.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A