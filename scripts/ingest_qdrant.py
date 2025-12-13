#!/usr/bin/env python3
"""
Qdrant Data Ingestion Script for Physical AI Textbook

This script:
1. Reads Markdown files from docs/ directory
2. Splits content into chunks
3. Embeds chunks using Google's embedding model
4. Stores embeddings in Qdrant vector database

Usage:
    python scripts/ingest_qdrant.py
"""

import sys
import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any
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
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GEMINI_API_KEY:
    print("ERROR: GOOGLE_API_KEY environment variable not set")
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
                content = content[end_idx+3:].strip()
        
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
            print(f"✓ Inserted {len(points)} points into collection")
        except Exception as e:
            print(f"✗ Error inserting points: {e}")
            sys.exit(1)
    
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
    """Manage text embeddings using Google's API."""
    
    @staticmethod
    def embed_text(text: str) -> List[float]:
        """
        Embed text using Google's embedding model.
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector
        """
        try:
            # Truncate text to reasonable length for embedding
            text = text[:2000]  # Google's limit is typically 2048 tokens
            
            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text
            )
            return response['embedding']
        except Exception as e:
            print(f"✗ Error embedding text: {e}")
            return None
    
    @staticmethod
    def embed_batch(texts: List[str], batch_size: int = 100) -> List[List[float]]:
        """
        Embed multiple texts in batches.
        
        Args:
            texts: List of texts to embed
            batch_size: Number of texts per batch
        
        Returns:
            List of embedding vectors
        """
        embeddings = []
        total = len(texts)
        
        for i in range(0, total, batch_size):
            batch = texts[i:i+batch_size]
            print(f"  Embedding batch {i//batch_size + 1}/{(total + batch_size - 1)//batch_size}...", end=' ')
            
            batch_embeddings = []
            for text in batch:
                embedding = EmbeddingManager.embed_text(text)
                if embedding:
                    batch_embeddings.append(embedding)
            
            embeddings.extend(batch_embeddings)
            print(f"✓")
        
        return embeddings


def get_markdown_files(docs_dir: Path) -> List[Path]:
    """
    Recursively find all markdown files in docs directory.
    
    Args:
        docs_dir: Path to docs directory
    
    Returns:
        List of markdown file paths
    """
    md_files = []
    for pattern in ['**/*.md', '**/*.mdx']:
        md_files.extend(docs_dir.glob(pattern))
    return sorted(md_files)


def ingest_documents():
    """Main ingestion function."""
    print("=" * 60)
    print("Physical AI Textbook - Qdrant Data Ingestion")
    print("=" * 60)
    
    # Setup paths
    docs_dir = Path(__file__).parent.parent / 'docs'
    if not docs_dir.exists():
        print(f"✗ Docs directory not found: {docs_dir}")
        sys.exit(1)
    
    print(f"\n📂 Documents directory: {docs_dir}")
    
    # Find markdown files
    md_files = get_markdown_files(docs_dir)
    if not md_files:
        print("✗ No markdown files found in docs directory")
        sys.exit(1)
    
    print(f"✓ Found {len(md_files)} markdown files")
    
    # Initialize managers
    qdrant = QdrantManager()
    qdrant.create_collection()
    
    # Parse documents and create chunks
    print("\n📖 Processing documents...")
    all_chunks: List[Dict[str, Any]] = []
    
    for file_path in md_files:
        rel_path = file_path.relative_to(docs_dir)
        print(f"\n  📄 {rel_path}")
        
        try:
            parsed = MarkdownParser.parse_file(file_path)
            frontmatter = parsed['frontmatter']
            content = parsed['content']
            
            if not content.strip():
                print(f"    ⚠️  No content")
                continue
            
            # Extract metadata
            document_id = frontmatter.get('id', str(rel_path))
            title = frontmatter.get('title', str(rel_path))
            
            # Split into chunks
            chunks = MarkdownParser.chunk_text(content)
            print(f"    ✓ {len(chunks)} chunks")
            
            for chunk_idx, chunk in enumerate(chunks):
                all_chunks.append({
                    'text': chunk,
                    'document_id': document_id,
                    'title': title,
                    'file_path': str(rel_path),
                    'chunk_index': chunk_idx,
                    'file_name': file_path.name,
                })
        
        except Exception as e:
            print(f"    ✗ Error processing file: {e}")
            continue
    
    if not all_chunks:
        print("\n✗ No chunks to embed")
        sys.exit(1)
    
    print(f"\n✓ Created {len(all_chunks)} chunks total")
    
    # Embed chunks
    print("\n🤖 Embedding chunks...")
    texts_to_embed = [chunk['text'] for chunk in all_chunks]
    embeddings = EmbeddingManager.embed_batch(texts_to_embed)
    
    if len(embeddings) != len(all_chunks):
        print(f"\n✗ Embedding count mismatch: {len(embeddings)} vs {len(all_chunks)}")
        sys.exit(1)
    
    print(f"✓ Embedded {len(embeddings)} chunks")
    
    # Create Qdrant points
    print("\n💾 Creating Qdrant points...")
    points = []
    for idx, (chunk, embedding) in enumerate(zip(all_chunks, embeddings)):
        point = PointStruct(
            id=idx,
            vector=embedding,
            payload={
                'text': chunk['text'],
                'document_id': chunk['document_id'],
                'title': chunk['title'],
                'file_path': chunk['file_path'],
                'file_name': chunk['file_name'],
                'chunk_index': chunk['chunk_index'],
                'ingested_at': datetime.now().isoformat(),
            }
        )
        points.append(point)
    
    # Insert into Qdrant
    qdrant.insert_points(points)
    
    # Print summary
    print("\n" + "=" * 60)
    stats = qdrant.get_collection_stats()
    if stats:
        print("✓ Ingestion Complete!")
        print(f"  Collection: {stats['name']}")
        print(f"  Total Points: {stats['points_count']}")
        print(f"  Vector Dimension: {stats['vector_size']}")
    print("=" * 60)


if __name__ == '__main__':
    try:
        ingest_documents()
    except KeyboardInterrupt:
        print("\n\n✗ Ingestion interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
