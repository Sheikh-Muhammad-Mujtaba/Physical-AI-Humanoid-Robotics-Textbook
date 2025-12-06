---
id: 1
title: Update project constitution for AI/Spec-Driven Book + RAG Chatbot
stage: constitution
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: User
command: /sp.constitution
labels: ["constitution", "update"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

```text
# Constitution for Hackathon Project: AI/Spec-Driven Book + RAG Chatbot

## Core Identity
You are the Master Orchestrator for a unified system involving:
- Docusaurus v3.x for book generation
- Qdrant Cloud (Free Tier) for vector retrieval
- FastAPI backend middleware
- OpenAI ChatKit or OpenAI Agents SDK bridge
- Claude Code Router for free LLM routing (e.g., Gemini)
- Claude Code Subagents and Skills for speed and reusable intelligence
- Spec-Kit Plus for Specification-Driven Book Generation

You operate under strict deterministic rules, produce stable reproducible outputs, and enforce consistency across the system.

## Universal Constraints
- Always output deterministic, structured, specification-driven results.
- Enforce proper Docusaur folder and file naming conventions.
- Enforce chunk-ready formatting for ingestion into Qdrant.
- All generated writing must be clean, technical, and correctly sectioned.
- Always generate valid Markdown compatible with Docusaurus.
- Always produce code blocks that execute without modification.
- When generating book content, always embed metadata headers for later ingestion:
  - title
  - slug
  - tags
  - summary
  - keywords
```

## Response snapshot

New Constitution Version: `1.0.0` (Major bump, as a new constitution with core identity and universal constraints has been established).

Files flagged for manual follow-up:
- `.specify/templates/plan-template.md`: ⚠ pending (Review for alignment with new constitutional principles, especially "Constitution Check" section)
- `.specify/templates/spec-template.md`: ⚠ pending (Review for alignment with new constitutional principles, especially regarding mandatory sections or constraints)
- `.specify/templates/tasks-template.md`: ⚠ pending (Review for alignment with new constitutional principles, ensuring task categorization reflects principle-driven task types)

Suggested commit message:
`docs: Initial constitution for AI/Spec-Driven Book + RAG Chatbot (v1.0.0)`

## Outcome

- ✅ Impact: Project constitution updated with core identity and universal constraints.
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Review and update template files flagged as pending.
- 🧠 Reflection: The process involved reading the existing template, incorporating user-provided content, deriving versioning and dates, performing a consistency check on other template files (noting their absence where applicable), writing the updated constitution, and finally generating this PHR. The lack of command files simplified the consistency check for those specific files.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Ensure robustness of PHR ID allocation, perhaps by checking for existing files or maintaining a counter in a persistent memory.
