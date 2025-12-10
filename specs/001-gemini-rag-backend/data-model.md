# Data Model: Gemini RAG Backend

**Date**: 2025-12-07
**Feature**: Gemini-augmented RAG Backend

This document defines the key data entities for the RAG backend, based on the feature specification.

## Core Entities

### Document

-   **Description**: Represents the source text from the Physical-AI-Humanoid-Robotics textbook.
-   **Attributes**:
    -   `doc_id` (string, required): A unique identifier for the document (e.g., a chapter or section name).
    -   `text` (string, required): The full raw text content of the document.
    -   `metadata` (object, optional): Additional information about the document.

### Chunk

-   **Description**: A segment of a Document, created by the chunking engine. This is the unit of information that is embedded and retrieved.
-   **Attributes**:
    -   `chunk_id` (string, required): A unique identifier for the chunk, typically generated during the ingestion process (e.g., combining `doc_id` and `chunk_index`).
    -   `doc_id` (string, required): The identifier of the parent Document.
    -   `text` (string, required): The text content of the chunk.
    -   `metadata` (object, required):
        -   `chapter` (string): The chapter the chunk belongs to.
        -   `chunk_index` (integer): The sequential index of the chunk within the document.
        -   `char_start` (integer): The starting character position of the chunk within the original document.
        -   `char_end` (integer): The ending character position of the chunk within the original document.

### Embedding

-   **Description**: The vector representation of a Chunk's text. This is stored in the Qdrant vector store.
-   **Attributes**:
    -   `vector` (array of floats, required): The numerical vector from the Gemini embedding model.
    -   `payload` (object, required): The data associated with the vector, which includes the `chunk_id`, `doc_id`, `text`, and all chunk `metadata`.

## API Request/Response Models

These models define the contracts for the FastAPI endpoints.

### IngestRequest

-   **Description**: The request body for the `POST /ingest` endpoint.
-   **Corresponds to**: `Document` entity.
-   **Fields**:
    -   `doc_id` (string)
    -   `text` (string)
    -   `metadata` (object)

### IngestResponse

-   **Description**: The response body for the `POST /ingest` endpoint.
-   **Fields**:
    -   `status` (string) - e.g., "success"
    -   `chunks_ingested` (integer)

### QueryRequest

-   **Description**: The request body for the `POST /query` endpoint.
-   **Fields**:
    -   `question` (string, required)
    -   `selection` (object, optional) - e.g., `{ "doc_id": "chapter1" }`
    -   `top_k` (integer, optional) - Defaults to a reasonable number like 3 or 5.

### QueryResponse

-   **Description**: The response body for the `POST /query` endpoint.
-   **Fields**:
    -   `answer` (string)
    -   `citations` (array of objects): Metadata from the source chunks used to generate the answer. Each object could contain `doc_id`, `chapter`, `chunk_index`.
    -   `raw_chunks` (array of strings): The raw text of the source chunks.

## User Authentication Entities (Postgres/Neon)

### User

-   **Description**: Represents a user of the application. To be used in a future authentication feature.
-   **Attributes**:
    -   `id` (integer, primary key)
    -   `username` (string, unique, required)
    -   `hashed_password` (string, required)
    -   `email` (string, unique, required)
    -   `is_active` (boolean, default: true)
