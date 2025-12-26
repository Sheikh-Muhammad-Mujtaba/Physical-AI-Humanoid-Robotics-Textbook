# Tasks: Fix Agent Search Tool

**Feature**: `001-fix-agent-search`
**Status**: Pending

## Implementation Strategy

We will implement this feature by first establishing a robust foundation (ingestion script) to ensure the vector database contains correctly formatted data (768 dimensions). Then we will refactor the search tool to use the official `qdrant-client` patterns and verify it against the ingested data.

1.  **Foundation**: Fix `scripts/ingest_qdrant.py` to ensure reliable data ingestion.
2.  **Core Feature**: Update `api/utils/tools.py` to implement correct vector search.
3.  **Polish**: Verify documentation and final testing.

## Dependencies

- **US1** (Retrieve Relevant Context) depends on **Foundation** (Ingestion).
- **US2** (Handle Low Relevance Results) extends **US1**.

## Phase 1: Setup

*Goal: Ensure environment and dependencies are ready.*

- [x] T001 Verify `qdrant-client` and `sentence-transformers` presence in `requirements.txt`
- [x] T002 Verify `TextChunk` model definition in `api/utils/models.py` matches `data-model.md`

## Phase 2: Foundation (Ingestion)

*Goal: Ensure Qdrant collection is correctly populated with 768-dim vectors.*

- [x] T003 [P] Implement vector ingestion logic using `qdrant-client` batch upload in `scripts/ingest_qdrant.py`
- [x] T004 [P] Configure collection creation with 768 dimensions and Cosine distance in `scripts/ingest_qdrant.py`
- [x] T005 Run `scripts/ingest_qdrant.py` to populate `textbook_chunks` collection
- [x] T006 Verify ingestion status (count points) using `test_qdrant_full.py`

## Phase 3: User Story 1 (Retrieve Context)

*Goal: Enable the agent to retrieve relevant content from the vector DB.*

- [x] T007 [US1] Implement `get_query_embedding` using `sentence-transformers` (or inference API) in `api/utils/tools.py`
- [x] T008 [US1] Implement `search_book_content` using `qdrant_client.query_points` (or `search`) in `api/utils/tools.py`
- [x] T009 [US1] Map Qdrant search results to `TextChunk` domain objects in `api/utils/tools.py`
- [x] T010 [US1] Add docstrings and usage examples to `api/utils/tools.py`

## Phase 4: User Story 2 (Low Relevance)

*Goal: Handle cases where no relevant content is found.*

- [x] T011 [US2] Add `score_threshold` parameter logic to `search_book_content` in `api/utils/tools.py`
- [x] T012 [US2] Implement empty result handling (return empty list, log warning) in `api/utils/tools.py`

## Phase 5: Polish

*Goal: Final verification and documentation.*

- [x] T013 Update `quickstart.md` with final usage instructions if changed during implementation
- [x] T014 Run manual verification script `test_qdrant_full.py` to confirm end-to-end functionality
