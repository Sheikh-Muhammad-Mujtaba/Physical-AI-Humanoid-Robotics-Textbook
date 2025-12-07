# Data Model: Normalize Backend Architecture

**Feature Branch**: `001-normalize-backend-arch`
**Created**: 2025-12-07
**Status**: Draft

## User Accounts (PostgreSQL)

### `users_table`
- `user_id` (Primary Key, UUID): Unique identifier for the user.
- `username` (Unique, String): User's chosen username.
- `email` (Unique, String): User's email address.
- `hashed_password` (String): Hashed password for authentication.
- `created_at` (Timestamp with timezone): Timestamp of user creation.
- `updated_at` (Timestamp with timezone): Timestamp of last user update.

## Document Metadata (PostgreSQL)

### `chunk_metadata_table`
- `chunk_id` (Primary Key, UUID): Unique identifier for each chunk.
- `doc_id` (Foreign Key, UUID): Identifier for the parent document.
- `owner_user_id` (Foreign Key, UUID): Identifier for the user who owns the document/chunk, linking to `users_table`.
- `chunk_text` (Text): The raw text content of the chunk.
- `token_count` (Integer): The number of tokens in `chunk_text`.
- `vector_id` (UUID): Reference to the corresponding vector in Qdrant.
- `created_at` (Timestamp with timezone): Timestamp of chunk creation.
- `updated_at` (Timestamp with timezone): Timestamp of last chunk update.

## Qdrant Integration (Vector Embeddings)

- Vector embeddings are stored in Qdrant, with a link back to `chunk_metadata_table` via `vector_id`.
- Qdrant payload will contain minimal metadata necessary for retrieval and deduplication, primarily `chunk_id` and `doc_id`.
- The `vector_id` in PostgreSQL's `chunk_metadata_table` will serve as the primary lookup for vector data in Qdrant.