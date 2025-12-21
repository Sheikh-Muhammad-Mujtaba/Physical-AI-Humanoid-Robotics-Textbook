# Data Model: Fix Auth and L10n

**Feature**: Fix Auth and L10n
**Date**: 2025-12-21

## Entities

### User

Represents an individual with access to the system. This entity is central to all authentication and authorization processes.

**Attributes**:
-   `id` (UUID): Unique identifier for the user. (System Generated)
-   `email` (String): User's primary email address. (Required, Unique, Validated as email format)
-   `password_hash` (String): Hashed and salted password for email/password authentication. (Required for email/password signup/login)
-   `oauth_provider` (String): Name of the OAuth provider (e.g., 'Google', 'GitHub'). (Nullable, populated if signed up via OAuth)
-   `oauth_id` (String): Unique identifier from the OAuth provider. (Nullable, populated if signed up via OAuth, Unique per provider)
-   `created_at` (Timestamp): Timestamp when the user account was created. (System Generated)
-   `updated_at` (Timestamp): Timestamp when the user account was last updated. (System Generated)

**Relationships**:
-   One-to-many with `Session` (a user can have multiple active sessions).

**Validation Rules**:
-   `email` must be a valid email format.
-   `email` must be unique across all users.
-   `password_hash` must be present for email/password users.
-   `oauth_provider` and `oauth_id` must be present if the user signed up via OAuth.

### Session

Represents an active authenticated state for a user, enabling persistent login across requests.

**Attributes**:
-   `id` (UUID): Unique identifier for the session. (System Generated)
-   `user_id` (UUID): Foreign key referencing the `User` entity. (Required)
-   `token` (String): The session token used for authentication (e.g., JWT, opaque token). (System Generated)
-   `expires_at` (Timestamp): Timestamp when the session will expire. (System Generated)
-   `created_at` (Timestamp): Timestamp when the session was created. (System Generated)
-   `last_accessed_at` (Timestamp): Timestamp when the session was last used. (System Generated)

**Relationships**:
-   Many-to-one with `User` (a session belongs to one user).

**State Transitions**:
-   `Active`: Session is valid and can be used for authentication.
-   `Expired`: Session has passed its `expires_at` and is no longer valid.
-   `Revoked`: Session has been explicitly invalidated (e.g., user logged out).

**Validation Rules**:
-   `user_id` must refer to an existing `User`.
-   `token` must be a valid, unexpired token.
-   Session must be `Active` to be used for authentication.
