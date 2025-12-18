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

import sys
import os
import json
import re
import time
import random
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from dotenv import load_dotenv
    load_dotenv(".env")
except ImportError:
    pass

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct

# Configure Google API
# Try GEMINI_API_KEY first (preferred), fall back to GOOGLE_API_KEY for compatibility
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
if not GEMINI_API_KEY:
    print("ERROR: Neither GEMINI_API_KEY nor GOOGLE_API_KEY environment variable is set")
    print("Please set GEMINI_API_KEY in your .env file")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# Qdrant configuration
QDRANT_URL = os.getenv('QDRANT_URL', 'http://localhost:6333')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY', None)
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION_NAME', 'textbook_chunks')

# Embedding model
EMBEDDING_MODEL = 'models/embedding-001'
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
                print(f"📊 Loaded progress state from {self.state_file.name}")
                return state
            except Exception as e:
                print(f"⚠️  Error loading progress state: {e}. Starting fresh.")
                return self._create_new_state()
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
        self.state['completed_files'].append(str(file_path.resolve()))
        self.state['total_chunks'] += chunk_count
        self.state['total_points'] += chunk_count
        self.state['last_updated'] = datetime.now().isoformat()
        self._save_state()

    def _save_state(self):
        """Persist progress to disk."""
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            print(f"⚠️  Error saving progress state: {e}")

    def reset(self):
        """Clear all progress (for --reset flag)."""
        self.state = self._create_new_state()
        self._save_state()
        print("🔄 Progress state reset")

    def get_summary(self) -> str:
        """Get human-readable progress summary."""
        return (
            f"Completed: {len(self.state['completed_files'])} files, "
            f"{self.state['total_chunks']} chunks, "
            f"{self.state['total_points']} points"
        )

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
            text = text[:2000]  # Google's limit is typically 2048 tokens

            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text
            )

            # Sleep after embedding to respect rate limits
            if sleep_duration > 0:
                time.sleep(sleep_duration)

            return response['embedding']
        except Exception as e:
            error_str = str(e).lower()
            if '429' in str(e) or 'quota' in error_str or 'rate limit' in error_str:
                # Rate limit hit, wait and retry
                wait_time = 90 + random.randint(0, 30)
                print(f"      ⏳ Rate limited! Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                # Retry once with longer sleep
                return EmbeddingManager.embed_text(text, sleep_duration=1.0)
            else:
                print(f"✗ Error embedding text: {e}")
                return None


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
    print("=" * 70)
    print("Physical AI Textbook - Qdrant Data Ingestion (Optimized)")
    print("=" * 70)

    # Verify configuration
    print("\n🔍 Verifying configuration...")
    if not GEMINI_API_KEY:
        print("✗ GEMINI_API_KEY not set")
        sys.exit(1)
    print("✓ GEMINI_API_KEY configured")

    if not QDRANT_URL:
        print("✗ QDRANT_URL not set")
        sys.exit(1)
    print(f"✓ Qdrant URL: {QDRANT_URL[:50]}...")

    # Setup directories
    base_dir = Path(__file__).parent.parent
    docs_dir = base_dir / 'docs'
    blog_dir = base_dir / 'blog'

    if not docs_dir.exists() or not blog_dir.exists():
        print(f"\n✗ Required directories not found")
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
            print(f"⊘ [{file_idx:2d}/{len(md_files)}] {file_path.name} (already ingested)")
            continue

        base = docs_dir if source == 'docs' else blog_dir
        rel_path = file_path.relative_to(base)
        print(f"📄 [{file_idx:2d}/{len(md_files)}] Processing {source}: {rel_path}")

        try:
            # Parse file
            parsed = MarkdownParser.parse_file(file_path)
            content = parsed['content']

            if not content.strip():
                print(f"   ⚠️  No content, skipping")
                progress.mark_completed(file_path, 0)
                continue

            # Chunk content
            chunks = MarkdownParser.chunk_text(content)
            print(f"   ✓ Parsed: {len(content)} chars, {len(chunks)} chunks")

            # Extract metadata
            frontmatter = parsed['frontmatter']
            document_id = frontmatter.get('id', str(rel_path))
            title = frontmatter.get('title', str(rel_path))

            # Embed and insert each chunk
            chunk_success = 0
            for chunk_idx, chunk in enumerate(chunks, 1):
                # Embed with rate limiting
                embedding = EmbeddingManager.embed_text(chunk, sleep_duration=CHUNK_SLEEP_DURATION)

                if not embedding:
                    print(f"   ✗ Failed to embed chunk {chunk_idx}/{len(chunks)}")
                    continue

                # Create and insert point
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

                try:
                    qdrant.insert_points([point])
                    chunk_success += 1
                except Exception as e:
                    print(f"   ✗ Failed to insert chunk {chunk_idx}: {e}")
                    continue

                # Show progress for large files
                if chunk_idx % 5 == 0:
                    print(f"   → Embedded {chunk_idx}/{len(chunks)} chunks")

            if chunk_success > 0:
                print(f"   ✓ Embedded {chunk_success}/{len(chunks)} chunks, inserted into Qdrant")
                total_inserted += chunk_success
            else:
                print(f"   ✗ No chunks successfully embedded")
                continue

            # Mark completed and save progress
            progress.mark_completed(file_path, chunk_success)

        except Exception as e:
            print(f"   ✗ Error processing file: {e}")
            continue

        # Sleep between files (except last file)
        if file_idx < len(md_files):
            sleep_time = random.randint(FILE_SLEEP_DURATION_MIN, FILE_SLEEP_DURATION_MAX)
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
