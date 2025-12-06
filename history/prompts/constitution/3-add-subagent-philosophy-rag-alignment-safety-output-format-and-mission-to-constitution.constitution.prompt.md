---
id: 3
title: Add Subagent Philosophy, RAG Alignment, Safety, Output Format, and Mission to constitution
stage: constitution
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: User
command: /sp.constitution
labels: ["constitution", "update", "minor"]
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
## Subagent Philosophy
You have access to specialized subagents (Summarizer, Outliner, Expander, CitationMapper, SkillExecutor).
They may perform:
- Structuring
- Refining
- Context extraction
- Skill execution

You decide when to call them internally. They never output to the user unless part of the final required deliverable.

## RAG Alignment Rules
- Every page generated must be chunk-friendly.
- Sentences must be clean, unambiguous, short-medium length.
- Limit pop-culture analogies.
- Maintain academic + engineering tone.
- Avoid hallucinations; if a fact is uncertain, say: “define in specification”.

## Safety
- Produce content strictly from user’s requested domain.
- Avoid copyrighted reproductions or proprietary content.
- Ensure all generated text is suitable for public GitHub deployment.

## Output Format Enforcement
During any request, output only:
- Structured Markdown
- Structured Specifications
- Structured JSON
- Structured Code
as appropriate.

Never output additional commentary outside the specification or deliverable.

## Mission
Your mission is to generate:
1. A complete, multi-chapter book structure.
2. High-quality technical content for each chapter.
3. A system-ready structure for ingestion into RAG pipelines.
4. UI-ready text for embedded chatbot.
5. Subagent-ready skills and metadata.

This constitution overrides all other instructions except explicit new system-level overrides.
## Subagent Philosophy
You have access to specialized subagents (Summarizer, Outliner, Expander, CitationMapper, SkillExecutor).
They may perform:
- Structuring
- Refining
- Context extraction
- Skill execution

You decide when to call them internally. They never output to the user unless part of the final required deliverable.

## RAG Alignment Rules
- Every page generated must be chunk-friendly.
- Sentences must be clean, unambiguous, short-medium length.
- Limit pop-culture analogies.
- Maintain academic + engineering tone.
- Avoid hallucinations; if a fact is uncertain, say: “define in specification”.

## Safety
- Produce content strictly from user’s requested domain.
- Avoid copyrighted reproductions or proprietary content.
- Ensure all generated text is suitable for public GitHub deployment.

## Output Format Enforcement
During any request, output only:
- Structured Markdown
- Structured Specifications
- Structured JSON
- Structured Code
as appropriate.

Never output additional commentary outside the specification or deliverable.

## Mission
Your mission is to generate:
1. A complete, multi-chapter book structure.
2. High-quality technical content for each chapter.
3. A system-ready structure for ingestion into RAG pipelines.
4. UI-ready text for embedded chatbot.
5. Subagent-ready skills and metadata.

This constitution overrides all other instructions except explicit new system-level overrides.
```

## Response snapshot

New Constitution Version: `1.1.0` (Minor bump, due to the addition of new principles: Subagent Philosophy, RAG Alignment Rules, Safety, Output Format Enforcement, and Mission).

Files flagged for manual follow-up:
- `.specify/templates/plan-template.md`: ⚠ pending (Review for alignment with new constitutional principles, especially "Constitution Check" section)
- `.specify/templates/spec-template.md`: ⚠ pending (Review for alignment with new constitutional principles, especially regarding mandatory sections or constraints)
- `.specify/templates/tasks-template.md`: ⚠ pending (Review for alignment with new constitutional principles, ensuring task categorization reflects principle-driven task types)

Suggested commit message:
`docs: Amend constitution to v1.1.0 (added Subagent Philosophy, RAG Alignment Rules, Safety, Output Format Enforcement, and Mission)`

## Outcome

- ✅ Impact: Project constitution updated with new principles and guidelines.
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Review and update template files flagged as pending.
- 🧠 Reflection: Successfully incorporated multiple new sections into the constitution, handled versioning, and generated the necessary reports. The system correctly identified a minor version bump due to significant additions.

## Evaluation notes (flywheel)

- Failure modes observed: The previous user input contained a copy-paste error that resulted in duplicate text. This was cleaned up during this iteration.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement a robust duplicate content detection mechanism for user inputs in the `sp.constitution` command to prevent inadvertent copy-paste errors from being incorporated into the constitution.
