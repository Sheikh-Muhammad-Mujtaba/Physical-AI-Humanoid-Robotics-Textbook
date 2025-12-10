<!--
Sync Impact Report:
Version change: 4.4.0 -> 4.5.0
Modified principles:
  - 1) OpenAI-Compatible Architecture
  - 5) Logic Preservation
  - 12) Docusaurus Native Theming
Added principles:
  - 15) Secure Connectivity
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

### 1) OpenAI-Adapter Pattern
The backend MUST use the `openai` Python SDK (or `openai-agents`) configured with the Gemini Base URL for all LLM operations. The `base_url` MUST be set to `"https://generativelanguage.googleapis.com/v1beta/openai/"` and authentication MUST use the `GOOGLE_API_KEY`. Do NOT rewrite this to the native Google GenAI SDK.

### 2) Root-Level Integration
The Chatbot component MUST NOT be embedded in Markdown or Page files. It MUST be rendered solely in `src/theme/Root.tsx` so it persists globally across the entire application.

### 3) Global State Management
Chat visibility (`isOpen`) and context data MUST be managed via a React Context (`ChatProvider`). This allows components like the "Selection Button" to control the Chatbot from anywhere.

### 4) Floating Widget UX
The Chatbot MUST be a collapsible "Floating Action Button" (FAB) widget fixed to the bottom-right of the viewport. Inline styles are FORBIDDEN; use Tailwind CSS.

### 5) Robust Sessions & Logic Preservation
The refactored UI MUST retain the existing backend integration (chat history, feedback). The Frontend MUST use the `uuid` library to generate version-4 UUIDs for `sessionId`. Simple timestamps are forbidden.

### 6) Extension-Less Imports
All imports of local TypeScript/React files MUST omit the `.tsx` or `.ts` extension (e.g., `import X from './file'`, NOT `import X from './file.tsx'`).

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

### 11) Real Data Integration
The Frontend `ChatContext` MUST connect to the Backend API (`/api/chat`) using the `chatApi` library. Mock data is forbidden in the final build.

### 12) Docusaurus Native Theming
All Chatbot UI components MUST use Tailwind `dark:` variants to perfectly match the Docusaurus theme.

### 13) Error Resilience
If the backend is offline, the Chatbot MUST display a user-friendly error message in the chat window, not crash the app.

### 14) Safe CSS Configuration
The `tailwind.config.js` MUST have `corePlugins: { preflight: false }` to prevent breaking the Docusaurus layout.

### 15) Secure Connectivity
The FastAPI backend MUST include `CORSMiddleware` allowing origins `["*"]` for development purposes. For production, specific domains MUST be whitelisted.

## Governance
<!-- Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

**Version**: 4.5.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-10
