# Quickstart Guide: Global Chatbot Integration (Root Architecture)

**Feature Branch**: `001-global-chatbot-integration`
**Created**: 2025-12-10

## Overview

This guide provides a high-level overview of how to set up and verify the "Global Chatbot Integration (Root Architecture)" feature. This feature transforms the chatbot from a page-specific component into a globally accessible, persistent widget.

## Prerequisites

1.  **Docusaurus Project Setup**: Ensure you have a running Docusaurus project (e.g., `textbook/` directory).
2.  **Backend Chat Service**: An operational backend chat service for AI responses, chat history, and session management is required.
3.  **Development Environment**: Node.js and npm/yarn installed.

## Steps to Get Started

1.  **Checkout Feature Branch**:
    ```bash
    git checkout 001-global-chatbot-integration
    ```

2.  **Install Dependencies**:
    Navigate to your Docusaurus project directory (e.g., `textbook/`) and install dependencies:
    ```bash
    cd textbook/
    npm install # or yarn install
    ```

3.  **Start Docusaurus Development Server**:
    From the `textbook/` directory:
    ```bash
    npm start # or yarn start
    ```
    This will typically open the application in your browser (e.g., `http://localhost:3000`).

4.  **Verify Global Chatbot Presence**:
    *   Navigate through various pages of the application (Home, Docs, Blog posts).
    *   Observe a floating chatbot widget persistently displayed in the bottom-right corner of the viewport.

5.  **Test Chatbot Interaction**:
    *   Click on the floating widget to expand the chatbot UI.
    *   Type a message and send it. Verify that you receive an AI response.
    *   Collapse the chatbot UI.

6.  **Test State Persistence**:
    *   Expand the chatbot, type a message, and navigate to another page.
    *   Verify that the chat history and the expanded state of the chatbot persist across page navigations.

7.  **Test Contextual Invocation**:
    *   On any page, select some text (e.g., from a documentation article).
    *   Observe the "Ask AI" button appearing near the selected text.
    *   Click the "Ask AI" button. Verify that the chatbot opens and the selected text is used as context for a new conversation or query.

## Expected Outcome

Upon following these steps, you should have a fully functional global chatbot integrated into the Docusaurus application, demonstrating persistence across pages and contextual invocation.
