# API Contract: /api/auth/token

This document describes the expected interaction with the `/api/auth/token` endpoint, which is part of the BetterAuth flow.

## Endpoint

`POST /api/auth/token`

## Description

This endpoint is called by the frontend after a user has clicked the sign-in link from their email. The purpose of this endpoint is to exchange the temporary token from the link for a long-lived session.

## Current Failing Behavior

-   **Request**: The frontend makes a `POST` request to this endpoint.
-   **Problem**: The backend returns a `401 Unauthorized` error.
-   **Root Cause**: The request from the frontend is not correctly including the session cookie (`__Secure-better-auth.session_data`), and the backend is not configured for cross-domain requests, so it cannot validate the session.

## Expected Successful Behavior

-   **Request**:
    -   Method: `POST`
    -   URL: `https://physical-ai-humanoid-robotics-textb-kohl-three.vercel.app/api/auth/token`
    -   Headers:
        -   `Cookie`: Must contain the `__Secure-better-auth.session_data` cookie.
    -   Credentials: The request must be sent with `credentials: 'include'`.

-   **Response (Success)**:
    -   Status Code: `200 OK`
    -   Body: A JSON object containing the user's session information.
    ```json
    {
      "user": {
        "id": "some-user-id",
        "email": "user@example.com",
        ...
      },
      "session": {
        "sessionId": "some-session-id",
        ...
      }
    }
    ```

-   **Response (Failure)**:
    -   Status Code: `401 Unauthorized`
    -   Body: A JSON object explaining the error.
    ```json
    {
      "error": "Invalid session"
    }
    ```
