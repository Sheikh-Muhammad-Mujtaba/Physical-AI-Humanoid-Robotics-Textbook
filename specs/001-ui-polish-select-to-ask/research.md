# Research: UI Polish, Select-to-Ask, and Deployment Fixes

No major research was required for this feature as the technical stack and implementation details are well-defined in the feature specification and the project constitution.

The following decisions were made based on the existing project context:

- **State Management**: React Context API (`ChatProvider`) will be used for managing the chat state globally, as specified in the feature description.
- **Styling**: Tailwind CSS will be used for all new components, as mandated by the constitution.
- **Deployment**: Vercel will be used for deployment, and the `vercel.json` file will be configured to handle the hybrid (Python + Static) build.
