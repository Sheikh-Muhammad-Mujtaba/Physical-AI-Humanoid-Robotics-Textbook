# Plan: Optimize Qdrant Ingestion Script for Free Tier Embedding Model

**Feature:** 002-optimize-qdrant-ingestion
**Created:** 2025-12-18
**Implementation Timeline:** 2025-12-18 to 2025-12-19

## Scope & Dependencies

### In Scope
- Modify `scripts/ingest_qdrant.py` to ingest from both `docs/` and `blog/`
- Add sequential file processing (one file at a time)
- Implement 1-2 minute sleep between files for rate limiting
- Add progress tracking and resume capability
- Add comprehensive logging
- Add rate limit error handling

### Out of Scope
- Parallel ingestion
- Other data sources
- Collection schema changes (backward compatible)

### External Dependencies
- Google Generative AI API (already used)
- Qdrant vector database (already running)
- No new packages required (using existing: genai, qdrant-client)

## Architecture Decisions

### Decision 1: Sequential vs Parallel Processing
**Options:**
1. Sequential (current proposal): One file at a time, sleep between
2. Parallel with thread pool: Multiple files concurrently

**Chosen:** Sequential
**Rationale:**
- Free tier quotas are very restrictive (100 embeds/day on some tiers)
- Sequential is safer for quota management
- Simpler to debug and resume
- Can run overnight without resource concerns

### Decision 2: Progress State Storage
**Options:**
1. In-memory only: No resume capability
2. JSON file in project root: Persistent, portable, easy to inspect
3. Database table: More complex, overkill for this use case

**Chosen:** JSON file (`.qdrant_ingestion_state.json`)
**Rationale:**
- User can easily inspect progress
- Can be deleted to force full re-ingestion
- No database dependency
- Portable across environments

### Decision 3: Rate Limiting Strategy
**Options:**
1. Sleep between chunks only: Not enough
2. Sleep between files only: Current proposal
3. Both chunk and file level: Belt and suspenders

**Chosen:** Both (0.5s between chunks, 90s between files)
**Rationale:**
- Respects both batch and individual request quotas
- Safe for free tier usage
- Flexible: can be tuned if needed

### Decision 4: Error Handling
**Options:**
1. Fail fast: Stop on any error
2. Skip and continue: Log errors, keep going
3. Retry with backoff: Automatic recovery

**Chosen:** Retry with backoff for rate limits, skip for parse errors
**Rationale:**
- Rate limits are temporary, worth retrying
- Parse errors are file-specific, should skip and continue
- User gets visibility into what happened

## Implementation Steps

### Step 1: Refactor File Discovery (15 min)

**Current Code (line 253-266):**
```python
def get_markdown_files(docs_dir: Path) -> List[Path]:
    md_files = []
    for pattern in ['**/*.md', '**/*.mdx']:
        md_files.extend(docs_dir.glob(pattern))
    return sorted(md_files)
```

**Changes:**
- Add `source` parameter to tag files as 'docs' or 'blog'
- Return list of tuples: `(file_path, source)`
- Call twice (once for docs/, once for blog/)
- Merge and sort results

**New Code:**
```python
def get_markdown_files(base_dir: Path, source: str = 'docs') -> List[tuple]:
    """Find all markdown files with source tagging."""
    md_files = []
    for pattern in ['**/*.md', '**/*.mdx']:
        for file_path in base_dir.glob(pattern):
            md_files.append((file_path, source))
    return sorted(md_files, key=lambda x: str(x[0]))
```

**Location:** Line 253-266

### Step 2: Add ProgressTracker Class (20 min)

**New class** (add before `ingest_documents()`):

```python
class ProgressTracker:
    """Track ingestion progress and support resume."""

    def __init__(self, state_file: str = '.qdrant_ingestion_state.json'):
        self.state_file = Path(state_file)
        self.state = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        """Load progress from disk or initialize new state."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
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
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def reset(self):
        """Clear all progress (for --reset flag)."""
        self.state = {
            'completed_files': [],
            'total_chunks': 0,
            'total_points': 0,
            'last_updated': None,
        }
        self._save_state()

    def get_summary(self) -> str:
        """Get human-readable progress summary."""
        return (
            f"Completed: {len(self.state['completed_files'])} files, "
            f"{self.state['total_chunks']} chunks, "
            f"{self.state['total_points']} points"
        )
```

**Location:** New class before `ingest_documents()` function

### Step 3: Add Rate Limiting to EmbeddingManager (15 min)

**Current Code (line 195-250):**
```python
class EmbeddingManager:
    @staticmethod
    def embed_text(text: str) -> List[float]:
        # ... no rate limiting

    @staticmethod
    def embed_batch(texts: List[str], batch_size: int = 100):
        # ... processes all at once
```

**Changes:**
- Add `sleep_duration` parameter to `embed_text()` (default 0.5)
- Sleep AFTER each embedding API call
- Keep `embed_batch()` but mark as deprecated

**New Code:**
```python
import time

class EmbeddingManager:
    @staticmethod
    def embed_text(text: str, sleep_duration: float = 0.5) -> List[float]:
        """Embed text and sleep to respect rate limits."""
        try:
            text = text[:2000]
            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text
            )
            # Sleep after embedding
            if sleep_duration > 0:
                time.sleep(sleep_duration)
            return response['embedding']
        except Exception as e:
            if '429' in str(e) or 'quota' in str(e).lower():
                # Rate limit hit, wait and retry
                wait_time = 90 + random.randint(0, 30)
                print(f"      ⏳ Rate limited! Waiting {wait_time}s...")
                time.sleep(wait_time)
                # Retry once
                return EmbeddingManager.embed_text(text, sleep_duration=1.0)
            raise

    # Keep embed_batch for backward compatibility, but unused
```

