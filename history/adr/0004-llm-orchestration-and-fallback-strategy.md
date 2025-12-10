# ADR-0004: LLM Orchestration and Fallback Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-07
- **Feature:** 001-normalize-backend-arch
- **Context:** The Retrieval-Augmented Generation (RAG) system heavily relies on Large Language Models (LLMs) for generating answers. A robust strategy is needed to leverage powerful models effectively while ensuring high availability and reliability through fallback mechanisms.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

The primary LLM for answer generation will be **Google Gemini** (initially "gemini-1.5-flash", with "gemini-1.5-pro" as a fallback within the Gemini tier). This will be **orchestrated via the OpenAI Agent SDK**.

If Gemini (via OpenAI Agent SDK) fails, the system will **fall back to OpenAI ChatCompletions**.

If OpenAI ChatCompletions also fail, the system will **fall back to Claude Code Router**.

## Consequences

### Positive

-   **Leverages Advanced Models**: Utilizes the capabilities of state-of-the-art Gemini models for high-quality answer generation.
-   **High Reliability**: The multi-tiered fallback mechanism significantly improves the resilience of the RAG system against outages or performance degradation of any single LLM provider.
-   **Consistency with Existing Design**: Reuses the established orchestration pattern of using the OpenAI Agent SDK, which is already integrated.
-   **Redundancy**: Provides operational redundancy for critical answer generation functionality.

### Negative

-   **Increased Complexity**: Managing and integrating multiple LLM providers and an orchestration layer adds complexity to the codebase and configuration.
-   **Potential Latency**: If primary LLM calls frequently fail, cascading fallbacks could introduce noticeable latency for users.
-   **Dependency on Multiple External APIs**: Relies on the availability and performance of several external services.
-   **Cost Implications**: Costs may increase if fallback models are frequently used, depending on pricing structures.

## Alternatives Considered

-   **Single LLM provider (e.g., only Gemini)**:
    -   **Pros**: Simpler integration and management, reduced complexity.
    -   **Cons**: Introduces a single point of failure; if the primary LLM service is down, experiences rate limits, or performs poorly, the RAG system's answer generation capability would be severely impacted or halted.
    -   **Rejected**: Due to critical reliability concerns and lack of fault tolerance.
-   **Custom LLM routing and fallback logic**:
    -   **Pros**: Full control over routing, load balancing, and fallback strategies.
    -   **Cons**: Requires significant development and maintenance effort to implement and test a robust, fault-tolerant custom solution. Duplicates functionality already available in existing orchestration tools.
    -   **Rejected**: Due to higher development cost and maintenance overhead compared to leveraging existing SDKs and proven patterns.

## References

- Feature Spec: /specs/001-normalize-backend-arch/spec.md
- Implementation Plan: /specs/001-normalize-backend-arch/plan.md
- Related ADRs: None
- Evaluator Evidence: None