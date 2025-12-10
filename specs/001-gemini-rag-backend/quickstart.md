# Quickstart: Gemini RAG Backend

**Date**: 2025-12-07
**Feature**: Gemini-augmented RAG Backend

This guide provides instructions for setting up and running the RAG backend locally.

## Prerequisites

-   Python 3.10+
-   An active internet connection
-   API keys for Gemini and Qdrant Cloud

## 1. Setup Environment

### Clone the Repository
```bash
# This backend is part of the main AI-Spec-Driven repository
# Ensure you are on the correct feature branch
git checkout 001-gemini-rag-backend
```

### Create a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS and Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```
*(Note: The `requirements.txt` file will be created during the implementation phase.)*

### Configure Environment Variables
Create a `.env` file in the `backend/` directory. **This file should not be committed to git.**

```env
# .env file

# Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Qdrant Cloud Configuration
QDRANT_URL="YOUR_QDRANT_CLOUD_URL"
QDRANT_API_KEY="YOUR_QDRANT_API_KEY"

# Neon/Postgres Database
DATABASE_URL="postgresql+asyncpg://user:password@host:port/dbname"

# Models (optional, defaults are set in config)
GEMINI_EMBED_MODEL="text-embedding-004"
GEMINI_CHAT_MODEL="gemini-1.5-flash"
```

## 2. Running the Application

Once the environment is set up, you can start the FastAPI server.

```bash
# From the backend/ directory
uvicorn src.main:app --reload
```
*(Note: The main application entry point will be created in `src/main.py` during implementation.)*

The API will be available at `http://127.0.0.1:8000`.

## 3. Using the API

You can interact with the API via the automatically generated documentation at `http://127.0.0.1:8000/docs`.

### Example: Ingesting a Document
Send a `POST` request to `http://127.0.0.1:8000/ingest` with a JSON body like:
```json
{
  "doc_id": "test-doc",
  "text": "This is a test document about the wonders of Physical AI.",
  "metadata": {
    "chapter": "Test Chapter"
  }
}
```

### Example: Querying the System
Send a `POST` request to `http://12_7.0.0.1:8000/query` with a JSON body like:
```json
{
  "question": "What is this document about?"
}
```

## 4. Running Tests

To run the test suite:
```bash
# From the backend/ directory
pytest
```
