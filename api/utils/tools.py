from typing import List
from qdrant_client.http.models import PointStruct
from api.utils.config import config, Config
from api.utils.helpers import GeminiHelper
from api.utils.models import TextChunk
import os

COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "textbook_chunks")

def search_book_content(query_embedding: List[float], limit: int = 5) -> List[TextChunk]:
    """
    Searches the Qdrant database for book content similar to the query embedding.
    """
    try:
        qdrant_client = config.get_qdrant_client()
        search_result = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=limit,
            with_payload=True
        )
        
        chunks = []
        for hit in search_result:
            chunks.append(TextChunk(
                text=hit.payload.get('text', ''),
                source=hit.payload.get('source'),
                page=hit.payload.get('page')
            ))
        return chunks
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []

def format_context(chunks: List[TextChunk]) -> str:
    """
    Formats the retrieved text chunks into a coherent string for the LLM.
    """
    formatted_string = "Retrieved context from the textbook:\n\n"
    for i, chunk in enumerate(chunks):
        formatted_string += f"--- Chunk {i+1} ---\n"
        formatted_string += f"Content: {chunk.text}\n"
        if chunk.source:
            formatted_string += f"Source: {chunk.source}\n"
        if chunk.page is not None:
            formatted_string += f"Page: {chunk.page}\n"
        formatted_string += "\n"
    return formatted_string
