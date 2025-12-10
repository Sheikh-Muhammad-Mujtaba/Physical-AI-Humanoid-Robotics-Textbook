# Implementation Plan: Physical AI & Humanoid Robotics – AI-Native Systems Book

**Branch**: `001-physical-ai-book` | **Date**: 2025-12-07 | **Spec**: /specs/001-physical-ai-book/spec.md
**Input**: Feature specification from `/specs/001-physical-ai-book/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the creation of a Docusaurus book titled “Physical AI & Humanoid Robotics – AI-Native Systems”. The technical approach involves phased development, leveraging Docusaurus for content, and content updated via manual markdown edits in the GitHub repository.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (Node.js for Docusaurus), TypeScript
**Primary Dependencies**: Docusaurus 3.x, React
**Storage**: Local filesystem (for Docusaurus content)
**Testing**: Jest/React Testing Library (for Docusaurus components), Visual inspection, Link checking
**Target Platform**: Web
**Project Type**: Web application (Docusaurus frontend)
**Performance Goals**: Target page load time for a typical chapter page: under 2 seconds.
**Constraints**: Content update via manual markdown edits in the GitHub repository.
**Scale/Scope**: Medium-sized book (10-20 chapters, 10-20 pages each), determined by `docs/contentguide.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **PRIMARY DIRECTIVES**: Preserve correctness and reproducibility. Use Context7 for authoritative docs, templates, examples, and storage of decisions. Use GitHub MCP for all filesystem/repo operations (create/update/commit). When uncertain, STOP and ASK a single clarifying question — do NOT guess or waste tokens.
- **TOKEN & SAFETY RULES**: Do not generate long content or change files until the structure is validated and approved. If a generation might cause build/deploy failure (configs, URLs, paths), ask first.
- **RAG / CLAUDE BEHAVIOR**: Claude must ask clarifying questions if blocked or missing critical data; never assume. Prefer minimal, high-precision questions. When using subagents/skills, call them only when they reduce risk or complexity.
- **CONTEXT & SOURCE RULES**: Persist all important outputs, decisions, and generated artifacts into Context7. Save versions of any file put into the repo via GitHub MCP (commit message must reference spec id).
- **VALIDATION CHECKPOINTS (MUST OCCUR BEFORE WRITE)**: Config validation (docusaurus.config, package.json), Build validation (locally or CI simulation), Link check (internal doc links + images), Security check (no secrets in files).
- **DEPLOY & ROLLBACK RULES**: For GitHub Pages: ensure baseUrl is correct for repo vs org pages. Create a rollback commit and note in Context7 before any production push.
- **COMMUNICATION RULE**: Every major step ends with: “Do you approve? (yes/no).” If user answers no, list options and propose corrective actions.

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Selected Structure: Docusaurus Single Project within 'docs/' directory
docs/
├── blog/
├── docs/                     # Book chapters will reside here
│   ├── intro.mdx
│   └── ...                   # Content from docs/contentguide.md
├── src/
│   ├── components/
│   ├── pages/
│   └── css/
├── static/
├── docusaurus.config.ts
├── package.json
└── README.md

# Removed Options:
# Option 1: Single project (DEFAULT) - Replaced by Docusaurus structure
# Option 2: Web application (when "frontend" + "backend" detected) - Backend/Chatbot removed from scope
# Option 3: Mobile + API (when "iOS/Android" detected) - Not applicable
```

**Structure Decision**: The project will utilize the existing `docs/` directory as the root for the Docusaurus book. This includes the Docusaurus configuration, content files, and source code for components/pages.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|