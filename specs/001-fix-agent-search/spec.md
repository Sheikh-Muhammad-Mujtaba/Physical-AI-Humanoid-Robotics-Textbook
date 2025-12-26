# Feature Specification: Fix Agent Search Tool

## 1. Overview

### 1.1. Context
The project uses a Qdrant vector database to store and retrieve textbook content for RAG (Retrieval-Augmented Generation). The current search implementation in `api/utils/tools.py` needs to be verified against official documentation (referred to as "context7 docs" protocol) to ensure it correctly queries the vector database and retrieves relevant context.

### 1.2. Goal
Fix and optimize the `search_book_content` function in `api/utils/tools.py` to ensure reliable vector search using official Qdrant patterns, and provide clear usage instructions.

## 2. User Scenarios & Testing

### 2.1. Scenario 1: Retrieve Relevant Context
- **Actor**: AI Agent / Developer
- **Action**: Calls `search_book_content` with a natural language query (e.g., "What is physical AI?").
- **System**: Generates an embedding for the query (768 dimensions).
- **System**: Queries the Qdrant collection `textbook_chunks` using the embedding.
- **Result**: Returns a list of `TextChunk` objects containing relevant text, source, and page number.

### 2.2. Scenario 2: Handle Low Relevance Results
- **Actor**: AI Agent / Developer
- **Action**: Calls `search_book_content` with an irrelevant query.
- **System**: Returns results (or empty list if threshold applies).
- **Result**: The system handles empty or low-quality results gracefully without crashing.

## 3. Functional Requirements

### 3.1. Vector Search Implementation
- The `search_book_content` function MUST use the `qdrant-client` library correctly according to the installed version's official documentation.
- It MUST query the `textbook_chunks` collection.
- It MUST use a 768-dimensional query vector (matching the ingestion model `sentence-transformers/all-mpnet-base-v2`).
- It SHOULD support a limit parameter to control the number of results.
- It SHOULD support a score threshold to filter irrelevant results.

### 3.2. Response Format
- The function MUST return a list of `TextChunk` domain objects.
- Each `TextChunk` MUST contain:
  - `text`: The content chunk.
  - `source`: The source filename/identifier.
  - `page`: The page number (if available).
  - `score`: The similarity score.

### 3.3. Documentation
- The code MUST include docstrings explaining inputs, outputs, and usage.
- A usage example SHOULD be provided (either in docstring or a separate guide).

## 4. Technical Constraints & Assumptions

### 4.1. Constraints
- Must use existing `qdrant-client` and `fastapi` stack.
- Must operate within the existing `api/` directory structure.
- Must not introduce new heavy dependencies.

### 4.2. Assumptions
- The Qdrant instance is accessible via `QDRANT_URL` and `QDRANT_API_KEY`.
- The collection `textbook_chunks` uses Cosine distance and 768 dimensions.
- The embedding model `sentence-transformers/all-mpnet-base-v2` is available via the configured inference client (Hugging Face).

## 5. Success Criteria

- `search_book_content` successfully returns relevant results for known terms in the textbook.
- `test_qdrant_full.py` (or a new test) passes and confirms 768-dim compatibility.
- Code documentation clearly explains how to invoke the tool.