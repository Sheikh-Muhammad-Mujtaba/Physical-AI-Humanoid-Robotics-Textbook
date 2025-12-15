# Quickstart: Vercel Deployment

This document provides instructions on how to deploy the application to Vercel.

## Prerequisites

1.  A Vercel account.
2.  The Vercel CLI installed and authenticated.
3.  A clone of this repository.

## Deployment Steps

1.  **Project Setup**:
    *   Create a new Vercel project and connect it to your forked repository.

2.  **Environment Variables**:
    *   In the Vercel project settings, add the following environment variables:
        *   `DATABASE_URL`: The connection string for your PostgreSQL database.
        *   `QDRANT_URL`: The URL for your Qdrant instance.
        *   `QDRANT_API_KEY`: The API key for your Qdrant instance.
        *   `GEMINI_API_KEY`: Your Gemini API key.
        *   `JWT_SECRET`: A secret key for signing JWTs.
        *   Any `betterauth` related variables.
        *   `AUTH_SERVICE_URL`: The URL of the deployed `auth-service`.

3.  **Deployment**:
    *   The deployment will be automatically triggered on every push to the `main` branch.
    *   The root `vercel.json` will handle the deployment of the Docusaurus frontend and the Python API.
    *   The `auth-service/vercel.json` will handle the deployment of the authentication service.

4.  **Verification**:
    *   Once the deployment is complete, access the Vercel-provided URL to verify that the application is running correctly.
    *   Test the authentication flow by creating a new user and logging in.
    *   Test the API endpoints to ensure they are responding as expected.
