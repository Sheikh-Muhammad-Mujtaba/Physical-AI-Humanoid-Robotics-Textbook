# Quickstart: Import Textbook Content

This guide explains how to run the import script to populate the Docusaurus `docs/` directory from the `contentguide.md` file.

## Prerequisites

- `contentguide.md` must exist in the root of the repository.
- The `docs/` directory must exist.
- The `docs/scripts/` directory must exist.

## Steps

1.  **Navigate to the `docs/` directory**:
    ```bash
    cd docs
    ```

2.  **Run the import script**:
    ```bash
    ./scripts/import-content.sh
    ```

3.  **Build the Docusaurus site**:
    ```bash
    npm run build
    ```

4.  **Start the Docusaurus site**:
    ```bash
    npm start
    ```

After these steps, the Docusaurus site should be running with the content from `contentguide.md`.
