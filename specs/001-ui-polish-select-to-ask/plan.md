# Implementation Plan: UI Polish, Select-to-Ask, and Deployment Fixes

**Branch**: `001-ui-polish-select-to-ask` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-polish-select-to-ask/spec.md`

## Summary

This plan outlines the steps to complete the application by adding the missing frontend features (Select-to-Ask, Floating Chat Widget) and fixing the deployment configuration, while preserving the existing OpenAI-based backend.

## Technical Context

**Language/Version**: Python 3.10, TypeScript 5.x
**Primary Dependencies**: FastAPI, React, Docusaurus, Tailwind CSS
**Storage**: N/A
**Testing**: pytest, Jest
**Target Platform**: Vercel
**Project Type**: Web application (frontend + backend)
**Performance Goals**: "Ask AI" button appears within 200ms of text selection. Vercel build completes in under 5 minutes.
**Constraints**: The backend MUST continue to use the OpenAI SDK pattern.
**Scale/Scope**: Single user application.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **OpenAI-Compatible Architecture**: The backend MUST use the `openai` Python SDK. (PASS)
- **Contextual Intelligence**: The AI assistant MUST be accessible via a "Select-to-Ask" flow. (PASS)
- **Modern UI/UX**: The Chatbot MUST be a collapsible **Floating Widget** (bottom-right) using Tailwind CSS. (PASS)
- **Hybrid Deployment**: The `vercel.json` MUST explicitly define a Python build for `api/` and a Static build for `textbook/`. (PASS)
- **Zero Broken Links**: The `npm run build` command must pass without error. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-polish-select-to-ask/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
api/
├── index.py
└── utils/
textbook/
├── src/
│   ├── components/
│   ├── pages/
│   └── theme/
└── static/
```

**Structure Decision**: The existing project structure (web application with `api/` and `textbook/` directories) will be used.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |