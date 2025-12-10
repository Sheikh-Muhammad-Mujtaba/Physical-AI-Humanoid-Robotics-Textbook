---

description: "Task list for Gemini-augmented RAG Backend feature implementation"
---

# Task Breakdown: Gemini-augmented RAG Backend

**Feature**: `001-gemini-rag-backend`
**Date**: 2025-12-07

This document breaks down the implementation of the Gemini RAG backend into actionable, dependency-ordered tasks, including the setup for PostgreSQL database connectivity.

## Phase 1: Project Setup

- [x] T001 Create the backend directory structure in `backend/`.
- [x] T002 Initialize a `requirements.txt` file in `backend/` with `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`, `google-generativeai`, `qdrant-client`, `sqlalchemy`, `asyncpg`, `pgvector`, `alembic`, `pytest`, and `pytest-mock`.
- [x] T003 Create a `.env.example` file in `backend/` with placeholders for `GEMINI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, and `DATABASE_URL`.
- [x] T004 Create the main application entrypoint in `backend/src/main.py`.
- [x] T005 Implement a configuration module in `backend/src/core/config.py` to load all environment variables.

## Phase 2: Foundational Services (RAG)

- [x] T006 [P] Implement the Gemini Embedding Service in `backend/src/services/embedding_service.py`.
- [x] T007 [P] Implement the Qdrant Vector Store Service in `backend/src/services/vector_store_service.py`.
- [x] T008 [P] Implement the Sentence-Aware Chunking Service in `backend/src/services/chunking_service.py`.
- [x] T009 [P] Implement the LLM Router Service in `backend/src/services/llm_service.py`.

## Phase 3: User Story 1 - Ingest Textbook Content (US1)

**Goal**: Implement the `/ingest` endpoint to process and store textbook content.
**Independent Test**: Send a document to `/ingest` and verify a `200 OK` response and that the data exists in Qdrant.

- [x] T010 [US1] Define the Pydantic models for the ingest endpoint in `backend/src/models/ingest.py`.
- [x] T011 [US1] Implement the `/ingest` API route in `backend/src/api/ingest.py`, ensuring it is publicly accessible.
- [x] T012 [US1] In the `/ingest` route, implement the logic to delete existing chunks if a `doc_id` is re-ingested.
- [x] T013 [US1] Add integration tests for the `/ingest` endpoint in `backend/tests/test_ingest.py`.

## Phase 4: User Story 2 - Query Textbook for Answers (US2)

**Goal**: Implement the `/query` endpoint to answer questions based on the stored content.
**Independent Test**: Send a question to `/query` and verify a `200 OK` response with a relevant answer and citations.

- [x] T014 [US2] Define the Pydantic models for the query endpoint in `backend/src/models/query.py`.
- [x] T015 [US2] Implement the `/query` API route in `backend/src/api/query.py`.
- [x] T016 [US2] Add integration tests for the `/query` endpoint in `backend/tests/test_query.py`.

<h2>Phase 5: User Story 3 - Monitor Backend Health (US3)</h2>

**Goal**: Implement the `/health` endpoint to provide a simple status check.
**Independent Test**: Send a GET request to `/health` and verify a `200 OK` response.

- [x] T017 [US3] Implement the `/health` API route in `backend/src/api/health.py`.
- [x] T018 [US3] Add a simple test for the `/health` endpoint in `backend/tests/test_health.py`.

<h2>Phase 6: PostgreSQL Database Setup</h2>

**Goal**: Set up the PostgreSQL database connection for backend use.

- [x] T019 [P] Create a new service module `backend/src/services/db_service.py` to handle the database session.
- [x] T020 [P] Define a `User` model using SQLAlchemy in `backend/src/models/user.py`.
- [ ] T021 [P] Implement `SQLAlchemy` async engine and session management in `backend/src/services/db_service.py`.
- [ ] T022 Configure the `DATABASE_URL` environment variable in `backend/.env.example` with the Neon DB connection string and load it in `backend/src/core/config.py`. (e.g., `postgresql://neondb_owner:npg_d2LPJKQ7aXIo@ep-tiny-grass-adxhzd95-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`)
- [ ] T023 Add an Alembic migration setup to `backend/` to manage database schema changes.
- [ ] T024 Create the initial migration for the `User` model.
- [ ] T025 Apply the initial database migration.
- [ ] T026 Integrate database session dependency into FastAPI app in `backend/src/main.py`.
- [ ] T027 Add a basic `/db-status` endpoint in `backend/src/api/health.py` to verify database connectivity.
- [ ] T028 Add unit/integration tests for `db_service.py` and the `/db-status` endpoint.

<h2>Phase 7: Polish & Finalization</h2>

- [x] T029 [P] Add comprehensive docstrings and type hints to all new modules.
- [x] T030 [P] Update `README.md` in the `backend/` directory with setup and usage instructions.
- [x] T031 [P] Create a script in `backend/scripts/ingest_docs.py` to ingest all Markdown chapters.
- [x] T032 [P] Generate a sample Docusaurus integration snippet in `backend/docusaurus_integration_snippet.jsx`.
- [ ] T033 Run a final `pytest` and `ruff check .` on the `backend/` directory and ensure all tests pass.

<h2>Dependencies</h2>

```mermaid
graph TD
    subgraph Legend
        direction LR
        A[Phase]
    end

    subgraph Feature Flow
        direction TB
        Setup(Phase 1: Setup) --> Foundational(Phase 2: Foundational Services)
        Foundational --> US1(Phase 3: Ingest)
        Foundational --> PostgresSetup(Phase 6: PostgreSQL Database Setup)
        US1 --> US2(Phase 4: Query)
        Setup --> US3(Phase 5: Health Check)
        US2 --> Polish(Phase 7: Polish)
        US3 --> Polish
        PostgresSetup --> Polish
    end
```

- All User Story phases depend on **Setup** and **Foundational Services**.
- The **PostgreSQL Database Setup** phase can run in parallel with the RAG feature phases after **Setup** is complete.
- **Polish** can begin after all core feature work is done.

<h2>Implementation Strategy</h2>

<h3>MVP First (User Story 1 Only)</h3>

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

<h3>Incremental Delivery</h3>

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

<h3>Parallel Team Strategy</h3>

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently
