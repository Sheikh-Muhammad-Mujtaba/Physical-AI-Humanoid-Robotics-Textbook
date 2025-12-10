---
id: 0009
title: Update Project Constitution with Frontend Principles
stage: constitution
date: 2025-12-10
surface: CLI
model: gemini-pro
feature: none
branch: main
user: agent
command: /sp.constitution read prompt.txt and then write the constitution
labels: ["constitution", "governance", "frontend-principles"]
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
Update the constitution to enforce strict TypeScript and Docusaurus integration rules.

**Principles:**
1.  **Extension-Less Imports**: All imports of local TypeScript/React files MUST omit the `.tsx` or `.ts` extension (e.g., `import X from './file'`, NOT `import X from './file.tsx'`).
2.  **Real Data Integration**: The Frontend `ChatContext` MUST connect to the Backend API (`/api/chat`) using the `chatApi` library. Mock data is forbidden in the final build.
3.  **Docusaurus Native Theming**: All custom UI components (Chatbot, Buttons) MUST support both Light and Dark modes using Tailwind's `dark:` modifiers.
4.  **Safe CSS**: The `tailwind.config.js` MUST have `corePlugins: { preflight: false }` to prevent breaking the Docusaurus layout.
```

## Response snapshot

Updated project constitution to version 4.4.0 with modified and new frontend-related principles. Generated Sync Impact Report. Identified templates requiring manual updates.

## Outcome

- ✅ Impact: Project constitution updated with new frontend principles, version bumped to 4.4.0.
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md.
- 🔁 Next prompts: Manual review of templates for alignment with new principles. Create commit.
- 🧠 Reflection: Successfully updated the constitution based on the provided frontend principles. Updated existing principles and added a new one. The prompt.txt reading via cat command was used again.

## Evaluation notes (flywheel)

- Failure modes observed: None for this specific task.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A