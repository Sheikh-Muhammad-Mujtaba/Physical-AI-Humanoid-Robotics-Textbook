# Feature Specification: Fix Build Errors and Finalize Global Chatbot

**Feature Branch**: `001-add-new-specs`  
**Created**: December 10, 2025  
**Status**: Draft  
**Input**: User description: "Feature: Fix Build Errors and Finalize Global Chatbot

I need to resolve the "module has no exports" build error and ensure Tailwind loads correctly.

**1. Fix Import Paths (Critical Build Fix):**
* **Target**: `textbook/src/theme/Root.tsx` and any component consuming `ChatContext`.
* **Issue**: The import path `../contexts/ChatContext.tsx` is invalid in Webpack/TS.
* **Requirement**: Change all imports to `../contexts/ChatContext` (remove file extension).

**2. Configure PostCSS (Tailwind Fix):**
* **Target**: `textbook/postcss.config.js`.
* **Requirement**: Create this file to enable Tailwind processing:
  ```javascript
  module.exports = {
    
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
3. Clean Up Root Logic:

Target: textbook/src/theme/Root.tsx.

Requirement: Remove the unused handleAsk function and askSelectionWithBackend import. The Root component should only be responsible for:

Wrapping the app in <ChatProvider>.

Rendering <TextSelectionButton /> and <ChatbotWidget />.

Success Criteria:

npm run build passes without errors.

The Chatbot appears on the site."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resolve Build Errors (Priority: P1)

As a developer, I want the project to build successfully without errors, so that I can deploy the application.

**Why this priority**: This is a critical blocker for any deployment or further development.

**Independent Test**: The `npm run build` command can be executed, and its exit code and output checked for errors.

**Acceptance Scenarios**:

1.  **Given** the project setup, **When** `npm run build` is executed, **Then** the build process completes without any "module has no exports" errors.
2.  **Given** `textbook/src/theme/Root.tsx` or any component consuming `ChatContext` contains `../contexts/ChatContext.tsx` import, **When** the build process runs, **Then** all imports are correctly resolved as `../contexts/ChatContext`.

---

### User Story 2 - Enable Tailwind CSS Processing (Priority: P1)

As a developer, I want Tailwind CSS to be correctly processed, so that the application's styling is applied as intended.

**Why this priority**: Proper styling is essential for the user interface and overall application quality.

**Independent Test**: The `postcss.config.js` file can be created and the application built, verifying Tailwind classes are correctly applied in the rendered output.

**Acceptance Scenarios**:

1.  **Given** the project needs Tailwind CSS processing, **When** `textbook/postcss.config.js` is created with the specified configuration, **Then** Tailwind CSS classes are correctly processed during the build.

---

### User Story 3 - Streamline Root Component Logic (Priority: P2)

As a developer, I want the `Root.tsx` component to have a clear and minimal responsibility, so that its code is cleaner and easier to maintain.

**Why this priority**: Code maintainability and clarity improve development efficiency and reduce future bugs.

**Independent Test**: The `textbook/src/theme/Root.tsx` file can be inspected to confirm the removal of unused functions and imports, and the correct rendering of `ChatProvider`, `TextSelectionButton`, and `ChatbotWidget`.

**Acceptance Scenarios**:

1.  **Given** `textbook/src/theme/Root.tsx` contains `handleAsk` function and `askSelectionWithBackend` import, **When** the code is updated, **Then** `handleAsk` and `askSelectionWithBackend` are removed from `Root.tsx`.
2.  **Given** the `Root` component, **When** it renders, **Then** it wraps the application in `<ChatProvider>`, and renders `<TextSelectionButton />` and `<ChatbotWidget />`.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The build system MUST correctly resolve module imports by changing `../contexts/ChatContext.tsx` to `../contexts/ChatContext` in `textbook/src/theme/Root.tsx` and all components consuming `ChatContext`.
-   **FR-002**: The project MUST be configured to process Tailwind CSS by creating `textbook/postcss.config.js` with the specified plugins (`tailwindcss`, `autoprefixer`).
-   **FR-003**: The `textbook/src/theme/Root.tsx` component MUST NOT contain the `handleAsk` function.
-   **FR-004**: The `textbook/src/theme/Root.tsx` component MUST NOT import `askSelectionWithBackend`.
-   **FR-005**: The `textbook/src/theme/Root.tsx` component MUST ensure the application is wrapped in `<ChatProvider>`.
-   **FR-006**: The `textbook/src/theme/Root.tsx` component MUST render `<TextSelectionButton />` and `<ChatbotWidget />`.

### Key Entities *(include if feature involves data)*

-   **ChatContext**: Provides context for the chatbot functionality to its consumers.
-   **Root Component**: The main entry point component (`textbook/src/theme/Root.tsx`) responsible for overall application structure and provider setup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: `npm run build` completes with an exit code of 0, indicating no build errors.
-   **SC-002**: The chatbot interface (including elements styled by Tailwind CSS) is visibly present and correctly rendered on the live site after deployment.
-   **SC-003**: All import paths for `ChatContext` within the specified files are updated to remove the `.tsx` extension, as verified by static analysis or code review.
-   **SC-004**: The `textbook/postcss.config.js` file exists and contains the correct configuration for Tailwind CSS and Autoprefixer.
-   **SC-005**: The `handleAsk` function and `askSelectionWithBackend` import are verifiably absent from `textbook/src/theme/Root.tsx`.