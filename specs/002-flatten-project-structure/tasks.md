# Tasks: Flatten Project Structure

**Input**: Design documents from `/specs/002-flatten-project-structure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: File Migration

- [ ] T001 [P] Copy `textbook/docusaurus.config.ts` to `docusaurus.config.ts`
- [ ] T002 [P] Copy `textbook/sidebars.ts` to `sidebars.ts`
- [ ] T003 [P] Copy `textbook/tailwind.config.js` to `tailwind.config.js`
- [ ] T004 [P] Copy `textbook/postcss.config.js` to `postcss.config.js`
- [ ] T005 [P] Copy `textbook/tsconfig.json` to `tsconfig.json`
- [ ] T006 [P] Copy `textbook/lighthouserc.js` to `lighthouserc.js`
- [ ] T007 [P] Copy `textbook/.npmignore` to `.npmignore`
- [ ] T008 [P] Copy `textbook/src/**` to `src/`
- [ ] T009 [P] Copy `textbook/docs/**` to `docs/`
- [ ] T010 [P] Copy `textbook/blog/**` to `blog/`
- [ ] T011 [P] Copy `textbook/static/**` to `static/`
- [ ] T012 [P] Copy `textbook/scripts/**` to `scripts/`
- [ ] T013 [P] Copy `textbook/i18n/**` to `i18n/`

---

## Phase 2: Configuration Update

- [ ] T014 Merge `textbook/package.json` into the root `package.json`.
- [ ] T015 Update `vercel.json` to build and serve the Docusaurus site from the root.

---

## Phase 3: Cleanup and Verification

- [ ] T016 Delete the `textbook/` directory.
- [ ] T017 Run `npm install` from the project root.
- [ ] T018 Run `npm run build` from the project root.
- [ ] T019 Run `npm start` from the project root to verify the site works locally.
