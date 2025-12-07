# Research & Best Practices: Gemini RAG Backend

**Date**: 2025-12-07
**Feature**: Gemini-augmented RAG Backend

This document outlines best practices for the technologies chosen for this feature.

## FastAPI Best Practices

- **Project Structure**: A modular structure is recommended. The plan's proposed structure (`api`, `core`, `models`, `services`) aligns with this, promoting separation of concerns.
- **Dependencies**: Use Pydantic models for request and response validation to ensure data integrity and provide clear API documentation automatically.
- **Configuration**: Centralize configuration management. The plan to use a `core/config.py` to load from environment variables is a solid approach.
- **Async Operations**: Use `async def` for all I/O-bound operations (API calls to Gemini, Qdrant) to ensure the server remains non-blocking and can handle concurrent requests efficiently.
- **Testing**: Use FastAPI's `TestClient` for integration tests. Mock external services (Gemini, Qdrant) for unit tests.

## Qdrant Best Practices

- **Connection Management**: Use a singleton pattern or a dependency injection system to manage the Qdrant client, avoiding the overhead of reconnecting on every request.
- **Data Indexing**: For a read-heavy workload like this, ensure `on_disk` is set to `True` for the HNSW index for better performance after indexing is complete. The collection should be created once on application startup.
- **Payload Indexing**: If filtering by metadata (like `doc_id` or `chapter`) is common, create payload indexes on those fields to speed up filtered searches.
- **Vector Size**: The decision to get the vector size dynamically from the Gemini embedding model is correct, preventing mismatches.

## Gemini API Best Practices

- **Client Initialization**: Initialize the Gemini client once and reuse it across the application to avoid re-authentication overhead.
- **Error Handling**: Implement robust error handling with retries (e.g., using an exponential backoff strategy) for API calls to handle transient network issues or API rate limits.
- **Batching**: For the `/ingest` endpoint, if high throughput is needed in the future, consider batching multiple chunks into a single `embed_contents` call to the Gemini API for better efficiency.
- **Model Selection**: The plan's LLM router with a fallback mechanism (Flash -> Pro -> others) is a good resilience pattern.

## Security Best Practices

- **Environment Variables**: As specified, all secrets (API keys) MUST be loaded from environment variables and never be hardcoded. Use a `.env` file for local development (and add it to `.gitignore`) and use platform-native secret management in production.
- **Input Validation**: Rely on FastAPI's automatic Pydantic validation for all incoming request bodies to prevent injection attacks and ensure data correctness.
- **Cross-Origin Resource Sharing (CORS)**: Configure CORS middleware in FastAPI to only allow requests from the Docusaurus frontend's domain.

## Postgres with Neon for User Data

- **Decision**: Use SQLAlchemy with the `asyncpg` driver for connecting to the Neon Postgres database.
- **Rationale**: SQLAlchemy is the de-facto standard ORM for Python and provides a robust way to interact with the database. `asyncpg` is a high-performance, asynchronous driver that integrates perfectly with FastAPI's `async` nature. This setup will be used for storing user data for the future authentication feature.
- **Alternatives considered**: Using raw SQL queries (less maintainable), or other ORMs like Tortoise ORM (SQLAlchemy is more mature and widely used).
