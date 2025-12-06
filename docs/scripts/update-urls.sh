#!/bin/bash
set -euo pipefail

# Script to find and replace placeholder URLs in Docusaurus markdown files.

# Placeholder patterns and their replacements
declare -A replacements
replacements["https://your-docusaurus-site.example.com"]="https://ai-native-systems-book.com"
replacements["/docs/intro"]="/docs/get-started" # Assuming a more specific 'get-started' page later
replacements["./setup/workstation"]="/docs/setup/workstation-guide"
replacements["./setup/edge-kit"]="/docs/setup/edge-kit-guide"
replacements["./setup/cloud"]="/docs/setup/cloud-guide"
replacements["./references/glossary"]="/docs/references/glossary-terms"
replacements["./module-1-ros2"]="/docs/module1-the-robotic-nervous-system"


# Directory containing markdown files
DOCS_DIR="docusaurus-book/docs"

echo "Starting URL update in $DOCS_DIR..."

# Find all markdown files and iterate
find "$DOCS_DIR" -name "*.md" -o -name "*.mdx" | while read -r file; do
    echo "Processing $file..."
    for placeholder in "${!replacements[@]}"; do
        target="${replacements[$placeholder]}"
        # Use sed to replace in-place. Use a temporary file for safety.
        # The 'g' flag for global replacement in each line.
        # Escaping '/' characters in sed patterns for URLs.
        sed -i.bak "s|${placeholder}|${target}|g" "$file"
        # Remove the backup file
        rm "${file}.bak"
    done
done

echo "URL update complete."