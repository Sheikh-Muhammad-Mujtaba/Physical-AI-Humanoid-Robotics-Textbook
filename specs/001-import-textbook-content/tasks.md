# Tasks: Import Complete Textbook Content into Docusaurus

**Input**: Design documents from `/specs/001-import-textbook-content/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated tests are requested for this feature. Manual testing is required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create the directory `docs/scripts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T002 Create the import script file `docs/scripts/import-content.sh`

---

## Phase 3: User Story 1 - Import Textbook Content (Priority: P1) 🎯 MVP

**Goal**: Import the entire textbook from a single Markdown file (`contentguide.md`) into the Docusaurus `docs/` directory, so that the content is structured into modules and chapters with correct navigation.

**Independent Test**: This can be tested by running a script that takes `contentguide.md` as input and generates the `docs/` directory structure and files. The output can be visually inspected and the `npm run build` command can be run to verify success.

### Implementation for User Story 1

- [ ] T003 [US1] Implement the logic to read the `contentguide.md` file in `docs/scripts/import-content.sh`.
- [ ] T004 [US1] Implement the logic to parse the modules and chapters in `docs/scripts/import-content.sh`.
- [ ] T005 [US1] Implement the logic to create the module directories in `docs/scripts/import-content.sh`.
- [ ] T006 [US1] Implement the logic to create the chapter files in `docs/scripts/import-content.sh`.
- [ ] T007 [US1] Implement the logic to generate the frontmatter for each chapter in `docs/scripts/import-content.sh`.
- [ ] T008 [US1] Implement the logic to handle existing files by overwriting them in `docs/scripts/import-content.sh`.
- [ ] T009 [US1] Implement the logic to convert special callouts to Docusaurus admonitions in `docs/scripts/import-content.sh`.
- [ ] T010 [US1] Implement the logic to ensure `docs/sidebars.ts` is configured for autogeneration in `docs/scripts/import-content.sh`.
- [ ] T011 [US1] Implement error handling for empty or non-existent `contentguide.md` in `docs/scripts/import-content.sh`.
- [ ] T012 [US1] Implement error handling for incorrect header hierarchy in `docs/scripts/import-content.sh`.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T013 Add comments and documentation to the `docs/scripts/import-content.sh` script.
- [ ] T014 [P] Run the import script and verify the output.
- [ ] T015 [P] Run `npm run build` in the `docs` directory and verify it passes.
- [ ] T016 [P] Manually test the generated site for correct sidebar order and broken links.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- The tasks in the Polish phase can be run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
