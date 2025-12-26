# Data Model: Agent Search

## Entities

### TextChunk

Represents a segment of text retrieved from the vector database.

| Field | Type | Description |
|-------|------|-------------|
| `text` | `str` | The actual text content of the chunk. |
| `source` | `Optional[str]` | The origin of the text (e.g., filename, chapter title). |
| `page` | `Optional[int]` | The page number in the original document (if applicable). |
| `score` | `Optional[float]` | The similarity score from the vector search (0.0 to 1.0). |

## Database Schema (Qdrant)

**Collection Name**: `textbook_chunks`

**Vector Configuration**:
- **Size**: 768
- **Distance**: Cosine

**Payload Schema**:
```json
{
  "text": "string",
  "source": "string",
  "page": "integer"
}
```
