# Feature Specification: Gemini-augmented RAG Backend

**Feature Branch**: `001-gemini-rag-backend`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Goal: Build and expose a complete Gemini-augmented RAG backend for the Physical-AI-Humanoid-Robotics textbook website. TECH STACK: - FastAPI backend API - Qdrant Cloud Free Tier vector store - Gemini embedding model (text-embedding-004 or latest) - Gemini LLM for answering questions (gemini-1.5-flash or gemini-1.5-pro) - OpenAI ChatKit/Agents as second-choice LLM - Claude Code Router as failover multiplexer - Python 3.10+ - Modular codebase structure REQUIREMENTS: 1) ENDPOINTS - POST /ingest   Input: {doc_id, text, metadata}   Action: chunk → embed → qdrant.upsert   Embeddings must use Gemini Embedding API.   Output: {status, chunks_ingested} - POST /query   Input: {question, selection?, top_k?}   RAG Logic:     • If selection exists → restrict retrieval to that span     • Else semantic search     • Retrieved text passed to LLM router   Router Priority:     1. Gemini LLM (Flash/Pro)     2. OpenAI ChatCompletions     3. Claude Code Router   Output: {answer, citations, raw_chunks} - GET /health   Returns {status:"ok"} 2) GEMINI CONFIG - Embedding model: "text-embedding-004" - Chat model: "gemini-1.5-flash" (default) - Fallback model: "gemini-1.5-pro" Environment variables: - GEMINI_API_KEY - GEMINI_EMBED_MODEL=text-embedding-004 - GEMINI_CHAT_MODEL=gemini-1.5-flash 3) QDRANT CONFIG - Collection: "robotics_book" - Vector size = embedding dimension from Gemini (768 or dynamic) - Metric: cosine 4) CHUNKING RULES - 900–1400 characters - sentence-aware splitting - metadata includes doc_id, chapter, chunk_index, char_start, char_end 5) RAG ROUTER LOGIC - Orchestration: OpenAI Agent SDK. - Prioritization: Gemini LLM (via OpenAI Agent SDK) (Flash → Pro) - Fallback 1: OpenAI ChatCompletions (if Gemini via Agent SDK fails) - Fallback 2: Claude Code Router (if OpenAI fails) - All responses must include:   • Answer   • Citation metadata   • Raw chunk list 6) SECURITY - No secrets stored in repo - Use environment variables 7) OUTPUTS - Complete FastAPI backend - Ready for Docusaurus front-end integration End with: “Backend spec (Gemini-enabled) loaded — proceed to /sp.plan?”"

## Clarifications

## Clarifications

### Session 2025-12-07
- Q: Is user management (e.g., creating/managing content administrators) explicitly out of scope for this backend, to be handled by a separate system? → A: Yes, out of scope
- Q: Will the `/ingest` endpoint require authorization to prevent unauthorized content submission? → A: No, the endpoint will be publicly accessible.
- Q: If a document with an existing `doc_id` is ingested, should it update the existing document (e.g., delete old chunks, ingest new ones) or return an error? → A: Update existing document: Delete all existing chunks associated with the `doc_id` and ingest the new content.
- Q: What are the expected throughput requirements for the `/ingest` endpoint (e.g., how many documents/chunks per minute)? → A: 10 documents/minute
- Q: What level of logging is required (e.g., info, warn, error) and where should logs be sent (e.g., console, file, centralized logging service)? → A: Basic logging (info, warn, error) to console (stdout/stderr).
- Q: How exactly should the Gemini model be integrated into the RAG backend, considering the mention of 'OpenAI agent sdk with the gemini model not the genrative ai sdk'? → A: Use the OpenAI Agent SDK to *orchestrate* calls to the Gemini model for chat completions, and the native Gemini SDK for embeddings.
- Q: Are there specific scale assumptions for the total number of documents or total data size expected in Qdrant? → A: Up to 10,000 documents, 10GB data.

## User Scenarios & Testing

### User Story 1 - Ingest Textbook Content (Priority: P1)

As a content administrator, I want to ingest new or updated sections of the Physical-AI-Humanoid-Robotics textbook into the RAG system so that the chatbot can answer questions based on the latest information.

**Why this priority**: Essential for populating the knowledge base.

**Independent Test**: Can be fully tested by sending text content to the `/ingest` endpoint and verifying the status and ingested chunks.

