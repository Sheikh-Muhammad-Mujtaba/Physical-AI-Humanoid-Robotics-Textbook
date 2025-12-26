# Research: Fix Agent Search Tool

## Decisions

### 1. Vector Database Client
- **Decision**: Use official `qdrant-client` Python library.
- **Rationale**: It is the official, maintained client with full support for the latest Qdrant features (batching, filtering, etc.). The project already lists it in `requirements.txt`.
- **Alternatives Considered**: Direct HTTP requests (too verbose, error-prone), LangChain Qdrant wrapper (too much abstraction for this specific tool task, want direct control).

### 2. Embedding Model
- **Decision**: `sentence-transformers/all-mpnet-base-v2`
- **Rationale**:
    - Generates 768-dimensional vectors.
    - Highly ranked on MTEB benchmarks for semantic search.
    - Already referenced in existing code (`api/utils/tools.py`).
- **Alternatives Considered**: `all-MiniLM-L6-v2` (smaller, faster, but less accurate; `mpnet` provides better quality for textbook RAG).

### 3. Ingestion Strategy
- **Decision**: Update/Rewrite `scripts/ingest_qdrant.py`.
- **Rationale**:
    - Use `qdrant-client`'s batch upload capabilities (`upload_points` or `upload_collection`).
    - Ensure correct vector dimension (768) is configured in the collection.
    - Use `sentence-transformers` library for local embedding generation during ingestion (to avoid external API rate limits if possible, or use the same inference API as the tool).
- **Implementation Detail**: The ingestion script should allow recreating the collection to ensure schema consistency.

### 4. Search Tool Implementation
- **Decision**: Refactor `api/utils/tools.py`.
- **Rationale**:
    - Needs to use `qdrant_client.search()` or `query_points()` with correct parameters.
    - Must handle the case where the collection doesn't exist or is empty gracefully.
    - Must return domain objects (`TextChunk`) not raw dictionaries.

## Unknowns Resolved
- **Qdrant Python Client**: Verified best practices (batching, client initialization).
- **Embedding Dimensions**: Confirmed `all-mpnet-base-v2` uses 768 dimensions.
- **Context7**: Interpreted as a requirement for "authoritative documentation" rather than a specific library import for this task (as per constitution/agent instructions).
