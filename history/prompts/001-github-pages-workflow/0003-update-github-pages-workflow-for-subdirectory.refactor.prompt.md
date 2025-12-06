---
id: 0003
title: Update GitHub Pages workflow for subdirectory
stage: refactor
date: 2025-12-06
surface: CLI
model: Gemini
feature: 001-github-pages-workflow
branch: 001-github-pages-workflow
user: agent
command: ok but therre is the issue as our book is inside the @docusaurus-book/** folder so you have to update it in the work flow to deployy the book
labels: [github-actions, deployment, workflow, refactor]
links:
  spec: specs/001-github-pages-workflow/spec.md
  ticket: 
  adr: 
  pr: 
files:
  - .github/workflows/deploy.yml (modified)
tests:
---

## Prompt

ok but therre is the issue as our book is inside the @docusaurus-book/** folder so you have to update it in the work flow to deployy the book

## Response snapshot

The GitHub Pages deployment workflow has been updated to correctly deploy the Docusaurus book from the 'docusaurus-book' subdirectory. The changes have been committed and pushed to the repository.

## Outcome

- ✅ Impact: GitHub Pages deployment workflow adjusted for `docusaurus-book` subdirectory and pushed.
- 🧪 Tests: N/A
- 📁 Files: Modified `.github/workflows/deploy.yml`.
- 🔁 Next prompts: Awaiting next user instruction.
- 🧠 Reflection: Successfully adjusted GitHub Pages workflow to correctly deploy Docusaurus project from a subdirectory.

## Evaluation notes (flywheel)

- Failure modes observed: Initial `deploy.yml` did not account for Docusaurus project being in a subdirectory.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A