**Acceptance Scenarios**:

1.  **Given** valid textbook content and metadata, **When** the content is sent to the `/ingest` endpoint, **Then** the content is chunked, embedded using Gemini, and stored in Qdrant, returning a success status and count of chunks.
2.  **Given** invalid content or metadata, **When** the content is sent to the `/ingest` endpoint, **Then** an appropriate error is returned, and no data is stored.
3.  **Given** a document with an existing `doc_id` is ingested, **When** the new content is sent to the `/ingest` endpoint, **Then** all old chunks associated with that `doc_id` are deleted, and the new content is chunked, embedded, and stored, returning a success status.

---

### User Story 2 - Query Textbook for Answers (Priority: P1)

As a textbook reader, I want to ask natural language questions about the Physical-AI-Humanoid-Robotics textbook and receive accurate, cited answers so that I can quickly find information and deepen my understanding.

**Why this priority**: Core functionality for the end-user.

**Independent Test**: Can be fully tested by sending a question to the `/query` endpoint and verifying the answer, citations, and raw chunks.

**Acceptance Scenarios**:

1.  **Given** a question about the textbook without a specific selection, **When** the question is sent to the `/query` endpoint, **Then** the system performs a semantic search, retrieves relevant chunks, uses a Gemini LLM to generate an answer with citations, and returns the answer, citations, and raw chunks.
2.  **Given** a question about the textbook with a specific document selection, **When** the question is sent to the `/query` endpoint, **Then** the system restricts retrieval to that selection, uses an LLM to generate an answer with citations, and returns the answer, citations, and raw chunks.
3.  **Given** a question where the primary Gemini LLM fails, **When** the question is sent to the `/query` endpoint, **Then** the system transparently falls back to OpenAI, then Claude, to generate an answer, returning the answer, citations, and raw chunks.
4.  **Given** a question for which no relevant information is found, **When** the question is sent to the `/query` endpoint, **Then** the system returns an informative response indicating it could not find an answer, with empty citations.

---


### User Story 3 - Monitor Backend Health (Priority: P2)

As a system administrator, I want to check the operational status of the RAG backend so that I can ensure its availability.

**Why this priority**: Important for system maintenance and reliability.

**Independent Test**: Can be fully tested by sending a request to the `/health` endpoint and verifying the `status:"ok"` response.

**Acceptance Scenarios**:

1.  **Given** the RAG backend is operational, **When** a GET request is sent to the `/health` endpoint, **Then** the system returns `{status:"ok"}`.

---


### Edge Cases

-   What happens when a very long document is ingested, exceeding chunk size limits or memory?
-   How does the system handle concurrent ingestion or query requests?
-   What happens when an embedding or LLM API call fails or times out?
-   How does the system handle queries with no relevant chunks found?
-   What if a requested `doc_id` for ingestion already exists? (Update or error?)

## Requirements


- **Ingest Endpoint Authorization**: The `/ingest` endpoint will be publicly accessible and will not require authorization.

### Functional Requirements

