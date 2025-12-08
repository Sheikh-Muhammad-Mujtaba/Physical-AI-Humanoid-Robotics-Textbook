---
id: 0001
title: Create specification for Chatbot with History and L10n
stage: spec
date: 2025-12-07
surface: ["CLI"]
model: "Gemini"
feature: "002-chatbot-history-l10n"
branch: "002-chatbot-history-l10n"
user: "user"
command: "/sp.specify read the prompt.txt using the cat command and add specification for new features"
labels: ["specification", "documentation"]
links:
  spec: "specs/002-chatbot-history-l10n/spec.md"
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/002-chatbot-history-l10n/spec.md
  - specs/002-chatbot-history-l10n/checklists/requirements.md
tests:
  - "none"
---

## Prompt

/sp.specify read the prompt.txt using the cat command and add specification for new features

Feature: Chatbot with History (Neon Postgres) and Urdu Localization

I want to upgrade the current Docusaurus site and Python backend to support persistent chat history and Urdu translation.

**1. Backend Requirements (Hybrid Database):**
* **Vector DB**: Continue using Qdrant for RAG.
* **Relational DB**: Use **PostgreSQL (via Neon)**. Do NOT use SQLite.
* **Database Driver**: Use `psycopg2-binary` for the connection.
* **Configuration**: The app MUST connect using the `DATABASE_URL` environment variable provided by Neon.
* **New Functionality**:
    * Store chat logs/history in the `chat_history` table in Postgres.
    * Add a `POST /api/feedback` endpoint to rate answers.

**2. Frontend Requirements (Chat UI):**
* **Component**: Integrate the `ChatBot.tsx` component into the Docusaurus layout (global wrapper).
* **Persistence**: The chat UI should generate a `sessionId` (UUID) and send it with requests to track conversation history.

**3. Localization (Urdu):**
* **Docusaurus i18n**: Configure `docusaurus.config.ts` to support English (`en`) as default and Urdu (`ur`) as a second language.
* **RTL Support**: Ensure the layout switches to Right-to-Left (RTL) when Urdu is selected.
* **Translation**: Setup the folder structure (`i18n/ur/`) for manual translation.

**Success Criteria:**
* The backend connects successfully to the Neon Postgres instance.
* Chat history is persisted across reloads (fetched from Postgres).
* Switching to Urdu changes the site direction to RTL.

## Response snapshot

I have created a new feature specification for "Chatbot with History (Neon Postgres) and Urdu Localization".

The specification is located at: `specs/002-chatbot-history-l10n/spec.md`
The quality checklist is located at: `specs/002-chatbot-history-l10n/checklists/requirements.md`

The specification is ready for the next phase: `/sp.clarify`

## Outcome

- ✅ Impact: A new feature specification has been created for the Chatbot with History (Neon Postgres) and Urdu Localization. This includes the spec file and a quality checklist.
- 🧪 Tests: No tests were run.
- 📁 Files:
  - `specs/002-chatbot-history-l10n/spec.md` (created)
  - `specs/002-chatbot-history-l10n/checklists/requirements.md` (created)
  - `history/prompts/002-chatbot-history-l10n/0001-create-specification-for-chatbot-with-history-and-l10n.spec.prompt.md` (created)
- 🔁 Next prompts: `/sp.clarify`
- 🧠 Reflection: The process of creating the specification was successful.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A