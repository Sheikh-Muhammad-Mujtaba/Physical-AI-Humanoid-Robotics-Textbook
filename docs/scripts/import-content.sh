#!/bin/bash

set -e

# This script imports content from a master markdown file into a Docusaurus project.
# It parses the master file, splits it into modules and chapters, generates frontmatter,
# and archives the master file.

# Configuration
MASTER_FILE="contentguide.md"
DOCS_DIR="docs"
ARCHIVE_DIR="history/content"

# Ensure the master file exists
if [ ! -f "$MASTER_FILE" ]; then
    echo "Error: Master file '$MASTER_FILE' not found."
    exit 1
fi

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Clean the docs directory, but preserve the scripts directory
for item in "${DOCS_DIR}"/*; do
    if [ "$(basename "$item")" != "scripts" ]; then
        rm -rf "$item"
    fi
done

# Read the master file and split it into modules and chapters
awk '
    /^# / {
        if (module_dir) close(chapter_file);
        module_name = substr($0, 3);
        gsub(/ /, "-", module_name);
        module_dir = "'"$DOCS_DIR"'/" tolower(module_name);
        system("mkdir -p " module_dir);
        chapter_count = 0;
    }
    /^## / {
        if (chapter_file) close(chapter_file);
        chapter_count++;
        chapter_name = substr($0, 4);
        gsub(/ /, "-", chapter_name);
        chapter_file = module_dir "/" tolower(chapter_name) ".md";
        print "---" > chapter_file;
        print "id: " tolower(chapter_name) >> chapter_file;
        print "title: " chapter_name >> chapter_file;
        print "sidebar_position: " chapter_count >> chapter_file;
        print "---" >> chapter_file;
    }
    /^#/ {next;}
    {
        if (chapter_file) {
            # Convert admonitions
            if ($0 ~ /^(Note|Warning|Info):/) {
                type = tolower(substr($1, 1, length($1)-1));
                sub(/^(Note|Warning|Info): /, "", $0);
                print ":::" type >> chapter_file;
                print $0 >> chapter_file;
                print ":::" >> chapter_file;
            } else {
                print $0 >> chapter_file;
            }
        }
    }
' "$MASTER_FILE"

# Archive the master file
mv "$MASTER_FILE" "$ARCHIVE_DIR/$(date +%Y-%m-%d)-${MASTER_FILE}"

echo "Content imported successfully."