---
id: 0008
title: Update Project Constitution with Chatbot Principles
stage: constitution
date: 2025-12-10
surface: CLI
model: gemini-pro
feature: none
branch: main
user: agent
command: /sp.constitution run cat prompt.txt command to read details to update the constitution
labels: ["constitution", "governance"]
links:
  spec: N/A
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: .specify/memory/constitution.md
    description: Updated project constitution document.
tests: N/A
---

## Prompt

```text
Update the project constitution to govern the final Chatbot integration and styling.

**New Principles:**
1.  **Real Backend Integration**: The `ChatContext` MUST NOT use mock data or timeouts. It MUST import functions from `src/lib/chatApi` to communicate with the Python backend (`/api/chat`, `/api/ask-selection`).
2.  **Theme Consistency**: The Chatbot UI components MUST respect the Docusaurus Light/Dark mode.
    * Use Tailwind's `dark:` modifier for all background and text colors.
    * Match the primary brand color (e.g., buttons should use `var(--ifm-color-primary)` or the equivalent Tailwind class).
3.  **Error Resilience**: If the backend is offline, the Chatbot MUST display a user-friendly error message in the chat window, not crash the app.
```

## Response snapshot

Updated project constitution to version 4.3.0 with new principles for Chatbot integration and styling. Generated Sync Impact Report. Identified templates requiring manual updates.

## Outcome

- ✅ Impact: Project constitution updated with new principles, version bumped to 4.3.0.
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md.
- 🔁 Next prompts: Manual review of templates for alignment with new principles. Create commit.
- 🧠 Reflection: Successfully updated the constitution based on the provided principles. Handled the prompt.txt reading via cat command due to ignore patterns.

## Evaluation notes (flywheel)

- Failure modes observed: prompt.txt could not be read via read_file due to ignore patterns.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A