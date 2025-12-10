---
id: 0005
title: Fix GitHub Pages deployment path in workflow and rename folder
stage: refactor
date: 2025-12-06
surface: CLI
model: Gemini
feature: 001-github-pages-workflow
branch: main
user: agent
command: ok I only have two onthon that move the all files to root or to rename the booc to the docs so github can analyze it and deploy it so lets just rename it
labels: [github-pages, docusaurus, deploy, workflow, refactor, fix]
links:
  spec: specs/001-github-pages-workflow/spec.md
  ticket: 
  adr: 
  pr: 
files:
  - docusaurus-book/ (renamed to docs/)
  - .github/workflows/deploy.yml (modified)
  - docs/docusaurus.config.ts (modified)
tests:
---

## Prompt

ok I only have two onthon that move the all files to root or to rename the booc to the docs so github can analyze it and deploy it so lets just rename it

## Response snapshot

The Docusaurus project directory has been renamed from 'docusaurus-book' to 'docs'.
The '.github/workflows/deploy.yml' has been updated to reflect this change and to ensure the deployment works correctly when GitHub Pages is configured to serve from the 'main' branch, from the '/ (root)' folder.
The 'docs/docusaurus.config.ts' file has also been updated to reflect the new directory name.

These changes have been committed and pushed to the 'main' branch.

**For your book to now appear correctly on GitHub Pages, you MUST configure your GitHub Pages settings as follows:**

1.  Go to your repository on GitHub: `https://github.com/Sheikh-Muhammad-Mujtaba/Physical-AI-Humanoid-Robotics-Textbook`
2.  Navigate to **Settings** -> **Pages**.
3.  Under the 'Source' section:
    *   Change 'Deploy from a branch' to **'Branch: main'**.
    *   Change the folder to **'/ (root)'**.
4.  Click **'Save'**.

Please let me know once you have updated these settings and if your book now displays correctly.

## Outcome

- ✅ Impact: GitHub Pages deployment workflow fixed to deploy from `docs/` folder, and Docusaurus folder renamed.
- 🧪 Tests: N/A
- 📁 Files: Renamed `docusaurus-book` to `docs`, modified `.github/workflows/deploy.yml` and `docs/docusaurus.config.ts`.
- 🔁 Next prompts: Awaiting user confirmation of successful deployment after manual GitHub Pages configuration.
- 🧠 Reflection: Successfully adapted deployment strategy based on user's GitHub Pages UI limitations, including renaming the Docusaurus project directory and updating the workflow accordingly.

## Evaluation notes (flywheel)

- Failure modes observed: Previous GitHub Pages configurations were incorrect due to misunderstanding of UI limitations.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A