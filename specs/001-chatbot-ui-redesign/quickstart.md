# Quickstart: Chatbot UI

This document provides a quickstart guide for developing the chatbot UI.

## Component Structure

The chatbot UI will be composed of the following React components:

-   `FloatingChatbotIcon`: This component will display the floating chatbot icon. It will be responsible for handling clicks to open the chatbot window.
-   `ChatbotWindow`: This is the main chatbot window component. It will contain the chat interface, including the message history, input field, and send button.
-   `AnimatedAvatar`: This component will display an animated avatar for the chatbot.
-   `MessageBubble`: This component will display the chat messages in animated bubbles.

## State Management

The chatbot's visibility will be managed using a React context. A `ChatbotProvider` component will be created to wrap the application and provide the chatbot's state to all components that need it.

## Styling

All styling will be done using Tailwind CSS. No inline styles should be used.

## Animation

Animations for the avatars and message bubbles will be implemented using the `framer-motion` library.
