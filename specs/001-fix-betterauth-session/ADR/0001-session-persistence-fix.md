# 0001-session-persistence-fix

## Status

Accepted

## Context

The system was experiencing persistent 401 Unauthorized errors and null session failures after successful user sign-in when deployed on Vercel. This prevented users from maintaining authenticated access to protected resources. Root causes were hypothesized to be related to unstable PostgreSQL (Neon) database connections and inconsistencies in `BETTER_AUTH_SECRET` or other authentication configurations across Vercel environments.

## Decision

Implement a series of targeted fixes and enhancements across the `auth-service` (TypeScript) and Python `api` backend to improve session persistence and JWT validation reliability. Key decisions include:
1.  **Enhanced Logging**: Introduce robust logging for environment variable loading, service startup, PostgreSQL connection tests, BetterAuth handler initialization, and detailed error capturing for internal `/api/auth/token` requests (especially on 401 responses) and JWT validation failures.
2.  **Configuration Validation**: Implement explicit environment variable validation checks at service startup for both `auth-service` and `api` to ensure critical secrets and URLs are present.
3.  **PostgreSQL Connection Optimization**: Configure `pg.Pool` in `auth-service` for Vercel serverless environments by adding explicit connection testing, global scoping, low idle timeout, and utilizing `@vercel/functions`' `attachDatabasePool`.
4.  **JWT Consistency Review**: Confirm `better-auth/plugins/jwt` configuration (issuer/audience) and Python API's JWT validation parameters (`BETTER_AUTH_ISSUER`, `BETTER_AUTH_JWKS_URL`) are consistent and correctly loaded.
5.  **Documentation**: Update `README.md` with best practices for Vercel environment variable management.

## Rationale

These decisions address the identified root causes by improving observability, validating critical configurations upfront, and optimizing database connection handling for serverless environments. Enhanced logging will provide necessary debug information to rapidly diagnose future authentication issues, while explicit validation ensures misconfigurations are caught early. Optimizing PostgreSQL connections and reviewing JWT consistency directly targets the "null session" and "401 unauthorized" problems.

## Consequences

*   **Improved Stability**: Authentication and session persistence are expected to be significantly more stable and reliable on Vercel deployments.
*   **Enhanced Debugging**: Faster identification and resolution of authentication-related issues due to comprehensive logging.
*   **Increased Configuration Awareness**: Build-time checks prevent deployment with missing critical environment variables.
*   **Minor Performance Impact**: Minimal overhead introduced by additional logging and connection testing, outweighed by increased stability and debuggability.
*   **No Direct `jose` Installation**: Relied on `better-auth`'s internal dependency management for `jose`, reducing direct dependency management for this project.
*   **Documentation Update**: Ensures users/developers are aware of Vercel environment variable best practices.
