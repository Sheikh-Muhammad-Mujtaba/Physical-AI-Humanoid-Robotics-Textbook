#!/usr/bin/env python3
"""
Qdrant Data Ingestion Script for Physical AI Textbook (Optimized)

This script:
1. Reads Markdown files from docs/ AND blog/ directories
2. Processes files sequentially (one at a time) with rate limiting
3. Splits content into chunks
4. Embeds chunks using Google's embedding model with sleep intervals
5. Stores embeddings in Qdrant vector database
6. Tracks progress and supports resume capability

Usage:
    python scripts/ingest_qdrant.py              # Resume from checkpoint
    python scripts/ingest_qdrant.py --reset      # Force re-ingest all files
    python scripts/ingest_qdrant.py --no-resume  # Ingest all, don't save state
    python scripts/ingest_qdrant.py --help       # Show help
"""

# Standard library imports
import sys
import os
import json
import re
import time
import random
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple
import uuid
from datetime import datetime

# Third-party imports
try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
if load_dotenv:
    load_dotenv(".env")

# Configure logging
def setup_logging():
    """Setup comprehensive logging to file and console."""
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f'qdrant_ingestion_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'

    # Create logger
    logger = logging.getLogger('qdrant_ingest')
    logger.setLevel(logging.DEBUG)

    # File handler (DEBUG level - log everything)
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.DEBUG)

    # Console handler (INFO level - show important info)
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)

    # Formatter with detailed information
    file_formatter = logging.Formatter(
        '%(asctime)s - [%(levelname)-8s] - %(name)s:%(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - [%(levelname)-8s] - %(message)s',
        datefmt='%H:%M:%S'
    )

    fh.setFormatter(file_formatter)
    ch.setFormatter(console_formatter)

    # Add handlers
    logger.addHandler(fh)
    logger.addHandler(ch)

    logger.info(f"Logging initialized. Log file: {log_file}")
    return logger, log_file

# Setup logging first
logger, log_file = setup_logging()
logger.debug("Loaded environment variables from .env file")

# Configure Google API
# Try GEMINI_API_KEY first (preferred), fall back to GOOGLE_API_KEY for compatibility
logger.debug("Attempting to load API keys from environment")
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
if not GEMINI_API_KEY:
    logger.error("Neither GEMINI_API_KEY nor GOOGLE_API_KEY environment variable is set")
    logger.error("Please set GEMINI_API_KEY in your .env file")
    sys.exit(1)

logger.info("GEMINI_API_KEY loaded successfully")
try:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Google API configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Google API: {e}", exc_info=True)
    sys.exit(1)

# Qdrant configuration
QDRANT_URL = os.getenv('QDRANT_URL', 'http://localhost:6333')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY', None)
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION_NAME', 'textbook_chunks')
logger.debug(f"Qdrant configuration: URL={QDRANT_URL[:50]}..., Collection={COLLECTION_NAME}")

# Embedding model
EMBEDDING_MODEL = 'models/text-embedding-004' #'models/embedding-001'
VECTOR_SIZE = 768  # Google Embedding API returns 768-dimensional vectors

# Chunk configuration
CHUNK_SIZE = 512  # Characters per chunk
CHUNK_OVERLAP = 128  # Characters to overlap between chunks

# Rate limiting configuration
CHUNK_SLEEP_DURATION = 0.5  # Seconds to sleep after each chunk embedding
FILE_SLEEP_DURATION_MIN = 60  # Minimum seconds between files
FILE_SLEEP_DURATION_MAX = 120  # Maximum seconds between files


