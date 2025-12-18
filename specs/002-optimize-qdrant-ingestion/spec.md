# Spec: Optimize Qdrant Ingestion Script for Free Tier Embedding Model

**Feature ID:** 002-optimize-qdrant-ingestion
**Status:** In Specification
**Created:** 2025-12-18
**Priority:** High

## Problem Statement

The current `scripts/ingest_qdrant.py` script:
- Only ingests files from `docs/` folder
- Does NOT ingest files from `blog/` folder
- Embeds chunks in rapid succession without rate limiting
- May exceed Google's free tier embedding model quotas (100 requests/day)
- No progress tracking or resume capability
- Cannot handle long-running ingestion gracefully

This results in:
- Incomplete knowledge base (missing blog articles)
- Potential API rate limit errors
- Loss of progress if ingestion fails partway through
- Unclear visibility into ingestion status

## Success Criteria

### Functional Requirements
- ✅ Script ingests all `.md` and `.mdx` files from BOTH `docs/` AND `blog/` directories
- ✅ Process files one at a time sequentially (not in batch)
- ✅ Add 1-2 minute sleep between files to respect free tier quotas
- ✅ Track progress and support resume from last completed file
- ✅ Provide clear logging of what's being ingested and why
- ✅ Handle rate limit errors gracefully (retry with backoff)

