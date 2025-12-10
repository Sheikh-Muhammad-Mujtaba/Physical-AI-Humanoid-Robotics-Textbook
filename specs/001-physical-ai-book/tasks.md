# Feature: Physical AI & Humanoid Robotics – AI-Native Systems Book

This document outlines the tasks required to develop the Docusaurus book, based on the provided `plan.md` and `spec.md`.

## Phase 1: Setup (Project Initialization)

- [ ] T001 Create `rag-backend/` directory at the repository root. (Marked as CANCELLED by previous user instruction)
- [ ] T002 Create `chatbot-widget/` directory at the repository root. (Marked as CANCELLED by previous user instruction)
- [ ] T003 Initialize a Python virtual environment and `requirements.txt` in `rag-backend/`. (Marked as CANCELLED by previous user instruction)
- [ ] T004 Initialize a Node.js project within `chatbot-widget/` directory (e.g., `npm init -y` or `pnpm init`). (Marked as CANCELLED by previous user instruction)
- [ ] T005 Configure `textbook/docusaurus.config.js` with the book title "Physical AI & Humanoid Robotics – AI-Native Systems".
- [ ] T006 Install core dependencies for Docusaurus in `textbook/package.json`.
- [ ] T007 Create initial `README.md` at the repository root describing the multi-project setup.
- [ ] T008 Create initial `.gitignore` files for `rag-backend/` and `chatbot-widget/`. (Marked as CANCELLED by previous user instruction)

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T009 Rename `textbook/docs/module1-introduction-to-physical-ai` to `textbook/docs/module1-the-robotic-nervous-system-ros2`.
- [ ] T010 Rename `textbook/docs/module2-humanoid-robotics` to `textbook/docs/module2-the-digital-twin-gazebo-unity`.
- [ ] T011 Rename `textbook/docs/module3-ai-native-systems` to `textbook/docs/module3-the-ai-robot-brain-nvidia-isaac`.
- [ ] T012 Rename `textbook/docs/module4-perception-and-sensor-fusion-for-physical-ai` to `textbook/docs/module4-vision-language-action-vla`.
- [ ] T013 Delete `textbook/docs/module5-motion-planning-and-control-for-humanoid-robots`.
- [ ] T014 Update `textbook/docs/module1-the-robotic-nervous-system-ros2/_category_.json` with the name "Module 1: The Robotic Nervous System (ROS 2)".
- [ ] T015 Update `textbook/docs/module2-the-digital-twin-gazebo-unity/_category_.json` with the name "Module 2: The Digital Twin (Gazebo & Unity)".
- [ ] T016 Update `textbook/docs/module3-the-ai-robot-brain-nvidia-isaac/_category_.json` with the name "Module 3: The AI-Robot Brain (NVIDIA Isaac™)".
- [ ] T017 Update `textbook/docs/module4-vision-language-action-vla/_category_.json` with the name "Module 4: Vision-Language-Action (VLA)".
- [ ] T018 Create `textbook/docs/module1-the-robotic-nervous-system-ros2/introduction-to-physical-ai.md` with content for "Weeks 1-2: Introduction to Physical AI" based on `contentguide.md`.
- [ ] T019 Create `textbook/docs/module1-the-robotic-nervous-system-ros2/ros2-fundamentals.md` with content for "Weeks 3-5: ROS 2 Fundamentals" based on `contentguide.md`.
- [ ] T020 Create `textbook/docs/module2-the-digital-twin-gazebo-unity/robot-simulation-with-gazebo.md` with content for "Weeks 6-7: Robot Simulation with Gazebo" based on `contentguide.md`.
- [ ] T021 Create `textbook/docs/module3-the-ai-robot-brain-nvidia-isaac/nvidia-isaac-platform.md` with content for "Weeks 8-10: NVIDIA Isaac Platform" based on `contentguide.md`.
- [ ] T022 Create `textbook/docs/module4-vision-language-action-vla/humanoid-robot-development.md` with content for "Weeks 11-12: Humanoid Robot Development" based on `contentguide.md`.
- [ ] T023 Create `textbook/docs/module4-vision-language-action-vla/conversational-robotics.md` with content for "Week 13: Conversational Robotics" based on `contentguide.md`.
- [ ] T024 Update `textbook/sidebars.ts` to include all modules and their respective chapters.

