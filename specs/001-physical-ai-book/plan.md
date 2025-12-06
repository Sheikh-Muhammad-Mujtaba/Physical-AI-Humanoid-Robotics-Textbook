# Implementation Plan: Physical AI & Humanoid Robotics – AI-Native Systems Book

**Branch**: `001-physical-ai-book` | **Date**: 2025-12-05 | **Spec**: /specs/001-physical-ai-book/spec.md
**Input**: Feature specification from `/specs/001-physical-ai-book/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the creation of a Docusaurus 3.9 book titled “Physical AI & Humanoid Robotics – AI-Native Systems”, integrating RAG and a chatbot, optimized for a hackathon. The technical approach involves phased development, leveraging Docusaurus for content, GitHub MCP for repository management, Context7 for knowledge storage, FastAPI/Qdrant for RAG, and an embedded chatbot.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (Node.js for Docusaurus), Python 3.x (for FastAPI/Qdrant)
**Primary Dependencies**: Docusaurus 3.9, React, FastAPI, Qdrant, OpenAI API/embeddings library
**Storage**: Qdrant (vector database), Local filesystem (for Docusaurus content)
**Testing**: Jest/React Testing Library (for Docusaurus components), Pytest (for FastAPI backend)
**Target Platform**: Web (Docusaurus), Linux server (FastAPI/Qdrant)
**Project Type**: Web application (Docusaurus frontend + FastAPI backend)
**Performance Goals**: Fast page load times for Docusaurus, low latency for RAG queries
**Constraints**: Hackathon time limit, resource constraints for Qdrant/FastAPI hosting (if deployed)
**Scale/Scope**: Single book with multiple chapters, single RAG chatbot instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Universal Rules**: Adhere to asking clarifying questions, stopping when stuck, not hallucinating, and storing critical decisions in Context7, and using GitHub MCP for file operations.
- **Output Format Rules**: Ensure structured Markdown, specifications, clean executable code, valid JSON, deterministic chapter formats, and valid Docusaurus layout.
- **RAG Alignment Standards**: Ensure text is chunk-friendly, maintains strict sentence boundaries, avoids ambiguous language, uses consistent terminology, and generates embeddings-ready paragraphs.
- **Subagent Philosophy**: Utilize subagents (OutlinerAgent, ChapterGeneratorAgent, SummaryAgent, RefinerAgent, CitationMapperAgent, SkillExecutorAgent) as internal tools.
- **GitHub MCP Usage Rules**: Use GitHub MCP for creating/writing/updating directories and files, maintaining folder structure, and generating full codebases.
- **Context7 Usage Rules**: Use Context7 for storing documentation, decisions, schemas, project roadmap, prompts, book outline, API references, and integration steps.
- **Mission**: Ensure the final output includes a complete Docusaurus book, multi-chapter content, Qdrant ingestion/retrieval, FastAPI RAG backend, ChatKit/OpenAI Agents integration, frontend chatbot widget, subagents + skills + router config, and a functional GitHub repo structure.

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
docusaurus-book/
├── blog/
├── docs/                     # Book chapters will reside here
│   ├── intro.md
│   └── ...
├── src/
│   ├── components/
│   ├── pages/
│   └── css/
├── static/
├── docusaurus.config.js
├── package.json
└── README.md

rag-backend/
├── main.py                   # FastAPI application
├── app/
│   ├── api/
│   ├── services/             # Qdrant client, embedding generation
│   └── models/
├── requirements.txt
└── Dockerfile                # Optional: for containerization

chatbot-widget/
├── src/
├── public/
└── package.json              # React or vanilla JS widget
```

**Structure Decision**: The project will consist of a `docusaurus-book` directory for the main book content, a `rag-backend` directory for the FastAPI/Qdrant integration, and a `chatbot-widget` for the embedded chatbot.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

---

## Macro-Phases for Book Generation

### Phase A: Docusaurus Layout Planning

*   **Objectives**:
    *   Initialize a basic Docusaurus project.
    *   Define the core layout and navigation structure for the book.
    *   Configure Docusaurus to support multiple chapters and a Table of Contents (TOC).
    *   Establish styling guidelines.
*   **Success Criteria**:
    *   Docusaurus project successfully initialized and runnable locally.
    *   Custom layout for book content is implemented (e.g., header, sidebar, footer).
    *   Navigation allows easy access to different sections.
    *   Basic styling (fonts, colors) is applied.
