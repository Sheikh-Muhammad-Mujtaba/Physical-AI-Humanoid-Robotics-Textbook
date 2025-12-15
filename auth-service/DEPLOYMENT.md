# Auth Service - Vercel Deployment Guide

This guide explains how to deploy the Better Auth service to Vercel.

## Architecture Overview

- **Frontend (Docusaurus)**: Deployed to Vercel at `ai-spec-driven.vercel.app`
- **Auth Service**: Deployed as a separate Vercel project
- **Database**: Neon PostgreSQL (serverless-compatible)

## Prerequisites

1. Vercel account
2. Neon PostgreSQL database (or other PostgreSQL provider)
3. (Optional) Google OAuth credentials
4. (Optional) GitHub OAuth credentials

## Deployment Steps

### 1. Deploy Auth Service to Vercel

#### Option A: Using Vercel CLI

```bash
cd auth-service
npm install -g vercel
vercel login
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import from GitHub repository
4. Set **Root Directory** to `auth-service`
5. Configure environment variables (see below)
6. Deploy

### 2. Configure Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables, add:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Secret key (32+ chars) | Generate with: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Auth service URL | `https://your-auth-service.vercel.app` |
| `FRONTEND_URL` | Frontend URL(s), comma-separated | `https://ai-spec-driven.vercel.app` |
| `API_BASE_URL` | Backend API URL | `https://your-api.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | (optional) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | (optional) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | (optional) |

### 3. Configure Frontend Environment

In the main Docusaurus project's Vercel settings, add:

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_URL` | Auth service URL | `https://your-auth-service.vercel.app` |
| `API_BASE_URL` | Backend API URL | `https://your-api.vercel.app` |

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Set Application type: "Web application"
4. Add Authorized redirect URI:
   ```
   https://your-auth-service.vercel.app/api/auth/callback/google
   ```
5. Copy Client ID and Client Secret to Vercel environment variables

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - Application name: Your app name
   - Homepage URL: `https://ai-spec-driven.vercel.app`
   - Authorization callback URL:
     ```
     https://your-auth-service.vercel.app/api/auth/callback/github
     ```
4. Copy Client ID and Client Secret to Vercel environment variables

## Database Setup (Neon)

1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string (includes `?sslmode=require`)
4. Run migrations:
   ```bash
   cd auth-service
   DATABASE_URL="your-connection-string" npm run migrate
   ```

## Verification

After deployment, verify:

1. Health check: `https://your-auth-service.vercel.app/health`
2. JWKS endpoint: `https://your-auth-service.vercel.app/api/auth/jwks`
3. Test sign-up/sign-in on your frontend

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` includes your frontend domain(s)
- Check that `trustedOrigins` in auth config matches frontend

### Cookie Issues
- Verify `useSecureCookies: true` for production
- Ensure cookies are being set with `SameSite=None; Secure` for cross-origin

### OAuth Callback Errors
- Verify callback URLs in OAuth provider match exactly
- Check that client ID/secret are correct

## Local Development

```bash
cd auth-service
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

## File Structure

```
auth-service/
├── api/
│   ├── auth.ts       # Vercel serverless function for auth
│   └── health.ts     # Health check endpoint
├── src/
│   ├── auth.ts       # Better Auth configuration
│   └── index.ts      # Express server (local dev)
├── vercel.json       # Vercel configuration
├── package.json
└── tsconfig.json
```