## Phase 3: User Story 1 - Read Book Content (P1)

- [ ] T025 [US1] Configure `textbook/docusaurus.config.js` for basic layout and navigation.
- [ ] T026 [US1] Ensure smooth content rendering across chapters in `docs/`.
- [ ] T027 [US1] Implement light/dark mode toggle functionality in Docusaurus theme (`textbook/src/theme/Navbar/ColorModeToggle/index.tsx` or similar).

## Phase 4: User Story 3 - Understand Book Overview (P2)

- [ ] T028 [US3] Create `textbook/src/pages/index.tsx` (or `.mdx`) with a hero section as described in `spec.md`.
- [ ] T029 [US3] Create `textbook/docs/intro.mdx` with detailed introductory content and learning outcomes from `contentguide.md`.
- [ ] T030 [US3] Add footer links in `textbook/src/theme/Footer/index.js` or `textbook/docusaurus.config.js` to GitHub repository, author information, and license.

## Phase 5: User Story 2 - Search Book Content (P2)

- [ ] T031 [US2] Configure Docusaurus search plugin (e.g., `docusaurus-theme-search-algolia` or `docusaurus-plugin-search-local`) in `textbook/docusaurus.config.js`.
- [ ] T032 [US2] Ensure search functionality indexes all book content and returns relevant results.

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T033 Perform unit and integration testing for `docs/`.
- [ ] T034 Optimize Docusaurus site for SEO (`textbook/docusaurus.config.js`, sitemap generation).
- [ ] T035 Prepare deployment scripts/configuration for Docusaurus to a hosting provider (e.g., GitHub Pages, Vercel).

## Dependencies

- Phase 1 must be completed before Phase 2.
- Phase 2 must be completed before Phase 3 and Phase 4.
- Phase 3 is a prerequisite for Phase 4.
- Phase 4 is a prerequisite for Phase 5.
- Phase 6 (Polish & Cross-Cutting Concerns) depends on the completion of all preceding phases.

## Parallel Execution Examples

- Tasks within Phase 1 (Setup) can be highly parallelized where not cancelled.
- Tasks within Phase 2 (Foundational) that create content files can be parallelized.
- Tasks within Phase 3 (User Story 1) can be highly parallelized, e.g., `T025`, `T026`, `T027`.
- `T028`, `T029`, `T030` can be parallelized.
- Tasks within Phase 6 (Polish & Cross-Cutting Concerns) can be parallelized.

## Implementation Strategy

The project will follow an MVP-first approach, prioritizing User Story 1 (Read Book Content) and User Story 3 (Understand Book Overview) to establish a basic functional book website. Subsequent features like search (User Story 2) and polishing will be implemented incrementally.

## Summary

- **Total Task Count**: 35 (excluding cancelled tasks)
- **Tasks per User Story**:
    - US1 (Read Book Content): 3
    - US2 (Search Book Content): 2
    - US3 (Understand Book Overview): 3
- **Parallel Opportunities Identified**: Many tasks within phases can be parallelized.
- **Independent Test Criteria for Each Story**:
    - **US1**: Deploy web-based book; verify all chapters accessible via sidebar, display correctly, light/dark mode functions.
    - **US2**: Search for keywords; verify relevant results link to correct sections.
    - **US3**: Navigate to homepage and intro; verify content introduces book and purpose.
- **Suggested MVP Scope**: User Story 1 and User Story 3 to deliver a basic, navigable book with an introduction.

Validation: All tasks follow the checklist format (checkbox, ID, labels, file paths).