*   **Required Inputs**:
    *   Book title: “Physical AI & Humanoid Robotics – AI-Native Systems”
    *   Docusaurus 3.9 documentation (Context7)
    *   Desired color palette/branding (NEEDS CLARIFICATION)
*   **Risks**:
    *   Compatibility issues with Docusaurus 3.9 and specific themes/plugins.
    *   Difficulty in achieving desired aesthetic within Docusaurus capabilities.
    *   Time spent on intricate UI details reducing hackathon focus.
*   **Required Tools**: Context7 (for Docusaurus docs), GitHub MCP (for project initialization and file creation/modification).
*   **Clarifying Questions**:
    *   What specific Docusaurus theme should be used (e.g., classic, custom)?
    *   Are there any specific design system requirements or brand guidelines to follow?
    *   What are the primary navigation paths (e.g., by chapter, by topic, search)?

### Phase B: Book Structure + TOC

*   **Objectives**:
    *   Define a detailed outline for the book, including chapters and sub-sections.
    *   Create placeholder Markdown files for each chapter and integrate them into Docusaurus’s TOC.
    *   Ensure logical flow and content organization.
*   **Success Criteria**:
    *   Comprehensive book outline created.
    *   All chapters and sub-sections reflected in Docusaurus TOC.
    *   Navigation to empty chapter pages works correctly.
    *   Consistent naming conventions for chapter files.
*   **Required Inputs**:
    *   High-level book topics (e.g., Introduction to Physical AI, Robotics Architectures, AI-Native Principles, etc. - NEEDS CLARIFICATION)
    *   Target audience knowledge level (NEEDS CLARIFICATION)
*   **Risks**:
    *   Book structure becoming too complex or shallow.
    *   Redundant or missing topics.
    *   Difficulty mapping logical structure to Docusaurus’s file-based routing.
*   **Required Tools**: Context7 (for storing outline), GitHub MCP (for creating chapter files).
*   **Clarifying Questions**:
    *   What are the main thematic sections/parts of the book?
    *   What level of detail is expected for each chapter (e.g., introductory, in-depth technical)?
    *   Are there any existing books or resources that should inspire the structure?

### Phase C: Chapter Writing

*   **Objectives**:
    *   Generate content for each chapter based on the defined structure.
    *   Ensure technical accuracy and alignment with the book’s theme.
    *   Format content according to Docusaurus Markdown and RAG alignment standards.
*   **Success Criteria**:
    *   All placeholder chapters filled with relevant content.
    *   Content is technically accurate and coherent.
    *   Markdown formatting is correct and consistent.
    *   Content adheres to RAG chunking and linguistic standards.
*   **Required Inputs**:
    *   Research material/source documents on Physical AI, Humanoid Robotics, AI-Native Systems (NEEDS CLARIFICATION or will be sourced via WebSearch/Context7 during generation).
    *   Style guide for writing (tone, verbosity, technical depth - NEEDS CLARIFICATION).
*   **Risks**:
    *   Content generation taking too long or producing low-quality output.
    *   Inconsistencies in tone or technical level across chapters.
    *   Plagiarism concerns if sourcing external content without proper attribution.
*   **Required Tools**: Context7 (for knowledge base during writing), GitHub MCP (for writing files), Task (for subagents like ChapterGeneratorAgent, RefinerAgent).
*   **Clarifying Questions**:
    *   Are there specific authoritative sources that must be referenced for content?
    *   What is the desired tone (e.g., academic, practical, accessible)?
    *   How will citations and references be handled within the book?

### Phase D: GitHub Repo Structure + File Generation via MCP

*   **Objectives**:
    *   Establish the full GitHub repository structure for the Docusaurus book, RAG backend, and chatbot widget.
    *   Generate all necessary configuration files (e.g., `package.json`, `docusaurus.config.js`, `requirements.txt`, `Dockerfile`).
    *   Ensure proper `.gitignore` and `README.md` files are in place.
*   **Success Criteria**:
    *   GitHub repository is initialized with the correct multi-project structure.
    *   All essential configuration files are created and correctly configured.
    *   Repository is ready for local development and deployment.
    *   README provides clear instructions for setup and running.
*   **Required Inputs**:
    *   Specific Docusaurus configuration parameters (e.g., sidebar items, plugins - NEEDS CLARIFICATION).
    *   FastAPI/Python version requirements.
    *   Basic README content.
*   **Risks**:
    *   Incorrect file paths or configurations leading to build/runtime errors.
    *   Missing critical dependency files.
    *   Git conflicts if multiple developers work without clear guidelines.
