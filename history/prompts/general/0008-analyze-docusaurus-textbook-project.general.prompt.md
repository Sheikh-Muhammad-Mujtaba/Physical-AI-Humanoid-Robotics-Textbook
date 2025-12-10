---
id: 0008
title: Analyze Docusaurus Textbook Project
stage: general
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-fix-docusaurus-deployment
user: user
command: /sp.analyze Analyze the entire Docusaurus textbook project located in the folder: ./docs
labels: ["docusaurus", "analysis", "textbook"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:

tests:

---

## Prompt

/sp.analyze Analyze the entire Docusaurus textbook project located in the folder: ./docs

Primary objectives of this analysis:

1. Detect and fix all broken internal links:
   - Identify any MDX links that point to missing, renamed, or incorrect pages.
   - Detect missing assets, incorrect paths, or invalid slugs.
   - Provide a corrected link map for each module, chapter, and section.
   - Replace outdated links with updated and valid ones.

2. Validate and normalize all MDX files:
   - Ensure all frontmatter fields are valid.
   - Ensure all JSX/MDX syntax is correct.
   - Remove undefined variables or unclosed elements.
   - Validate headings hierarchy (H1 → H2 → H3).
   - Ensure all images use correct relative paths.

3. Inspect the author configuration:
   - Verify the author image path.
   - Fix any incorrect asset paths in authors.json or authors.yml.
   - Ensure image loads correctly in both light and dark modes.

4. Remove the “Edit this page” button:
   - Check docusaurus.config.js
   - Disable editUrl globally.
   - Confirm the button no longer renders.

5. Build a complete hierarchical content specification:
   - Enumerate every module in the book.
   - Under each module, list every chapter.
   - Under each chapter, list all sections.
   - Provide stable IDs, file paths, and usable metadata for future RAG embeddings.

6. Validate sidebar structure:
   - Ensure sidebars.js correctly reflects the content structure.
   - Ensure no missing or orphaned files.
   - Ensure all module and chapter ordering is correct.

7. Analyze project readiness for RAG chatbot embedding:
   - Validate file paths so embeddings can be generated cleanly.
   - Ensure naming conventions are consistent for vector storage.
   - Suggest metadata keys (module, chapter, slug, title, section).
   - Identify content that may require chunking adjustments.

8. Produce actionable reports:
   - List broken links and their fixed replacements.
   - List invalid files and their required corrections.
   - List missing or incorrect image paths.
   - Provide a complete, machine-usable content map.
Output format:
- Comprehensive link validation report
- Full content-tree specification
- Sidebar audit
- Author profile audit
- Image path verification
- Global config audit
- Suggested fixes summary

## Response snapshot

I'm generating an analysis plan for your Docusaurus textbook project. This will address broken links, MDX validation, author configuration, content hierarchy, sidebar structure, and RAG chatbot readiness. I will create a Prompt History Record for this request.

## Outcome

- ✅ Impact: Planned comprehensive analysis of Docusaurus project
- 🧪 Tests: N/A
- 📁 Files: PHR created.
- 🔁 Next prompts: Generate and execute plan for Docusaurus analysis.
- 🧠 Reflection: Initial planning phase for complex Docusaurus project analysis.

## Evaluation notes (flywheel)

- Failure modes observed: N/A
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
