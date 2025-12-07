# ADR-0002: Data Storage Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-07
- **Feature:** 001-normalize-backend-arch
- **Context:** Previous inconsistencies existed regarding the roles of PostgreSQL and Qdrant. A clear definition is needed for storing user accounts, document metadata, and vector embeddings to ensure data integrity and optimal performance.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**PostgreSQL** will be used exclusively for **user accounts, authentication, and all document metadata**, including chunk-level details (e.g., `chunk_id`, `doc_id`, `owner_user_id`, `chunk_text`, `token_count`, `vector_id`, `created_at`, `updated_at`).

**Qdrant Cloud Free Tier** will be used exclusively for the storage and retrieval of **vector embeddings**.

## Consequences

### Positive

-   **Clear Separation of Concerns**: Each database is leveraged for its strengths (relational integrity and ACID properties for metadata/user data; efficient vector search for embeddings).
-   **Data Integrity**: PostgreSQL ensures strong consistency and relational integrity for critical metadata and user information.
-   **Optimized Performance**: Qdrant provides highly optimized vector search capabilities.
-   **Scalability**: Allows independent scaling of relational data and vector data stores.
-   **Resolves Inconsistencies**: Addresses previous ambiguities and contradictions in the architecture.

### Negative

-   **Operational Complexity**: Requires managing two distinct database systems.
-   **Transactional Challenges**: Requires careful implementation of transactional consistency mechanisms during operations like ingestion (e.g., ensuring both PostgreSQL and Qdrant are updated atomically or can be rolled back).
-   **Increased Latency**: Some queries may require fetching data from both systems.

## Alternatives Considered

-   **Single Database (e.g., PostgreSQL with pgvector)**:
    -   **Pros**: Simpler operational overhead, single point of truth for all data.
    -   **Cons**: `pgvector` might not scale as efficiently for very large vector search workloads compared to a dedicated vector database like Qdrant. Might complicate relational schema with vector data.
    -   **Rejected**: For specialized vector search performance and scalability provided by Qdrant.
-   **Qdrant for all metadata**:
    -   **Pros**: Simpler integration with vector data.
    -   **Cons**: Qdrant's payload is flexible but lacks the relational capabilities, strong consistency, and advanced querying of a traditional SQL database needed for user accounts and complex metadata management. Not suitable for transactional user authentication.
    -   **Rejected**: Due to lack of relational capabilities, strong consistency, and transactional support essential for user and detailed document metadata.

## References

- Feature Spec: /specs/001-normalize-backend-arch/spec.md
- Implementation Plan: /specs/001-normalize-backend-arch/plan.md
- Data Model: /specs/001-normalize-backend-arch/data-model.md
- Related ADRs: None
- Evaluator Evidence: None