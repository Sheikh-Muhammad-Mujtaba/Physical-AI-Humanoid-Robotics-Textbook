---
id: 0005
title: Update Plan for Shared Neon PostgreSQL and User Linkage
stage: plan
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-betterauth-integration
branch: 001-betterauth-integration
user: user
command: (plan update request)
labels: ["planning", "database", "neon", "postgresql", "user-linkage", "chat-history"]
links:
  spec: specs/001-betterauth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-betterauth-integration/plan.md
  - specs/001-betterauth-integration/tasks.md
tests:
  - null
---

## Prompt

and where the auth user data save?
...
lets just update plan we will be using shared postgress using neon which will store each user login also the history will be saved as the auth user id or token with the sessionid which is alredy now

## Response snapshot

Updated both `plan.md` and `tasks.md` to use **shared Neon PostgreSQL** for all services and link chat history to authenticated users:

**Plan Updates (`plan.md`)**:
1. Added "Database Architecture" section with diagram showing shared Neon PostgreSQL
2. Updated BetterAuth config to use `pg.Pool` with `DATABASE_URL` (same as FastAPI)
3. Added SQL migration for `user_id` column on `chat_history` table
4. Updated `ChatHistory` model to include `user_id` (nullable for anonymous users)
5. Updated environment variables section to show shared `DATABASE_URL`

**Tasks Updates (`tasks.md`)**:
1. Phase 2 expanded from 6 to 9 tasks (T011-T019)
2. Added T013: Update `sql_models.py` with `user_id` column
3. Added T014: Run database migration on Neon
4. Added T017: Update endpoints to save `user_id` from JWT
5. Added T018: New `/api/user/history` endpoint for user's history across all sessions
6. Updated task numbers: Phase 3 (T020-T028), Phase 4 (T029-T034)
7. Total tasks increased from 31 to 34
8. Updated validation checklist for user linkage

**Database Schema**:
```sql
ALTER TABLE chat_history ADD COLUMN user_id UUID;
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
```

**Key Architecture Decision**:
- `user_id` is nullable to support both anonymous and authenticated users
- Same `session_id` can be linked to different users (if session transferred)
- User can retrieve history across all their sessions via `/api/user/history`

## Outcome

- Impact: Unified database architecture, chat history linked to authenticated users
- Tests: N/A (planning update)
- Files: 2 files updated (plan.md, tasks.md)
- Next prompts: Begin Phase 1 implementation (T001-T010)
- Reflection: Shared database simplifies deployment; user_id linkage enables personalized history

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Plan aligns with user requirements - PASS
- Prompt variant (if applicable): User clarified database and history linkage requirements
- Next experiment (smallest change to try): Execute Phase 1 tasks to set up BetterAuth service with shared Neon PostgreSQL