**Location:** Update `EmbeddingManager` class (lines 195-250)

### Step 4: Refactor Main Ingestion Loop (30 min)

**Current Flow (line 269-382):**
- Parse ALL files
- Chunk ALL documents
- Embed ALL chunks
- Insert ALL points

**New Flow:**
- For each file sequentially:
  1. Skip if already completed
  2. Parse file
  3. Chunk content
  4. For each chunk:
     - Embed with rate limiting
     - Create point
     - Insert point
  5. Mark file completed and save state
  6. Sleep 90 seconds (unless last file)

**New Code Structure:**
```python
def ingest_documents(resume: bool = True, reset: bool = False):
    """Main ingestion with sequential processing and resume support."""
    print("=" * 70)
    print("Physical AI Textbook - Qdrant Data Ingestion (Optimized)")
    print("=" * 70)

    # Setup directories
    docs_dir = Path(__file__).parent.parent / 'docs'
    blog_dir = Path(__file__).parent.parent / 'blog'

    if not docs_dir.exists() or not blog_dir.exists():
        print(f"✗ Required directories not found")
        sys.exit(1)

    print(f"\n📂 Docs directory: {docs_dir}")
    print(f"📂 Blog directory: {blog_dir}")

    # Initialize progress tracker
    progress = ProgressTracker()
    if reset:
        progress.reset()
        print("🔄 Reset progress state")

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
    qdrant = QdrantManager()
    qdrant.create_collection()

    # Process files sequentially
    print(f"\n📖 Starting ingestion (resuming: {resume})...")
    print(f"📊 {progress.get_summary()}\n")

    for file_idx, (file_path, source) in enumerate(md_files, 1):
        # Skip if already processed
        if resume and progress.is_completed(file_path):
            print(f"⊘ [{file_idx}/{len(md_files)}] {file_path.name} (already ingested)")
            continue

        rel_path = file_path.relative_to(docs_dir if source == 'docs' else blog_dir)
        print(f"📄 [{file_idx}/{len(md_files)}] Processing {source}: {rel_path}")

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
            for chunk_idx, chunk in enumerate(chunks, 1):
                # Embed with rate limiting
                embedding = EmbeddingManager.embed_text(chunk, sleep_duration=0.5)

                if not embedding:
                    print(f"   ✗ Failed to embed chunk {chunk_idx}")
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
                qdrant.insert_points([point])

            print(f"   ✓ Embedded {len(chunks)} chunks, inserted into Qdrant")

            # Mark completed and save progress
            progress.mark_completed(file_path, len(chunks))

        except Exception as e:
            print(f"   ✗ Error: {e}")
            continue

        # Sleep between files (except last file)
        if file_idx < len(md_files):
            sleep_time = 60 + random.randint(0, 60)
            print(f"   ⏳ Sleeping {sleep_time}s before next file...\n")
            time.sleep(sleep_time)

    # Summary
    print("\n" + "=" * 70)
    print("✓ Ingestion Complete!")
    print(f"📊 {progress.get_summary()}")
    stats = qdrant.get_collection_stats()
    if stats:
        print(f"   Collection: {stats['name']}")
        print(f"   Total Points: {stats['points_count']}")
    print("=" * 70)
```

**Location:** Replace `ingest_documents()` function (lines 269-382)

### Step 5: Add CLI Argument Support (10 min)

**Update `__main__` block (line 384-395):**

```python
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Ingest markdown files into Qdrant vector database'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset progress state and re-ingest all files'
    )
    parser.add_argument(
        '--no-resume',
        action='store_true',
        help='Ignore previous progress and ingest all files'
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
```

**Location:** Replace bottom of file (lines 384-395)

### Step 6: Add Imports (5 min)

**Add at top of file:**
```python
import time
import random
import argparse
```

**Location:** After existing imports (line 15-22)

## Testing Strategy

### Test 1: Single File Processing
```bash
# Create test with just one file
cp scripts/ingest_qdrant.py scripts/ingest_qdrant_test.py

# Modify to use temp directories
# Run and verify:
# - File is parsed
# - Content is chunked
# - Points are inserted
# - Progress state is saved
```

### Test 2: Resume Capability
```bash
# Run partial ingestion (interrupt with Ctrl+C after 2-3 files)
python scripts/ingest_qdrant.py

# Check .qdrant_ingestion_state.json
cat .qdrant_ingestion_state.json

# Resume from where it left off
python scripts/ingest_qdrant.py
```

### Test 3: Rate Limit Handling
```bash
# Monitor logs for rate limit errors
# Verify backoff strategy works
# Should NOT exceed quota
```

### Test 4: Blog Directory Coverage
```bash
# Verify blog files are found
# Check that blog articles are in Qdrant
```

## Success Criteria

- ✅ All docs/ files ingested (14+ files)
- ✅ All blog/ files ingested (1+ files)
- ✅ No rate limit exceeded errors
- ✅ Progress state works (can resume)
- ✅ Clear logging at each step
- ✅ Takes less than 30 minutes total (with sleeps)
- ✅ Can be restarted with `--reset` flag

## Rollback Plan

If issues occur:
1. Stop the script (Ctrl+C)
2. Delete `.qdrant_ingestion_state.json`
3. Run `python scripts/ingest_qdrant.py --reset` to start fresh
4. Or revert to old script if needed

## Files to Modify

| File | Lines | Type |
|------|-------|------|
| `scripts/ingest_qdrant.py` | Various | Refactor |

## Deliverables

1. ✅ Updated `scripts/ingest_qdrant.py` with all changes
2. ✅ Clear, informative logging output
3. ✅ Progress state file (`.qdrant_ingestion_state.json`)
4. ✅ Documentation in code comments

