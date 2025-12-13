#!/bin/bash
set -euo pipefail

# Script to generate the book structure with modules and chapters.

DOCS_DIR="docusaurus-book/docs"

# Function to generate a random number within a range
random_range() {
  shuf -i $1-$2 -n 1
}

# Number of modules (5-6)
NUM_MODULES=$(random_range 5 6)
echo "Generating $NUM_MODULES modules..."

for ((m=1; m<=$NUM_MODULES; m++)); do
  MODULE_DIR="$DOCS_DIR/module$m-$(echo "Module Title Placeholder" | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')"
  mkdir -p "$MODULE_DIR"
  echo "Created module directory: $MODULE_DIR"

  # Number of chapters (3-4)
  NUM_CHAPTERS=$(random_range 3 4)
  echo "  Generating $NUM_CHAPTERS chapters for module $m..."

  for ((c=1; c<=$NUM_CHAPTERS; c++)); do
    CHAPTER_FILE="$MODULE_DIR/chapter$c-$(echo "Chapter Title Placeholder" | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]').md"
    
    # Placeholder content for chapter
    cat <<EOF > "$CHAPTER_FILE"
---
title: "Chapter $c: Chapter Title Placeholder"
---

# Chapter $c: Chapter Title Placeholder

This is placeholder content for chapter $c of module $m.
It will be replaced with detailed and attractive content about Physical AI & Humanoid Robotics.

EOF
    echo "    Created chapter file: $CHAPTER_FILE"
  done
done

echo "Book structure generation complete."
