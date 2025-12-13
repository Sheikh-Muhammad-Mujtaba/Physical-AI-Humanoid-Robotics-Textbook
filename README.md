# Physical AI & Humanoid Robotics Textbook

## A Comprehensive Guide to AI-Native Systems

This repository hosts the source for "Physical AI & Humanoid Robotics – AI-Native Systems," a comprehensive textbook meticulously crafted through an AI-driven, specification-driven development process. This book delves into the cutting-edge intersection of artificial intelligence and physical embodiment, providing a detailed guide for understanding and building intelligent robotic systems.

### About the Book

The textbook is structured into 5 distinct modules, each containing 3 chapters, designed to progressively build your understanding:

1.  **Module 1: Introduction to Physical AI**: Explores the foundational concepts of Physical AI, its core components, and the sense-plan-act cycle.
2.  **Module 2: Humanoid Robotics**: Delves into the anatomy of humanoid robots, their design principles, and the challenges involved in their development.
3.  **Module 3: AI-Native Systems**: Understands the paradigm shift towards AI-Native systems, where AI is foundational to design and operation.
4.  **Module 4: Perception and Sensor Fusion for Physical AI**: Discovers how robots perceive their environment through diverse sensor modalities and how data from these sensors is fused for robust understanding.
5.  **Module 5: Motion Planning and Control for Humanoid Robots**: Learns the principles of kinematics, dynamics, trajectory generation, and whole-body control for achieving precise and stable humanoid robot movements.

### Key Features:

*   **AI-Generated Content**: The book's structure and initial content were generated and refined by an AI agent, ensuring consistency and adherence to specified quality criteria.
*   **SEO Optimized**: Configured for optimal search engine visibility, incorporating Docusaurus best practices for sitemap generation, meta tags, and image optimization.
*   **Intelligent URL Management**: Placeholder URLs are automatically updated to maintain internal link integrity and enhance navigation.
*   **Docusaurus-Powered**: Built using Docusaurus, providing a modern, responsive, and easily navigable online reading experience.

### Guiding Principles

This project adheres to a strict constitution to ensure quality and consistency. The core principles are:

1.  **OpenAI-Adapter Pattern**: The backend MUST use the `openai` Python SDK.
2.  **Root-Level Integration**: The Chatbot component MUST be rendered in `src/theme/Root.tsx`.
3.  **Global State Management**: Chat visibility and context data MUST be managed via a React Context.
4.  **Floating Widget UX**: The Chatbot MUST be a collapsible "Floating Action Button" (FAB) widget.
5.  **Robust Sessions & Logic Preservation**: The Frontend MUST use `uuid` to generate version-4 UUIDs for `sessionId`.
6.  **Extension-Less Imports**: All imports of local TypeScript/React files MUST omit the file extension.
7.  **Tailwind v3 Standard**: The project MUST use Tailwind CSS v3 with a `postcss.config.js`.
8.  **Context-Driven UI**: UI components MUST consume `useChat()` directly.
9.  **Hybrid Deployment**: The `vercel.json` MUST define builds for both `api/` and `textbook/`.
10. **Zero Broken Links**: The `npm run build` command must pass without error.
11. **Real Data Integration**: The Frontend `ChatContext` MUST connect to the Backend API.
12. **Docusaurus Native Theming**: All custom UI components MUST support both Light and Dark modes.
13. **Error Resilience**: The Chatbot MUST display a user-friendly error message if the backend is offline.
14. **Safe CSS Configuration**: The `tailwind.config.js` MUST have `corePlugins: { preflight: false }`.
15. **Secure Connectivity**: The FastAPI backend MUST include `CORSMiddleware`.

### Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the `api` directory:

*   `GEMINI_API_KEY`: Your Google Gemini API key.
*   `QDRANT_URL`: The URL of your Qdrant instance.
*   `QDRANT_API_KEY`: The API key for your Qdrant instance.
*   `DATABASE_URL`: The connection string for your PostgreSQL database (e.g., Neon).

### Contributing

Contributions are welcome! Please refer to the project's specification documents for guidelines on adding new content, improving existing sections, or contributing to the development of this textbook.

### License

This project is licensed under the MIT License.

---

