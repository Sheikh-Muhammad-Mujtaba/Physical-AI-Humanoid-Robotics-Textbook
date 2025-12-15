# Research for API Authentication with BetterAuth

## Decision: Bearer Token Authentication in FastAPI

### RT-001: Best Practices for `fastapi.security.HTTPBearer`

**What was chosen**: Implement `fastapi.security.HTTPBearer` as a dependency. A custom `validate_token` function will be created to perform the actual token verification. This function will be applied to protected routes using `Depends()`.

**Rationale**: `HTTPBearer` provides a standard and straightforward way to integrate Bearer Token authentication into FastAPI applications. Using a dependency function centralizes token validation logic, making it reusable and easy to apply across multiple endpoints. Error handling for invalid or missing tokens is built-in (returning 401 Unauthorized), which aligns with constitutional requirements.

**Alternatives considered**:
*   Using API Key authentication: Less standard for modern web APIs, and doesn't fit the 'Bearer Token' constitutional mandate.
*   Implementing custom token parsing logic directly in each endpoint: Violates DRY principle, increases boilerplate, and makes maintenance harder.

## Decision: Secure Backend Secret Storage

### RT-002: Securely Storing `BETTER_AUTH_SECRET_KEY`

**What was chosen**: For production environments, `BETTER_AUTH_SECRET_KEY` MUST be stored as an environment variable, ideally managed by the deployment platform's secret management system (e.g., Vercel Environment Variables, Kubernetes Secrets, AWS Secrets Manager). For local development, it can be stored in a `.env` file that is excluded from version control (`.gitignore`).

**Rationale**: Environment variables are the most common and secure way to handle secrets in cloud-native applications. This prevents hardcoding secrets in the codebase, which is a significant security risk. Using platform-specific secret management enhances security by abstracting secret handling and lifecycle.

**Alternatives considered**:
*   Hardcoding the secret: Unacceptable due to high security risk.
*   Storing in a configuration file within the repository: Less secure than environment variables, especially if the repository is public or has loose access controls.

## Decision: Secure Frontend Token Handling

### RT-003: Best Practices for Frontend `AUTH_TOKEN` Management

**What was chosen**: For development, a static `AUTH_TOKEN` ("DEV_TOKEN") will be defined locally in `src/lib/chatApi.ts` and used to inject the `Authorization: Bearer` header. For production, the `AUTH_TOKEN` should be dynamically fetched after a user authentication flow (e.g., login) and stored securely (e.g., in `localStorage` with appropriate security measures, or as an `HttpOnly` cookie). The token should be injected into fetch options using an interceptor or a wrapper function.

**Rationale**: Directly embedding a sensitive token in the frontend code for production is a security vulnerability. Dynamic token fetching after authentication and secure storage (e.g., `localStorage` for convenience with XSS mitigation, or `HttpOnly` cookies for stronger XSS protection) is crucial. Using an interceptor ensures that all API calls automatically include the token without manual intervention. The "DEV_TOKEN" is a pragmatic approach for initial development.

**Alternatives considered**:
*   Hardcoding a production token: Severe security risk.
*   Passing token via URL parameters: Insecure, as tokens can be logged or exposed.

## Decision: MCP Tooling for BetterAuth

### RT-004: Explore MCP Tooling and Context7 Documentation

**What was chosen**: Leverage Context7's `resolve-library-id` and `get-library-docs` tools to obtain the most up-to-date documentation for BetterAuth integration. This information will inform the specific implementation details, configuration, and best practices.

**Rationale**: Directly aligns with the "Model Context Protocol (MCP)" constitution principle. Ensures the implementation is based on authoritative and current documentation, reducing the risk of using outdated patterns or misconfiguring the integration.

**Alternatives considered**:
*   Manually searching for BetterAuth documentation: Prone to finding outdated or unofficial sources, less efficient.
*   Guessing implementation details: Leads to potential errors and security vulnerabilities.
