# Research: Fix BetterAuth Authentication Flow

This document outlines the findings from the research phase of the implementation plan.

## 1. File Locations

The primary goal of the research was to identify the key files that need to be modified to fix the authentication flow.

-   **Backend Auth Configuration**: The core BetterAuth logic and configuration are located in `auth-service/src/auth.ts`. The serverless function that handles API requests is `auth-service/api/auth.ts`. Modifications will likely be needed in `auth-service/src/auth.ts` to enable cross-domain settings.

-   **Frontend Auth Client**: The client-side logic for handling authentication is located in `src/lib/auth-client.ts`. This file will need to be updated to include credentials in fetch requests and to handle potential null responses gracefully.

## 2. Key Configuration Requirements

Based on the feature description, the following configurations are required:

### Backend (`auth-service/src/auth.ts`)

-   `advanced.crossDomain`: Must be set to `true`.
-   `allowedOrigins`: Must include the frontend URL: `https://ai-spec-driven.vercel.app`.

### Frontend (`src/lib/auth-client.ts`)

-   `baseURL`: Must be set to the backend URL: `https://physical-ai-humanoid-robotics-textb-kohl-three.vercel.app`.
-   `fetchOptions.credentials`: Must be set to `'include'`.

### Deployment

-   Environment variables such as `BETTER_AUTH_URL` and `TRUST_PROXY` may need to be reviewed and set correctly in the Vercel deployment environment for both the frontend and backend services.

All `NEEDS CLARIFICATION` markers from the initial plan have been resolved by locating these files.