*   **Required Tools**: GitHub MCP (for all file operations, repository creation), Context7 (for storing configuration decisions).
*   **Clarifying Questions**:
    *   Are there any existing GitHub repository templates or best practices to follow?
    *   What environment variables or secrets will be needed for deployment (e.g., API keys)?
    *   Should any CI/CD pipelines be considered for the hackathon?

### Phase E: RAG Integration (FastAPI + Qdrant)

*   **Objectives**:
    *   Set up a FastAPI backend for RAG capabilities.
    *   Integrate Qdrant as the vector database to store book embeddings.
    *   Implement an embedding generation service (e.g., using OpenAI embeddings or a local model).
    *   Create API endpoints for ingesting book content into Qdrant and performing similarity searches.
*   **Success Criteria**:
    *   FastAPI application runs successfully.
    *   Qdrant instance is accessible and functional.
    *   Book content can be successfully embedded and stored in Qdrant.
    *   API endpoints for RAG queries return relevant results from the book content.
*   **Required Inputs**:
    *   Qdrant deployment strategy (local, Docker, cloud service - NEEDS CLARIFICATION).
    *   Choice of embedding model/service (e.g., OpenAI, Hugging Face - NEEDS CLARIFICATION).
    *   API key management strategy for embedding service.
*   **Risks**:
    *   Performance bottlenecks with embedding generation or Qdrant queries.
    *   Data ingestion issues (e.g., incorrect chunking, poor embedding quality).
    *   Security vulnerabilities in FastAPI API.
*   **Required Tools**: Context7 (for Qdrant/FastAPI docs, embedding model integration), GitHub MCP (for backend code creation), Task (for general-purpose agent to assist with FastAPI/Qdrant setup).
*   **Clarifying Questions**:
    *   What are the expected latency requirements for RAG queries?
    *   Hpw will the Qdrant instance be managed and scaled?
    *   Are there specific data privacy or security concerns for the RAG data?

### Phase F: Chatbot Embedding into Book

*   **Objectives**:
    *   Develop a frontend chatbot widget (e.g., using React or vanilla JS).
    *   Integrate the chatbot widget into the Docusaurus book layout.
    *   Connect the chatbot to the FastAPI RAG backend to answer questions based on book content.
    *   Implement a user-friendly chat interface.
*   **Success Criteria**:
    *   Chatbot widget is visible and interactive within the Docusaurus book.
    *   Chatbot successfully sends queries to the FastAPI RAG endpoint.
    *   Chatbot displays relevant answers from the RAG system.
    *   User experience for the chatbot is intuitive.
*   **Required Inputs**:
    *   Chatbot UI/UX design preferences (NEEDS CLARIFICATION).
    *   Integration method for Docusaurus (e.g., custom React component, script injection).
    *   Chatbot conversation flow design (NEEDS CLARIFICATION).
*   **Risks**:
    *   Cross-origin issues between Docusaurus and FastAPI.
    *   Poor user experience due to slow responses or irrelevant answers.
    *   Styling conflicts with Docusaurus theme.
*   **Required Tools**: Context7 (for chatbot framework docs, Docusaurus integration patterns), GitHub MCP (for chatbot widget code), Task (for general-purpose agent to assist with frontend development).
*   **Clarifying Questions**:
    *   Will the chatbot have any persistent state (e.g., conversation history)?
    *   How should the chatbot handle out-of-scope questions?
    *   Are there any accessibility requirements for the chatbot?

### Phase G: Testing, Polishing, Deployment

*   **Objectives**:
    *   Perform comprehensive testing of the Docusaurus book, RAG backend, and chatbot.
    *   Address any bugs, performance issues, or UI/UX inconsistencies.
    *   Optimize the book for search engines (SEO).
    *   Prepare and execute deployment of the entire solution.
    *   Create basic documentation for maintenance and future development.
*   **Success Criteria**:
    *   All components are functional and stable.
    *   No critical bugs or regressions found.
    *   Book content is indexed by search engines.
    *   Solution is successfully deployed and publicly accessible.
    *   Maintenance documentation is available.
*   **Required Inputs**:
    *   Testing strategy (unit, integration, end-to-end - NEEDS CLARIFICATION).
    *   Deployment platform/provider (e.g., Netlify, Vercel for Docusaurus; AWS, GCP, Heroku for backend - NEEDS CLARIFICATION).
    *   Domain name (if applicable).