class ProgressTracker:
    """Track ingestion progress and support resume capability."""

    def __init__(self, state_file: str = '.qdrant_ingestion_state.json'):
        """Initialize progress tracker."""
        self.state_file = Path(state_file)
        self.state = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        """Load progress from disk or initialize new state."""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                logger.info(f"Loaded progress state from {self.state_file.name}")
                logger.debug(f"Loaded state: {state}")
                return state
            except Exception as e:
                logger.error(f"Error loading progress state: {e}", exc_info=True)
                logger.info("Starting fresh with new progress state")
                return self._create_new_state()
        logger.debug(f"Progress state file not found: {self.state_file}")
        return self._create_new_state()

    @staticmethod
    def _create_new_state() -> Dict[str, Any]:
        """Create a new progress state."""
        return {
            'completed_files': [],
            'total_chunks': 0,
            'total_points': 0,
            'last_updated': None,
        }

    def is_completed(self, file_path: Path) -> bool:
        """Check if file was already ingested."""
        return str(file_path.resolve()) in self.state['completed_files']

    def mark_completed(self, file_path: Path, chunk_count: int):
        """Mark file as successfully processed."""
        logger.debug(f"Marking file as completed: {file_path.name} with {chunk_count} chunks")
        self.state['completed_files'].append(str(file_path.resolve()))
        self.state['total_chunks'] += chunk_count
        self.state['total_points'] += chunk_count
        self.state['last_updated'] = datetime.now().isoformat()
        logger.info(f"File completed: {file_path.name} | Total: {len(self.state['completed_files'])} files, {self.state['total_chunks']} chunks")
        self._save_state()

    def _save_state(self):
        """Persist progress to disk."""
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
            logger.debug(f"Progress state saved to {self.state_file}")
        except Exception as e:
            logger.error(f"Error saving progress state: {e}", exc_info=True)

    def reset(self):
        """Clear all progress (for --reset flag)."""
        logger.warning("Resetting progress state - all progress will be cleared")
        self.state = self._create_new_state()
        self._save_state()
        logger.info("Progress state reset successfully")

    def get_summary(self) -> str:
        """Get human-readable progress summary."""
        summary = (
            f"Completed: {len(self.state['completed_files'])} files, "
            f"{self.state['total_chunks']} chunks, "
            f"{self.state['total_points']} points"
        )
        logger.debug(f"Progress summary: {summary}")
        return summary

    def get_completed_count(self) -> int:
        """Get count of completed files."""
        return len(self.state['completed_files'])


class MarkdownParser:
    """Parse Markdown files and extract structured content."""

    @staticmethod
    def parse_file(file_path: Path) -> Dict[str, Any]:
        """
        Parse a markdown file and extract frontmatter and content.

        Returns:
            Dict with 'frontmatter' (YAML dict) and 'content' (plain text)
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter (YAML between --- delimiters)
        frontmatter = {}
        if content.startswith('---'):
            end_idx = content.find('---', 3)
            if end_idx != -1:
                fm_str = content[3:end_idx].strip()
                # Simple YAML parsing for our use case
                for line in fm_str.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip().strip('"\'')
                content = content[end_idx + 3:].strip()

        # Remove MDX imports and other directives
        content = re.sub(r'^import\s+.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^export\s+.*$', '', content, flags=re.MULTILINE)

        # Remove HTML comments
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)

        # Clean up multiple blank lines
        content = re.sub(r'\n\n+', '\n\n', content)

        return {
            'frontmatter': frontmatter,
            'content': content.strip()
        }

    @staticmethod
    def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """
        Split text into overlapping chunks.

        Args:
            text: Text to chunk
            chunk_size: Size of each chunk in characters
            overlap: Number of characters to overlap between chunks

        Returns:
            List of text chunks
        """
        chunks = []
        if len(text) <= chunk_size:
            return [text]

        step = chunk_size - overlap
        for i in range(0, len(text), step):
            chunk = text[i:i + chunk_size]
            if chunk.strip():  # Only add non-empty chunks
                chunks.append(chunk)

        return chunks


class QdrantManager:
    """Manage Qdrant collection for embeddings."""

    def __init__(self):
        """Initialize Qdrant client."""
        try:
            if QDRANT_API_KEY:
                self.client = QdrantClient(
                    url=QDRANT_URL,
                    api_key=QDRANT_API_KEY,
                    prefer_grpc=False
                )
            else:
                self.client = QdrantClient(QDRANT_URL, prefer_grpc=False)
            print(f"✓ Connected to Qdrant at {QDRANT_URL}")
        except Exception as e:
            print(f"✗ Failed to connect to Qdrant: {e}")
            print("  Make sure Qdrant is running:")
            print("    docker run -p 6333:6333 qdrant/qdrant")
            sys.exit(1)

    def create_collection(self):
        """Create collection if it doesn't exist."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [c.name for c in collections.collections]

            if COLLECTION_NAME in collection_names:
                print(f"✓ Collection '{COLLECTION_NAME}' already exists")
                return

            # Create collection
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            print(f"✓ Created collection '{COLLECTION_NAME}'")
        except Exception as e:
            print(f"✗ Error creating collection: {e}")
            sys.exit(1)

    def insert_points(self, points: List[PointStruct]):
        """Insert points into collection."""
        try:
            self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
        except Exception as e:
            print(f"✗ Error inserting points: {e}")
            raise

    def get_collection_stats(self):
        """Get collection statistics."""
        try:
            collection = self.client.get_collection(COLLECTION_NAME)
            return {
                'name': collection.name,
                'points_count': collection.points_count,
                'vector_size': VECTOR_SIZE
            }
        except Exception as e:
            print(f"✗ Error getting collection stats: {e}")
            return None


