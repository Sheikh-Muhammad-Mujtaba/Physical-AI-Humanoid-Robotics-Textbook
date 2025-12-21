# Tasks: Fix Auth and L10n

**Input**: Design documents from `/specs/001-fix-auth-and-l10n/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 3 - Complete Urdu Localization (Priority: P3)

**Goal**: Complete the Urdu (ur) localization for the Docusaurus project.

**Independent Test**: An Urdu-speaking user can browse the entire site with all content and UI elements translated correctly.

### Implementation for User Story 3

- [X] T017 [US3] [P] Audit all content in `docs/` and identify untranslated files.
- [X] T018 [US3] [P] Audit all UI components in `src/` and identify untranslated strings.
- [X] T019 [US3] Use Gemini AI to translate all untranslated content from `docs/` and create corresponding files in `i18n/ur/docusaurus-plugin-content-docs/current/`.
- [X] T020 [US3] Use Gemini AI to translate all untranslated UI strings and add them to `i18n/ur/code.json`.
- [X] T021 [US3] Update `i18n/ur/docusaurus-theme-classic/navbar.json` and any other relevant JSON files with Urdu translations.
- [X] T022 [US3] Ensure the Docusaurus configuration `docusaurus.config.ts` includes Urdu in the `i18n` locales.

**Checkpoint**: The Urdu localization is complete and consistent across the entire site.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Final testing and cleanup.

- [X] T025 Review the complete Urdu translation for consistency and accuracy.
- [ ] T026 Remove any temporary files like `error.txt`.
- [ ] T027 Final code cleanup and refactoring across all modified files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 3 (Phase 1)**: All tasks are complete.
- **Polish (Phase 2)**: Depends on completion of User Story 3.

---

## Implementation Strategy

The focus of this implementation was to complete the Urdu localization. All tasks related to User Story 3 have been completed. The next step is to perform a final review of the translations.