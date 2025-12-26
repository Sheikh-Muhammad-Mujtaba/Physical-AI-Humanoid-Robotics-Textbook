# Quickstart: Fix Agent Search

## Prerequisites

1.  **Environment Variables**:
    Ensure `.env` (or `api/.env`) contains:
    ```bash
    QDRANT_URL=...
    QDRANT_API_KEY=...
    QDRANT_COLLECTION_NAME=textbook_chunks
    HUGGINGFACE_API_KEY=... (Required for embedding generation)
    ```

2.  **Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## Ingestion (Setup)

To populate the Qdrant database with textbook content (uses Hugging Face Inference API):

```bash
# Run the ingestion script (resets existing collection)
python scripts/ingest_qdrant.py --reset
```

*Note: This will recreate the collection `textbook_chunks` and upload data from `docs/` and `blog/`.*

## Usage (Tool)

The search tool is available in `api/utils/tools.py`.

```python
from api.utils.tools import search_book_content, get_query_embedding
import asyncio

async def main():
    # 1. Generate embedding
    embedding = await get_query_embedding("What is physical AI?")
    
    # 2. Search
    results = search_book_content(embedding, limit=3)
    
    for chunk in results:
        print(f"[{chunk.score:.2f}] {chunk.text[:50]}...")

if __name__ == "__main__":
    asyncio.run(main())
```

## Testing

Run the verification scripts:

1.  **Full Qdrant Connectivity Check**:
    ```bash
    python test_qdrant_full.py
    ```

2.  **End-to-End Tool Test**:
    ```bash
    python test_tools_e2e.py
    ```