import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Add the utils directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'utils')))

from config import Config
from models import ChatRequest, ChatResponse, AskSelectionRequest
from helpers import GeminiHelper
from tools import search_book_content, format_context

# Initialize Config to load environment variables
config = Config()

# Initialize GeminiHelper (lazy initialization will be handled by Config for Qdrant)
# For GeminiHelper, API key is directly passed
gemini_helper: GeminiHelper = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: Initialize GeminiHelper
    global gemini_helper
    if not config.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set. Gemini features will be limited or unavailable.")
    gemini_helper = GeminiHelper(api_key=config.GEMINI_API_KEY)
    
    # Lazy initialization for Qdrant client is already handled in Config.get_qdrant_client()
    # Test Qdrant connection if possible (optional, might slow down startup)
    try:
        qdrant_client = config.get_qdrant_client()
        # Attempt to get a collection or perform a simple operation to check connection
        # This might fail if the collection doesn't exist yet, but confirms client initialization
        qdrant_client.get_collections() 
        print("Qdrant client initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize Qdrant client: {e}. RAG features might be unavailable.")

    yield
    # Shutdown event: (Optional) close any resources
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=dict)
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not gemini_helper or not gemini_helper.api_key:
        raise HTTPException(status_code=500, detail="Gemini API not configured.")

    try:
        # Input cleansing (FR-014: Attempt to parse/cleanse invalid input)
        # For a simple string query, cleansing might involve basic sanitization
        # or validation that it's not excessively long. For this example, we'll
        # assume the Pydantic model handles basic type validation.
        # More advanced cleansing would depend on specific threat models.
        
        query_embedding = gemini_helper.embed_text([request.query])[0]
    except Exception as e:
        # Fallback for LLM embedding failure
        print(f"Error embedding query: {e}")
        return ChatResponse(answer="I'm sorry, I couldn't process your request to understand the query.", context=[])

    context_chunks = []
    try:
        context_chunks = search_book_content(query_embedding)
    except Exception as e:
        # Qdrant unavailability fallback (FR-004/005)
        print(f"Warning: Qdrant search failed: {e}. Proceeding with generic LLM response.")
        return ChatResponse(
            answer="I'm currently unable to retrieve specific context from the textbook, but I can still try to answer generally.",
            context=[]
        )

    formatted_context = format_context(context_chunks)
    
    prompt = f"""You are an AI assistant specialized in Physical AI and Humanoid Robotics.
Answer the following question based ONLY on the provided context from the textbook.
If the question cannot be answered from the context, state that you cannot answer from the provided information and provide a general answer based on your knowledge.

Context:
{formatted_context}

Question: {request.query}
Answer:
"""
    try:
        llm_answer = gemini_helper.generate_response(prompt)
        return ChatResponse(answer=llm_answer, context=[c.text for c in context_chunks])
    except Exception as e:
        # LLM unresponsiveness/error fallback (FR-006) or rate limits (FR-015)
        print(f"Error generating LLM response: {e}")
        return ChatResponse(
            answer="I'm sorry, I'm currently experiencing technical difficulties. Please try again later.",
            context=[]
        )

@app.post("/api/ask-selection", response_model=ChatResponse)
async def ask_selection(request: AskSelectionRequest):
    if not gemini_helper or not gemini_helper.api_key:
        raise HTTPException(status_code=500, detail="Gemini API not configured.")

    try:
        # Input cleansing (FR-014) - similar to chat endpoint
        selected_text_embedding = gemini_helper.embed_text([request.selection])[0]
    except Exception as e:
        print(f"Error embedding selected text: {e}")
        return ChatResponse(answer="I'm sorry, I couldn't process your selected text.", context=[])

    context_chunks = []
    try:
        context_chunks = search_book_content(selected_text_embedding)
    except Exception as e:
        # Qdrant unavailability fallback (FR-004/005)
        print(f"Warning: Qdrant search failed: {e}. Proceeding with generic LLM response.")
        return ChatResponse(
            answer="I'm currently unable to retrieve specific context from the textbook for your selection, but I can still try to answer generally.",
            context=[]
        )

    formatted_context = format_context(context_chunks)
    
    prompt = f"""You are an AI assistant specialized in Physical AI and Humanoid Robotics.
The user has selected the following text from the textbook:
"{request.selection}"

And asked the following question about it:
"{request.question}"

Based ONLY on the provided selected text and the retrieved context, explain the answer to the question.
If the question cannot be answered from the provided information, state that you cannot answer from the provided information and provide a general answer based on your knowledge.

Context:
{formatted_context}

Answer:
"""
    try:
        llm_answer = gemini_helper.generate_response(prompt)
        return ChatResponse(answer=llm_answer, context=[c.text for c in context_chunks])
    except Exception as e:
        # LLM unresponsiveness/error fallback (FR-006) or rate limits (FR-015)
        print(f"Error generating LLM response: {e}")
        return ChatResponse(
            answer="I'm sorry, I'm currently experiencing technical difficulties. Please try again later.",
            context=[]
        )
