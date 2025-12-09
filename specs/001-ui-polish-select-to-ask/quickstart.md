# Quickstart: UI Polish, Select-to-Ask, and Deployment Fixes

This document provides a quick guide to setting up and running the project with the new features.

## Prerequisites

- Node.js >= 18.0
- Python >= 3.10
- Vercel CLI

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    pip install -r api/requirements.txt
    ```

2.  **Set up environment variables**:
    Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your-api-key
    ```

## Running the application locally

1.  **Start the frontend**:
    ```bash
    npm run start
    ```
    This will start the Docusaurus development server at `http://localhost:3000`.

2.  **Start the backend**:
    ```bash
    vercel dev
    ```
    This will start the Vercel development server, which will run the Python backend in `api/` and the Docusaurus frontend.

## Deployment

The application is configured for automatic deployment to Vercel. Simply push your changes to the `main` branch to trigger a new deployment.
