import asyncio
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'api/utils'))

from dotenv import load_dotenv
from tools import get_query_embedding, search_book_content, format_context

load_dotenv(".env")
load_dotenv("api/.env")

async def main():
    print("Testing get_query_embedding...")
    query = "What is the definition of Physical AI?"
    embedding = await get_query_embedding(query)
    
    if embedding and len(embedding) == 768:
        print(f"✅ Embedding generated: {len(embedding)} dimensions")
    else:
        print(f"❌ Embedding failed or wrong dimension: {len(embedding) if embedding else 'None'}")
        return

    print("\nTesting search_book_content...")
    chunks = search_book_content(embedding, limit=3, score_threshold=0.0)
    
    if chunks:
        print(f"✅ Found {len(chunks)} chunks")
        for i, chunk in enumerate(chunks, 1):
            print(f"\nResult {i} (Score: {chunk.score:.4f}):")
            print(f"Source: {chunk.source}")
            print(f"Text: {chunk.text[:100]}...")
    else:
        print("⚠️ No chunks found (might be expected if DB empty or threshold too high)")

    print("\nTesting format_context...")
    formatted = format_context(chunks, include_scores=True)
    print("Formatted output preview:")
    print(formatted[:200])

if __name__ == "__main__":
    asyncio.run(main())
