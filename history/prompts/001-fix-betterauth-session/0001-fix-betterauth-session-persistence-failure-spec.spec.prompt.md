---
id: 0001
title: Fix BetterAuth Session Persistence Failure Spec
stage: spec
date: 2025-12-16T00:00:00Z
surface: CLI
model: Gemini
feature: 001-fix-betterauth-session
branch: 001-fix-betterauth-session
user: abdullah
command: /sp.specify (implicit)
labels: [spec, auth, fix, betterauth, vercel]
links:
  spec: specs/001-fix-betterauth-session/spec.md
  ticket:
  adr:
  pr:
files:
  - specs/001-fix-betterauth-session/spec.md
  - specs/001-fix-betterauth-session/checklists/requirements.md
tests:

---

## Prompt

User invoked `/sp.specify` with argument: `run the cat prompt.txt commands and read the spects for the auth faliur fix`.

User then provided an explicit instruction: `before creating spects run cat command to read prompt.txt`.

Content of `prompt.txt` was:
```
sp.specify
# SPEC: Fix BetterAuth Session Persistence Failure (401/Null Session) on Vercel

## 1. Goal
Resolve the persistent 401 Unauthorized error that occurs immediately after a successful sign-in (during internal JWT generation) and the
 subsequent failure to retrieve a session (`Auth handler returned null (no session found)`). This will ensure session data is reliably st
ored and retrieved, allowing for persistent, authenticated access on the deployed Vercel platform.

## 2. Technical Context
- **Architecture:** Cross-domain deployment. Frontend (`ai-spec-driven.vercel.app`) calls Auth Backend (`physical-ai-humanoid-robotics-te
xtb-kohl-three.vercel.app`).
- **Observed Issue:** The session cookie is set correctly with `Secure; SameSite=None; Partitioned`, but the server fails an internal val
idation check (`401` on internal token request) and cannot retrieve the session data from the database.
- **Root Cause Hypothesis (Confirmed):** Failure to read, write, or validate session data, most likely due to:
    1.  An unstable or misconfigured **PostgreSQL (Neon) database connection** (`DATABASE_URL`).
    2.  An inconsistency or mismatch in the **`BETTER_AUTH_SECRET`** used for session signing/validation across Vercel environments.

## 3. Detailed Requirements (Code and Configuration)

1.  **Auth Backend (`auth-service/src/auth.ts`):**
    * **DB Connection Validation:** Implement explicit connection test and logging for the `pg.Pool` instance upon module initialization.
 If the connection fails, log a critical error indicating the database status.
    * **Configuration Validation:** Explicitly log a successful initialization message showing that the `betterAuth` handler has been cre
ated, confirming the `BETTER_AUTH_SECRET` was read.
    * **Structure Validation:** Ensure the `pg.Pool` is instantiated correctly for a Vercel/Serverless environment (e.g., handling connec
tion pooling efficiently). (Current implementation looks reasonable, but stability should be prioritized).

2.  **Auth Backend Vercel Handler (`auth-service/api/auth.ts`):**
    * **JWT Generation Logging:** Enhance logging around the internal `/api/auth/token` request to capture and log any raw error body or 
additional headers from the `tokenResponse` when the status is 401, providing deeper insight into the server-side rejection.

3.  **Python API Backend (`api/utils/auth.py`):**
    * **Secret/JWKS Consistency Check:** Confirm that the `BETTER_AUTH_ISSUER` and `BETTER_AUTH_JWKS_URL` environment variables are consi
stent across all environments where they are used. The logic in `api/utils/auth.py` for JWT validation using JWKS is structurally sound, 
but requires environment variable consistency.

## 4. Tasks (To be generated in next step)
The plan will involve modifying `auth-service/src/auth.ts` and `auth-service/api/auth.ts` to add the critical logging and stability check
s.
```

## Response snapshot

The AI agent created a feature specification based on the content of `prompt.txt`.
- Determined short name: `fix-betterauth-session`.
- Created new feature branch `001-fix-betterauth-session`.
- Generated `specs/001-fix-betterauth-session/spec.md` by mapping the content of `prompt.txt` to the spec template and refining it to remove implementation details and improve technology-agnostic phrasing.
- Created and completed `specs/001-fix-betterauth-session/checklists/requirements.md`, confirming all quality criteria were met after one round of refinement.
The specification is ready for the next phase (`/sp.clarify` or `/sp.plan`).

## Outcome

- ✅ Impact: Positive. A well-defined, validated specification for an important authentication fix has been created.
- 🧪 Tests: N/A for spec creation.
- 📁 Files: Two new files created: `specs/001-fix-betterauth-session/spec.md` and `specs/001-fix-betterauth-session/checklists/requirements.md`, and one PHR file.
- 🔁 Next prompts: The user can now proceed with `/sp.clarify` (if further questions arise) or `/sp.plan` to begin implementation planning.
- 🧠 Reflection: The initial prompt was ambiguous, leading to a misinterpretation. The explicit user instruction to `cat prompt.txt` clarified the true intent. It highlights the importance of explicit user instructions overriding implicit interpretations.

## Evaluation notes (flywheel)

- Failure modes observed: Initial misinterpretation of the feature description due to a meta-instruction. Command parsing failure when passing a long, complex string as an argument.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Improve `create-new-feature.sh` or the `run_shell_command` usage to handle complex string arguments more robustly, possibly by passing content via a temp file or stdin.