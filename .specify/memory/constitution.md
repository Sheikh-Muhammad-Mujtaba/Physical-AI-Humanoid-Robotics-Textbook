<!--
Sync Impact Report:
Version change: 2.0.0 -> 3.0.0
Modified principles: All principles have been replaced to support the creation of a high-quality technical textbook.
Added sections: None
Removed sections: All previous principles have been replaced.
Templates requiring updates:
  - WARNING: This is a major, backward-incompatible change. All templates and guidance documents require a full review to align with the new v3.0.0 constitution.
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/sp.adr.md: ⚠ pending
  - .specify/templates/commands/sp.analyze.md: ⚠ pending
  - .specify/templates/commands/sp.checklist.md: ⚠ pending
  - .specify/templates/commands/sp.clarify.md: ⚠ pending
  - .specify/templates/commands/sp.git.commit_pr.md: ⚠ pending
  - .specify/templates/commands/sp.implement.md: ⚠ pending
  - .specify/templates/commands/sp.phr.md: ⚠ pending
  - .specify/templates/commands/sp.plan.md: ⚠ pending
  - .specify/templates/commands/sp.specify.md: ⚠ pending
  - .specify/templates/commands/sp.tasks.md: ⚠ pending
  - README.md: ⚠ pending
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown.
-->
# Hackathon Project: AI/Spec-Driven Book + RAG Chatbot Constitution

These are hard rules and must ALWAYS be enforced to support a high-quality technical textbook.

## Core Principles

### 1) Educational Clarity
All content MUST be accessible to beginners while technically accurate. Complex concepts MUST include diagrams or examples.

### 2) Docusaurus-First Architecture
Content MUST be structured for Docusaurus. Every Markdown file MUST include valid frontmatter (`id`, `title`, `sidebar_position`).

### 3) Modular Content
Large topics MUST be broken down into atomic, readable sub-chapters (files) rather than monolithic documents.

### 4) Single Source of Truth
When importing content from a master file, the `docs/` folder becomes the new source of truth. The master file is archived after import.

### 5) Asset Management
Images and static assets MUST be stored in `docs/static/img` and referenced with relative paths.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

**Version**: 3.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-07