class EmbeddingManager:
    """Manage text embeddings using Google's API with rate limiting."""

    @staticmethod
    def embed_text(text: str, sleep_duration: float = CHUNK_SLEEP_DURATION) -> List[float]:
        """
        Embed text using Google's embedding model with rate limiting.

        Args:
            text: Text to embed
            sleep_duration: Seconds to sleep after embedding

        Returns:
            Embedding vector or None on error
        """
        try:
            # Truncate text to reasonable length for embedding
            text_len = len(text)
            text = text[:2000]  # Google's limit is typically 2048 tokens
            logger.debug(f"Embedding text: length={text_len} chars, truncated={len(text)} chars")

            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text
            )

            embedding_dim = len(response['embedding'])
            logger.debug(f"Embedding created successfully: {embedding_dim}-dimensional vector")

            # Sleep after embedding to respect rate limits
            if sleep_duration > 0:
                time.sleep(sleep_duration)
                logger.debug(f"Rate limit sleep: {sleep_duration}s")

            return response['embedding']
        except Exception as e:
            error_str = str(e).lower()
            if '429' in str(e) or 'quota' in error_str or 'rate limit' in error_str:
                # Rate limit hit, wait and retry
                wait_time = 90 + random.randint(0, 30)
                logger.warning(f"Rate limit encountered: {e}")
                logger.warning(f"Retrying after {wait_time}s wait")
                time.sleep(wait_time)
                # Retry once with longer sleep
                return EmbeddingManager.embed_text(text, sleep_duration=1.0)
            else:
                logger.error(f"Error embedding text: {e}", exc_info=True)
                return []


def get_markdown_files(base_dir: Path, source: str = 'docs') -> List[Tuple[Path, str]]:
    """
    Find all markdown files with source tagging.

    Args:
        base_dir: Directory to search
        source: Source label ('docs' or 'blog')

    Returns:
        List of tuples (file_path, source)
    """
    md_files = []
    for pattern in ['**/*.md', '**/*.mdx']:
        for file_path in base_dir.glob(pattern):
            md_files.append((file_path, source))
    return sorted(md_files, key=lambda x: str(x[0]))


