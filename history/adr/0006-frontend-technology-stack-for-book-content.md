# ADR-0006: Frontend Technology Stack for Book Content

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Proposed
- **Date:** 2025-12-07
- **Feature:** 001-physical-ai-book
- **Context:** The project aims to create a Docusaurus book for "Physical AI & Humanoid Robotics – AI-Native Systems". The frontend technology stack needs to support documentation generation, content display, and basic web application features. The project will leverage existing project structure.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

- Framework: Docusaurus 3.x
- Language: React, TypeScript
- Deployment: Static site generation, hosted via GitHub Pages (or similar static hosting)
- Content Structure: Utilizes existing `docs/` directory as the root for the Docusaurus book.

<!-- For technology stacks, list all components:
     - Framework: Next.js 14 (App Router)
     - Styling: Tailwind CSS v3
     - Deployment: Vercel
     - State Management: React Context (start simple)
-->

## Consequences

### Positive

- **Specialized for Documentation**: Docusaurus is built specifically for documentation, providing features like versioning, search, and theming out-of-the-box.
- **React Ecosystem**: Leverages the popular React ecosystem for UI development, allowing for custom components and extensions.
- **TypeScript Support**: Provides type safety and better developer experience.
- **Static Site Generation**: Results in fast page load times and low hosting costs.
- **Leverages Existing Structure**: Integrates seamlessly with the project's existing `docs/` directory.

### Negative

- **Docusaurus-Specific Learning Curve**: Developers unfamiliar with Docusaurus may need time to learn its conventions and APIs.
- **Limited Dynamic Features**: While extendable with React, Docusaurus is primarily a static site generator, which might limit highly dynamic application features without additional effort.
- **Build Times**: For very large books, build times can increase, though this is mitigated by static generation benefits.

## Alternatives Considered

- **Alternative Stack A**: VuePress/VitePress: Similar static site generators but based on Vue.js. Rejected because Docusaurus is already in use/familiar within the project context, and React/TypeScript are preferred languages.
- **Alternative Stack B**: Custom React/Next.js Application: Provides maximum flexibility but significantly increases development effort for basic documentation features (e.g., routing, sidebar, search) that Docusaurus provides out-of-the-box.

## References

- Feature Spec: /specs/001-physical-ai-book/spec.md
- Implementation Plan: /specs/001-physical-ai-book/plan.md
- Related ADRs: None
- Evaluator Evidence: N/A <!-- link to eval notes/PHR showing graders and outcomes -->