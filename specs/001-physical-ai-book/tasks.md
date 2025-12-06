## Tasks for Physical AI & Humanoid Robotics – AI-Native Systems Book

### A. Environment Setup Tasks

- [ ] T001 Install Node.js and npm (manual step, requires user action)
- [ ] T002 Install Python 3.x and pip (manual step, requires user action)
- [x] T003 Initialize Docusaurus project in `docusaurus-book/`
- [x] T004 Install Docusaurus project dependencies in `docusaurus-book/`
- [x] T005 Create Python virtual environment for RAG backend in `rag-backend/`
- [ ] T006 Activate Python virtual environment for RAG backend
- [ ] T007 Install FastAPI and Qdrant dependencies for RAG backend from `rag-backend/requirements.txt`

### B. Docusaurus Layout Tasks

- [x] T008 Configure `docusaurus.config.js` with book title and basic theme options `docusaurus-book/docusaurus.config.js`
- [x] T009 [P] Create custom CSS file for basic styling in `docusaurus-book/src/css/custom.css`
- [ ] T010 [P] Implement custom Navbar and Footer components for Docusaurus in `docusaurus-book/src/theme/Navbar.js`
- [ ] T011 Configure Docusaurus sidebar navigation in `docusaurus-book/sidebars.js`

### C. Documentation Structure Tasks

- [x] T012 Create `docusaurus-book/docs` directory for book chapters
- [x] T013 Create `docusaurus-book/docs/_category_.json` for main book category
- [x] T014 Create placeholder Markdown files for main chapters
- [x] T015 Update `docusaurus-book/sidebars.js` to include new chapter Markdown files

### D. Content Generation Tasks

- [x] T016 [P] Generate detailed content for `docusaurus-book/docs/chapter1.md`
- [x] T017 [P] Generate detailed content for `docusaurus-book/docs/chapter2.md` and `docusaurus-book/docs/chapter3.md`
- [ ] T018 Review and refine generated chapter content for accuracy, coherence, and RAG alignment
- [ ] T019 Add citations and references to chapter content where necessary `docusaurus-book/docs/**/*.md`

### E. GitHub File Creation Tasks

- [ ] T020 Create `.gitignore` file for the repository root `/.gitignore`
- [ ] T021 Create `README.md` for the overall project `README.md`
- [ ] T022 Create `package.json` for Docusaurus (if not created by init) in `docusaurus-book/package.json`
- [ ] T023 Create `rag-backend/requirements.txt` for FastAPI backend dependencies `rag-backend/requirements.txt`
- [ ] T024 Create `rag-backend/Dockerfile` for FastAPI backend (optional, ask for confirmation) `rag-backend/Dockerfile`

### F. RAG Backend Tasks (FastAPI + Qdrant)

- [ ] T025 Create FastAPI application structure in `rag-backend/main.py` and `rag-backend/app/`
- [ ] T026 Implement Qdrant client initialization and connection in `rag-backend/app/services/qdrant_service.py`
- [ ] T027 Create embedding generation service in `rag-backend/app/services/embedding_service.py`
- [ ] T028 Implement API endpoint for book content ingestion into Qdrant in `rag-backend/app/api/ingestion.py`
- [ ] T029 Implement API endpoint for RAG queries in `rag-backend/app/api/query.py`
- [ ] T030 Add basic error handling and logging to FastAPI endpoints in `rag-backend/app/main.py` and `rag-backend/app/api/*.py`

### G. Chatbot UI Integration Tasks

- [ ] T031 Create chatbot widget project structure in `chatbot-widget/`
- [ ] T032 Develop basic chatbot UI components
- [ ] T033 Integrate chatbot widget into Docusaurus layout
- [ ] T034 Connect chatbot frontend to FastAPI RAG backend
- [ ] T035 Implement displaying RAG responses in chatbot UI
- [ ] T036 Add basic styling to chatbot widget

### H. Packaging, Testing, Deploy Tasks

- [ ] T037 Write unit tests for Docusaurus custom React components
- [ ] T038 Write unit tests for FastAPI RAG backend services and API endpoints
- [ ] T039 Implement end-to-end testing for chatbot and RAG flow
- [ ] T040 Configure Docusaurus for production deployment
- [ ] T041 Configure FastAPI RAG backend for production deployment
- [ ] T042 Deploy Docusaurus book (manual or automated step, requires user action)
- [ ] T043 Deploy FastAPI RAG backend (manual or automated step, requires user action)
- [ ] T044 Create basic documentation for maintenance and future development

