# Implementation Plan: Reference Parity and Bug Fixes

**Branch**: `001-ref-parity-fixes` | **Date**: 2025-12-10 | **Spec**: [specs/001-ref-parity-fixes/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ref-parity-fixes/spec.md`

## Summary

This plan outlines the steps to fix backend connectivity, standardize SDK usage, and polish the UI to match the reference repository. This involves adding CORS middleware, updating dependencies, refactoring the LLM logic, improving frontend session management and error handling, and fixing UI styling.

## Technical Context

**Language/Version**: Python 3.10+, TypeScript 5.x
**Primary Dependencies**: FastAPI, Docusaurus, React, `openai`
**Storage**: N/A for this feature
**Testing**: Manual testing as per spec
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
- [x] Hybrid Deployment
- [x] Zero Broken Links
- [x] Real Data Integration
- [x] Docusaurus Native Theming
- [x] Error Resilience
- [x] Safe CSS Configuration
- [x] Secure Connectivity

## Project Structure

The project is a web application with a frontend and a backend.
-   **Backend**: `api/` directory, written in Python with FastAPI.
-   **Frontend**: `textbook/` directory, a Docusaurus site with React components.

## Implementation Phases

### Phase 1: Backend Alignment

1.  **Add CORS Middleware**: Modify `api/index.py` to include `CORSMiddleware` with `allow_origins=["*"]`.
2.  **Update Dependencies**: Modify `api/requirements.txt` to add `openai`.
3.  **Refactor LLM Logic**: Modify `api/utils/models.py` to use `AsyncOpenAI` with the Gemini base URL.

### Phase 2: Frontend Logic

1.  **Install UUID**: Run `npm install uuid @types/uuid` in the `textbook` directory.
2.  **Implement Session ID**: Modify `textbook/src/theme/Chat/ChatContext.tsx` to generate a v4 UUID on mount.
3.  **Improve Error Handling**: Modify `textbook/src/theme/Chat/chatApi.ts` to log specific network errors.

### Phase 3: UI Polish

1.  **Apply Dark Mode Styles**: Modify `textbook/src/theme/Chat/ChatbotWidget.tsx` to ensure `dark:` variants are applied correctly.

### Phase 4: Deployment Config

1.  **Verify `vercel.json`**: Check `vercel.json` to ensure it includes `api/utils/**` in the Python build.
