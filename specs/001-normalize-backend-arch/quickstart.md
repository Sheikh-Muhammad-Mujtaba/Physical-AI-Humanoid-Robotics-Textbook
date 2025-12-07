# Quickstart Guide: Normalized Gemini RAG Backend

**Feature Branch**: `001-normalize-backend-arch`
**Created**: 2025-12-07
**Status**: Draft

This guide provides instructions for setting up and running the Normalized Gemini RAG Backend locally, reflecting the architecture where PostgreSQL manages user accounts and document metadata, and Qdrant handles vector embeddings.

## 1. Prerequisites

- Docker (for PostgreSQL and Qdrant local instances)
- Python 3.10+
- `pip` for Python package management

## 2. Environment Setup

### 2.1 Clone the Repository

```bash
git clone <repository_url>
cd AI-Spec-Driven/backend # Adjust if your backend directory is named differently
```

### 2.2 Create and Activate Virtual Environment

```bash
python3.10 -m venv venv
source venv/bin/activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables (`.env` file)

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials and configurations:

```ini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBED_MODEL=text-embedding-004
GEMINI_CHAT_MODEL=gemini-1.5-flash
QDRANT_URL=http://localhost:6333 # For local Docker instance
QDRANT_API_KEY= # Not needed for local Qdrant
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname # For local Docker PostgreSQL
```

Replace `your_gemini_api_key`, `user`, `password`, and `dbname` with your actual values.

## 3. Run Local Database Services (PostgreSQL & Qdrant)

It is recommended to run PostgreSQL and Qdrant using Docker for local development.

### 3.1 Start PostgreSQL and Qdrant via Docker Compose (Example)

(This section assumes a `docker-compose.yaml` would be available or created for the project. For this quickstart, we'll outline manual Docker commands.)

#### PostgreSQL

```bash
docker run --name some-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dbname -p 5432:5432 -d postgres:16
```

#### Qdrant

```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
```

Ensure the `DATABASE_URL` and `QDRANT_URL` in your `.env` file match these local Docker setups.

## 4. Database Migrations (PostgreSQL)

Initialize and apply database migrations using Alembic:

```bash
# First time setup (only once per project)
alembic init -t async backend/alembic # Assuming 'async' template and alembic directory in backend/
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 5. Running the Backend API

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be accessible at `http://localhost:8000`.

## 6. Initial PostgreSQL Client Setup and ORM Integration Notes

- The `backend/src/services/db_service.py` module will handle the `SQLAlchemy` engine and session management.
- `asyncpg` will be used as the asynchronous PostgreSQL driver.
- Session dependency injection will be provided to FastAPI routes.

## 7. Basic Usage (Example)

### Ingest Data

```bash
curl -X POST http://localhost:8000/api/ingest -H "Content-Type: application/json" -d '{
  "doc_id": "doc123",
  "text": "This is a sample document for testing ingestion.",
  "metadata": {"source": "manual", "author": "dev"}
}'
```

### Query Data

```bash
curl -X POST http://localhost:8000/api/query -H "Content-Type: application/json" -d '{
  "question": "What is this document about?",
  "top_k": 3
}'
```

### User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}'
```
