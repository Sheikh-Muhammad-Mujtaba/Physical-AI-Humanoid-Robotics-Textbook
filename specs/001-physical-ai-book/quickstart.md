# Quickstart Guide: Physical AI & Humanoid Robotics – AI-Native Systems Book

This guide provides instructions to set up and run the Docusaurus book project locally.

## Prerequisites

- Node.js (>=18.0)
- npm or yarn

## Setup

1.  **Clone the repository**:
    ```bash
    git clone [repository_url]
    cd [repository_name]
    ```

2.  **Navigate to the Docusaurus project directory**:
    ```bash
    cd docs/
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    # OR
    yarn install
    ```

## Running Locally

1.  **Start the development server**:
    ```bash
    npm start
    # OR
    yarn start
    ```
    This command starts a local development server and opens a browser window. Most changes are reflected live without having to restart the server.

2.  **Access the book**:
    Open your web browser and navigate to `http://localhost:3000`.

## Building the Static Site

1.  **Generate static content**:
    ```bash
    npm run build
    # OR
    yarn build
    ```
    This command generates static content into the `build` directory and can be served by any static content hosting service.
