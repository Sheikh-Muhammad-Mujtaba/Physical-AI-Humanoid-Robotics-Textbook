# Implementation Plan: Flatten Project Structure

**Branch**: `002-flatten-project-structure` | **Date**: 2025-12-10 | **Spec**: [specs/002-flatten-project-structure/spec.md](spec.md)
**Input**: Feature specification from `/specs/002-flatten-project-structure/spec.md`

## Summary

This plan outlines the steps to migrate the Docusaurus site from the `textbook/` subdirectory to the project root. This will simplify the project structure and deployment configuration, making the Docusaurus site the root of the domain.

## Technical Context

**Language/Version**: Python 3.10+, TypeScript 5.x
**Primary Dependencies**: FastAPI, Docusaurus, React
**Storage**: N/A for this feature
**Testing**: Manual testing
**Target Platform**: Vercel
**Project Type**: Web application (frontend + backend)

## Constitution Check

- [x] OpenAI-Adapter Pattern
- [x] Root-Level Integration
- [x] Global State Management
- [x] Floating Widget UX
- [x] Robust Sessions & Logic Preservation
- [x] Extension-Less Imports
- [x] Tailwind v3 Standard
- [x] Context-Driven UI
- [x] Hybrid Deployment (will be updated)
- [x] Zero Broken Links
- [x] Real Data Integration
- [x] Docusaurus Native Theming
- [x] Error Resilience
- [x] Safe CSS Configuration
- [x] Secure Connectivity

## Project Structure

The project structure will be flattened to move all Docusaurus files from the `textbook/` subdirectory to the project root. The `api/` directory will remain as is.

## Implementation Phases

### Phase 1: File Migration

1.  **Copy all Docusaurus configuration files to root:**
   - Copy `textbook/docusaurus.config.ts` → `docusaurus.config.ts`
   - Copy `textbook/sidebars.ts` → `sidebars.ts`
   - Copy `textbook/tailwind.config.js` → `tailwind.config.js`
   - Copy `textbook/postcss.config.js` → `postcss.config.js`
   - Copy `textbook/tsconfig.json` → `tsconfig.json`
   - Copy `textbook/lighthouserc.js` → `lighthouserc.js`
   - Copy `textbook/.npmignore` → `.npmignore`

2.  **Copy all source directories to root:**
   - Copy `textbook/src/**` → `src/`
   - Copy `textbook/docs/**` → `docs/`
   - Copy `textbook/blog/**` → `blog/`
   - Copy `textbook/static/**` → `static/`
   - Copy `textbook/scripts/**` → `scripts/`
   - Copy `textbook/i18n/**` → `i18n/`

### Phase 2: Configuration Update

1.  **Merge `package.json`:**
   - Extract all dependencies and scripts from `textbook/package.json` and merge them into the root `package.json`.

2.  **Update `vercel.json` for new structure:**
   - Modify the build configuration to build the Docusaurus site from the root.
   - Update the routes to serve the Docusaurus site from the root.

### Phase 3: Cleanup and Verification

1.  **Delete old `textbook/` directory** after all files have been moved and verified.
2.  **Test locally:**
   - Run `npm install` from the project root.
   - Run `npm run build` from the project root.
   - Run `npm start` from the project root to verify the site works locally.

### Phase 4: Docusaurus Sidebar Configuration (CRITICAL)

**Issue**: After migration, content was not appearing in the sidebar.

**Root Cause Analysis**: The `id` frontmatter field in markdown files was incorrectly set to include folder paths (e.g., `id: module1-introduction-to-physical-ai/what-is-physical-ai`). This causes Docusaurus to generate different routes than expected by `sidebars.ts`.

**Docusaurus Behavior** (per [official docs](https://docusaurus.io/docs/sidebar)):
- When `id` is NOT set: Docusaurus auto-generates ID from file path (e.g., `docs/module1/file.md` → ID `module1/file`)
- When `id` IS set: Docusaurus uses that ID directly AND changes the URL route to match
- Setting `id: folder/filename` effectively duplicates the folder path, breaking the sidebar reference

**Solution**: Remove all `id` fields from frontmatter. Let Docusaurus auto-generate IDs from file paths.

**Correct Frontmatter Format**:
```yaml
---
title: Document Title
sidebar_position: 1
---
```

**Incorrect Format** (DO NOT USE):
```yaml
---
id: folder-name/document-name  # ❌ Causes routing issues
title: Document Title
sidebar_position: 1
---
```

**Sidebar Reference Pattern** (in `sidebars.ts`):
```typescript
{
  type: 'category',
  label: 'Module 1',
  items: [
    'module1-folder/document-filename',  // No .md extension
  ],
}
```

**Key Takeaway**: The sidebar item string should match the folder structure from the `docs/` root, without the `.md` extension. Do not set explicit `id` fields unless you have a specific reason to override the URL.