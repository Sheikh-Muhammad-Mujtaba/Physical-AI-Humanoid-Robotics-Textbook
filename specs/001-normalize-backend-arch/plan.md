# Implementation Plan: Normalize Backend Architecture

**Feature Branch**: `001-normalize-backend-arch`  
**Created**: 2025-12-07  
**Status**: Draft  

## Technical Context

### Architecture & Components
- **Backend API**: FastAPI
- **Vector Store**: Qdrant Cloud Free Tier (Exclusively for vector embeddings and retrieval, as per spec.)
- **Database**: PostgreSQL (For user accounts, authentication, and all document metadata, as per spec.)
- **Embedding Model**: Gemini embedding model ("text-embedding-004")
- **LLM for Query**: Gemini LLM ("gemini-1.5-flash", "gemini-1.5-pro") orchestrated via OpenAI Agent SDK
- **Orchestration**: OpenAI Agent SDK
- **Fallback LLMs**: OpenAI ChatCompletions, Claude Code Router
- **Hosting**: NEEDS CLARIFICATION (Optimal hosting environment/platform for FastAPI backend remains an unknown, to be researched in Phase 0.)

### Key Technologies
- **Primary Language**: Python 3.10+
- **Frameworks/Libraries**: FastAPI, Qdrant client, Gemini SDK, OpenAI Agent SDK, httpx, pydantic, SQLAlchemy, asyncpg, Alembic

### Integrations
- **Gemini API**: Used for embedding and chat completions (orchestrated via OpenAI Agent SDK).
- **OpenAI API**: Used for chat completions as a fallback LLM; OpenAI Agent SDK leveraged for Gemini orchestration.
- **Claude API**: Used for chat completions as a secondary fallback LLM.
- **Qdrant Cloud**: Vector store for chunk embeddings, configured with "robotics_book" collection.
- **PostgreSQL**: Primary database for user accounts, authentication, and document metadata.

### Knowns & Assumptions
- **Knowns**:
    - All functional and non-functional requirements from `spec.md` are accepted.
    - PostgreSQL is in scope for user accounts, authentication, and document metadata.
    - Qdrant is exclusively for vector embeddings and retrieval.
    - Chunk metadata table schema is defined in `spec.md` (`chunk_id`, `doc_id`, `owner_user_id`, `chunk_text`, `token_count`, `vector_id`, `created_at`, `updated_at`).
    - Gemini integration is orchestrated via OpenAI Agent SDK.
    - Qdrant instance stores up to 10,000 documents, approx. 10GB data.
- **Assumptions**:
    - Reliable network connectivity to all external API services (Gemini, OpenAI, Claude, Qdrant, PostgreSQL service).
    - API keys and database credentials are securely managed via environment variables.
    - Existing functional requirements for ingestion, query, and authentication will be adapted to the normalized architecture.
    - Transition to normalized architecture will not introduce regressions.
    - Performance characteristics of existing flows are expected to be maintained or improved.

### Unknowns / Needs Clarification (NEEDS CLARIFICATION MUST BE RESOLVED IN RESEARCH.MD)
- Optimal hosting environment/platform for FastAPI backend (e.g., Docker, Kubernetes, serverless, specific cloud provider).
- Detailed error handling and retry mechanisms for external API failures (beyond simple fallbacks to other LLMs).
- Detailed observability requirements, including specific metrics to track, alerting thresholds, and potential integration with monitoring tools.

## Constitution Check

### Primary Directives
- [x] Preserve correctness and reproducibility.
- [x] Use Context7 for authoritative docs, templates, examples, and storage of decisions.
- [x] Use GitHub MCP for all filesystem/repo operations (create/update/commit).
- [x] When uncertain, STOP and ASK a single clarifying question — do NOT guess or waste tokens.

### Token & Safety Rules
- [x] Do not generate long content or change files until the structure is validated and approved.
- [x] If a generation might cause build/deploy failure (configs, URLs, paths), ask first.

### RAG / Claude Behavior
- [x] Claude must ask clarifying questions if blocked or missing critical data; never assume.
- [x] Prefer minimal, high-precision questions.
- [x] When using subagents/skills, call them only when they reduce risk or complexity.

### Context & Source Rules
- [x] Persist all important outputs, decisions, and generated artifacts into Context7.
- [x] Save versions of any file put into the repo via GitHub MCP (commit message must reference spec id).

