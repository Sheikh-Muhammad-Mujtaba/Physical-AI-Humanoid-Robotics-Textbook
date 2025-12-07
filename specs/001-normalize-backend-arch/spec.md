# Feature Specification: Normalize Backend Architecture

**Feature Branch**: `001-normalize-backend-arch`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Normalize the entire backend architecture: PostgreSQL for user accounts + metadata, Qdrant for embeddings. Ensure ingestion, query, and authentication flows are consistent and all contradictions are resolved."

## User Scenarios & Testing

This feature is primarily an architectural refinement, so user scenarios are framed around the consistent and reliable operation of existing features under the normalized architecture.

### User Story 1 - Consistent Data Storage for Ingestion (Priority: P1)

As a content administrator, I want the ingestion process to reliably store document metadata in PostgreSQL and vector embeddings in Qdrant, so that the data is consistently organized and accessible according to the defined architecture.

**Why this priority**: Ensures the foundational data storage strategy for RAG content is correctly implemented and consistent.

**Independent Test**: Can be fully tested by performing document ingestion and verifying that metadata is stored exclusively in PostgreSQL and embeddings exclusively in Qdrant, without cross-contamination or errors.

**Acceptance Scenarios**:

1.  **Given** valid document content is submitted for ingestion, **When** the ingestion process completes, **Then** all document metadata (e.g., `doc_id`, `owner_user_id`, `chunk_id`, `chunk_text`, etc.) is stored in PostgreSQL, and only vector embeddings are stored in Qdrant.
2.  **Given** an existing document is re-ingested, **When** the process updates the document, **Then** metadata is correctly updated in PostgreSQL and associated embeddings are updated in Qdrant, maintaining data integrity.

---

### User Story 2 - Consistent Data Retrieval for Query (Priority: P1)

As a textbook reader, I want queries to retrieve information by correctly accessing document metadata from PostgreSQL and vector embeddings from Qdrant, so that answers are consistent with the normalized data architecture.

**Why this priority**: Critical for ensuring accurate and architecturally sound RAG query responses.

**Independent Test**: Can be fully tested by performing queries and observing that data access patterns correctly segregate retrieval of metadata from PostgreSQL and embeddings from Qdrant.

**Acceptance Scenarios**:

1.  **Given** a user performs a query, **When** the system processes the query, **Then** document metadata used for context or citation is retrieved from PostgreSQL, and semantic search is performed using embeddings from Qdrant.
2.  **Given** the system needs to resolve metadata (e.g., `doc_id`, `owner_user_id`) for a retrieved chunk, **When** the metadata is accessed, **Then** it is consistently retrieved from PostgreSQL.

---

### User Story 3 - Consistent User Authentication (Priority: P1)

As a user, I want my authentication and account information to be managed exclusively and consistently in PostgreSQL, so that my user data is handled securely and according to the defined database architecture.

**Why this priority**: Ensures user data integrity and security aligns with the chosen architecture.

**Independent Test**: Can be fully tested by user registration, login, and profile updates, verifying all user account data is managed solely within PostgreSQL.

**Acceptance Scenarios**:

1.  **Given** a user attempts to register or log in, **When** authentication occurs, **Then** all user account data and credentials are processed and stored exclusively in PostgreSQL.
2.  **Given** a user updates their profile information, **When** the update is processed, **Then** the changes are consistently saved to PostgreSQL.

---

### Edge Cases

-   What happens if PostgreSQL is unavailable during ingestion or authentication?
-   What happens if Qdrant is unavailable during ingestion or query vector search?
-   How are transactions handled to ensure atomicity across PostgreSQL (metadata) and Qdrant (vectors) during ingestion?
-   What happens if there's a discrepancy between `vector_id` in PostgreSQL and actual vectors in Qdrant?

## Requirements

### Out of Scope
- This feature does not introduce new user-facing functionalities beyond ensuring consistency of existing (or planned) flows.
- This feature does not redefine the core logic of RAG, only its underlying data architecture.

### Functional Requirements

-   **FR-001**: The backend architecture MUST store all user accounts and authentication data exclusively in PostgreSQL.
-   **FR-002**: The backend architecture MUST store all document metadata, including chunk-level metadata (`chunk_id`, `doc_id`, `owner_user_id`, `chunk_text`, `token_count`, `vector_id`, `created_at`, `updated_at`), exclusively in PostgreSQL.
-   **FR-003**: The backend architecture MUST store all vector embeddings exclusively in Qdrant.
-   **FR-004**: The ingestion flow MUST ensure that document metadata is persisted in PostgreSQL and vector embeddings in Qdrant, maintaining transactional consistency between the two data stores.
-   **FR-005**: The query flow MUST retrieve user-related data and document metadata from PostgreSQL, and perform vector searches against Qdrant.
-   **FR-006**: The authentication flow MUST interact exclusively with PostgreSQL for user credential verification and account management.
-   **FR-007**: All existing functional requirements related to ingestion, query, and authentication MUST be compatible with and leverage this normalized architecture.

### Non-Functional Requirements

#### Consistency
-   **NFR-C001**: Data integrity MUST be maintained across PostgreSQL and Qdrant, particularly for linked entities like `doc_id` and `vector_id`.

#### Reliability
-   **NFR-R001**: The system MUST gracefully handle failures in either PostgreSQL or Qdrant, with appropriate fallback mechanisms or error reporting.

### Key Entities

-   **PostgreSQL**: The relational database responsible for persistent storage of user accounts, authentication credentials, and all document metadata (including chunk-level details like `chunk_id`, `doc_id`, `owner_user_id`, `chunk_text`, `token_count`, `vector_id`, `created_at`, `updated_at`).
-   **Qdrant**: The vector database responsible for efficient storage and retrieval of vector embeddings associated with document chunks.
-   **User Account**: An entity representing a system user, with attributes for authentication and ownership, stored in PostgreSQL.
-   **Document Metadata Record**: A record in PostgreSQL containing structured information about a document and its chunks, linked to vector data in Qdrant via `vector_id`.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: 100% of ingestion operations successfully persist metadata in PostgreSQL and embeddings in Qdrant, maintaining transactional integrity.
-   **SC-002**: 100% of query operations correctly retrieve data from PostgreSQL for metadata and Qdrant for vector search, without architectural contradictions.
-   **SC-003**: 100% of authentication attempts successfully leverage PostgreSQL for user validation and account management.
-   **SC-004**: All previously identified contradictions and inconsistencies in the backend architecture (regarding database responsibilities) are resolved and explicitly documented.
-   **SC-005**: The normalized architecture is reflected consistently across `spec.md`, `plan.md`, and `tasks.md`.

## Assumptions

-   Existing functional requirements for ingestion, query, and authentication are maintained and will be adapted to the normalized architecture.
-   The necessary database connection strings and credentials for both PostgreSQL and Qdrant are securely managed via environment variables.
-   The transition to this normalized architecture will not introduce regressions in existing system behavior.
-   Performance characteristics of existing flows are expected to be maintained or improved under the new architecture.

## Clarifications