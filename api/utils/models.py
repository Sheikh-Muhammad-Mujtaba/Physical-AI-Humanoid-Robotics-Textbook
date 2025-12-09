from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

class ChatRequest(BaseModel):
    query: str
    session_id: uuid.UUID

class ChatResponse(BaseModel):
    message_id: uuid.UUID
    answer: str
    context: List[str] = []

class AskSelectionRequest(BaseModel):
    selection: str
    question: str
    session_id: uuid.UUID

class FeedbackRequest(BaseModel):
    message_id: uuid.UUID
    rating: int

class HistoryMessage(BaseModel):
    message_id: uuid.UUID
    session_id: uuid.UUID
    timestamp: datetime
    sender: str
    text: str

    class Config:
        orm_mode = True

class TextChunk(BaseModel):
    text: str
    source: Optional[str] = None
    page: Optional[int] = None