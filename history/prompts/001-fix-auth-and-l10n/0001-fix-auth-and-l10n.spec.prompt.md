---
id: 0001
title: Fix Auth and L10n
stage: spec
date: 2025-12-21
surface: CLI
model: gemini-pro
feature: 001-fix-auth-and-l10n
branch: 001-fix-auth-and-l10n
user: abdullah
command: /sp.specify
labels: [spec, auth, l10n]
links:
  spec: specs/001-fix-auth-and-l10n/spec.md
  ticket:
  adr:
  pr:
files:
  - specs/001-fix-auth-and-l10n/spec.md
  - specs/001-fix-auth-and-l10n/checklists/requirements.md
tests:
  - none
---

## Prompt

Problem

BetterAuth session-based login & signup is unreliable.

Social OAuth login/signup (Google/GitHub/etc.) is not working correctly.

Session persistence, callback handling, or token → session exchange is likely broken.

Documentation may have changed; implementation may be outdated.

Urdu (ur) translation in the Docusaurus project is incomplete and inconsistent.

Goals

Fix session-based authentication for:

Email/password login

Signup

Session persistence (cookies, server session, refresh)

Fix social OAuth login & signup end-to-end.

Align implementation strictly with latest BetterAuth docs.

Use Context7 MCP and BetterAuth MCP to fetch up-to-date references and examples.

Complete full Urdu (ur) localization using Docusaurus i18n.

Use Gemini AI for high-quality Urdu translations.

Ensure translations are consistent, reviewed, and production-ready.

Non-Goals

No UI redesign unless required for auth correctness.

No custom auth logic outside BetterAuth unless explicitly required by docs.

## Response snapshot

I have created a feature specification for fixing the authentication and localization issues.
The specification includes user stories, functional requirements, and success criteria.
I have also created a checklist to validate the specification.
The feature branch is `001-fix-auth-and-l10n` and the spec file is located at `specs/001-fix-auth-and-l10n/spec.md`.

## Outcome

- ✅ Impact: Created a new feature specification and branch.
- 🧪 Tests: None.
- 📁 Files: 
  - `specs/001-fix-auth-and-l10n/spec.md`
  - `specs/001-fix-auth-and-l10n/checklists/requirements.md`
- 🔁 Next prompts: `/sp.plan`
- 🧠 Reflection: The process of creating a specification from a detailed problem description was straightforward. The provided template and guidelines were helpful.