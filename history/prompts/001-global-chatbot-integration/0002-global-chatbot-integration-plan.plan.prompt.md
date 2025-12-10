---
id: 0002
title: global chatbot integration plan
stage: plan
date: 2025-12-10
surface: cli
model: gemini-1.5-flash
feature: 001-global-chatbot-integration
branch: 001-global-chatbot-integration
user: mujtaba
command: /sp.plan read prompt.txt using cat command as I just update it to create the plan
labels: []
links:
  spec: specs/001-global-chatbot-integration/spec.md
  ticket: 
  adr: 
  pr: 
files:
  - path: specs/001-global-chatbot-integration/plan.md
    action: created
  - path: specs/001-global-chatbot-integration/research.md
    action: created
  - path: specs/001-global-chatbot-integration/data-model.md
    action: created
  - path: specs/001-global-chatbot-integration/contracts/frontend-contract.md
    action: created
  - path: specs/001-global-chatbot-integration/quickstart.md
    action: created
  - path: GEMINI.md
    action: modified
tests:
  - type: none
    status: N/A
---

## Prompt

The user requested to create an implementation plan for the current feature. The command given was `/sp.plan read prompt.txt using cat command as I just update it to create the plan`.

The content of `prompt.txt` that was used for the specification and guided this plan was:

```
Feature: Global Chatbot Integration (Root Architecture)

I want to move the Chatbot from being an embedded page component to a global application-level widget, exactly like the reference architecture.

**1. Architecture Change (The "Move"):**
* **Target**: `src/theme/Root.tsx`.
* **Requirement**: The `ChatBot` and `TextSelectionButton` components MUST be rendered inside this Root wrapper.
* **Cleanup**: Remove any `<ChatBot />` tags from `src/pages/index.tsx` or `docs/` content.

**2. Component Refactoring:**
* **ChatBot.tsx**: Rewrite this to be a "dumb" UI component that receives its state (`messages`, `isOpen`) from a Context Provider.
* **Style**: Convert it to a fixed position popup (Bottom-Right) with a toggle button.
* **Logic**: Keep the `getHistory` and `chatWithBackend` calls, but move the *state* that drives them into the Context.

**3. New Context (`ChatContext.tsx`):**
* Create a provider that holds:
    * `isOpen` (boolean)
    * `sessionId` (string)
    * `messages` (array)
    * `selectedText` (string)
* It should expose functions like `openChat()`, `handleSelection(text)`, and `sendMessage(text)`.

**Success Criteria:**
* The Chatbot appears on *every* page (Docs, Blog, Home).
* Navigating between pages does *not* reset the chat history.
* Clicking "Ask AI" on selected text opens this global chatbot instance.
```

## Response snapshot

Successfully created the implementation plan (`specs/001-global-chatbot-integration/plan.md`), research document (`specs/001-global-chatbot-integration/research.md`), data model (`specs/001-global-chatbot-integration/data-model.md`), frontend contract (`specs/001-global-chatbot-integration/contracts/frontend-contract.md`), and quickstart guide (`specs/001-global-chatbot-integration/quickstart.md`) for the "Global Chatbot Integration (Root Architecture)" feature. The agent's context (`GEMINI.md`) was updated with relevant technologies extracted from the plan. All constitutional principles were respected, and no gate violations were found during the planning process.

## Outcome

- ✅ Impact: A comprehensive implementation plan, including research, data model, contracts, and a quickstart guide, has been successfully generated for the feature.
- 🧪 Tests: N/A
- 📁 Files:
    - Created: `specs/001-global-chatbot-integration/plan.md`
    - Created: `specs/001-global-chatbot-integration/research.md`
    - Created: `specs/001-global-chatbot-integration/data-model.md`
    - Created: `specs/001-global-chatbot-integration/contracts/frontend-contract.md`
    - Created: `specs/001-global-chatbot-integration/quickstart.md`
    - Modified: `GEMINI.md`
- 🔁 Next prompts: The feature is now ready for task breakdown and implementation (`/sp.tasks`).
- 🧠 Reflection: The planning process involved evaluating the feature against constitutional principles, detailing technical context, and generating design artifacts. The iterative nature of the process ensured all requirements were addressed and documented.

## Evaluation notes (flywheel)

- Failure modes observed: Initial script call syntax error for `update-agent-context.sh` was resolved.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A