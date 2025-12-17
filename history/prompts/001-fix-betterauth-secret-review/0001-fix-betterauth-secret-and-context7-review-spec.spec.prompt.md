---
id: 0001
title: Fix BetterAuth Secret and Context7 Review Spec
stage: spec
date: 2025-12-16T00:00:00Z
surface: CLI
model: Gemini
feature: 001-fix-betterauth-secret-review
branch: 001-fix-betterauth-secret-review
user: abdullah
command: /sp.specify read the prompt.txt using the cat commandand update the betterauth session handeling issue Importatnt use cat command to read file
labels: [spec, auth, fix, betterauth, secret, context7, review]
links:
  spec: specs/001-fix-betterauth-secret-review/spec.md
  ticket:
  adr:
  pr:
files:
  - specs/001-fix-betterauth-secret-review/spec.md
  - specs/001-fix-betterauth-secret-review/checklists/requirements.md
tests:

---

## Prompt

User invoked `/sp.specify` with argument: `read the prompt.txt using the cat commandand update the betterauth session handeling issue Importatnt use cat command to read file`.

User then provided the content of `prompt.txt` which was:
```
# SPEC: Fix BetterAuth Session Persistence Failure (Null Session) by Enforcing Secret and Reviewing Context7 Guidelines

## 1. Goal
The primary goal is to resolve the session validation failure (`Auth handler returned null`) in the BetterAuth Backend, which is preventi
ng successful user persistence. This will be achieved by implementing hardcoded secret key validation logging and ensuring all authentica
tion logic adheres to the cross-domain setup guidelines, including those outlined in Context7.

## 2. Technical Context
- **Deployment:** Cross-domain Vercel architecture: Frontend/API (`ai-spec-driven.vercel.app`) calls Auth Backend (`physical-ai-humanoid-
robotics-textb-kohl-three.vercel.app`).
- **Observed Issue:** Login succeeds, JWT is generated, and cookies are sent correctly by the browser, but the BetterAuth handler returns
 a null session. DB connection is confirmed successful.
- **Root Cause Hypothesis:** The `BETTER_AUTH_SECRET` is not consistently set or read correctly by the serverless function, causing sessi
on signature validation to fail.

## 3. Detailed Requirements (Code and Configuration)

1.  **Auth Backend Core (`auth-service/src/auth.ts`):**
    * **CRITICAL:** Add code to explicitly log the **length** of the `BETTER_AUTH_SECRET` to the Vercel logs to verify its presence and c
onsistency across deployments.
    * Ensure the `pg.Pool` initialization is robust for Vercel/Neon and the explicit DB health check log remains active.

2.  **Configuration Enforcement:**
    * **User Action (Crucial):** The user MUST re-enter or reset the `BETTER_AUTH_SECRET` on the Vercel dashboard for the BetterAuth Back
end to ensure no hidden/extra characters.

3.  **Context7 Review & Alignment:**
    * **Clarification Task:** Use `sp.clarify` to review the contents of `context7-docs-integrator.md` (which is currently empty) to iden
tify any specific BetterAuth setup instructions (like middleware dependencies or custom database schemas) that might be missing or miscon
figured in the service architecture.
    * **Social Login Review:** Although the email login logs are clear, the social login issue mentioned previously needs review. Ensure 
that OAuth callback logic correctly processes the temporary session into a persistent JWT session.

4.  **Frontend (`src/lib/auth-client.ts`):**
    * (Implicit Check) The client must successfully receive and store the `set-auth-token` header, which the logs suggest is happening. N
o code change is needed unless the server fix fails.
```

## Response snapshot

The AI agent created a feature specification based on the content of `prompt.txt`.
- Determined short name: `fix-betterauth-secret-review`.
- Created new feature branch `001-fix-betterauth-secret-review`.
- Generated `specs/001-fix-betterauth-secret-review/spec.md` by mapping the content of `prompt.txt` to the spec template and refining it to create a clear, validated specification.
- Created and completed `specs/001-fix-betterauth-secret-review/checklists/requirements.md`, confirming all quality criteria were met.
The specification is ready for the next phase (`/sp.clarify` or `/sp.plan`).

## Outcome

- ✅ Impact: A new, validated specification for addressing the BetterAuth session persistence failure, focusing on secret enforcement and Context7 guidelines, has been created.
- 🧪 Tests: N/A for spec creation.
- 📁 Files: `specs/001-fix-betterauth-secret-review/spec.md` and `specs/001-fix-betterauth-secret-review/checklists/requirements.md` created.
- 🔁 Next prompts: The user can now proceed with `/sp.clarify` or `/sp.plan` for this new feature.
- 🧠 Reflection: Successfully navigated the meta-instruction to use `prompt.txt` as the feature description, similar to a previous interaction. This confirms the user's preferred way of providing detailed feature descriptions.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-new-feature.sh` script continues to struggle with multi-line string arguments that contain markdown, leading to shell parsing errors, though the core task (creating the branch and `spec.md`) is completed. This reinforces the need for a more robust argument passing mechanism or script.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Improve argument handling for `create-new-feature.sh` to prevent shell parsing errors with complex string inputs.