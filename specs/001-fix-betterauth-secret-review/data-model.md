# Data Model: Fix BetterAuth Secret and Context7 Review

## Entities

### User
*   **Description**: Represents an individual whose authenticated session persistence is being verified and restored within the application.
*   **Relationships**: Associated with an active Session.

### Session
*   **Description**: The current state of an authenticated user's interaction with the application. The primary issue is this state being `null` even after a successful login. Its integrity and validity are critically dependent on the Authentication Handler and the correct application of the Security Secret.
*   **Fields**:
    *   `status`: Represents the current state of the session (e.g., `valid`, `invalid`, `expired`, `null`).
*   **Validation**: The session's authenticity and integrity are validated by the Authentication Handler using the Security Secret.

### Security Secret (`BETTER_AUTH_SECRET`)
*   **Description**: A highly confidential key crucial for cryptographic operations like signing and verifying session tokens or cookies by the Authentication Handler. Its consistent presence, correct value, and proper application are fundamental to preventing session validation failures.
*   **Fields**:
    *   `value`: The actual string of the secret (never logged directly).
    *   `length`: An observable property used for logging and verification to confirm the secret's presence and consistency across different deployment environments without exposing its value.

### Authentication Handler
*   **Description**: The core component (e.g., the `betterAuth` instance in `auth-service/src/auth.ts`) responsible for orchestrating user login, creating and managing session identifiers, issuing JWTs, and most critically, validating active sessions based on the Security Secret and adherence to specified guidelines.
*   **Key Operations**: Login processing, session creation, session validation, JWT issuance.

### Context7 Guidelines
*   **Description**: An external set of best practices, constraints, or detailed setup instructions specifically for BetterAuth. These guidelines may include recommendations for middleware dependencies, specific database schema configurations, or cross-domain setup strategies that are vital for robust authentication architecture.
*   **Purpose**: To ensure the current authentication implementation is aligned with authoritative, up-to-date recommendations.

## Relationships

*   The **Authentication Handler** is responsible for validating a **Session** using the **Security Secret**.
*   A **User** is identified and maintains their state through a **Session**.
*   The proper functioning and configuration of the **Authentication Handler** are guided by **Context7 Guidelines**.
*   The integrity of the **Session** is directly dependent on the correct handling of the **Security Secret** by the **Authentication Handler**.