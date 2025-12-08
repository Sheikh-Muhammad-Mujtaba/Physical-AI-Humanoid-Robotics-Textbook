from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    context: List[str] = []

class AskSelectionRequest(BaseModel):
    selection: str
    question: str

class TextChunk(BaseModel):
    text: str
    source: Optional[str] = None
    page: Optional[int] = None
