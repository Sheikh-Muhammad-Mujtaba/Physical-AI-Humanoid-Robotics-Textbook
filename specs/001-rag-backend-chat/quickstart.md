# Quickstart: RAG Backend API & Chat Integration

This guide explains how to set up and run the RAG Backend API locally.

## Prerequisites

-   Python 3.10+
-   `pip` (Python package installer)
-   `poetry` (Python dependency management - recommended)
-   Google Gemini API Key
-   Qdrant Cloud API Key and URL (or local Qdrant instance)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create a virtual environment and install dependencies:**
    ```bash
    cd api
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```
    (Alternatively, if using Poetry)
    ```bash
    cd api
    poetry install
    poetry shell
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the `api/` directory with your API keys and Qdrant details:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    QDRANT_URL="YOUR_QDRANT_CLOUD_URL"
    QDRANT_API_KEY="YOUR_QDRANT_API_KEY"
    ```

4.  **Run the FastAPI application:**
    ```bash
    uvicorn index:app --reload
    ```
    The API will be accessible at `http://127.0.0.1:8000`.

## Frontend Integration (Local)

1.  **Ensure backend is running locally.**
2.  **Navigate to the `textbook` directory:**
    ```bash
    cd ../textbook
    ```
3.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
4.  **Start the Docusaurus development server:**
    ```bash
    npm start
    ```
    The frontend will be accessible at `http://localhost:3000`. It will proxy `/api` requests to your locally running backend.

## Deployment to Vercel

1.  **Create a `vercel.json` file** in the root of your project:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/(.*)",
          "destination": "/api"
        }
      ]
    }
    ```
2.  **Configure environment variables** on Vercel for your project:
    `GEMINI_API_KEY`
    `QDRANT_URL`
    `QDRANT_API_KEY`
3.  **Deploy your project** to Vercel.