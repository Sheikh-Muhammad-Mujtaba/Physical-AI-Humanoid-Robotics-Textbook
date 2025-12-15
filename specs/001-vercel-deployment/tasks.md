# Tasks: Vercel Deployment

**Input**: Design documents from `specs/001-vercel-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing deployment configuration.

- [ ] T001 Review root `vercel.json` for the Docusaurus frontend and Python API.
- [ ] T002 Review `auth-service/vercel.json` for the TypeScript authentication service.
- [ ] T003 Review `package.json` for existing build scripts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T004 Create/update the root `vercel.json` to ensure correct routing and function definitions for the Docusaurus frontend and Python API.
- [ ] T005 Create/update the `auth-service/vercel.json` to ensure correct build commands, function definitions, and routing for the authentication service.
- [ ] T006 Ensure the `package.json` contains the necessary build commands for a Vercel deployment (e.g., `build:vercel`).

---

## Phase 3: User Story 1 - Deploying the Monorepo to Vercel (Priority: P1) 🎯 MVP

**Goal**: Successfully deploy the entire monorepo to Vercel.

**Independent Test**: Access the Vercel URL and verify that the frontend, backend, and authentication services are all working correctly.

### Implementation for User Story 1

- [ ] T007 [US1] Trigger a Vercel deployment by pushing to a new branch.
- [ ] T008 [US1] Verify that the deployment completes successfully without any build errors.
- [ ] T009 [US1] Access the Vercel URL and verify that the Docusaurus frontend is rendered correctly.
- [ ] T010 [US1] Access the `/api/` endpoint and verify that the Python FastAPI backend responds.
- [ ] T011 [US1] Access the `auth-service` URL and verify that the TypeScript authentication service responds.

---

## Phase 4: User Story 2 - User Authentication (Priority: P2)

**Goal**: Users can authenticate with the application.

**Independent Test**: Create a new user, log in, and verify that the user is granted access to protected resources.

### Implementation for User Story 2

- [ ] T012 [US2] Verify that all necessary environment variables (`DATABASE_URL`, `QDRANT_URL`, `QDRANT_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`, `AUTH_SERVICE_URL`) are correctly configured in the Vercel project settings.
- [ ] T013 [US2] Perform a test login with a new user to ensure the authentication flow is working correctly.
- [ ] T014 [US2] Make a request to a protected API endpoint with the authentication token to verify access.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Finalize the deployment and merge the changes.

- [ ] T015 Run quickstart.md validation.
- [ ] T016 Create a pull request from the `001-vercel-deployment` branch to `main`.
- [ ] T017 Merge the pull request after a successful review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion.
- **Polish (Phase 5)**: Depends on all user stories being complete.

### Parallel Opportunities

- T001, T002, T003 can be run in parallel.
- T004, T005, T006 can be run in parallel after Phase 1.
