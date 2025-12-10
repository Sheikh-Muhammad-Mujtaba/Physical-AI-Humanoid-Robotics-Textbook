# ADR-0007: Content Management and Update Workflow for Book Content

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Proposed
- **Date:** 2025-12-07
- **Feature:** 001-physical-ai-book
- **Context:** The project involves creating and updating a Docusaurus book. A clear and efficient workflow for content creation, modification, and publication is essential, especially for a project with a defined content guide.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

- Content Creation/Editing: Manual markdown edits directly in the GitHub repository.
- Content Structure: Book content will be structured and derived from `docs/contentguide.md`.
- Version Control: Git.

<!-- For technology stacks, list all components:
     - Framework: Next.js 14 (App Router)
     - Styling: Tailwind CSS v3
     - Deployment: Vercel
     - State Management: React Context (start simple)
-->

## Consequences

### Positive

- **Simplicity**: Low overhead, easy to understand for developers.
- **Version Control**: Leverages Git for full version history, collaboration, and rollback capabilities.
- **Direct Integration**: Content is directly managed where the code is, simplifying deployment.
- **Cost-Effective**: No need for additional CMS infrastructure or licenses.

### Negative

- **Steep Learning Curve for Non-Technical Users**: Requires familiarity with Markdown and Git/GitHub for content contributors.
- **Potential for Conflicts**: Manual edits can lead to merge conflicts, especially with multiple contributors.
- **Lack of Content-Specific Features**: No rich text editor, content scheduling, or advanced content workflows provided by a CMS.

## Alternatives Considered

- **Alternative A**: Dedicated CMS (e.g., Strapi, Contentful): Provides a user-friendly interface for non-technical content creators, advanced workflows, and content management features. Rejected due to increased complexity, setup time, and potential cost, not suitable for a hackathon context.
- **Alternative B**: Headless CMS with Git-based backend: Offers a good balance between ease of use and developer control. Rejected for similar reasons as Alternative A (increased complexity for initial setup) and a preference for maximum simplicity for the hackathon.

## References

- Feature Spec: /specs/001-physical-ai-book/spec.md
- Implementation Plan: /specs/001-physical-ai-book/plan.md
- Related ADRs: None
- Evaluator Evidence: N/A <!-- link to eval notes/PHR showing graders and outcomes -->