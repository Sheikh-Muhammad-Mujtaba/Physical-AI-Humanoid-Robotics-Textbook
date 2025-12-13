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

---

## Phase 4: Docusaurus Sidebar Fix (Post-Migration)

**Issue Discovered**: Content was not showing in sidebar after migration.

**Root Cause**: Document frontmatter `id` fields contained folder paths (e.g., `id: module1-introduction-to-physical-ai/what-is-physical-ai`), which conflicts with how Docusaurus generates routes.

**Fix Applied**: Remove `id` fields from all markdown frontmatter in `/docs/`. Docusaurus auto-generates IDs from file paths, which matches what `sidebars.ts` expects.

### Files Fixed (13 total):

- [x] T020 `docs/module1-introduction-to-physical-ai/what-is-physical-ai.md` - Remove `id` field
- [x] T021 `docs/module1-introduction-to-physical-ai/the-ai-robot-brain.md` - Remove `id` field
- [x] T022 `docs/module1-introduction-to-physical-ai/the-digital-twin.md` - Remove `id` field
- [x] T023 `docs/module1-introduction-to-physical-ai/the-robotic-nervous-system.md` - Remove `id` field
- [x] T024 `docs/module1-introduction-to-physical-ai/vision-language-action.md` - Remove `id` field
- [x] T025 `docs/module2-hardware-requirements/workstation-requirements.md` - Remove `id` field
- [x] T026 `docs/module2-hardware-requirements/edge-kit-requirements.md` - Remove `id` field
- [x] T027 `docs/module2-hardware-requirements/robot-lab-options.md` - Remove `id` field
- [x] T028 `docs/module2-hardware-requirements/summary-of-architecture.md` - Remove `id` field
- [x] T029 `docs/module3-cloud-native-lab/cloud-workstations.md` - Remove `id` field
- [x] T030 `docs/module3-cloud-native-lab/local-bridge-hardware.md` - Remove `id` field
- [x] T031 `docs/module3-cloud-native-lab/the-latency-trap.md` - Remove `id` field
- [x] T032 `docs/module4-economy-jetson-student-kit/jetson-student-kit.md` - Remove `id` field

### Correct Frontmatter Pattern:

```yaml
---
title: Document Title
sidebar_position: 1
---
```

**DO NOT USE** (causes sidebar/routing issues):
```yaml
---
id: folder-name/document-name  # ❌ WRONG - don't include paths
title: Document Title
sidebar_position: 1
---
```
