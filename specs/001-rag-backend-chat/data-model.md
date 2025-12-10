# Data Model: RAG Backend API & Chat Integration

This document defines the Pydantic models used for data exchange in the RAG Backend API.

## Pydantic Models

### ChatRequest

-   **Description**: Represents a request to the `/api/chat` endpoint.
-   **Fields**:
    -   `query` (string): The user's question or prompt.

### ChatResponse

-   **Description**: Represents a response from the `/api/chat` endpoint.
-   **Fields**:
    -   `answer` (string): The LLM-generated answer.
    -   `context` (List[string]): A list of text snippets used as context for the answer.

### AskSelectionRequest

-   **Description**: Represents a request to the `/api/ask-selection` endpoint.
-   **Fields**:
    -   `selection` (string): The user-selected text snippet from the textbook.
    -   `question` (string): A specific question about the selected text.

### TextChunk

-   **Description**: Represents a chunk of text from the textbook, used for RAG.
-   **Fields**:
    -   `text` (string): The content of the text chunk.
    -   `source` (string, optional): The source of the text (e.g., file name, chapter title).
    -   `page` (integer, optional): The page number or relative position of the text.
