from typing import List, Optional
from config import config
from models import TextChunk
import logging
import os

logger = logging.getLogger(__name__)

COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "textbook_chunks")
HUGGINGFACE_EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"  # 768-dim model


async def get_query_embedding(query: str) -> Optional[List[float]]:
    """
    Generate embedding for a query using Hugging Face's all-mpnet-base-v2 model.

    This function uses the Hugging Face Inference API to embed queries without
    quota limits. The model outputs 768-dimensional vectors.

    Args:
        query: The text to embed

    Returns:
        List of floats representing the embedding, or None if embedding fails
    """
    try:
        logger.debug(f"Embedding query using {HUGGINGFACE_EMBEDDING_MODEL}: '{query[:100]}'")
        inference_client = config.get_inference_client()

        embedding_response = inference_client.feature_extraction(
            text=query,
            model=HUGGINGFACE_EMBEDDING_MODEL
        )

        # feature_extraction returns a list of floats directly or numpy array
        if hasattr(embedding_response, 'tolist'):
            embedding_response = embedding_response.tolist()
            
        logger.debug(f"Query embedding generated, dimension: {len(embedding_response)}")
        return embedding_response

    except Exception as e:
        logger.error(f"Error embedding query with Hugging Face: {str(e)}", exc_info=True)
        return None

def search_book_content(
    query_embedding: List[float],
    limit: int = 5,
    score_threshold: Optional[float] = 0.0
) -> List[TextChunk]:
    """
    Searches the Qdrant database for book content similar to the query embedding.

    Args:
        query_embedding: Vector embedding of the query
        limit: Maximum number of results to return
        score_threshold: Minimum similarity score (0.0-1.0) for results

    Returns:
        List of TextChunk objects with relevant content from the textbook

    Example:
        >>> embedding = await get_query_embedding("Physical AI")
        >>> chunks = search_book_content(embedding, limit=3)
        >>> for chunk in chunks:
        ...     print(chunk.text)
    """
    try:
        qdrant_client = config.get_qdrant_client()

        logger.info(f"Searching Qdrant collection '{COLLECTION_NAME}' with limit={limit}")

        search_results = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_embedding,
            limit=limit,
            with_payload=True
        )

        logger.info(f"Found {len(search_results.points)} relevant chunks in Qdrant")

        chunks = []
        for i, scored_point in enumerate(search_results.points):
            score_value = getattr(scored_point, 'score', None)

            # Apply score threshold filtering
            if score_threshold and score_value is not None and score_value < score_threshold:
                logger.debug(f"Skipping chunk {i+1}: score {score_value:.3f} below threshold {score_threshold}")
                continue

            chunk = TextChunk(
                text=scored_point.payload.get('text', ''),
                source=scored_point.payload.get('source'),
                page=scored_point.payload.get('page'), # Might be None
                score=score_value
            )

            chunks.append(chunk)
            logger.debug(f"Chunk {i+1}: id={scored_point.id}, score={score_value if score_value is not None else 'N/A'}, source={chunk.source}")

        if not chunks:
            logger.warn("No chunks found matching criteria.")

        return chunks

    except Exception as e:
        logger.error(f"Error searching Qdrant collection '{COLLECTION_NAME}': {str(e)}", exc_info=True)
        return []

def format_context(chunks: List[TextChunk], include_scores: bool = False) -> str:
    """
    Formats the retrieved text chunks into a coherent string for the LLM.

    Args:
        chunks: List of TextChunk objects from vector search
        include_scores: Whether to include relevance scores

    Returns:
        Formatted string ready for LLM consumption
    """
    if not chunks:
        return "No relevant context found in the textbook."

    formatted_string = f"Retrieved {len(chunks)} relevant context chunk(s) from the textbook:\n\n"

    for i, chunk in enumerate(chunks, 1):
        formatted_string += f"--- Chunk {i} ---\n"
        formatted_string += f"Content: {chunk.text}\n"

        if chunk.source:
            formatted_string += f"Source: {chunk.source}\n"
        if chunk.page is not None:
            formatted_string += f"Page: {chunk.page}\n"
        if include_scores and hasattr(chunk, 'score') and chunk.score:
            formatted_string += f"Relevance: {chunk.score:.1%}\n"

        formatted_string += "\n"

    return formatted_string

def get_collection_info() -> dict:
    """
    Get information about the Qdrant collection (useful for debugging).
    """
    try:
        qdrant_client = config.get_qdrant_client()
        collection_info = qdrant_client.get_collection(COLLECTION_NAME)
        return {
            "name": COLLECTION_NAME,
            "points_count": collection_info.points_count,
            "vectors_count": getattr(collection_info, 'vectors_count', 'N/A'),
            "status": str(collection_info.status),
            "config": {
                "vector_size": getattr(collection_info.config.params, 'size', 'N/A'),
                "distance": getattr(collection_info.config.params, 'distance', 'N/A')
            }
        }
    except Exception as e:
        logger.error(f"Error getting collection info: {str(e)}")
        return {"error": str(e)}