### Non-Functional Requirements
- ✅ Must respect free tier rate limits (no quota exceeded errors)
- ✅ Total ingestion time acceptable (can take hours, that's fine)
- ✅ Graceful shutdown on Ctrl+C (save progress state)
- ✅ Maintain backward compatibility with existing Qdrant collection

## Design Details

### Current Architecture
```
ingest_qdrant.py
├── MarkdownParser: Parse MD/MDX files
├── QdrantManager: Manage Qdrant collection
├── EmbeddingManager: Call Google embedding API
└── Main Flow:
    1. Find all files
    2. Parse all files (in memory)
    3. Chunk all documents (in memory)
    4. Embed all chunks (batched)
    5. Insert all points at once
```

### Proposed Architecture
```
ingest_qdrant.py (refactored)
├── MarkdownParser: Parse MD/MDX files
├── QdrantManager: Manage Qdrant collection
├── EmbeddingManager: Call Google embedding API + rate limiting
├── ProgressTracker: Track completed files
└── Main Flow:
    1. Load progress state (which files done)
    2. Find all files from docs/ AND blog/
    3. For each file (sequentially):
       a. Parse file
       b. Chunk content
       c. Embed chunks (with sleep between)
       d. Insert points into Qdrant
       e. Save progress
       f. Sleep 1-2 minutes
    4. Save final state
```

### Key Changes

#### 1. Multi-Directory Support
**Current:**
```python
docs_dir = Path(__file__).parent.parent / 'docs'
md_files = get_markdown_files(docs_dir)
```

**Proposed:**
```python
docs_dir = Path(__file__).parent.parent / 'docs'
blog_dir = Path(__file__).parent.parent / 'blog'

md_files_docs = get_markdown_files(docs_dir, source='docs')
md_files_blog = get_markdown_files(blog_dir, source='blog')
md_files = sorted(md_files_docs + md_files_blog)
```

#### 2. Sequential File Processing with Sleep
**Current:**
```python
# All chunks embedded in batch
embeddings = EmbeddingManager.embed_batch(texts_to_embed)
```

**Proposed:**
```python
for file_idx, file_path in enumerate(md_files):
    # Process ONE file at a time
    parsed = MarkdownParser.parse_file(file_path)
    chunks = MarkdownParser.chunk_text(parsed['content'])

    # Embed only this file's chunks (with per-chunk sleep)
    for chunk_idx, chunk in enumerate(chunks):
        embedding = EmbeddingManager.embed_text(chunk)
        # Insert point immediately
        qdrant.insert_single_point(embedding, metadata)

        # Sleep between chunks
        if chunk_idx < len(chunks) - 1:
            sleep(0.5)  # Small sleep between chunks

    # Major sleep between files
    if file_idx < len(md_files) - 1:
        sleep(60 + random.randint(0, 60))  # 1-2 minutes

    # Save progress
    save_progress_state(file_idx)
```

#### 3. Progress Tracking
**Add ProgressTracker class:**
```python
class ProgressTracker:
    """Track ingestion progress and support resume."""

    def __init__(self, state_file='.qdrant_ingestion_state.json'):
        self.state_file = state_file
        self.state = self.load_state()

    def load_state(self):
        """Load previous progress state."""
        if self.state_file.exists():
            return json.load(open(self.state_file))
        return {
            'completed_files': [],
            'total_chunks': 0,
            'total_points': 0,
            'last_updated': None,
            'version': 1,
        }

    def is_completed(self, file_path):
        """Check if file already processed."""
        return str(file_path) in self.state['completed_files']

    def mark_completed(self, file_path, chunk_count):
        """Mark file as completed."""
        self.state['completed_files'].append(str(file_path))
        self.state['total_chunks'] += chunk_count
        self.state['last_updated'] = datetime.now().isoformat()
        self.save_state()

    def save_state(self):
        """Save progress state to file."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
```

#### 4. Rate Limiting
**Current:**
```python
# No rate limiting
for text in batch:
    embedding = EmbeddingManager.embed_text(text)
```

**Proposed:**
```python
def embed_text_with_rate_limit(text, rate_limit_sleep=1.0):
    """Embed text with configurable rate limiting."""
    try:
        response = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text[:2000]
        )
        # Sleep after each embedding to avoid quota
        time.sleep(rate_limit_sleep)
        return response['embedding']
    except Exception as e:
        if '429' in str(e) or 'quota' in str(e).lower():
            # Rate limited, wait and retry
            wait_time = 60 + random.randint(0, 30)
            print(f"Rate limited, waiting {wait_time}s...")
            time.sleep(wait_time)
            return embed_text_with_rate_limit(text, rate_limit_sleep)
        raise
```

#### 5. Enhanced Logging
**Add structured logging:**
```
[09:15:22] Starting ingestion (1 from docs/, 1 from blog/ - 16 files total)
[09:15:23] Processing: docs/intro.mdx (1/16)
[09:15:25]   ✓ Parsed: 1200 chars
[09:15:30]   ✓ Chunked: 4 chunks
[09:15:32]   ✓ Embedded chunk 1/4
[09:15:33]   ✓ Embedded chunk 2/4
[09:15:34]   ✓ Embedded chunk 3/4
[09:15:35]   ✓ Embedded chunk 4/4
[09:15:36]   ✓ Inserted 4 points
[09:15:36] ⏳ Sleeping 62 seconds before next file...
[09:16:38] Processing: docs/module1-introduction.../what-is-physical-ai.md (2/16)
...
```

## Implementation Plan

### Phase 1: Core Changes
1. Update `get_markdown_files()` to accept source parameter
2. Add collection search pattern for blog/ directory
3. Refactor main loop for sequential processing

### Phase 2: Progress Tracking
1. Create ProgressTracker class
2. Add state file management
3. Implement resume logic

### Phase 3: Rate Limiting
1. Add configurable sleep between chunks (default 0.5s)
2. Add configurable sleep between files (default 90s)
3. Add quota error handling with exponential backoff

### Phase 4: Testing & Polish
1. Test with sample data
2. Verify progress state persists
3. Add command-line flags (--resume, --reset, --dry-run)
4. Update documentation

## Database Schema

No schema changes. The PointStruct payload will include:
```python
{
    'text': str,
    'document_id': str,
    'title': str,
    'file_path': str,  # e.g., 'docs/module1/intro.md' or 'blog/post.md'
    'source': str,     # NEW: 'docs' or 'blog'
    'file_name': str,
    'chunk_index': int,
    'ingested_at': str (ISO datetime),
}
```

## Migration & Rollout

### Breaking Changes
- None. Existing collection continues to work.

### Backward Compatibility
- Old ingestion runs can be resumed (progress state is optional).
- If no progress state, ingests everything from scratch.

### Deployment Steps
1. Update `scripts/ingest_qdrant.py`
2. Commit changes
3. Run: `python scripts/ingest_qdrant.py --resume` (or `--reset` for fresh start)
4. Monitor logs for rate limit issues
5. Verify all documents in Qdrant collection

## Success Metrics

- ✅ All files from `docs/` ingested (currently ~14 files)
- ✅ All files from `blog/` ingested (currently ~1 file)
- ✅ Zero quota exceeded errors during ingestion
- ✅ Ingestion completes without requiring manual intervention
- ✅ Progress can be resumed if interrupted
- ✅ Clear logging shows what's happening at each step

## Timeline

- **Planning:** 2025-12-18
- **Implementation:** 2025-12-18 to 2025-12-19
- **Testing:** 2025-12-19
- **Deployment:** 2025-12-19

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Rate limit errors | Ingestion fails | Implement exponential backoff, increase sleep time |
| Progress state corruption | Resume fails | Validate state file, provide --reset flag |
| Long ingestion time | Resource waste | Acceptable - can run overnight |
| Missing files in blog/ | Incomplete KB | Verify blog files are found in glob pattern |

## Open Questions

1. Should we support parallel ingestion with thread pool? (NO - keep sequential for quota safety)
2. Should we ingest from other sources (e.g., GitHub issues)? (NO - out of scope)
3. How often should ingestion run? (Weekly/monthly? User decides)

## References

- [Google Embedding Model Quotas](https://ai.google.dev/docs/quotas)
- [Qdrant API Reference](https://qdrant.tech/documentation/concepts/payload/)
- Current script: `scripts/ingest_qdrant.py`

