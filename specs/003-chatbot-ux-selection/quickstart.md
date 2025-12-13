# Quickstart: Chatbot UX with WhatsApp-Style Selection

**Feature**: 003-chatbot-ux-selection
**Date**: 2025-12-13

## Overview

This feature enhances the AI chatbot with text selection support. Users can:
1. Select any text in the textbook
2. Click "Ask AI" button that appears
3. See their selection in a WhatsApp-style quote
4. Ask questions about the selection
5. Receive educational, contextual responses

## Prerequisites

- Node.js 20+
- Python 3.11+
- Environment variables configured (see below)

## Environment Setup

Create `.env` at project root with:

```env
# Gemini API (for chat and embeddings)
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_google_api_key

# Qdrant (for RAG vector search)
QDRANT_URL=https://your-qdrant-instance.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=textbook_chunks

# PostgreSQL (for chat history)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies (in api/ directory)
cd api
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Ingest Textbook Content (RAG)

```bash
# From project root, with .env configured
source api/.venv/bin/activate
python scripts/ingest_qdrant.py
```

### 3. Run Development Server

```bash
# Terminal 1: Frontend (Docusaurus)
npm run start

# Terminal 2: Backend (FastAPI) - optional for local dev
cd api
source .venv/bin/activate
uvicorn index:app --reload --port 8000
```

### 4. Deploy to Vercel

```bash
# Ensure vercel.json and requirements.txt at root
vercel --prod
```

## Testing the Feature

### Manual Test: Text Selection Flow

1. Open any chapter page (e.g., `/docs/intro`)
2. Select some text with your mouse
3. Verify "Ask AI" button appears above selection
4. Click "Ask AI"
5. Verify:
   - Chat widget opens
   - Selected text appears in quote block above input
   - Quote shows "Selected from book:" label
   - Quote has dismiss (X) button
6. Type a question (e.g., "What does this mean?")
7. Press Enter or click Send
8. Verify:
   - Loading dots appear
   - AI response acknowledges selection
   - Quote block disappears after sending
   - Chat auto-scrolls to new message

### Manual Test: Dismiss Selection

1. Select text and click "Ask AI"
2. Click the X button on the quote block
3. Verify quote disappears
4. Send a message
5. Verify message goes without selection context

### Manual Test: Error Handling

1. Temporarily invalidate GEMINI_API_KEY
2. Try to send a message
3. Verify friendly error message appears

## File Locations

| Component | File |
| --------- | ---- |
| Selection Button | `src/components/TextSelectionButton.tsx` |
| Chat Widget | `src/components/ChatbotWidget.tsx` |
| Chat Context | `src/contexts/ChatContext.tsx` |
| API Client | `src/lib/chatApi.ts` |
| Backend API | `api/index.py` |
| API Models | `api/utils/models.py` |

## Common Issues

### "Ask AI" button doesn't appear
- Check browser console for JavaScript errors
- Verify TextSelectionButton is rendered in Root.tsx
- Ensure Tailwind CSS is compiled

### API returns 500 error
- Check Vercel function logs
- Verify environment variables are set in Vercel dashboard
- Check Gemini API quota

### Selection not sending to API
- Check ChatContext is wrapping the app
- Verify askSelectionWithBackend is called (check console logs)
- Check network tab for request/response

### RAG not returning relevant context
- Run ingest script to populate Qdrant
- Verify QDRANT_URL and QDRANT_API_KEY are correct
- Check Qdrant dashboard for collection status
