# Data Model: Physical AI & Humanoid Robotics – AI-Native Systems Book

This document outlines the key entities and their relationships within the Docusaurus book project.

## Entities

### Book

- **Description**: The primary entity, representing the entire published content.
- **Attributes**:
    - `title`: String (e.g., "Physical AI & Humanoid Robotics – AI-Native Systems")
    - `authors`: Array of Strings
    - `version`: String
    - `publicationDate`: Date
    - `chapters`: List of Chapter entities (relationship)

### Chapter

- **Description**: A major division of the book, containing sub-sections (pages).
- **Attributes**:
    - `title`: String
    - `slug`: String (URL-friendly identifier)
    - `order`: Integer (sequential position within the book/module)
    - `pages`: List of Page entities (relationship)
    - `parentModule`: Reference to Module (if applicable, implied by Docusaurus structure)

### Page

- **Description**: An individual markdown file representing a section or a sub-section within a chapter.
- **Attributes**:
    - `title`: String
    - `slug`: String (URL-friendly identifier)
    - `content`: Markdown text
    - `parentChapter`: Reference to Chapter (relationship)
