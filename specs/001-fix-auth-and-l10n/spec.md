# Feature Specification: Fix Auth and L10n

**Feature Branch**: `001-fix-auth-and-l10n`
**Created**: 2025-12-21
**Status**: Draft
**Input**: User description: "Problem

BetterAuth session-based login & signup is unreliable.

Social OAuth login/signup (Google/GitHub/etc.) is not working correctly.

Session persistence, callback handling, or token → session exchange is likely broken.

Documentation may have changed; implementation may be outdated.

Urdu (ur) translation in the Docusaurus project is incomplete and inconsistent.

Goals

Fix session-based authentication for:

Email/password login

Signup

Session persistence (cookies, server session, refresh)

Fix social OAuth login & signup end-to-end.

Align implementation strictly with latest BetterAuth docs.

Use Context7 MCP and BetterAuth MCP to fetch up-to-date references and examples.

Complete full Urdu (ur) localization using Docusaurus i18n.

Use Gemini AI for high-quality Urdu translations.

Ensure translations are consistent, reviewed, and production-ready.

Non-Goals

No UI redesign unless required for auth correctness.

No custom auth logic outside BetterAuth unless explicitly required by docs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Email/Password Authentication (Priority: P1)

As a user, I want to be able to sign up and log in reliably using my email and password, so that I can access my account without issues. My session should persist so I don't have to log in repeatedly.

**Why this priority**: This is a fundamental feature for user access and retention.

**Independent Test**: A user can create an account, log out, log back in, and access their content. The session remains active after closing and reopening the browser.

**Acceptance Scenarios**:

1.  **Given** a new user is on the signup page, **When** they enter valid credentials and sign up, **Then** they are logged in and a persistent session is created.
2.  **Given** an existing user is on the login page, **When** they enter correct credentials, **Then** they are logged in and a persistent session is created.
3.  **Given** a logged-in user closes their browser and reopens it, **When** they navigate to the site, **Then** they are still logged in.

---

### User Story 2 - Seamless Social OAuth Login (Priority: P2)

As a user, I want to be able to sign up and log in using my Google or GitHub account, so that I can have a quick and easy authentication experience.

**Why this priority**: Social logins are a common and expected feature that improves user experience and conversion rates.

**Independent Test**: A user can click "Login with Google" or "Login with GitHub", complete the OAuth flow, and be successfully logged into the application.

**Acceptance Scenarios**:

1.  **Given** a new user is on the login page, **When** they click "Login with Google" and approve the request, **Then** a new account is created, and they are logged in.
2.  **Given** an existing user is on the login page, **When** they click "Login with GitHub" and have previously linked their account, **Then** they are logged in.

---

### User Story 3 - Complete Urdu Localization (Priority: P3)

As an Urdu-speaking user, I want to see the entire website translated into Urdu, so that I can use the application in my native language.

**Why this priority**: This makes the application accessible to a wider audience.

**Independent Test**: An Urdu-speaking user can navigate the entire website and see all text in high-quality, consistent Urdu.

**Acceptance Scenarios**:

1.  **Given** a user has selected Urdu as their language, **When** they navigate to any page, **Then** all UI text is displayed in Urdu.
2.  **Given** a user is reading content in Urdu, **When** they encounter any UI element, **Then** the translation is contextually accurate and consistent with other translations.

### Edge Cases

-   What happens if a user tries to sign up with an email that is already registered?
-   What happens if the OAuth provider (Google/GitHub) has an outage?
-   How does the system handle right-to-left (RTL) display for Urdu?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: System MUST allow users to create an account using email and password.
-   **FR-002**: System MUST allow users to log in using their email and password.
-   **FR-003**: System MUST create a persistent session for authenticated users.
-   **FR-004**: System MUST allow users to sign up and log in via Google OAuth.
-   **FR-005**: System MUST allow users to sign up and log in via GitHub OAuth.
-   **FR-006**: System MUST align the authentication implementation with the latest BetterAuth documentation.
-   **FR-007**: System MUST provide a complete and consistent Urdu (ur) localization for all user-facing text.

### Key Entities *(include if feature involves data)*

-   **User**: Represents an individual with access to the system. Attributes include email, password hash, and linked OAuth provider details.
-   **Session**: Represents a user's authenticated state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 99.9% of email/password login and signup attempts are successful.
-   **SC-002**: 99.9% of social OAuth login and signup attempts are successful.
-   **SC-003**: 100% of user-facing text is translated into Urdu with a review-assessed quality score of 95% or higher for accuracy and consistency.
-   **SC-004**: Session persistence failures affect less than 0.1% of active users.