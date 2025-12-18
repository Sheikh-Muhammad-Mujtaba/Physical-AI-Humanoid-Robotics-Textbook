# Tasks: Optimize Qdrant Ingestion Script for Free Tier Embedding Model

**Feature:** 002-optimize-qdrant-ingestion
**Estimated Effort:** 4-6 hours
**Status:** Ready for Implementation

## Task Breakdown

### Task 1: Add New Imports
**Effort:** 5 minutes
**Complexity:** Trivial
**Acceptance Criteria:**
- [ ] `import time` added
- [ ] `import random` added
- [ ] `import argparse` added
- [ ] `import uuid` added (already present, verify)
- [ ] Script runs without import errors

**Test Case:**
```bash
python scripts/ingest_qdrant.py --help
# Should show help without errors
```

---

### Task 2: Refactor File Discovery for Multi-Directory Support
**Effort:** 15 minutes
**Complexity:** Low
**Acceptance Criteria:**
- [ ] `get_markdown_files()` accepts `source` parameter
- [ ] Returns list of tuples: `(file_path, source)`
- [ ] Finds all .md and .mdx files in both docs/ and blog/
- [ ] Files sorted consistently
- [ ] No files missed or duplicated

**Test Cases:**
```bash
# Count files discovered
# Should include both docs/ and blog/ files
python -c "
from pathlib import Path
from scripts.ingest_qdrant import get_markdown_files

docs_dir = Path('docs')
blog_dir = Path('blog')

docs_files = get_markdown_files(docs_dir, source='docs')
blog_files = get_markdown_files(blog_dir, source='blog')

print(f'Docs: {len(docs_files)}')
print(f'Blog: {len(blog_files)}')
print('Sample:', docs_files[0] if docs_files else 'None')
"
```

**Code Location:** Update function at line 253-266

---

### Task 3: Implement ProgressTracker Class
**Effort:** 20 minutes
**Complexity:** Low
**Acceptance Criteria:**
- [ ] `ProgressTracker` class created
- [ ] Persists state to `.qdrant_ingestion_state.json`
- [ ] `is_completed(file_path)` returns boolean
- [ ] `mark_completed(file_path, chunk_count)` saves state
- [ ] `reset()` clears progress
- [ ] `get_summary()` returns readable string
- [ ] State file is valid JSON

**Test Cases:**
```bash
# Create tracker and verify persistence
python -c "
from scripts.ingest_qdrant import ProgressTracker
from pathlib import Path

tracker = ProgressTracker('.test_state.json')
tracker.reset()
tracker.mark_completed(Path('test.md'), 5)

# Verify file exists and is valid JSON
import json
state = json.load(open('.test_state.json'))
assert state['total_chunks'] == 5
assert 'test.md' in str(state['completed_files'][0])
print('✓ ProgressTracker works correctly')
"
```

**Code Location:** New class before `ingest_documents()` function

---

### Task 4: Update EmbeddingManager for Rate Limiting
**Effort:** 15 minutes
**Complexity:** Low
**Acceptance Criteria:**
- [ ] `embed_text()` accepts `sleep_duration` parameter (default 0.5)
- [ ] Sleeps after each API call
- [ ] Handles 429 (rate limit) errors gracefully
- [ ] Retries once on rate limit with longer sleep
- [ ] Returns embedding vector on success
- [ ] Returns None on failure

**Test Cases:**
```bash
# Test rate limit handling (use mock or actual API)
# Verify sleep duration is respected

python -c "
import time
from scripts.ingest_qdrant import EmbeddingManager

start = time.time()
# This should sleep for ~0.5 seconds
result = EmbeddingManager.embed_text('test', sleep_duration=0.5)
elapsed = time.time() - start

assert elapsed >= 0.5, f'Sleep not applied: {elapsed}s'
assert isinstance(result, list) or result is None
print(f'✓ Embedding with sleep worked ({elapsed:.1f}s)')
"
```

**Code Location:** Update `EmbeddingManager` class (lines 195-250)

---

### Task 5: Refactor Main Ingestion Loop
**Effort:** 30 minutes
**Complexity:** Medium
**Acceptance Criteria:**
- [ ] Processes files one at a time (sequential)
- [ ] Skips completed files when resuming
- [ ] Parses each file before processing
- [ ] Creates chunks from parsed content
- [ ] Embeds each chunk with rate limiting
- [ ] Inserts points into Qdrant immediately (not batched)
- [ ] Saves progress after each file
- [ ] Sleeps 60-120 seconds between files
- [ ] Handles errors gracefully (skip and continue)
- [ ] Provides detailed progress logging

**Test Cases:**
```bash
# Test with small dataset (modify to process only 2 files)
python scripts/ingest_qdrant.py --reset

# Verify output includes:
# - File processing counter [X/Y]
# - Chunk counts for each file
# - Progress state saved
# - Sleep messages between files

# Interrupt and resume
# Ctrl+C during execution
# python scripts/ingest_qdrant.py
# Should skip completed files
```

**Code Location:** Replace `ingest_documents()` function (lines 269-382)

