# Chatbot with Multi-Repository Support

This project is a chatbot application designed to interact with multiple repositories or namespaces. It allows users to select and chat with specific namespaces or multiple namespaces simultaneously.

## Features

- **Single Repository Chat**: Users can interact with a selected repository to ask questions and get responses.
- **Multi-Repository Chat**: Users can select multiple repositories (or namespaces) to have a combined chat experience, allowing the chatbot to pull responses from different repositories.
- **Code Syntax Highlighting**: Code snippets are highlighted using PrismJS for a better user experience.
- **Message History**: Chats are stored in Supabase to keep track of past conversations for each repository.
- **Interactive UI**: A clean and responsive UI that allows easy switching between single and multi-repository chats.

## Technologies Used

- **React**: Frontend library for building the user interface.
- **Supabase**: Backend service for handling message storage and retrieval.
- **PrismJS**: Code syntax highlighting library.
- **ReactMarkdown**: Library for rendering Markdown content.
- **CSS**: For styling the app.

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Supabase account and a project setup
- NPM or Yarn package manager

### Clone the Repository

```bash
git clone https://github.com/rakeshpuppala2590/Codebase_Chat.git
cd Codebase_Chat

### How to run

npm install
npm run dev