---

### Critical Path Task List

1.  T003 Initialize Docusaurus project in `docusaurus-book/`
2.  T004 Install Docusaurus project dependencies in `docusaurus-book/`
3.  T008 Configure `docusaurus.config.js` with book title and basic theme options `docusaurus-book/docusaurus.config.js`
4.  T012 Create `docusaurus-book/docs` directory for book chapters
5.  T013 Create `docusaurus-book/docs/_category_.json` for main book category
6.  T014 Create placeholder Markdown files for main chapters
7.  T015 Update `docusaurus-book/sidebars.js` to include new chapter Markdown files
8.  T005 Create Python virtual environment for RAG backend in `rag-backend/`
9.  T006 Activate Python virtual environment for RAG backend
10. T023 Create `rag-backend/requirements.txt` for FastAPI backend dependencies `rag-backend/requirements.txt`
11. T007 Install FastAPI and Qdrant dependencies for RAG backend from `rag-backend/requirements.txt`
12. T025 Create FastAPI application structure in `rag-backend/main.py` and `rag-backend/app/`
13. T026 Implement Qdrant client initialization and connection in `rag-backend/app/services/qdrant_service.py`
14. T027 Create embedding generation service in `rag-backend/app/services/embedding_service.py`
15. T028 Implement API endpoint for book content ingestion into Qdrant in `rag-backend/app/api/ingestion.py`
16. T029 Implement API endpoint for RAG queries in `rag-backend/app/api/query.py`
17. T031 Create chatbot widget project structure in `chatbot-widget/`
18. T032 Develop basic chatbot UI components
19. T033 Integrate chatbot widget into Docusaurus layout
20. T034 Connect chatbot frontend to FastAPI RAG backend
21. T035 Implement displaying RAG responses in chatbot UI

### Parallelizable Tasks

*   T009 Create custom CSS file for basic styling in `docusaurus-book/src/css/custom.css`
*   T010 Implement custom Navbar and Footer components for Docusaurus
*   T016 Generate detailed content for `docusaurus-book/docs/chapter1-introduction.md`
*   T017 Generate detailed content for `docusaurus-book/docs/chapter2-concepts.md` (and subsequent chapters)
*   T018 Review and refine generated chapter content for accuracy, coherence, and RAG alignment (can be done per chapter as generated)
*   T019 Add citations and references to chapter content where necessary
*   T020 Create `.gitignore` file for the repository root `/.gitignore`
*   T021 Create `README.md` for the overall project `README.md`
*   T022 Create `package.json` for Docusaurus (if not created by init)
*   T024 Create `rag-backend/Dockerfile` for FastAPI backend (optional, ask for confirmation)
*   T030 Add basic error handling and logging to FastAPI endpoints
*   T036 Add basic styling to chatbot widget
*   T037 Write unit tests for Docusaurus custom React components
*   T038 Write unit tests for FastAPI RAG backend services and API endpoints
*   T039 Implement end-to-end testing for chatbot and RAG flow

### Tasks Requiring Human Approval

*   T001 Install Node.js and npm
*   T002 Install Python 3.x and pip
*   T003 Initialize Docusaurus project (especially if overwriting)
*   T008 Configure `docusaurus.config.js` (confirming organization/project names)
*   T009 Desired color palette/branding for custom CSS
*   T010 Specific Navbar/Footer structure and links
*   T014 Exact titles for main chapters
*   T016 Specific sub-topics and technical detail level for content generation
*   T019 Citation style for chapter content
*   T021 Specific sections for main `README.md`
*   T024 Confirmation for creating `Dockerfile` and base image
*   T026 Qdrant connection details (host, port, API key)
*   T027 Specific embedding model/service
*   T028 Metadata fields for Qdrant ingestion
*   T029 How retrieved content chunks should be combined/summarized
*   T031 Chatbot widget framework choice (React vs Vanilla JS)
*   T033 Chatbot widget positioning in Docusaurus layout
*   T042 Deploy Docusaurus book (manual confirmation of deployment steps)
*   T043 Deploy FastAPI RAG backend (manual confirmation of deployment steps)
*   T044 Most critical aspects for maintenance documentation
*   T040 Chosen hosting provider for Docusaurus book
*   T041 How environment variables for FastAPI backend will be managed in production
*   T039 Critical end-to-end user flows for testing
