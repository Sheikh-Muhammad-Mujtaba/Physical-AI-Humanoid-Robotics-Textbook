# Feature Specification: Flatten Project Structure

**Feature Branch**: `002-flatten-project-structure`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "## Task 1: Flatten Project Structure - Move Docusaurus to Root

**Objective:** Migrate Docusaurus configuration and source files from `textbook/` subdirectory
 to project root for simplified deployment and better monorepo alignment.

**Current Structure:**
```
AI-Spec-Driven/
├── api/
├── textbook/
│   ├── docusaurus.config.ts
│   ├── package.json
│   ├── src/
│   ├── docs/
│   ├── blog/
│   ├── static/
│   ├── scripts/
│   ├── i18n/
│   └── build/
└── vercel.json
```

**Target Structure:**
```
AI-Spec-Driven/
├── api/
│   ├── index.py
│   ├── utils/
│   └── requirements.txt
├── src/                    (from textbook/src)
├── docs/                   (from textbook/docs)
├── blog/                   (from textbook/blog)
├── static/                 (from textbook/static)
├── scripts/                (from textbook/scripts)
├── i18n/                   (from textbook/i18n)
├── docusaurus.config.ts    (from textbook/)
├── sidebars.ts             (from textbook/)
├── package.json            (merged from textbook/)
├── tsconfig.json           (from textbook/)
├── tailwind.config.js      (from textbook/)
├── postcss.config.js       (from textbook/)
├── vercel.json             (updated for root)
└── lighthouserc.js         (from textbook/)
```
"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simplified Deployment (Priority: P1)

As a developer, I want to deploy the Docusaurus site from the root of the project, so that the deployment process is simpler and more aligned with monorepo best practices.

**Why this priority**: This will simplify the project structure and deployment configuration.

**Independent Test**: The project can be deployed to Vercel with a single build command from the project root.

**Acceptance Scenarios**:

1. **Given** the project is deployed to Vercel, **When** a user visits the root domain, **Then** the Docusaurus site is displayed.
2. **Given** the project is deployed to Vercel, **When** a user visits an API route, **Then** the API responds correctly.

---

### User Story 2 - Root-level Access (Priority: P1)

As a user, I want to access the Docusaurus site from the root of the domain, so that I don't have to navigate to a subdirectory.

**Why this priority**: This improves the user experience and makes the site more professional.

**Independent Test**: The Docusaurus site is accessible at the root of the domain.

**Acceptance Scenarios**:

1. **Given** the project is deployed, **When** a user visits `https://<domain>/`, **Then** the Docusaurus homepage is displayed.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All Docusaurus source files and configuration MUST be moved from the `textbook/` subdirectory to the project root.
- **FR-002**: The `package.json` file at the root MUST be updated to include all dependencies and scripts from the original `textbook/package.json`.
- **FR-003**: The `vercel.json` file MUST be updated to build and serve the Docusaurus site from the project root.
- **FR-004**: The original `textbook/` directory MUST be deleted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Docusaurus site is accessible from the root of the domain on Vercel.
- **SC-002**: The API routes at `/api/*` are still working as expected.
- **SC-003**: The local development environment can be started with `npm start` from the project root.
- **SC-004**: The project builds successfully with `npm run build` from the project root.

---

## Known Issues & Solutions

### Issue: Sidebar Not Displaying Content (Fixed 2025-12-13)

**Symptom**: After migration, the Docusaurus sidebar shows categories but documents don't appear or navigation fails.

**Root Cause**: Document frontmatter contained `id` fields with folder paths (e.g., `id: module1-intro/what-is-physical-ai`). In Docusaurus, the `id` field also affects the URL route, causing a mismatch with what `sidebars.ts` expects.

**Solution**: Remove all `id` fields from markdown frontmatter. Use only `title` and `sidebar_position`:

```yaml
---
title: What is Physical AI?
sidebar_position: 1
---
```

**Files Affected**: All 13 markdown files in `docs/` subdirectories.

**Reference**: [Docusaurus Sidebar Documentation](https://docusaurus.io/docs/sidebar), [GitHub Issue #10496](https://github.com/facebook/docusaurus/issues/10496)