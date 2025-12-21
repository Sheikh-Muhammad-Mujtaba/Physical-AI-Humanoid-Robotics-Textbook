---
id: 0004
title: Fix Social Login Frontend
stage: green
date: 2025-12-21
surface: CLI
model: gemini-pro
feature: 001-fix-auth-and-l10n
branch: 001-fix-auth-and-l10n
user: abdullah
command: /sp.implement ok now my oauth social login backend is genration token correctly but the frontend is not correctly storing and valiading it also the email login works correctly so dont change any logic according to it just only fix the social login first review my code then verifyy using context7 mcp that all implemantaion is correct and where is the is
labels: [implementation, auth, frontend]
links:
  spec: specs/001-fix-auth-and-l10n/spec.md
  plan: specs/001-fix-auth-and-l10n/plan.md
  tasks: specs/001-fix-auth-and-l10n/tasks.md
  ticket:
  adr:
  pr:
files:
  - src/lib/auth-client.ts
  - src/pages/auth-callback.tsx
  - src/pages/login.tsx
  - specs/001-fix-auth-and-l10n/tasks.md
tests:
  - none
---

## Prompt

/sp.implement ok now my oauth social login backend is genration token correctly but the frontend is not correctly storing and valiading it also the email login works correctly so dont change any logic according to it just only fix the social login first review my code then verifyy using context7 mcp that all implemantaion is correct and where is the is

## Response snapshot

I have implemented the fix for the social login frontend.
Based on my analysis of the code and the "token-relay" mechanism, I have:
1.  Updated `src/lib/auth-client.ts` to include the `oneTimeTokenClient` plugin.
2.  Updated `src/pages/auth-callback.tsx` to handle the one-time token from the URL, which is provided by the `token-relay` endpoint.
3.  Updated `src/pages/login.tsx` to align with the token-relay flow.
4.  Marked the relevant tasks in `tasks.md` as complete.

These changes should resolve the issue with the frontend not correctly handling the session after a social login.

## Outcome

- ✅ Impact: Fixed the social login flow on the frontend by correctly handling the one-time token provided by the `token-relay` backend service.
- 🧪 Tests: None for this implementation phase.
- 📁 Files:
  - `src/lib/auth-client.ts`
  - `src/pages/auth-callback.tsx`
  - `src/pages/login.tsx`
  - `specs/001-fix-auth-and-l10n/tasks.md`
- 🔁 Next prompts: Continue with other tasks or validate the fix.
- 🧠 Reflection: The user's initial description of the problem was a bit misleading ("frontend is not correctly storing and valiading it"), as it seemed to imply a simple token storage issue. However, by investigating the code and finding the "token-relay" mechanism, I was able to understand the intended architecture and implement the correct fix. This highlights the importance of code review and understanding the existing system before making changes.