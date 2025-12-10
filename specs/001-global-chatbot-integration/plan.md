# Implementation Plan: Global Chatbot Integration (Root Architecture)

**Branch**: `001-global-chatbot-integration` | **Date**: 2025-12-10 | **Spec**: /specs/001-global-chatbot-integration/spec.md
**Input**: Feature specification from `/specs/001-global-chatbot-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature involves moving the chatbot from embedded page components to a global, application-level widget, ensuring its availability across all pages and persistence of state during navigation. This requires refactoring the chatbot UI component to be purely presentational, establishing a global state management system for its operational status and conversation context, and integrating it at the highest level of the application's UI hierarchy. The existing backend communication for chat history and AI responses will be preserved.

## Technical Context

**Language/Version**: Python 3.10+ (for backend), TypeScript 5.x (for frontend)
**Primary Dependencies**: FastAPI, React, Docusaurus, Tailwind CSS
**Storage**: PostgreSQL (for user data, if applicable to existing backend), Qdrant (for vectors, if applicable to existing backend)
**Testing**: `npm test && npm run lint` (for frontend, Docusaurus)
**Target Platform**: Web (Docusaurus-based frontend)
**Performance Goals**: Responsive UI, chat responses within typical expectations (as per SC-002 in spec: AI responses displayed within 500ms of being received from the backend).
**Constraints**: Adherence to project constitution principles (e.g., no inline styles, use of Tailwind CSS).
**Scale/Scope**: Implementation of a global application-level UI component that impacts and is available across all user-facing pages (Home, Blog, Docs).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **Educational Clarity**: This principle is not directly applicable to the implementation of a UI feature. (N/A)
-   **Docusaurus-First Architecture**: The plan directly addresses Docusaurus architecture by integrating the chatbot into the root UI hierarchy and eliminating page-specific integrations. (PASS)
-   **Modular Content**: This principle is not directly applicable to the implementation of a UI feature. (N/A)
-   **Single Source of Truth**: This principle is not directly applicable to the implementation of a UI feature. (N/A)
-   **Asset Management**: This feature doesn't introduce new static assets beyond UI elements. (N/A)
-   **Serverless Compatibility**: The feature preserves existing backend communication, implying adherence to serverless compatibility if the backend already is. No new server-side components are introduced by this feature. (PASS)
-   **Type Safety**: The feature primarily involves frontend UI and state management. Backend type safety (Pydantic) is not directly impacted but remains a general project principle. (PASS - by not introducing incompatibility)
-   **Modular Utilities**: The plan to establish a dedicated, global state management system (context) aligns with modularity principles. (PASS)
-   **Secure Configuration**: This principle is not directly applicable to the implementation of a UI feature. (N/A)
-   **Frontend/Backend Separation**: The feature explicitly preserves existing backend communication, implying adherence to communication via `/api` endpoints. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-global-chatbot-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (when "frontend" + "backend" detected)
api/ # Existing backend structure
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

textbook/ # Existing Docusaurus frontend structure
├── src/
│   ├── components/ # New Chatbot components and refactored TextSelectionButton
│   ├── theme/      # Modification of Root.tsx to integrate global chatbot
│   ├── contexts/   # New directory for Chat Context (e.g., ChatContext.tsx)
│   ├── services/   # Potentially for client-side chat API calls
│   └── pages/      # Cleanup: Removal of existing chatbot integrations
└── tests/
```

**Structure Decision**: The feature primarily impacts the existing `textbook/` (Docusaurus frontend) structure. New components, context, and modifications to `Root.tsx` will be introduced. Existing page-level chatbot integrations will be removed. The `api/` (backend) structure remains largely untouched, as existing communication is preserved.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |