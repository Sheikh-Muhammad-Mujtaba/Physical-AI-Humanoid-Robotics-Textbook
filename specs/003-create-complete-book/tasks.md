# Tasks: Create a Complete Book

**Input**: Design documents from `specs/003-create-complete-book/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify Docusaurus installation and project setup in `docusaurus-book/`
- [X] T002 [P] Configure linting and formatting tools for markdown files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T003 Setup environment for Lighthouse CI integration.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - SEO Optimization (Priority: P3)

**Goal**: Optimize the book for search engines using Lighthouse to improve its visibility.

**Independent Test**: Run Lighthouse on the deployed book and verifying that the SEO score meets a certain threshold.

### Implementation for User Story 3

- [X] T004 [US3] Add/update `title` and `description` meta tags in `docusaurus-book/docusaurus.config.ts`.
- [X] T005 [P] [US3] Add `alt` tags to all images in the book.
- [X] T006 [US3] Ensure `sitemap.xml` is generated correctly by `@docusaurus/plugin-sitemap`.
- [X] T007 [US3] Run Lighthouse audit and document initial SEO score.
- [X] T008 [US3] Address any critical SEO issues reported by Lighthouse.

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update all URLs (Priority: P2)

**Goal**: Automatically update all URLs in the book to ensure they are correct and not placeholders.

**Independent Test**: Run the URL update script on a book with placeholder URLs. The script should replace them with valid URLs.

### Implementation for User Story 2

- [X] T009 [US2] Create a script to find and replace placeholder URLs in `docusaurus-book/docs/`.
- [X] T010 [US2] Run the script to update all placeholder URLs.
- [X] T011 [US2] Manually verify a sample of updated URLs to ensure correctness.

**Checkpoint**: At this point, User Stories 2 AND 3 should both work independently

---

## Phase 5: User Story 1 - Generate Book Structure and Content (Priority: P1) 🎯 MVP

**Goal**: Automatically generate a book with 5-6 modules, each containing 3-4 chapters, to quickly create a complete draft of the book.

**Independent Test**: Run the generation script and verifying that the correct number of modules and chapters are created with placeholder content.

### Implementation for User Story 1

- [X] T012 [US1] Create a script to generate the book structure with 5-6 modules and 3-4 chapters each in `docusaurus-book/docs/`.
- [X] T013 [US1] Run the script to generate the book structure.
- [X] T014 [US1] Write content for the first module using `context7 mcp` to get details.
- [X] T015 [US1] Write content for the remaining modules.
- [X] T016 [P] [US1] Review and edit the generated content for clarity and correctness.

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T017 [P] Documentation updates in `docusaurus-book/docs/intro.mdx`.
- [X] T018 Code cleanup and refactoring of all scripts.
- [X] T019 Performance optimization across all stories.
- [X] T020 Run quickstart.md validation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US3 → US2 → US1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 3 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
5. Each story adds value without breaking previous stories
