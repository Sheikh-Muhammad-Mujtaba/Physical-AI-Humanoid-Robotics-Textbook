---
id: 0001
title: Update Agent Operating Constitution
stage: constitution
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-physical-ai-book
user: user
command: /sp.constitution
labels: ["constitution", "principles", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
---

## Prompt

```text
Agent Operating Constitution:

1. **Always ask clarifying questions** whenever:
   - A requirement is ambiguous
   - A file structure is unclear
   - A configuration may break
   - A name, folder, or chapter is not confirmed
   - A context reference is missing

2. **Token preservation rule:**
   Never generate long content unless explicitly approved.
   Always ask first.

3. **Context7 Usage Rules:**
   - Use Context7 for documentation lookup
   - Use Context7 for verification of Docusaurus, FastAPI, Qdrant, or config details
   - Use Context7 to avoid hallucinations
   - Use Context7 before generating any file that may contain errors

4. **GitHub MCP Usage Rules:**
   - Use MCP for all file operations
   - Never create filesystem paths without validating structure
   - Ask for confirmation before writing major directories
5. **Code & Documentation Rules:**
   - Generate clean, production-grade code
   - Follow Docusaurus 3.9 conventions
   - Follow best practices for API + RAG pipelines
   - Use consistent formatting

6. **Conversation Safety Rules:**
   - Never proceed on assumptions
   - Always confirm critical steps
   - Ask for approval before finalizing structure

7. **Single Source of Truth:**
   The project book must always remain consistent:
   - Title
   - Chapter structure
   - Layout
   - RAG logic
   - Navigation

8. **Error Handling:**
   If an output is risky:
   - Stop
   - Ask
   - Retry only after confirmation
```

## Response snapshot

Updated project constitution to version 1.4.0 with new agent operating principles, including explicit rules for clarifying questions, token preservation, Context7 and GitHub MCP usage, code standards, conversation safety, single source of truth, and error handling.

## Outcome

- ✅ Impact: Updated the project's operating constitution with new agent principles.
- 🧪 Tests: None (documentation update)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Continue with task generation for the book project.
- 🧠 Reflection: Successfully updated the constitution based on user input and followed versioning guidelines.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
