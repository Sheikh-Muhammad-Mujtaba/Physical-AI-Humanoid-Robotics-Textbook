---
id: 0007
title: update constitution frontend principles
stage: constitution
date: 2025-12-10
surface: cli
model: gemini-1.5-flash
feature: none
branch: main
user: mujtaba
command: /sp.constitution read the prompt.txt using cat commands and update the constitutionn accordingly
labels: []
links:
  spec: 
  ticket: 
  adr: 
  pr: 
files:
  - path: .specify/memory/constitution.md
    action: modified
tests:
  - type: none
    status: N/A
---

## Prompt

The user requested to update the project constitution based on the content of `prompt.txt`.

**User command:**
`/sp.constitution read the prompt.txt using cat commands and update the constitutionn accordingly`

**Content of prompt.txt:**
```
Update the project constitution to govern the Frontend Architecture and Component Placement.

**Overwrite** conflicting principles with these new rules:

1.  **Root-Level Integration**: The Chatbot component MUST NOT be embedded in Markdown or Page files. It MUST be rendered solely in `src/theme/Root.tsx` so it persists globally across the entire application.
2.  **Global State Management**: Chat visibility (`isOpen`) and context data MUST be managed via a React Context (`ChatProvider`). This allows components like the "Selection Button" to control the Chatbot from anywhere.
3.  **Floating Widget UX**: The Chatbot MUST be a collapsible "Floating Action Button" (FAB) widget fixed to the bottom-right of the viewport. Inline styles are FORBIDDEN; use Tailwind CSS.
4.  **Logic Preservation**: The refactored UI MUST retain the existing backend integration (chat history, session UUIDs, feedback) that uses the OpenAI SDK.
```

## Response snapshot

Updated `.specify/memory/constitution.md` to version `4.1.0`. Incorporated new frontend architecture and component placement principles from `prompt.txt`, superseding previous general UI principles. Retained non-conflicting backend and deployment principles. Updated `LAST_AMENDED_DATE` to `2025-12-10`. A Sync Impact Report was prepended to the constitution file detailing the changes, version bump, and files requiring follow-up updates.

## Outcome

- ✅ Impact: Constitution successfully updated with new frontend principles.
- 🧪 Tests: N/A
- 📁 Files: One file modified: `.specify/memory/constitution.md`
- 🔁 Next prompts: User needs to acknowledge the changes and potentially address the flagged templates.
- 🧠 Reflection: The process involved reconciling user input with existing document content, performing a version bump, and generating a detailed impact report. Special attention was paid to the "overwrite conflicting principles" instruction.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A