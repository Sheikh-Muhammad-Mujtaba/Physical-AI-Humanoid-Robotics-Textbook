---
id: 0002
title: amend constitution npm command rule
stage: constitution
date: 2025-12-06
surface: CLI
model: Gemini
feature: none
branch: main
user: agent
command: /sp.constitution when ever you have to run npm build or npm start dont run on your own ask me to do that for you and tell the output toyou
labels: [documentation, constitution, operational-guideline]
links:
  spec: 
  ticket: 
  adr: 
  pr: 
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

/sp.constitution when ever you have to run npm build or npm start dont run on your own ask me to do that for you and tell the output toyou

## Response snapshot

New constitution version: 1.5.0
Rationale: Minor version bump due to adding a new operational rule to the "Conversation Safety Rules" section, specifically requiring explicit permission before executing `npm build` or `npm start` commands.
Files flagged for manual follow-up:
- .specify/templates/plan-template.md: ⚠ pending
- .specify/templates/spec-template.md: ⚠ pending
- .specify/templates/tasks-template.md: ⚠ pending
- .specify/templates/commands/sp.adr.md: ⚠ pending
- .specify/templates/commands/sp.analyze.md: ⚠ pending
- .specify/templates/commands/sp.checklist.md: ⚠ pending
- .specify/templates/commands/sp.clarify.md: ⚠ pending
- .specify/templates/commands/sp.git.commit_pr.md: ⚠ pending
- .specify/templates/commands/sp.phr.md: ⚠ pending
- .specify/templates/commands/sp.plan.md: ⚠ pending
- .specify/templates/commands/sp.specify.md: ⚠ pending
- .specify/templates/commands/sp.tasks.md: ⚠ pending
Suggested commit message: docs: amend constitution to v1.5.0 (add npm command execution rule)

## Outcome

- ✅ Impact: Constitution updated with new operational guideline.
- 🧪 Tests: No automated tests were run for this change.
- 📁 Files: Modified `.specify/memory/constitution.md`.
- 🔁 Next prompts: Continue with `/sp.implement` to execute the task plan.
- 🧠 Reflection: Incorporated user feedback to ensure safer execution of npm commands.

## Evaluation notes (flywheel)

- Failure modes observed: Previous failure to execute `pwsh` script. User clarified behavior.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A