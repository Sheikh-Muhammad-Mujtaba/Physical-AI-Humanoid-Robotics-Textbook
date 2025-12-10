# Tasks: Reference Parity and Bug Fixes

**Input**: Design documents from `/specs/001-ref-parity-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Backend Alignment (User Story 1 & 2)

### User Story 1: Backend Connectivity

- [x] T001 [US1] Modify `api/index.py` to add `CORSMiddleware` with `allow_origins=["*"]`.

### User Story 2: Standardized SDK Usage

- [x] T002 [US2] Modify `api/requirements.txt` to add `openai`.
- [x] T003 [US2] Modify `api/utils/models.py` to use `AsyncOpenAI` with the Gemini base URL.

---

## Phase 2: Frontend Logic & UI Polish (User Story 3)

### User Story 3: UI Polishing

- [x] T004 [US3] [P] Run `npm install uuid @types/uuid` in the `textbook` directory.
- [x] T005 [US3] Modify `textbook/src/contexts/ChatContext.tsx` to generate a v4 UUID on mount.
- [x] T006 [US3] Modify `textbook/src/lib/chatApi.ts` to log specific network errors.
- [x] T007 [US3] Modify `textbook/src/components/ChatbotWidget.tsx` to ensure `dark:` variants are applied correctly.

---

## Phase 3: Deployment Config

- [x] T008 [P] Verify `vercel.json` to ensure it includes `api/utils/**` in the Python build.