def ingest_documents(resume: bool = True, reset: bool = False):
    """
    Main ingestion function with sequential processing and resume support.

    Args:
        resume: Whether to resume from checkpoint
        reset: Whether to reset progress and start fresh
    """
    logger.info("="*70)
    logger.info("Physical AI Textbook - Qdrant Data Ingestion (Optimized)")
    logger.info("="*70)

    # Verify configuration
    logger.info("Verifying configuration...")
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set")
        sys.exit(1)
    logger.info("✓ GEMINI_API_KEY configured")

    if not QDRANT_URL:
        logger.error("QDRANT_URL not set")
        sys.exit(1)
    logger.info(f"✓ Qdrant URL: {QDRANT_URL[:50]}...")

    print("=" * 70)
    print("Physical AI Textbook - Qdrant Data Ingestion (Optimized)")
    print("=" * 70)
    print(f"Log file: {log_file}")
    print()
    # Print config (visually for console)
    print("✓ GEMINI_API_KEY configured")
    print(f"✓ Qdrant URL: {QDRANT_URL[:50]}...")

    # Setup directories
    base_dir = Path(__file__).parent.parent
    docs_dir = base_dir / 'docs'
    blog_dir = base_dir / 'blog'

    if not docs_dir.exists() or not blog_dir.exists():
        print("\n✗ Required directories not found")
        print(f"  docs ({docs_dir}): {docs_dir.exists()}")
        print(f"  blog ({blog_dir}): {blog_dir.exists()}")
        sys.exit(1)

    print(f"\n📂 Docs directory: {docs_dir}")
    print(f"📂 Blog directory: {blog_dir}")

    # Initialize progress tracker
    progress = ProgressTracker()
    if reset:
        progress.reset()

    # Find markdown files from both sources
    md_files_docs = get_markdown_files(docs_dir, source='docs')
    md_files_blog = get_markdown_files(blog_dir, source='blog')
    md_files = sorted(md_files_docs + md_files_blog, key=lambda x: str(x[0]))

    if not md_files:
        print("✗ No markdown files found")
        sys.exit(1)

    print(f"✓ Found {len(md_files_docs)} docs, {len(md_files_blog)} blog posts")
    print(f"✓ Total files to process: {len(md_files)}")

    # Initialize managers
    print("\n📡 Initializing Qdrant connection...")
    try:
        qdrant = QdrantManager()
        qdrant.create_collection()
    except Exception as e:
        print(f"✗ Failed to initialize Qdrant: {e}")
        print("  Make sure:")
        print("    1. Qdrant is running (docker or cloud instance)")
        print("    2. QDRANT_URL is correct in .env")
        print("    3. QDRANT_API_KEY is correct (if cloud hosted)")
        sys.exit(1)

    # Process files sequentially
    print(f"\n📖 Starting ingestion (resume: {resume}, reset: {reset})...")
    print(f"📊 {progress.get_summary()}\n")

    total_inserted = 0

    for file_idx, (file_path, source) in enumerate(md_files, 1):
        # Skip if already processed
        if resume and progress.is_completed(file_path):
            logger.debug(f"File already processed: {file_path.name}")
            print(f"⊘ [{file_idx:2d}/{len(md_files)}] {file_path.name} (already ingested)")
            continue

        base = docs_dir if source == 'docs' else blog_dir
        rel_path = file_path.relative_to(base)
        logger.info(f"[{file_idx:2d}/{len(md_files)}] Processing {source}: {rel_path}")
        print(f"📄 [{file_idx:2d}/{len(md_files)}] Processing {source}: {rel_path}")

        try:
            # Parse file
            logger.debug(f"Parsing file: {file_path}")
            parsed = MarkdownParser.parse_file(file_path)
            content = parsed['content']

            if not content.strip():
                logger.warning(f"File has no content: {rel_path}")
                print("   ⚠️  No content, skipping")
                progress.mark_completed(file_path, 0)
                continue

            # Chunk content
            chunks = MarkdownParser.chunk_text(content)
            logger.info(f"Parsed: {len(content)} chars, {len(chunks)} chunks | File: {rel_path}")
            print(f"   ✓ Parsed: {len(content)} chars, {len(chunks)} chunks")

            # Extract metadata
            frontmatter = parsed['frontmatter']
            document_id = frontmatter.get('id', str(rel_path))
            title = frontmatter.get('title', str(rel_path))
            logger.debug(f"Document ID: {document_id}, Title: {title}")

            # Embed and insert each chunk
            chunk_success = 0
            for chunk_idx, chunk in enumerate(chunks, 1):
                logger.debug(f"Embedding chunk {chunk_idx}/{len(chunks)} for {rel_path}")
                # Embed with rate limiting
                embedding = EmbeddingManager.embed_text(chunk, sleep_duration=CHUNK_SLEEP_DURATION)

                if not embedding:
                    logger.error(f"Failed to embed chunk {chunk_idx}/{len(chunks)} for {rel_path}")
                    print(f"   ✗ Failed to embed chunk {chunk_idx}/{len(chunks)}")
                    continue

                # Create and insert point
                try:
                    point = PointStruct(
                        id=uuid.uuid4().int % (2**31),  # Qdrant-compatible ID
                        vector=embedding,
                        payload={
                            'text': chunk,
                            'document_id': document_id,
                            'title': title,
                            'file_path': str(rel_path),
                            'source': source,
                            'file_name': file_path.name,
                            'chunk_index': chunk_idx - 1,
                            'ingested_at': datetime.now().isoformat(),
                        }
                    )

                    qdrant.insert_points([point])
                    chunk_success += 1
                    logger.debug(f"Chunk {chunk_idx} inserted successfully | File: {rel_path}")
                except Exception as e:
                    logger.error(f"Failed to insert chunk {chunk_idx}: {e}", exc_info=True)
                    print(f"   ✗ Failed to insert chunk {chunk_idx}: {e}")
                    continue

                # Show progress for large files
                if chunk_idx % 5 == 0:
                    logger.debug(f"Progress: Embedded {chunk_idx}/{len(chunks)} chunks")
                    print(f"   → Embedded {chunk_idx}/{len(chunks)} chunks")

            if chunk_success > 0:
                logger.info(f"File completed: {chunk_success}/{len(chunks)} chunks inserted | File: {rel_path}")
                print(f"   ✓ Embedded {chunk_success}/{len(chunks)} chunks, inserted into Qdrant")
                total_inserted += chunk_success
            else:
                logger.error(f"No chunks successfully embedded for file: {rel_path}")
                print("   ✗ No chunks successfully embedded")
                continue

            # Mark completed and save progress
            progress.mark_completed(file_path, chunk_success)

        except Exception as e:
            logger.error(f"Error processing file {rel_path}: {e}", exc_info=True)
            print(f"   ✗ Error processing file: {e}")
            continue

        # Sleep between files (except last file)
        if file_idx < len(md_files):
            sleep_time = random.randint(FILE_SLEEP_DURATION_MIN, FILE_SLEEP_DURATION_MAX)
            logger.info(f"Rate limit: Sleeping {sleep_time}s before next file")
            print(f"   ⏳ Sleeping {sleep_time}s before next file...")
            print()
            time.sleep(sleep_time)

    # Summary
    print("\n" + "=" * 70)
    print("✓ Ingestion Complete!")
    print(f"📊 {progress.get_summary()}")
    stats = qdrant.get_collection_stats()
    if stats:
        print(f"   Collection: {stats['name']}")
        print(f"   Total Points: {stats['points_count']}")
        print(f"   Inserted this run: {total_inserted}")
    print("=" * 70)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Ingest markdown files from docs/ and blog/ into Qdrant vector database'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset progress state and re-ingest all files'
    )
    parser.add_argument(
        '--no-resume',
        action='store_true',
        help='Ignore previous progress and ingest all files (but do not save progress)'
    )
    args = parser.parse_args()

    try:
        ingest_documents(
            resume=not args.no_resume,
            reset=args.reset
        )
    except KeyboardInterrupt:
        print("\n\n✗ Ingestion interrupted by user (progress saved)")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
