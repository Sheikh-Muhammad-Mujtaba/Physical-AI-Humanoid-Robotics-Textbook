# Implementation Plan: Vercel Deployment

**Branch**: `001-vercel-deployment` | **Date**: 2025-12-15 | **Spec**: [specs/001-vercel-deployment/spec.md](specs/001-vercel-deployment/spec.md)
**Input**: Feature specification from `specs/001-vercel-deployment/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The primary requirement is to deploy the entire monorepo, including the Docusaurus frontend, the Python FastAPI backend, and the TypeScript authentication service, to Vercel. The technical approach involves using the existing `vercel.json` configurations in the root and `auth-service` directories to orchestrate the deployment of the different parts of the application.

## Technical Context

**Language/Version**: Docusaurus (TypeScript), Python 3.10+, TypeScript 5.x
**Primary Dependencies**: Docusaurus, FastAPI, SQLAlchemy, Qdrant, PyJWT, Next.js (in `auth-service`)
**Storage**: PostgreSQL (for user data), Qdrant (for vectors)
**Testing**: Not specified, but likely involves `npm test` and `pytest`.
**Target Platform**: Vercel
**Project Type**: Web application (monorepo with frontend and multiple backend services)
**Performance Goals**: Frontend loads in <3s, deployment pipeline <5m.
**Constraints**: Must use existing `vercel.json` files.
**Scale/Scope**: Single application deployment to Vercel.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Secure API Access (Bearer Token)**: The deployment plan must ensure that the `BETTER_AUTH_SECRET_KEY` environment variable is correctly configured in the Vercel environment for the FastAPI backend to validate JWTs.
- **Model Context Protocol (MCP)**: Not directly applicable to the deployment plan itself, but the environment variables for the AI services (`GEMINI_API_KEY`, etc.) must be correctly configured.

## Project Structure

### Documentation (this feature)

```text
specs/001-vercel-deployment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command) - Not needed
├── data-model.md        # Phase 1 output (/sp.plan command) - Not needed
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command) - Not needed
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

The project structure is already defined and is a monorepo containing the Docusaurus frontend, the Python API, and the TypeScript auth-service.

```text
# Web application (monorepo)
├── api/
│   └── index.py
├── auth-service/
│   └── api/
│       └── auth.ts
├── src/
│   └── theme/
└── docusaurus.config.ts
```

**Structure Decision**: The existing monorepo structure will be used.

## Complexity Tracking

No violations of the constitution were identified.