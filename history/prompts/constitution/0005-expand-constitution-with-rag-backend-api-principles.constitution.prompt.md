---
id: 0005
title: Expand constitution with RAG Backend API principles
stage: constitution
date: 2025-12-07
surface: ["CLI"]
model: "Gemini"
feature: "none"
branch: ""
user: "user"
command: "/sp.constitution ok now read the prompt.txt file in root to update the constitution"
labels: ["constitution", "documentation"]
links:
  spec: ""
  ticket: ""
  adr: ""
  pr: ""
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - README.md
tests:
  - "none"
---

## Prompt

/sp.constitution ok now read the prompt.txt file in root to update the constitution

I need to expand the project constitution to govern the development of a RAG Backend API.

Please add the following Principles to `.specify/memory/constitution.md`:

1.  **Serverless Compatibility**: The backend MUST be stateless and structure the entry point (`api/index.py`) to be compatible with Vercel Serverless Functions. Global variables for database clients must use lazy initialization.
2.  **Type Safety**: All backend data exchange MUST be defined using Pydantic models (`BaseModel`). No loose dictionaries for API request/response payloads.
3.  **Modular Utilities**: Shared logic (database connections, embeddings, helpers) MUST be separated into a `utils/` directory, distinct from the route handlers in `api/`.
4.  **Secure Configuration**: API Keys (Gemini, Qdrant) and sensitive configuration MUST be loaded from environment variables.
5.  **Frontend/Backend Separation**: The frontend (React/Docusaurus) MUST communicate with the backend solely via the `/api` endpoints, defined in a dedicated TypeScript service file.

Draft the updated constitution.

## Response snapshot

I have updated the project constitution to version 3.1.0 to include the new principles for RAG Backend API development.

I also updated the following files to ensure consistency:
- `.specify/memory/constitution.md`: Updated with new principles and version.
- `.specify/templates/plan-template.md`: The "Constitution Check" section now reflects the new principles.
- `README.md`: Added the new "Guiding Principles" to communicate the new standards.

Suggested commit message:
`docs: amend constitution to v3.1.0 (RAG backend principles)`

## Outcome

- ✅ Impact: The project constitution has been updated to version 3.1.0 with new principles for RAG Backend API development. The `plan-template.md` and `README.md` have been updated to reflect these changes.
- 🧪 Tests: No tests were run.
- 📁 Files:
  - `.specify/memory/constitution.md` (updated)
  - `.specify/templates/plan-template.md` (updated)
  - `README.md` (updated)
  - `history/prompts/constitution/0005-expand-constitution-with-rag-backend-api-principles.constitution.prompt.md` (created)
- 🔁 Next prompts: None
- 🧠 Reflection: The process of updating the constitution and propagating the changes to other files was successful.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A