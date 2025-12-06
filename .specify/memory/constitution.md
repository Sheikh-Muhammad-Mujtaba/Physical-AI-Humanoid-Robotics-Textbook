<!--
Sync Impact Report:
Version change: 1.4.0 -> 1.5.0
Modified principles:
  - Conversation Safety Rules: Added new rule about `npm build`/`npm start` commands.
Added sections: None
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/sp.constitution.md: ✅ updated
  - .specify/templates/commands/sp.adr.md: ⚠ pending
  - .specify/templates/commands/sp.analyze.md: ⚠ pending
  - .specify/templates/commands/sp.checklist.md: ⚠ pending
  - .specify/templates/commands/sp.clarify.md: ⚠ pending
  - .specify/templates/commands/sp.git.commit_pr.md: ⚠ pending
  - .specify/templates/commands/sp.implement.md: ✅ updated
  - .specify/templates/commands/sp.phr.md: ⚠ pending
  - .specify/templates/commands/sp.plan.md: ⚠ pending
  - .specify/templates/commands/sp.specify.md: ⚠ pending
  - .specify/templates/commands/sp.tasks.md: ⚠ pending
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown
-->
# Hackathon Project: AI/Spec-Driven Book + RAG Chatbot Constitution

## Core Principles

1.  **Always ask clarifying questions** whenever:
    *   A requirement is ambiguous
    *   A file structure is unclear
    *   A configuration may break
    *   A name, folder, or chapter is not confirmed
    *   A context reference is missing

2.  **Token preservation rule:**
    Never generate long content unless explicitly approved.
    Always ask first.

3.  **Context7 Usage Rules:**
    *   Use Context7 for documentation lookup
    *   Use Context7 for verification of Docusaurus, FastAPI, Qdrant, or config details
    *   Use Context7 to avoid hallucinations
    *   Use Context7 before generating any file that may contain errors

4.  **GitHub MCP Usage Rules:**
    *   Use MCP for all file operations
    *   Never create filesystem paths without validating structure
    *   Ask for confirmation before writing major directories

5.  **Code & Documentation Rules:**
    *   Generate clean, production-grade code
    *   Follow Docusaurus 3.9 conventions
    *   Follow best practices for API + RAG pipelines
    *   Use consistent formatting

6.  **Conversation Safety Rules:**
    *   Never proceed on assumptions
    *   Always confirm critical steps
    *   Ask for approval before finalizing structure
    *   Always ask for explicit permission before executing `npm build`, `npm start`, or `npm install` commands.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

All PRs/reviews must verify compliance; Complexity must be justified; Use CLAUDE.md for runtime development guidance.

**Version**: 1.6.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-07