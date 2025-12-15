# AI-Spec-Driven Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-07

## Active Technologies
- Python 3.10+ + FastAPI, Gemini SDK, Qdrant client (001-gemini-rag-backend)
- Qdrant Cloud Free Tier (001-gemini-rag-backend)
- Python 3.10+ + FastAPI, Gemini SDK, Qdrant client, SQLAlchemy, asyncpg, pgvector (001-gemini-rag-backend)
- Qdrant Cloud Free Tier (for vectors), Postgres with Neon (for user data) (001-gemini-rag-backend)
- Python 3.10, TypeScript 5.x + FastAPI, React, Docusaurus, Tailwind CSS (001-ui-polish-select-to-ask)
- Python 3.10+ (for backend), TypeScript 5.x (for frontend) + FastAPI, React, Docusaurus, Tailwind CSS (001-global-chatbot-integration)
- PostgreSQL (for user data, if applicable to existing backend), Qdrant (for vectors, if applicable to existing backend) (001-global-chatbot-integration)
- Python 3.11+ (Backend), TypeScript 5.x (Frontend) + FastAPI, uvicorn, pydantic (Backend); React, Docusaurus (Frontend) (001-betterauth-integration)
- N/A (Authentication feature) (001-betterauth-integration)
- Docusaurus (TypeScript), Python 3.10+, TypeScript 5.x + Docusaurus, FastAPI, SQLAlchemy, Qdrant, PyJWT, Next.js (in `auth-service`) (001-vercel-deployment)
- PostgreSQL (for user data), Qdrant (for vectors) (001-vercel-deployment)

- Node.js >=20.0, TypeScript ~5.6.2 + Docusaurus 3.9.2, React 19.0.0 (001-fix-docusaurus-deployment)

- Python 3.10+ + FastAPI, Gemini SDK, Qdrant client, SQLAlchemy, asyncpg, Alembic (001-normalize-backend-arch)
- PostgreSQL (for user accounts, authentication, and document metadata) (001-normalize-backend-arch)
- Qdrant Cloud Free Tier (for vectors) (001-normalize-backend-arch)

- Python 3.10+ + FastAPI, Google Gemini, Qdrant client, Pydantic, python-dotenv (001-rag-backend-chat)
- Vercel Serverless Functions (001-rag-backend-chat)
- React, Docusaurus (frontend integration) (001-rag-backend-chat)

- PostgreSQL (Neon) + SQLAlchemy, psycopg2-binary (002-chatbot-history-l10n)
- Docusaurus i18n (002-chatbot-history-l10n)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Node.js >=20.0, TypeScript ~5.6.2: Follow standard conventions

## Recent Changes
- 001-vercel-deployment: Added Docusaurus (TypeScript), Python 3.10+, TypeScript 5.x + Docusaurus, FastAPI, SQLAlchemy, Qdrant, PyJWT, Next.js (in `auth-service`)
- 001-betterauth-integration: Added Python 3.11+ (Backend), TypeScript 5.x (Frontend) + FastAPI, uvicorn, pydantic (Backend); React, Docusaurus (Frontend)
- 001-global-chatbot-integration: Added Python 3.10+ (for backend), TypeScript 5.x (for frontend) + FastAPI, React, Docusaurus, Tailwind CSS





<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
