# Document Chatbot - Frontend

This React application provides a simple chat interface to interact with a document-based chatbot.

## Features

- Chat UI with message bubbles for user and bot
- Maintains session with a generated session ID
- Connects to the backend API to get answers based on uploaded documents
- Responsive and clean UI

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. The app will be available at `http://localhost:3000` by default.

## Usage

- Type your question in the input box.
- Press Enter or click Send to ask the question.
- The bot will reply based on the document content indexed in the backend.

## Environment Variables

No environment variables are needed for the frontend, but ensure the backend API URL is correctly set in the fetch request inside the code. Replace `http://localhost:8000` with your deployed backend URL.

## Notes

- Ensure CORS is configured properly on the backend to allow requests from the frontend URL.
- Session ID is randomly generated once per app load to maintain chat history.