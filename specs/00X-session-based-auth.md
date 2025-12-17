# Specification: Chatbot Session-Based Authentication

## 1. Problem Statement

The chatbot application was experiencing authentication failures due to the frontend caching JWT tokens without proper expiration checks. This led to expired tokens being sent to the Python backend, resulting in 401 Unauthorized errors, despite valid user sessions existing via BetterAuth cookies. The current implementation also lacks a `user_id` column in the `ChatHistory` table, preventing proper user-specific chat history management.

## 2. Solution Overview: Session-Based Authentication

The chosen solution is to transition the chatbot's authentication mechanism from JWT-based to session-based, leveraging BetterAuth's existing session cookies. This approach simplifies authentication by eliminating the need for manual JWT management, token expiration checks, and directly utilizes the robust session management provided by BetterAuth.

## 3. Detailed Specifications

### 3.1. Backend Changes

#### 3.1.1. Database Schema for BetterAuth Sessions

The BetterAuth service manages its own `session` table, which includes:
*   `id` (string, primary key)
*   `userId` (string, foreign key)
*   `token` (string, unique)
*   `expiresAt` (timestamp with time zone)
*   `ipAddress` (text, nullable)
*   `userAgent` (text, nullable)
*   `createdAt` (timestamp with time zone)
*   `updatedAt` (timestamp with time zone)

#### 3.1.2. `api/utils/sql_models.py` Updates

*   Introduce `BetterAuthSession` and `BetterAuthUser` SQLAlchemy models to represent the BetterAuth database schema (read-only for the chatbot backend).
*   **CRITICAL PENDING TASK:** Modify the `ChatHistory` model to include a `user_id` column, linked to `BetterAuthUser.id`, to enable user-specific chat history. This will require a database migration.

#### 3.1.3. `api/utils/auth.py` Implementation

*   Implement `validate_session(request: Request, db: Session) -> dict`:
    *   Retrieves the `better-auth.session_token` from incoming request cookies.
    *   Queries the `BetterAuthSession` table to find an active session matching the token.
    *   Validates session existence and expiration (`expiresAt` against current UTC time).
    *   Raises `HTTPException(401)` for invalid or expired sessions.
    *   Returns a dictionary containing `user_id` and `session_id` upon successful validation.
*   Implement `get_current_user_from_session(request: Request, db: Session) -> str`:
    *   A FastAPI dependency that calls `validate_session` and returns the `user_id`.

#### 3.1.4. `api/index.py` Endpoint Updates

All chatbot-related API endpoints (`/api/history/{session_id}`, `/api/user/history`, `/api/feedback`, `/api/chat`, `/api/ask-selection`) must be updated:
*   Replace `Depends(get_current_user_id)` with `Depends(get_current_user_from_session)` or call `validate_session` directly.
*   Ensure the `Request` object is passed to `validate_session`.
*   Update database queries for `ChatHistory` and `Feedback` to filter by the `user_id` obtained from the session, once the `user_id` column is added to `ChatHistory`. Currently, filtering by `user_id` is commented out in `get_history` and `get_user_history`.

### 3.2. Frontend Changes (`src/lib/chatApi.ts`)

*   **Remove JWT Logic:** Eliminate functions and calls related to `ensureJWTToken` and `clearAuthToken`.
*   **Remove `authServiceUrl`:** The `authServiceUrl` parameter should be removed from all relevant API call functions (`getHistory`, `chatWithBackend`, `askSelectionWithBackend`).
*   **Include Credentials:** All `fetch` requests to the backend API should include `credentials: 'include'` to ensure session cookies are sent with requests.
*   **Error Handling:** Retain or enhance existing 401 error handling to redirect to `/login` when session validation fails.

### 3.3. Testing Considerations

*   **Unit Tests:**
    *   Test `validate_session` function with valid, invalid, and expired session tokens.
    *   Test `get_current_user_from_session` dependency injection.
*   **Integration Tests:**
    *   Verify that backend endpoints correctly authenticate using session cookies for all chat-related operations.
    *   Ensure that frontend chat interactions (sending messages, retrieving history, asking selections) work seamlessly with session-based authentication.
    *   Test the `/api/history/{session_id}` and `/api/user/history` endpoints to ensure they return user-specific history after the `user_id` column is added to `ChatHistory` and corresponding filtering is enabled.
*   **Manual Testing:**
    *   Log in and use the chatbot to ensure full functionality.
    *   Test session expiration by logging in, waiting for a session to expire (if possible, or simulate), and attempting to use the chatbot.
    *   Verify that logging out correctly invalidates the session.

## 4. Next Steps

The critical next step is to address the missing `user_id` column in the `ChatHistory` table and implement the necessary database migration. After that, update the backend endpoint queries to utilize this new column for user-specific data filtering.