-   **FR-001**: The system MUST provide a FastAPI backend API.
-   **FR-002**: The system MUST include a `/ingest` endpoint that accepts `{doc_id, text, metadata}`.
-   **FR-003**: The `/ingest` endpoint MUST chunk the input text according to specified rules (900-1400 chars, sentence-aware splitting).
-   **FR-004**: The `/ingest` endpoint MUST embed the chunks using the Gemini Embedding API ("text-embedding-004").
- **FR-005**: The `/ingest` endpoint MUST, if a `doc_id` already exists, first delete all existing chunks associated with that `doc_id` from Qdrant, delete associated document metadata from PostgreSQL, then upsert the new embedded chunks into a Qdrant vector store with the collection "robotics_book" and store updated document metadata in PostgreSQL.
-   **FR-006**: The `/ingest` endpoint MUST return `{status, chunks_ingested}` upon successful processing.
-   **FR-007**: The system MUST include a `/query` endpoint that accepts `{question, selection?, top_k?}`.
-   **FR-008**: The `/query` endpoint MUST perform semantic search for relevant chunks if `selection` is not provided.
-   **FR-009**: The `/query` endpoint MUST restrict retrieval to the specified `selection` if provided.
-   **FR-010**: The `/query` endpoint MUST pass retrieved text to an LLM router for answer generation.
-   **FR-011**: The LLM router MUST prioritize Gemini LLM ("gemini-1.5-flash" then "gemini-1.5-pro") orchestrated via the OpenAI Agent SDK.
-   **FR-012**: The LLM router MUST fall back to OpenAI ChatCompletions if Gemini fails.
-   **FR-013**: The LLM router MUST fall back to Claude Code Router if OpenAI fails.
-   **FR-014**: The `/query` endpoint MUST return `{answer, citations, raw_chunks}`.
-   **FR-015**: The system MUST include a `/health` endpoint that returns `{status:"ok"}`.
-   **FR-016**: The system MUST use Gemini embedding model "text-embedding-004".
-   **FR-017**: The system MUST use Gemini chat model "gemini-1.5-flash" by default, with "gemini-1.5-pro" as fallback, orchestrated via the OpenAI Agent SDK.
-   **FR-018**: The system MUST configure Qdrant with collection "robotics_book", cosine metric, and vector size matching Gemini embedding dimension.
- **FR-019**: Chunk and document metadata MUST be stored in PostgreSQL, including `chunk_id`, `doc_id`, `owner_user_id`, `chunk_text`, `token_count`, `vector_id`, `created_at`, `updated_at` for chunks, and additional document-level attributes as needed.
-   **FR-020**: The system MUST NOT store secrets in the repository.
-   **FR-021**: The system MUST use environment variables for sensitive configurations (e.g., `GEMINI_API_KEY`).
-   **FR-022**: The system MUST manage user accounts and authentication using PostgreSQL.
-   **FR-023**: The system MUST store document metadata (e.g., `doc_id`, `chapter`, `chunk_index`, `char_start`, `char_end`, and potentially other document-level attributes) in PostgreSQL.

### Non-Functional Requirements
#### Scalability
-   The system is expected to scale to support a Qdrant instance storing up to 10,000 documents with a total data size of approximately 10GB.

### Data Model

#### `chunk_metadata_table` (PostgreSQL)
- `chunk_id` (Primary Key, UUID): Unique identifier for each chunk.
- `doc_id` (Foreign Key): Identifier for the parent document.
- `owner_user_id` (Foreign Key): Identifier for the user who owns the document/chunk.
- `chunk_text` (Text): The raw text content of the chunk.
- `token_count` (Integer): The number of tokens in `chunk_text`.
- `vector_id` (UUID): Reference to the corresponding vector in Qdrant.
- `created_at` (Timestamp with timezone): Timestamp of chunk creation.
- `updated_at` (Timestamp with timezone): Timestamp of last chunk update.

### Key Entities

-   **User**: A registered user with credentials, managed in PostgreSQL for authentication and account management.
-   **Document Metadata**: Structured information about ingested documents and their chunks, stored in PostgreSQL as per the `chunk_metadata_table` schema.
-   **Document/Textbook Content**: The raw textual information from the Physical-AI-Humanoid-Robotics textbook, including its structure (chapters, sections).
-   **Chunk**: A segment of the Document/Textbook Content, adhering to specified size and splitting rules, used for embedding and retrieval.
-   **Embedding**: A numerical representation (vector) of a Chunk, generated by the Gemini Embedding API.
-   **Question**: A natural language query posed by the user.
-   **Answer**: A natural language response generated by an LLM based on retrieved chunks.
-   **Citation**: Metadata identifying the source (e.g., chapter, page, chunk_index) of information used in an Answer.

### Data Volume Assumptions
-   The Qdrant instance is expected to store up to 10,000 documents with a total data size of approximately 10GB.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: The `/ingest` endpoint successfully processes and stores 100% of valid textbook content without data loss or corruption.
-   **SC-002**: The `/query` endpoint returns a relevant answer with citations for 90% of user questions, as judged by human evaluators.
-   **SC-003**: The average response time for the `/query` endpoint is under 3 seconds for 95% of queries.
-   **SC-004**: The system maintains an "ok" status on the `/health` endpoint 99.9% of the time.
-   **SC-005**: All sensitive configurations are managed via environment variables, ensuring no secrets are exposed in the codebase.
-   **SC-006**: The RAG router successfully falls back to alternative LLMs when the primary Gemini LLM fails, ensuring continuous service availability.
-   **SC-007**: The `/ingest` endpoint can process and store at least 10 documents per minute.

### Observability
-   **OBS-001**: The system MUST log informational, warning, and error messages to the console (stdout/stderr).