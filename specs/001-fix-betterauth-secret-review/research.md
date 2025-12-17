# Research Findings: Fix BetterAuth Secret and Context7 Review

## 1. BetterAuth Documentation (General Setup, Database Schema, Middleware)

### Decision: Confirm BetterAuth database schema integrity and review existing middleware for compliance.
### Rationale: Session persistence heavily relies on a correctly configured and migrated database schema. Understanding BetterAuth's schema management and middleware interactions is crucial for identifying potential misconfigurations causing null sessions.

### Findings:
*   **Database Schema Management**:
    *   Better Auth uses a CLI tool (`npx @better-auth/cli generate` or `migrate`) to create and manage its required database schema.
    *   `generate` creates ORM schema/SQL migration files. `migrate` (for built-in Kysely adapter) applies changes directly.
    *   The `auth-service/package.json` includes `migrate` and `generate` scripts. It is critical to ensure `migrate` has been successfully run against the target database (PostgreSQL/Neon) to establish BetterAuth's tables.
    *   Customization of database schemas (table names, field names) is possible via the `schema` option in the `betterAuth` configuration for core and plugin-specific models (e.g., JWKS table). This allows alignment with existing database structures.
*   **Middleware Dependencies**:
    *   BetterAuth integrates with common web frameworks like Express, Fastify, and Elysia, often leveraging their respective CORS middleware (`cors`, `@fastify/cors`, `@elysiajs/cors`).
    *   The existing `auth-service/api/auth.ts` implements a custom `setCorsHeaders` function. It's important to ensure this custom implementation fully meets BetterAuth's cross-origin requirements and does not inadvertently block necessary headers or cookies.
*   **General Setup Instructions**:
    *   **Environment Variables**: The importance of correctly setting environment variables (`BETTER_AUTH_URL`, `client IDs`, `secrets`) is reiterated. This aligns with the `BETTER_AUTH_SECRET` focus of this plan.
    *   **Prerequisites**: Node.js v16+ and ES Module Support (via `{ "type": "module" }` in `package.json` or `esModuleInterop: true` in `tsconfig.json`) are essential. The `auth-service` already meets these.

## 2. BetterAuth Documentation (Session Persistence & JWT Validation) [Previous Research]

### Decision: Leverage BetterAuth's built-in session and JWT capabilities.
### Rationale: The BetterAuth library provides robust mechanisms for managing sessions and JWTs, including explicit configuration for stateless modes, cookie caching, and server-side validation. Utilizing these features directly minimizes custom implementation complexity and leverages battle-tested security patterns.

### Findings:
*   **JWT Validation**: The `jose` library is central to JWT handling within BetterAuth. Validation relies on `jwtVerify` and either `createLocalJWKSet` or `createRemoteJWKSet`. Essential for verification are `issuer` and `audience` parameters, which must match the JWT's claims. The `/api/auth/token` endpoint retrieves a JWT, and existing session tokens in the `Authorization` header can be used for authentication.
*   **Session Management**: BetterAuth's `session.cookieCache` offers flexible configuration for stateless sessions, allowing custom `maxAge`, `strategy` (JWE or JWT), and `refreshCache`. Server-side session validation is handled via `auth.api.getSession`.
*   **JWT Plugin**: The `better-auth/plugins/jwt` enables fine-grained configuration of JWT properties suchs as `algorithm`, `expiresIn`, `issuer`, and `audience`. This plugin should be used to ensure consistency across token generation and validation.

## 3. PostgreSQL Connection Pooling in Vercel Serverless Environments [Previous Research]

### Decision: Implement global connection pooling with `pg` for Node.js and leverage serverless-optimized providers/features where available.
### Rationale: Serverless functions' ephemeral nature and potential for rapid scaling necessitate careful management of database connections to avoid exhaustion and performance bottlenecks. Global pooling, low idle timeouts, and utilizing Vercel-specific utilities or serverless-native database features are crucial for stability and efficiency.

### Findings:
*   **Connection Pooling is Essential**: Prevents connection exhaustion in high-concurrency serverless environments.
*   **Global Scope for Pools**: Initialize connection pools in the global scope of Vercel functions for maximum reuse across invocations.
*   **Vercel's `attachDatabasePool`**: For Vercel Fluid Compute, `@vercel/functions` offers `attachDatabasePool` to manage idle connections and prevent leaks effectively.
*   **Low Idle Timeout**: Configure short idle timeouts (e.g., 5 seconds) for connection pools to promptly close unused connections.
*   **Avoid Max Pool Size of 1**: Ensures adequate concurrency.
*   **Server-Side Poolers**: PgBouncer or Supavisor (transaction mode) can be highly beneficial for extremely dynamic serverless workloads by acting as intermediaries.
*   **Vercel Postgres SDK**: If using Vercel Postgres, the `sql` function handles pooling automatically.
*   **Neon**: Serverless-optimized PostgreSQL providers like Neon offer features like WebSocket connectivity suitable for serverless platforms.
*   **Observability and Retry Logic**: Critical for monitoring performance and enhancing resilience against transient connection failures.
*   **Rolling Releases**: Recommended for deployments to prevent sudden spikes in database connections.

## 4. Vercel Environment Variables and Security Best Practices [Previous Research]

### Decision: Consistently manage all sensitive configuration (especially `BETTER_AUTH_SECRET`, `DATABASE_URL`, JWT `issuer`/`audience`) via Vercel's built-in environment variable management, ensuring strict separation by environment and marking sensitive values.
### Rationale: Secure and consistent handling of environment variables is paramount for the integrity of authentication and session management. Vercel provides robust tools for this, which, when combined with careful application-level validation, mitigate risks of misconfiguration or exposure.

### Findings:
*   **Vercel's Built-in Management**: Use the Vercel Dashboard/CLI for secure storage, encryption, and injection of environment variables.
*   **Never Commit `.env` Files**: `.env` files should always be excluded from version control.
*   **Differentiate Environments**: Maintain distinct environment variables for `development`, `preview`, and `production` to avoid unintended data exposure or incorrect configurations.
*   **Mark Sensitive Variables**: Use Vercel's "sensitive" flag for variables like `BETTER_AUTH_SECRET` to prevent accidental display of values after creation.
*   **Descriptive Names**: Employ clear naming conventions for variables (e.g., `DATABASE_URL`, `BETTER_AUTH_SECRET`).
*   **Correct Access in Code**: Access via `process.env.VARIABLE_NAME` (Node.js/Next.js) or `os.environ` (Python). Public variables for frontend must be explicitly prefixed (e.g., `NEXT_PUBLIC_`).
*   **Redeploy After Changes**: Any changes to environment variables necessitate a project redeployment to take effect.
*   **Build-Time vs. Runtime**: Use `env` for runtime and `build.env` for build-time variables in `vercel.json`, referencing Vercel secrets for sensitive build-time values to keep `vercel.json` safe in VCS.
*   **Principle of Least Privilege**: Ensure components only access the secrets they absolutely need.
*   **Verification**: Include checks in the build process to confirm all required environment variables are set.
*   **Limitations**: Be aware of the 4KB limit for environment variables; for very large secrets, consider external secrets managers.