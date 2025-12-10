<!--
Sync Impact Report:
Version change: 4.2.0 -> 4.3.0
Modified principles: None
Added principles:
  - Real Backend Integration
  - Theme Consistency
  - Error Resilience
Removed principles: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/sp.adr.md: ⚠ pending
  - .specify/templates/commands/sp.analyze.md: ⚠ pending
  - .specify/templates/commands/sp.checklist.md: ⚠ pending
  - .specify/templates/commands/sp.clarify.md: ⚠ pending
  - .specify/templates/commands/sp.git.commit_pr.md: ⚠ pending
  - .specify/templates/commands/sp.implement.md: ⚠ pending
  - .specify/templates/commands/sp.phr.md: ⚠ pending
  - .specify/templates/commands/sp.plan.md: ⚠ pending
  - .specify/templates/commands/sp.specify.md: ⚠ pending
  - .specify/templates/commands/sp.tasks.md: ⚠ pending
  - README.md: ⚠ pending
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown.
-->
# Hackathon Project: AI/Spec-Driven Book + RAG Chatbot Constitution

These are hard rules and must ALWAYS be enforced to support a high-quality technical textbook and RAG Backend API development.

## Core Principles

### 1) OpenAI-Compatible Architecture
The backend MUST use the `openai` Python SDK (or `openai-agents`) configured with the Gemini Base URL (`generativelanguage.googleapis.com`) for all LLM operations. Do NOT rewrite this to the native Google GenAI SDK.

### 2) Root-Level Integration
The Chatbot component MUST NOT be embedded in Markdown or Page files. It MUST be rendered solely in `src/theme/Root.tsx` so it persists globally across the entire application.

### 3) Global State Management
Chat visibility (`isOpen`) and context data MUST be managed via a React Context (`ChatProvider`). This allows components like the "Selection Button" to control the Chatbot from anywhere.

### 4) Floating Widget UX
The Chatbot MUST be a collapsible "Floating Action Button" (FAB) widget fixed to the bottom-right of the viewport. Inline styles are FORBIDDEN; use Tailwind CSS.

### 5) Logic Preservation
The refactored UI MUST retain the existing backend integration (chat history, session UUIDs, feedback) that uses the OpenAI SDK.

### 6) TypeScript Import Standard
All imports of local files MUST omit the `.tsx` or `.ts` file extension (e.g., `import X from './file'`, NOT `import X from './file.tsx'`).

### 7) Tailwind v3 Standard
The project uses Tailwind CSS v3. It MUST rely on a `postcss.config.js` file for processing. Do NOT use `lightningcss` or Tailwind v4 packages.

### 8) Context-Driven UI
UI components like `TextSelectionButton` and `ChatbotWidget` MUST consume `useChat()` directly to trigger actions. Parent components (like `Root`) MUST NOT pass down handler functions manually.

### 9) Hybrid Deployment
The `vercel.json` MUST explicitly define:
* A Python build for `api/` (including `api/utils/**`).
* A Static build for `textbook/`.

### 10) Zero Broken Links
The `npm run build` command must pass without error.

### 11) Real Backend Integration
The `ChatContext` MUST NOT use mock data or timeouts. It MUST import functions from `src/lib/chatApi` to communicate with the Python backend (`/api/chat`, `/api/ask-selection`).

### 12) Theme Consistency
The Chatbot UI components MUST respect the Docusaurus Light/Dark mode.
* Use Tailwind's `dark:` modifier for all background and text colors.
* Match the primary brand color (e.g., buttons should use `var(--ifm-color-primary)` or the equivalent Tailwind class).

### 13) Error Resilience
If the backend is offline, the Chatbot MUST display a user-friendly error message in the chat window, not crash the app.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

**Version**: 4.3.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-10