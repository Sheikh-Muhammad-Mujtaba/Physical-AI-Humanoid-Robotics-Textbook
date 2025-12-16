# Data Model: Fix BetterAuth Session Persistence Failure

## Entities

### User
*   **Description**: Represents an individual who can authenticate and interact with the application.
*   **Fields**:
    *   `id`: Unique identifier for the user.
    *   `credentials`: Information used for authentication (e.g., hashed password, reference to an external identity provider).
    *   `roles`: User roles or permissions within the system.
    *   `metadata`: Any additional user-specific data (e.g., name, email address).
*   **Relationships**: Has many Sessions.

### Session
*   **Description**: Represents an active, authenticated user session.
*   **Fields**:
    *   `id`: Unique identifier for the session.
    *   `userId`: Identifier linking to the associated User.
    *   `token`: Reference to the active Authentication Token (or the token itself, depending on storage strategy).
    *   `expiry`: Timestamp indicating when the session will expire.
    *   `issuedAt`: Timestamp indicating when the session was created.
    *   `isValid`: Boolean flag indicating the current validity of the session.
    *   `refreshToken`: (Optional) A token used for renewing the session without requiring full re-authentication.
*   **Relationships**: Belongs to a User, associated with an Authentication Token.

### Authentication Token
*   **Description**: A secure, digitally signed token issued upon successful authentication, used to verify user identity and maintain session state in a stateless manner.
*   **Fields**:
    *   `value`: The string representation of the signed token.
    *   `type`: The type of token (e.g., "Bearer", "JWT").
    *   `claims`: The payload data within the token, typically containing user identity, roles, expiry, issuer, and audience.
*   **Validation Rules**: Must be digitally signed with a valid secret/key, include a valid `issuer` and `audience` claim, and not be expired.

### Session Data Storage
*   **Description**: The persistent storage layer responsible for securely storing and managing user and session-related information.
*   **Conceptual Content**: Stores User records and Session records.
*   **Responsibilities**: Provides mechanisms for storing, retrieving, updating, and deleting User and Session data securely and efficiently.

### Authentication Service
*   **Description**: A dedicated service or module responsible for managing the lifecycle of user authentication, including sign-in, sign-out, token generation, token validation, session creation, and session retrieval.
*   **Key Operations**: Handles user authentication requests, issues and validates authentication tokens, manages session state, and interacts with Session Data Storage.

### Client Application
*   **Description**: The application (e.g., web frontend, mobile app) that consumes the Authentication Service.
*   **Key Operations**: Sends user credentials for sign-in, receives and stores authentication tokens, includes tokens in requests to protected resources, and handles session expiration.

## Relationships

*   A **User** can be associated with multiple **Sessions** concurrently or sequentially.
*   Each **Session** is uniquely linked to a single **User**.
*   An **Authentication Token** is generated for and associated with an active **Session**.
*   The **Authentication Service** orchestrates the interactions between **Users**, **Sessions**, and **Authentication Tokens**, persisting necessary data in the **Session Data Storage**.
*   The **Client Application** communicates with the **Authentication Service** and secured backend resources using **Authentication Tokens** to represent an active **Session**.