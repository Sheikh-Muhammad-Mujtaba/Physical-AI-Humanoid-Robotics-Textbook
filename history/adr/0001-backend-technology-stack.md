# ADR-0001: Backend Technology Stack

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-07
- **Feature:** 001-normalize-backend-arch
- **Context:** The project requires a robust and performant backend API for a RAG system. Consistency with existing RAG components and leveraging an asynchronous framework are key considerations.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

The backend API will be implemented using **FastAPI** with **Python 3.10+**.

## Consequences

### Positive

-   Leverages an existing performant, asynchronous Python web framework.
-   Maintains consistency with the established RAG backend.
-   Provides excellent developer experience and a robust ecosystem for API development.
-   Strong support for type hints and data validation (Pydantic).

### Negative

-   Requires Python expertise.
-   May introduce challenges if integration with other non-Python services becomes extensive.

## Alternatives Considered

-   **Flask**: Lighter-weight, but requires more manual setup for features like Pydantic integration and asynchronous handling. Rejected for a more batteries-included async framework for API.
-   **Django**: More opinionated, full-stack framework. Overkill for a pure API backend. Rejected due to larger overhead.
-   **Node.js (Express.js)**: Different ecosystem, would require bridging with existing Python-based RAG components (e.g., Gemini SDK, Qdrant client, LLM services). Rejected for ecosystem consistency.

## References

- Feature Spec: /specs/001-normalize-backend-arch/spec.md
- Implementation Plan: /specs/001-normalize-backend-arch/plan.md
- Related ADRs: None
- Evaluator Evidence: None