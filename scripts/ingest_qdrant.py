#!/usr/bin/env python3
"""
Qdrant Data Ingestion Script for Physical AI Textbook

This script:
1. Reads Markdown files from docs/ and blog/ directories
2. Processes files sequentially
3. Splits content into chunks
4. Embeds chunks using Hugging Face Inference API (sentence-transformers/all-mpnet-base-v2)
5. Stores embeddings in Qdrant vector database

Usage:
    python scripts/ingest_qdrant.py              # Resume from checkpoint
    python scripts/ingest_qdrant.py --reset      # Force re-ingest all files
"""

import sys
import os
import json
import uuid
import argparse
import logging
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple
from datetime import datetime

# Third-party imports
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from huggingface_hub import InferenceClient

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
load_dotenv(".env")
load_dotenv("api/.env")  # Also try api/.env

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('qdrant_ingest')

# Configuration
QDRANT_URL = os.getenv('QDRANT_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION_NAME', 'textbook_chunks')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
EMBEDDING_MODEL_NAME = 'sentence-transformers/all-mpnet-base-v2'
VECTOR_SIZE = 768
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

class ProgressTracker:
    """Track ingestion progress."""
    def __init__(self, state_file: str = '.qdrant_ingestion_state.json'):
        self.state_file = Path(state_file)
        self.state = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading state: {e}")
        return {'completed_files': []}

    def is_completed(self, file_path: Path) -> bool:
        return str(file_path.resolve()) in self.state['completed_files']

    def mark_completed(self, file_path: Path):
        self.state['completed_files'].append(str(file_path.resolve()))
        self._save_state()

    def _save_state(self):
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def reset(self):
        self.state = {'completed_files': []}
        self._save_state()

class MarkdownParser:
    """Parse and chunk markdown files."""
    @staticmethod
    def parse_file(file_path: Path) -> Dict[str, Any]:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        frontmatter = {}
        if content.startswith('---'):
            end_idx = content.find('---', 3)
            if end_idx != -1:
                fm_str = content[3:end_idx].strip()
                for line in fm_str.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip().strip('"\'')
                content = content[end_idx + 3:].strip()

        return {'frontmatter': frontmatter, 'content': content}

    @staticmethod
    def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        chunks = []
        if len(text) <= chunk_size:
            return [text]
        step = chunk_size - overlap
        for i in range(0, len(text), step):
            chunk = text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)
        return chunks

def get_markdown_files(base_dir: Path) -> List[Tuple[Path, str]]:
    files = []
    # Process docs/
    docs_dir = base_dir / 'docs'
    if docs_dir.exists():
        for p in docs_dir.glob('**/*.md*'):
            files.append((p, 'docs'))
    
    # Process blog/
    blog_dir = base_dir / 'blog'
    if blog_dir.exists():
        for p in blog_dir.glob('**/*.md*'):
            files.append((p, 'blog'))
            
    return sorted(files, key=lambda x: str(x[0]))

def embed_with_retry(client, text, model, retries=3):
    for i in range(retries):
        try:
            # feature_extraction returns a list of floats (the embedding)
            response = client.feature_extraction(text, model=model)
            return response
        except Exception as e:
            if i == retries - 1:
                raise e
            logger.warning(f"Embedding failed, retrying ({i+1}/{retries}): {e}")
            time.sleep(2)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reset', action='store_true', help='Reset progress and recreate collection')
    args = parser.parse_args()

    if not QDRANT_URL:
        logger.error("QDRANT_URL not set in .env")
        sys.exit(1)
    
    if not HUGGINGFACE_API_KEY:
        logger.error("HUGGINGFACE_API_KEY not set in .env")
        sys.exit(1)

    # Initialize Inference Client
    logger.info(f"Using Inference API for model: {EMBEDDING_MODEL_NAME}")
    hf_client = InferenceClient(api_key=HUGGINGFACE_API_KEY)

    # Initialize Qdrant Client
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Create/Recreate Collection
    collections = qdrant_client.get_collections()
    exists = any(c.name == COLLECTION_NAME for c in collections.collections)

    if args.reset or not exists:
        logger.info(f"Creating collection '{COLLECTION_NAME}' (size={VECTOR_SIZE}, dist=Cosine)")
        qdrant_client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )
        ProgressTracker().reset()
    
    progress = ProgressTracker()
    base_dir = Path(__file__).parent.parent
    files = get_markdown_files(base_dir)

    logger.info(f"Found {len(files)} files to process")

    points_buffer = []
    
    for file_path, source in files:
        if not args.reset and progress.is_completed(file_path):
            continue

        logger.info(f"Processing {file_path.name}")
        try:
            parsed = MarkdownParser.parse_file(file_path)
            content = parsed['content']
            if not content.strip():
                continue

            chunks = MarkdownParser.chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                # Embed individually (API might not support batching efficiently or large payloads)
                vector = embed_with_retry(hf_client, chunk, EMBEDDING_MODEL_NAME)
                
                point = PointStruct(
                    id=uuid.uuid4().hex,
                    vector=vector,
                    payload={
                        'text': chunk,
                        'source': file_path.name,
                        'full_path': str(file_path),
                        'category': source,
                        'chunk_index': i
                    }
                )
                points_buffer.append(point)

                # Rate limit safety
                time.sleep(0.1)

            # Upload in batches
            if len(points_buffer) >= 20:
                qdrant_client.upload_points(collection_name=COLLECTION_NAME, points=points_buffer)
                points_buffer = []

            progress.mark_completed(file_path)

        except Exception as e:
            logger.error(f"Failed to process {file_path}: {e}")

    # Upload remaining points
    if points_buffer:
        qdrant_client.upload_points(collection_name=COLLECTION_NAME, points=points_buffer)

    logger.info("Ingestion complete")

if __name__ == "__main__":
    main()
