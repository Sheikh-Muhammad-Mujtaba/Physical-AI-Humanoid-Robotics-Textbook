---
id: 0001
title: Fix Build Errors and Finalize Global Chatbot Spec
stage: spec
date: 2025-12-10
surface: CLI
model: gemini-pro
feature: 001-add-new-specs
branch: 001-add-new-specs
user: agent
command: /sp.specify "read prompt.txt using the cat command to read and add new specs"
labels: ["spec-generation", "build-fix", "tailwind"]
links:
  spec: specs/001-add-new-specs/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/001-add-new-specs/spec.md
    description: Generated feature specification.
  - path: specs/001-add-new-specs/checklists/requirements.md
    description: Specification quality checklist.
tests: N/A
---

## Prompt

```text
Feature: Fix Build Errors and Finalize Global Chatbot

I need to resolve the "module has no exports" build error and ensure Tailwind loads correctly.

**1. Fix Import Paths (Critical Build Fix):**
* **Target**: `textbook/src/theme/Root.tsx` and any component consuming `ChatContext`.
* **Issue**: The import path `../contexts/ChatContext.tsx` is invalid in Webpack/TS.
* **Requirement**: Change all imports to `../contexts/ChatContext` (remove file extension).

**2. Configure PostCSS (Tailwind Fix):**
* **Target**: `textbook/postcss.config.js`.
* **Requirement**: Create this file to enable Tailwind processing:
  ```javascript
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
3. Clean Up Root Logic:

Target: textbook/src/theme/Root.tsx.

Requirement: Remove the unused handleAsk function and askSelectionWithBackend import. The Root component should only be responsible for:

Wrapping the app in <ChatProvider>.

Rendering <TextSelectionButton /> and <ChatbotWidget />.

Success Criteria:

npm run build passes without errors.

The Chatbot appears on the site.
```

## Response snapshot

Generated feature specification `specs/001-add-new-specs/spec.md` and a corresponding quality checklist `specs/001-add-new-specs/checklists/requirements.md`. Noted technical debt in spec due to highly technical user input.

## Outcome

- ✅ Impact: Specification for critical build errors and chatbot finalization generated.
- 🧪 Tests: N/A
- 📁 Files: Created spec.md and requirements.md.
- 🔁 Next prompts: /sp.plan
- 🧠 Reflection: The initial user input was an instruction to read another file for the actual feature description, and the feature description itself was highly technical. This led to a spec that, while accurate to the request, violated principles of high-level, non-technical specification. The agent handled the "pwsh not found" error by using the bash equivalent script.

## Evaluation notes (flywheel)

- Failure modes observed: pwsh command not found on linux environment.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A