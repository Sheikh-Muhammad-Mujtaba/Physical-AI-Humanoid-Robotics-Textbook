---
id: 0003
title: Create Tasks for Reference Parity and Bug Fixes
stage: tasks
date: 2025-12-10
surface: 
model: 
feature: 001-ref-parity-fixes
branch: 001-ref-parity-fixes
user: 
command: /sp.tasks
labels: []
links:
  spec: specs/001-ref-parity-fixes/spec.md
  plan: specs/001-ref-parity-fixes/plan.md
  tasks: specs/001-ref-parity-fixes/tasks.md
  ticket: 
  adr: 
  pr: 
files:
- specs/001-ref-parity-fixes/tasks.md
tests:

---

## Prompt

Generate dependency-ordered tasks.

**Tasks:**
1.  **[Backend]**: Update `api/requirements.txt` (add `openai`).
2.  **[Backend]**: Edit `api/index.py` to add `app.add_middleware(CORSMiddleware, ...)` immediately after defining `app`.
3.  **[Backend]**: Refactor `api/utils/helpers.py` to implement the `get_chat_response` using `AsyncOpenAI` (Gemini adapter).
4.  **[Frontend]**: Run `npm install uuid @types/uuid` in `textbook/`.
5.  **[Frontend]**: Update `textbook/src/contexts/ChatContext.tsx` to use `v4()` from `uuid`.
6.  **[Frontend]**: Audit `ChatbotWidget.tsx` for missing `dark:` classes.

## Response snapshot

I have created a new task list for "Reference Parity and Bug Fixes".
The task list is located at `specs/001-ref-parity-fixes/tasks.md`.

## Outcome

- ✅ Impact: Created a new task list for 'Reference Parity and Bug Fixes'.
- 🧪 Tests: No tests were run.
- 📁 Files: Created 1 file: the task list.
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: The tasks are broken down by user story and phase, which should make implementation straightforward.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): None.