### Validation Checkpoints (MUST OCCUR BEFORE WRITE)
- [ ] Config validation (docusaurus.config, package.json)
- [ ] Build validation (locally or CI simulation)
- [ ] Link check (internal doc links + images)
- [x] Security check (no secrets in files)

### Deploy & Rollback Rules
- [ ] For GitHub Pages: ensure baseUrl is correct for repo vs org pages.
- [ ] Create a rollback commit and note in Context7 before any production push.

### Communication Rule
- [x] Every major step ends with: “Do you approve? (yes/no).”
- [x] If user answers no, list options and propose corrective actions.

## Gates

### Pre-requisite Gates
- [x] Feature Specification (`spec.md`) is complete and approved.
- [x] All critical ambiguities from `spec.md` have been clarified.
- [ ] Research phase (`research.md`) is complete. (Will be completed in Phase 0 of this plan.)

### Post-Design Gates
- [ ] Data Model (`data-model.md`) is complete. (Will be generated in Phase 1.)
- [ ] API Contracts (`contracts/`) are defined. (Will be generated in Phase 1.)
- [ ] Quickstart guide (`quickstart.md`) is drafted. (Will be generated in Phase 1.)

## Phases of Work

### Phase 0: Research & Outline

#### Goal
Resolve all "Unknowns / Needs Clarification" identified in the Technical Context, specifically regarding hosting and detailed error/observability. Consolidate findings into `research.md`.

#### Tasks (to be expanded in tasks.md)
- Research optimal hosting environment/platform for FastAPI backend (e.g., Docker, Kubernetes, serverless, specific cloud provider).
- Research detailed error handling and retry mechanisms for external API failures (beyond simple fallbacks to other LLMs), considering the new PostgreSQL integration.
- Research detailed observability requirements, including specific metrics to track, alerting thresholds, and potential integration with monitoring tools.

#### Artifacts
- `research.md` (detailed findings and decisions)

### Phase 1: Design & Contracts

#### Goal
Translate clarified requirements and research findings into detailed design artifacts for the normalized architecture.

#### Tasks (to be expanded in tasks.md)
- Define FastAPI application structure, incorporating PostgreSQL for user/metadata management.
- Design data models for user accounts and document metadata in PostgreSQL, based on the schema defined in `spec.md`.
- Define how Qdrant integration will specifically handle vector embeddings with links to PostgreSQL metadata.
- Define API endpoints and their request/response schemas, ensuring consistency with the normalized architecture.
- Implement initial PostgreSQL client setup and ORM integration (SQLAlchemy, asyncpg).
- Draft quickstart guide for local setup and basic usage, reflecting the normalized architecture.

#### Artifacts
- `data-model.md` (detailed data structures for PostgreSQL and its interaction with Qdrant)
- `contracts/` (OpenAPI/Swagger definitions for API endpoints, potentially updated for new auth flows or metadata access)
- `quickstart.md` (guide for getting started with the normalized backend)

### Phase 2: Implementation

#### Goal
Develop and test the normalized RAG backend based on design artifacts.

#### Tasks (to be expanded in tasks.md)
- Implement FastAPI endpoints for authentication and user management.
- Implement PostgreSQL database schema and migrations (using Alembic).
- Integrate PostgreSQL for document metadata storage and retrieval.
- Integrate chunking, embedding, and Qdrant upsert logic, ensuring metadata is handled by PostgreSQL.
- Implement LLM routing, query, and ingestion flows consistent with the normalized architecture.
- Implement logging, error handling, and retry mechanisms for both Qdrant and PostgreSQL interactions.
- Develop unit and integration tests for all new and modified components, including database interactions and architectural consistency checks.

#### Artifacts
- `src/` (backend source code, updated)
- `tests/` (unit and integration tests, updated)

### Phase 3: Deployment & Observability

#### Goal
Deploy the normalized backend and ensure operational readiness and monitoring.

#### Tasks (to be expanded in tasks.md)
- Develop deployment scripts/configurations based on hosting research.
- Implement comprehensive monitoring and alerting based on observability research, covering both Qdrant and PostgreSQL health.
- Set up CI/CD pipeline for the normalized backend.

#### Artifacts
- Deployment configurations (e.g., Dockerfile, Kubernetes manifests, or cloud-specific configs)
- Monitoring dashboards/alerts configurations