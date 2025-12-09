<!--
Sync Impact Report:
Version change: 3.1.0 -> 4.0.0
Modified principles: Overwritten with 5 new principles for final polish and feature integration.
Added sections: None
Removed sections: All previous principles removed.
Templates requiring updates:
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

These are hard rules and must ALWAYS be enforced to support a high-quality technical textbook and RAG Backend API development.

## Core Principles

### 1) OpenAI-Compatible Architecture
The backend MUST use the `openai` Python SDK (or `openai-agents`) configured with the Gemini Base URL (`generativelanguage.googleapis.com`) for all LLM operations. Do NOT rewrite this to the native Google GenAI SDK.

### 2) Contextual Intelligence
The AI assistant MUST be accessible via a "Select-to-Ask" flow. Highlighting text on any page MUST trigger a floating "Ask AI" button.

### 3) Modern UI/UX
The Chatbot MUST be a collapsible **Floating Widget** (bottom-right) using Tailwind CSS. Inline styles are FORBIDDEN.

### 4) Hybrid Deployment
The `vercel.json` MUST explicitly define:
* A Python build for `api/` (including `api/utils/**`).
* A Static build for `textbook/`.

### 5) Zero Broken Links
The `npm run build` command must pass without error.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

**Version**: 4.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-09