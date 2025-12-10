# ADR-0003: ORM and Database Access Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-07
- **Feature:** 001-normalize-backend-arch
- **Context:** The backend requires robust, asynchronous interaction with the PostgreSQL database for user management and document metadata, integrated seamlessly with the FastAPI framework. A reliable method for managing database schema evolution is also necessary.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

The Object-Relational Mapper (ORM) for PostgreSQL access will be **SQLAlchemy (version 2.0+)** with **asyncpg** as the asynchronous database driver. **Alembic** will be used for managing database schema migrations.

## Consequences

### Positive

-   **Robust ORM**: SQLAlchemy is a mature, powerful, and flexible ORM for Python, enabling type-safe and object-oriented database interactions.
-   **Asynchronous Compatibility**: `asyncpg` ensures non-blocking I/O for database operations, which aligns well with FastAPI's asynchronous nature and improves performance for concurrent requests.
-   **Schema Evolution**: Alembic provides a robust and version-controlled mechanism for managing database schema changes, crucial for long-term project maintainability.
-   **Rich Ecosystem**: Both SQLAlchemy and Alembic have extensive documentation, community support, and integration with various tools.

### Negative

-   **Learning Curve**: Developers new to SQLAlchemy's declarative models, session management, or Alembic's migration workflow may experience a learning curve.
-   **Configuration Complexity**: Requires careful setup and configuration of engine, session factories, and migration environment.
-   **Increased Dependencies**: Adds multiple libraries to the project's dependency graph.

## Alternatives Considered

-   **Direct `asyncpg` usage (without ORM)**:
    -   **Pros**: Offers maximum control over SQL queries, potentially slightly better performance for highly optimized queries.
    -   **Cons**: Requires writing more boilerplate SQL code, lacks object-relational mapping capabilities, increases development time and risk of SQL injection if not careful.
    -   **Rejected**: ORM benefits (object mapping, query building, schema definition) outweigh the minor performance gains and increased boilerplate.
-   **Other Asynchronous ORMs (e.g., Tortoise ORM, GINO)**:
    -   **Pros**: Potentially simpler APIs for basic use cases.
    -   **Cons**: SQLAlchemy is a more mature and widely adopted solution with broader features, better community support, and a proven track record for complex enterprise applications.
    -   **Rejected**: SQLAlchemy's maturity, flexibility, and powerful feature set are preferred for this project.
-   **Manual SQL migrations**:
    -   **Pros**: No additional tools needed.
    -   **Cons**: Lacks version control, automation, and programmatic management features provided by Alembic. Prone to errors and difficult to track changes in a collaborative environment.
    -   **Rejected**: Alembic's version-controlled, programmatic migration management is essential for maintainability.

## References

- Feature Spec: /specs/001-normalize-backend-arch/spec.md
- Implementation Plan: /specs/001-normalize-backend-arch/plan.md
- Data Model: /specs/001-normalize-backend-arch/data-model.md
- Related ADRs: None
- Evaluator Evidence: None