*   **Risks**:
    *   Deployment failures or complex configuration.
    *   Unforeseen bugs after deployment.
    *   Performance degradation under load.
    *   Security vulnerabilities in production.
*   **Required Tools**: GitHub MCP (for code fixes, deployment scripts), Context7 (for deployment platform docs), Bash (for running tests, deployment commands), Task (for general-purpose agent for debugging/optimization).
*   **Clarifying Questions**:
    *   What are the preferred testing frameworks and methodologies?
    *   What is the target deployment environment and CI/CD setup?
    *   Who will be responsible for ongoing maintenance and monitoring?

---

## Execution Timeline (Hackathon Optimized)

This timeline is aggressive and assumes parallel work where possible, with frequent communication and rapid iteration.

**Day 1: Setup & Core Structure (Phases A & B)**
*   **Morning**:
    *   Initialize Docusaurus project (GitHub MCP).
    *   Plan Docusaurus layout and navigation (Phase A).
    *   Define high-level book structure and main topics (Phase B - Clarify with user).
*   **Afternoon**:
    *   Implement Docusaurus layout and navigation (GitHub MCP).
    *   Create placeholder chapter files and integrate into TOC (GitHub MCP).
    *   Refine book structure based on feedback (Phase B).

**Day 2: Content & Initial RAG (Phases C & E - Part 1)**
*   **Morning**:
    *   Start chapter writing for initial few chapters (Phase C - Subagents).
    *   Set up FastAPI backend project structure (GitHub MCP).
    *   Integrate Qdrant and basic embedding service (Phase E).
*   **Afternoon**:
    *   Continue chapter writing.
    *   Implement API endpoints for content ingestion into Qdrant (Phase E).
    *   Basic RAG query endpoint (Phase E).

**Day 3: Chatbot & Refinement (Phases D, E - Part 2, F)**
*   **Morning**:
    *   Refine GitHub repo structure and generate config files (Phase D).
    *   Implement advanced RAG features/optimizations (Phase E).
    *   Develop core chatbot widget (Phase F).
*   **Afternoon**:
    *   Integrate chatbot into Docusaurus book (Phase F).
    *   Connect chatbot to RAG backend (Phase F).
    *   Initial testing and bug fixing (Phase G starts).

**Day 4: Testing, Polish & Deployment (Phase G)**
*   **Morning**:
    *   Comprehensive testing (unit, integration, E2E where feasible).
    *   Performance tuning and UI/UX polishing.
    *   SEO optimization.
*   **Afternoon**:
    *   Prepare for deployment.
    *   Execute deployment of Docusaurus and FastAPI backend.
    *   Final documentation for handover.

---

## Branching Decision Checks

*   **Before Phase A (Docusaurus Layout)**:
    *   **Decision**: Docusaurus version (3.9 selected).
    *   **Check**: Confirm project name, initial layout needs, theme choice.
    *   **Branching**: If custom theme, significant upfront design.
*   **Before Phase B (Book Structure)**:
    *   **Decision**: Book's core topics and target audience.
    *   **Check**: Is the outline logical and comprehensive enough?
    *   **Branching**: If structure is complex, consider sub-books or multi-level navigation.
*   **Before Phase C (Chapter Writing)**:
    *   **Decision**: Content generation strategy (manual, AI-assisted, subagents).
    *   **Check**: Are sufficient source materials available or accessible?
    *   **Branching**: If relying heavily on AI, robust refinement process needed.
*   **Before Phase D (GitHub Repo Structure)**:
    *   **Decision**: Multi-project mono-repo vs. separate repos.
    *   **Check**: Does the chosen structure simplify or complicate development/deployment?
    *   **Branching**: If separate repos, ensure clear dependency management.
*   **Before Phase E (RAG Integration)**:
    *   **Decision**: Vector database (Qdrant selected), embedding model.
    *   **Check**: Performance and scalability requirements met by chosen tech.
    *   **Branching**: If real-time updates needed, consider streaming ingestion.
*   **Before Phase F (Chatbot Embedding)**:
    *   **Decision**: Chatbot framework/library.
    *   **Check**: Ease of integration with Docusaurus, UI flexibility.
    *   **Branching**: If complex conversational AI, consider dedicated NLU/dialogue flow tools.
*   **Before Phase G (Testing, Deployment)**:
    *   **Decision**: Deployment strategy and platforms.
    *   **Check**: All components testable and production-ready.
    *   **Branching**: If high-traffic expected, consider load balancing and auto-scaling.
