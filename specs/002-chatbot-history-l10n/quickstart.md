# Quickstart: Chatbot with History (Neon Postgres) and Urdu Localization

This guide explains how to set up and run the Chatbot with History (Neon Postgres) and Urdu Localization feature locally.

## Prerequisites

-   Python 3.10+
-   `pip` (Python package installer)
-   `poetry` (Python dependency management - recommended)
-   Google Gemini API Key
-   Qdrant Cloud API Key and URL (or local Qdrant instance)
-   Neon PostgreSQL `DATABASE_URL`

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create a virtual environment and install backend dependencies:**
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
    Create a `.env` file in the `api/` directory with your API keys, Qdrant details, and Neon Postgres `DATABASE_URL`:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    QDRANT_URL="YOUR_QDRANT_CLOUD_URL"
    QDRANT_API_KEY="YOUR_QDRANT_API_KEY"
    DATABASE_URL="YOUR_NEON_POSTGRES_DATABASE_URL"
    ```

4.  **Run database migrations (initial setup):**
    ```bash
    python -m api.utils.database # This will run the migration script
    ```

5.  **Run the FastAPI backend application:**
    ```bash
    uvicorn api.index:app --reload
    ```
    The API will be accessible at `http://127.0.0.1:8000`.

## Frontend Integration (Local)

1.  **Open a NEW terminal window (keep the backend running in the first terminal).**
2.  **Navigate to the `textbook` directory:**
    ```bash
    cd textbook
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
    `DATABASE_URL`
3.  **Deploy your project** to Vercel.

## Localization Setup

1.  **Run Docusaurus translation command:**
    ```bash
    cd textbook
    npm run write-translations
    ```
    This will generate the `i18n/ur/` folder structure.
2.  **Manually translate** the generated `.json` files in `textbook/i18n/ur/docusaurus-plugin-content-docs/current.json` and other relevant files.
3.  **To view in Urdu:** Add `/ur/` to your local Docusaurus URL (e.g., `http://localhost:3000/ur/`).