---

### Task 6: Add CLI Argument Support
**Effort:** 10 minutes
**Complexity:** Low
**Acceptance Criteria:**
- [ ] `--reset` flag clears progress and re-ingests all files
- [ ] `--no-resume` flag ignores previous progress
- [ ] `--help` shows usage information
- [ ] Default behavior resumes from last checkpoint
- [ ] Ctrl+C saves progress before exiting

**Test Cases:**
```bash
# Test help
python scripts/ingest_qdrant.py --help
# Should show argument descriptions

# Test reset flag
python scripts/ingest_qdrant.py --reset
# Should start fresh even if .qdrant_ingestion_state.json exists

# Test no-resume flag
python scripts/ingest_qdrant.py --no-resume
# Should ingest all files but not save progress

# Test default (resume)
python scripts/ingest_qdrant.py
# Should resume from .qdrant_ingestion_state.json if exists
```

**Code Location:** Update `__main__` block (lines 384-395)

---

### Task 7: Manual Integration Testing
**Effort:** 45 minutes
**Complexity:** Medium
**Acceptance Criteria:**
- [ ] Script runs without errors
- [ ] Ingests all docs/ files (~14 files)
- [ ] Ingests all blog/ files (~1-2 files)
- [ ] No rate limit exceeded errors
- [ ] Progress state saves correctly
- [ ] Can interrupt and resume successfully
- [ ] `--reset` flag works correctly
- [ ] Qdrant collection contains all points
- [ ] Points have correct metadata (source field)
- [ ] Logging is clear and informative
- [ ] Total ingestion time is reasonable (~20-30 minutes)

**Test Steps:**
1. Start fresh: `rm .qdrant_ingestion_state.json`
2. Run: `python scripts/ingest_qdrant.py --reset`
3. Monitor:
   - Check progress every 5 minutes
   - Verify timestamps are recent
   - Look for any error messages
4. After completion:
   - Check Qdrant collection points count
   - Query for docs vs blog content
   - Verify metadata has 'source' field
5. Test resume:
   - Delete `.qdrant_ingestion_state.json`
   - Add one more file to blog/
   - Run again - should ingest only new file
6. Test interrupt/resume:
   - Start ingestion
   - Press Ctrl+C after 2 files
   - Check `.qdrant_ingestion_state.json`
   - Run again - should skip first 2 files

**Test Commands:**
```bash
# Start ingestion
python scripts/ingest_qdrant.py --reset

# Query Qdrant to verify content
python -c "
from qdrant_client import QdrantClient

client = QdrantClient(url='https://e15688f5-8901-4a7e-a660-2c118f64241a.us-east4-0.gcp.cloud.qdrant.io')
collection = client.get_collection('textbook_chunks')
print(f'Total points: {collection.points_count}')

# Count by source
from qdrant_client.models import Filter, FieldCondition, MatchValue
docs_count = client.count(
    collection_name='textbook_chunks',
    count_filter=Filter(
        must=[FieldCondition(
            key='source',
            match=MatchValue(value='docs')
        )]
    )
).count
print(f'Docs points: {docs_count}')
"
```

---

### Task 8: Documentation & Cleanup
**Effort:** 15 minutes
**Complexity:** Trivial
**Acceptance Criteria:**
- [ ] Docstring updated for all new functions
- [ ] Inline comments explain rate limiting strategy
- [ ] README or script header updated with new flags
- [ ] No debugging print statements left
- [ ] Code follows existing style conventions
- [ ] No trailing whitespace or lint errors

**Checklist:**
- [ ] Format: `black scripts/ingest_qdrant.py`
- [ ] Lint: `pylint scripts/ingest_qdrant.py` (check for errors)
- [ ] All docstrings present and accurate
- [ ] Example usage in header comments

---

## Testing Checklist

### Unit Tests (if applicable)
- [ ] `ProgressTracker.is_completed()` works
- [ ] `ProgressTracker.mark_completed()` persists
- [ ] `get_markdown_files()` finds all files
- [ ] `EmbeddingManager.embed_text()` respects sleep

### Integration Tests
- [ ] Full script runs end-to-end
- [ ] All files processed without errors
- [ ] Progress state is correct after completion
- [ ] Resume works from checkpoint
- [ ] Reset clears progress

### Smoke Tests
- [ ] Script exits cleanly on Ctrl+C
- [ ] Error messages are informative
- [ ] No API errors or timeouts
- [ ] Qdrant collection has data

---

## Definition of Done

✅ All tasks completed
✅ All test cases pass
✅ Code reviewed
✅ Commit pushed to main
✅ PHR (Prompt History Record) created
✅ No breaking changes to existing functionality

---

## Blockers & Dependencies

**Blockers:** None
**Dependencies:**
- Google Embedding API accessible
- Qdrant server running
- Network connectivity stable

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| API key expired | Update GOOGLE_API_KEY in .env |
| Qdrant unreachable | Check Qdrant URL in QDRANT_URL |
| Out of quota | Wait 24 hours, then retry |

