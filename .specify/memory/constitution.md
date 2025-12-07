<!--
Sync Impact Report:
Version change: 3.0.0 -> 3.1.0
Modified principles: Added new principles for RAG Backend API development.
Added sections: None
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/sp.adr.md: ⚠ pending
  - .specify/templates/commands/sp.analyze.md: ⚠ pending
  - .specify/templates/commands/sp.checklist.md: ⚠ pending
  - .specify/templates/commands/sp.clarify.md: ⚠ pending
  - .specify/templates/commands/sp.git.commit_pr.md: ⚠ pending
  - .specify/templates/commands/sp.implement.md: ⚠ pending
  - .specify/templates/commands/sp.phr.md: ⚠ pending
  - .specify/templates/commands/sp.plan.md: ⚠ pending
  - .specify/templates/commands/sp.specify.md: ⚠ pending
  - .specify/templates/commands/sp.tasks.md: ⚠ pending
  - README.md: ⚠ pending
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown.
-->
# Hackathon Project: AI/Spec-Driven Book + RAG Chatbot Constitution

These are hard rules and must ALWAYS be enforced to support a high-quality technical textbook and RAG Backend API development.

## Core Principles

### 1) Educational Clarity
All content MUST be accessible to beginners while technically accurate. Complex concepts MUST include diagrams or examples.

### 2) Docusaurus-First Architecture
Content MUST be structured for Docusaurus. Every Markdown file MUST include valid frontmatter (`id`, `title`, `sidebar_position`).

### 3) Modular Content
Large topics MUST be broken down into atomic, readable sub-chapters (files) rather than monolithic documents.

### 4) Single Source of Truth
When importing content from a master file, the `docs/` folder becomes the new source of truth. The master file is archived after import.

### 5) Asset Management
Images and static assets MUST be stored in `docs/static/img` and referenced with relative paths.

### 6) Serverless Compatibility
The backend MUST be stateless and structure the entry point (`api/index.py`) to be compatible with Vercel Serverless Functions. Global variables for database clients must use lazy initialization.

### 7) Type Safety
All backend data exchange MUST be defined using Pydantic models (`BaseModel`). No loose dictionaries for API request/response payloads.

### 8) Modular Utilities
Shared logic (database connections, embeddings, helpers) MUST be separated into a `utils/` directory, distinct from the route handlers in `api/`.

### 9) Secure Configuration
API Keys (Gemini, Qdrant) and sensitive configuration MUST be loaded from environment variables.

### 10) Frontend/Backend Separation
The frontend (React/Docusaurus) MUST communicate with the backend solely via the `/api` endpoints, defined in a dedicated TypeScript service file.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

**Version**: 3.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-07
