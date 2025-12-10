# ADR-0005: API Design for Authentication and Data Operations

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-07
- **Feature:** 001-normalize-backend-arch
- **Context:** The backend needs to expose clear, consistent, and secure APIs for managing user accounts, handling authentication, and performing core RAG functionalities (document ingestion and querying), all aligned with the normalized data architecture.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

The backend API will follow a **RESTful design pattern** using **FastAPI**.

**Key Endpoints:**
-   **`/api/auth/register` (POST)**: For creating new user accounts.
-   **`/api/auth/token` (POST)**: For user login and issuing **JSON Web Tokens (JWT)** access tokens.
-   **`/api/users/me` (GET)**: For retrieving information about the currently authenticated user.
-   **`/api/ingest` (POST)**: For ingesting document content, with metadata persisting in PostgreSQL and vector embeddings in Qdrant.
-   **`/api/query` (POST)**: For querying the RAG system, retrieving metadata from PostgreSQL and performing vector searches against Qdrant.
-   **`/api/health` (GET)**: For checking the operational status of the API.

**Authentication Mechanism:**
-   Authentication will be based on **JWTs** (JSON Web Tokens) using the **BearerAuth** scheme, managed by FastAPI's `OAuth2PasswordBearer`.

## Consequences

### Positive

-   **Standardization**: RESTful design is a widely understood and adopted standard, promoting interoperability and ease of integration for client applications.
-   **Clear Responsibilities**: Endpoints clearly delineate responsibilities for user management, authentication, and core RAG functionalities.
-   **Scalable Authentication**: JWTs provide a stateless authentication mechanism, which is suitable for distributed systems and horizontal scaling.
-   **FastAPI Benefits**: Leverages FastAPI's automatic OpenAPI documentation generation, Pydantic models for data validation, and dependency injection system.
-   **Security**: JWTs offer a secure way to transmit user identity between client and server once authenticated.

### Negative

-   **JWT Security Considerations**: Requires careful handling of JWTs (e.g., secure storage on the client-side, proper expiration management, potential for token revocation if not carefully implemented).
-   **API Versioning**: Future changes to API contracts will require a clear versioning strategy to maintain backward compatibility.
-   **Overhead for Simple Clients**: May introduce slight overhead for extremely simple client applications compared to session-based approaches.

## Alternatives Considered

-   **GraphQL API**:
    -   **Pros**: More flexible for clients to request only the data they need, reducing over-fetching. Single endpoint.
    -   **Cons**: Adds complexity to backend implementation (schema definition, resolvers), requires different client-side tooling. Less ideal for simple, command-style operations like document ingestion.
    -   **Rejected**: Increased complexity for the current scope and less suited for the defined operations.
-   **Session-based Authentication**:
    -   **Pros**: Simpler for traditional server-rendered web applications, easier to manage session state on the server.
    -   **Cons**: Can complicate horizontal scaling (requires shared session store), less suitable for mobile or cross-origin (CORS) client authentication compared to JWTs. Less stateless.
    -   **Rejected**: Less scalable and flexible for a modern API backend serving various client types.

## References

- Feature Spec: /specs/001-normalize-backend-arch/spec.md
- Implementation Plan: /specs/001-normalize-backend-arch/plan.md
- API Contracts: /specs/001-normalize-backend-arch/contracts/openapi.yaml
- Related ADRs: None
- Evaluator Evidence: None