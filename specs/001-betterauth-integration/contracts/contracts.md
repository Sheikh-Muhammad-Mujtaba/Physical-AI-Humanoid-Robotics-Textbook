# API Contracts for API Authentication with BetterAuth

This document outlines the changes to API contracts for implementing Bearer Token authentication. The affected endpoints are `/api/chat`, `/api/ask-selection`, and `/api/feedback`.

## Security Scheme

All protected endpoints will now require a Bearer Token.

### Request Header

All requests to the protected endpoints MUST include an `Authorization` header with a valid Bearer Token.

```
Authorization: Bearer <VALID_TOKEN>
```

Replace `<VALID_TOKEN>` with an actual, non-expired JSON Web Token (JWT) or other agreed-upon Bearer Token.

## Endpoint Changes

### Protected Endpoints

The following endpoints are now protected and require the `Authorization: Bearer <TOKEN>` header:

*   `/api/chat`
*   `/api/ask-selection`
*   `/api/feedback`

### Error Responses

If a request to a protected endpoint is made without a valid `Authorization: Bearer` header, the API will respond with a `401 Unauthorized` HTTP status code.

#### Example 401 Unauthorized Response

```json
{
  "detail": "Not authenticated"
}
```

This response indicates that the request was missing valid authentication credentials.
