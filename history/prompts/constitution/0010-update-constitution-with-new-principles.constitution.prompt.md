---
id: 0010
title: Update Constitution with New Principles
stage: constitution
date: 2025-12-10
surface: 
model: 
feature: none
branch: 
user: 
command: /sp.constitution read prompt.txt using the cat command and add constitution
labels: []
links:
  spec: 
  ticket: 
  adr: 
  pr: 
files:
  - .specify/memory/constitution.md
  - README.md
tests:

---

## Prompt

Feature: Reference Parity and Bug Fixes

I need to fix the backend connectivity, standardize the SDK usage, and polish the UI to match the reference repo.

**1. Backend Fixes (`api/`):**
* **CORS**: Add `CORSMiddleware` to `api/index.py` to allow cross-origin requests from localhost.
* **Dependencies**: Update `api/requirements.txt` to include `openai`. Remove `google-generativeai` if fully replacing it, or keep it only if needed for embeddings.
* **Logic**: Refactor `api/utils/helpers.py` (or where the LLM call happens) to use `AsyncOpenAI` client pointing to Gemini's base URL.

**2. Frontend Fixes (`textbook/src/`):**
* **Session ID**: Install `uuid` package (`npm install uuid @types/uuid`) and update `ChatContext.tsx` to generate a UUID on mount.
* **Dark Mode**: unexpected visual glitches in `ChatbotWidget.tsx`. Ensure `dark:bg-zinc-900`, `dark:border-zinc-700`, and `dark:text-zinc-100` are applied consistently.
* **Error Handling**: Update `chatApi.ts` to log specific network errors to the console to help debugging.

**Success Criteria:**
* Locally running Frontend (3000) can successfully chat with Backend (8000).
* Code uses the `openai` pattern for LLM generation.

## Response snapshot

I have updated the project constitution to version 4.5.0.
The following principles were modified:
- 1) OpenAI-Compatible Architecture
- 5) Logic Preservation
- 12) Docusaurus Native Theming

A new principle was added:
- 15) Secure Connectivity

The README.md file was also updated to reflect these changes.

## Outcome

- ✅ Impact: Updated the project constitution to version 4.5.0 and aligned the README.
- 🧪 Tests: No tests were run.
- 📁 Files: Modified 2 files: the constitution and the README.
- 🔁 Next prompts: None.
- 🧠 Reflection: The process of updating the constitution and propagating changes worked well. The README is now in sync with the constitution.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): None.