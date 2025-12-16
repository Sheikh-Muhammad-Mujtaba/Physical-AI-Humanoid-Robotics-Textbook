The recent changes address critical issues related to hardcoded configurations that were causing authentication and deployment problems in production environments. By replacing these static values with dynamic environment variables, the system is now more flexible and reliable across different deployment contexts.

Key changes include:

1.  **`auth-service/api/auth.ts`**: Removed the hardcoded `PRODUCTION_FRONTEND` constant and relied on the `FRONTEND_URL` environment variable to configure allowed CORS origins. This ensures that only authorized frontends can make requests to the auth service.

2.  **`docusaurus.config.ts`**: Replaced the static `url` with a dynamic value derived from the `VERCEL_URL` environment variable. This allows the Docusaurus site to correctly resolve links and assets across various environments, including local development, preview deployments, and production.

3.  **`auth-service/api/token-relay.ts`**: Eliminated the hardcoded fallback for the `frontendUrl`, making the token relay mechanism fully dependent on the `FRONTEND_URL` environment variable. This guarantees that OAuth callbacks are correctly redirected to the appropriate frontend URL.

These modifications collectively enhance the system's portability and maintainability, preventing environment-specific failures and simplifying the deployment process.