import sys
import os
import uuid
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, function_tool, set_tracing_disabled

# Add the utils directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'utils')))

from config import Config
from models import ChatRequest, ChatResponse, AskSelectionRequest, HistoryMessage, FeedbackRequest
from tools import search_book_content, format_context
from database import create_tables, get_db
from sql_models import ChatHistory, Feedback
from auth import get_current_user_from_session  # Use session-based auth instead of JWT

# Initialize Config to load environment variables
config = Config()

# Disable tracing for the agent SDK
set_tracing_disabled(disabled=True)

# Create two AsyncOpenAI clients: one for chat, one for embeddings
chat_client = AsyncOpenAI(api_key=config.GEMINI_API_KEY, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
embedding_client = AsyncOpenAI(api_key=config.GEMINI_API_KEY, base_url="https://generativelanguage.googleapis.com/v1beta/")


# Define the search tool
@function_tool
async def search_tool(query: str) -> str:
    """Searches the textbook for relevant content."""
    try:
        query_embedding_response = await embedding_client.embeddings.create(model="models/embedding-001", input=[query])
        query_embedding = query_embedding_response.data[0].embedding
    except Exception as e:
        print(f"Error embedding query: {e}")
        return "I'm sorry, I couldn't process your request to understand the query."

    context_chunks = []
    try:
        context_chunks = search_book_content(query_embedding)
    except Exception as e:
        print(f"Warning: Qdrant search failed: {e}. Proceeding with generic LLM response.")
        return "I'm currently unable to retrieve specific context from the textbook, but I can still try to answer generally."

    return format_context(context_chunks)

# Global agent variable
agent: Agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: Initialize the Agent
    global agent
    if not config.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set. Features will be limited or unavailable.")
    
    agent = Agent(
        name="PhysicalAIAssistant",
        instructions="You are an AI assistant specialized in Physical AI and Humanoid Robotics. Answer questions based on the context provided by the search_tool. If the tool returns no relevant context, say so and answer based on your general knowledge.",
        model=OpenAIChatCompletionsModel(model="gemini-2.5-flash", openai_client=chat_client),
        tools=[search_tool]
    )

    # Initialize database tables
    try:
        create_tables()
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}. Database features might be unavailable.")

    # Test Qdrant connection if possible
    try:
        qdrant_client = config.get_qdrant_client()
        qdrant_client.get_collections()
        print("Qdrant client initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize Qdrant client: {e}. RAG features might be unavailable.")

    yield
    # Shutdown event
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Configure CORS for production security
# In production, restrict to specific origins
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

# Add Vercel preview deployment URLs if they exist
vercel_url = os.getenv("VERCEL_URL")
if vercel_url and f"https://{vercel_url}" not in allowed_origins:
    allowed_origins.append(f"https://{vercel_url}")

if "*" in allowed_origins:
    # Development mode - allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Production mode - restrict to specific origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

@app.get("/api/health", response_model=dict)
async def health_check():
    return {"status": "ok"}

@app.get("/api/history/{session_id}", response_model=List[HistoryMessage])
async def get_history(session_id: uuid.UUID, user_id: str = Depends(get_current_user_from_session), db: Session = Depends(get_db)):
    """Get chat history for a session. Requires valid session cookie."""
    try:
        history = db.query(ChatHistory).filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user_id
        ).order_by(ChatHistory.timestamp).all()
        return history
    except Exception as e:
        print(f"Error retrieving history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve chat history.")


@app.get("/api/user/history", response_model=List[HistoryMessage])
async def get_user_history(user_id: str = Depends(get_current_user_from_session), db: Session = Depends(get_db)):
    """Get all chat history for the authenticated user across all sessions."""
    try:
        history = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.timestamp.desc()).limit(100).all()
        return history
    except Exception as e:
        print(f"Error retrieving user history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve user history.")

@app.post("/api/feedback", response_model=dict)
async def feedback(feedback_request: FeedbackRequest, user_id: str = Depends(get_current_user_from_session), db: Session = Depends(get_db)):
    """Submit feedback for a message. Requires valid session cookie."""
    try:
        # Verify the message exists
        message = db.query(ChatHistory).filter(
            ChatHistory.message_id == feedback_request.message_id,
            ChatHistory.user_id == user_id
        ).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found or you are not the owner.")

        feedback_entry = Feedback(message_id=feedback_request.message_id, rating=feedback_request.rating)
        db.add(feedback_entry)
        db.commit()
        return {"status": "Feedback received"}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error saving feedback: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save feedback.")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(chat_request: ChatRequest, user_id: str = Depends(get_current_user_from_session), db: Session = Depends(get_db)):
    """Send a chat message. Requires valid session cookie."""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not configured.")

    user_message = ChatHistory(session_id=chat_request.session_id, user_id=user_id, sender="user", text=chat_request.query)
    db.add(user_message)
    db.commit()

    try:
        result = await Runner.run(agent, chat_request.query)
        llm_answer = result.final_output

        bot_message = ChatHistory(session_id=chat_request.session_id, user_id=user_id, sender="bot", text=llm_answer)
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)

        return ChatResponse(message_id=bot_message.message_id, answer=llm_answer, context=[])
    except Exception as e:
        print(f"Error during agent run: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")

@app.post("/api/ask-selection", response_model=ChatResponse)
async def ask_selection(selection_request: AskSelectionRequest, user_id: str = Depends(get_current_user_from_session), db: Session = Depends(get_db)):
    """Ask a question about selected text. Requires valid session cookie."""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not configured.")

    user_message_text = f"Selection: {selection_request.selection}\nQuestion: {selection_request.question}"
    user_message = ChatHistory(session_id=selection_request.session_id, user_id=user_id, sender="user", text=user_message_text)
    db.add(user_message)
    db.commit()

    prompt = f"""You are an expert AI tutor helping students understand Physical AI and Humanoid Robotics concepts.

The student has highlighted/selected the following text from the textbook:
---
"{selection_request.selection}"
---

The student's question about this selection:
"{selection_request.question}"

Instructions:
1. First, acknowledge what the student has selected and show you understand the context.
2. Directly answer their specific question about the selected text.
3. Explain the concept in simple, clear terms - assume the student is learning this for the first time.
4. If relevant, provide examples or analogies to make the concept easier to understand.
5. If the selection contains technical terms, briefly define them.
6. Use the search_tool to find additional relevant context from the textbook if needed.

Be concise but thorough. Focus on helping the student truly understand the selected content.
"""
    try:
        result = await Runner.run(agent, prompt)
        llm_answer = result.final_output

        bot_message = ChatHistory(session_id=selection_request.session_id, user_id=user_id, sender="bot", text=llm_answer)
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)

        return ChatResponse(message_id=bot_message.message_id, answer=llm_answer, context=[])
    except Exception as e:
        print(f"Error during agent run: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")
