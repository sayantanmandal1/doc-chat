# Document Chatbot

A document-based chatbot web application powered by FastAPI backend, FAISS vector store, OpenAI embeddings, and a React frontend. This project enables you to upload documents, index them with FAISS, and ask questions that the chatbot answers based on your documents.

---

## Table of Contents

- [Features](#features)  
- [Architecture](#architecture)  
- [Technologies Used](#technologies-used)  
- [Setup & Installation](#setup--installation)  
- [Environment Variables](#environment-variables)  
- [Running Locally](#running-locally)  
- [Deployment](#deployment)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- Upload documents and index with FAISS vector store
- Store and load FAISS indexes remotely from Supabase storage
- FastAPI backend serving a chat API with session-based conversation history
- React frontend with chat interface and persistent session support
- Query documents intelligently using OpenAI GPT embeddings and chat completions
- CORS configured for secure frontend-backend communication

---

## Architecture

```plaintext
User <--> React Frontend <--> FastAPI Backend <--> FAISS Vectorstore (loaded from Supabase Storage) <--> OpenAI Embeddings and Chat Completion API
```

1. **Frontend** sends questions with a session ID.
2. **Backend** downloads FAISS index files from Supabase storage on startup.
3. Backend uses OpenAI embeddings to load vector store from FAISS files.
4. Backend processes user queries with a retrieval-based QA chain.
5. Backend returns answers to frontend.
6. Frontend displays answers and manages chat session history locally.

---

## Technologies Used

- Python 3.11  
- FastAPI  
- Uvicorn (ASGI server)  
- LangChain  
- FAISS  
- OpenAI API (Embeddings and Chat Completion)  
- Supabase Storage (for remote FAISS index files)  
- React.js (frontend)  
- Fetch API for communication  
- CORS Middleware  

---

## Setup & Installation

### Backend

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/doc-chatbot.git
   cd doc-chatbot/backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend root and add your OpenAI API key:
   ```
   OPENAI_SECRET_KEY=your_openai_api_key_here
   ```

4. Update the Supabase FAISS index URLs in `app.py` if needed.

---

## Environment Variables

| Variable            | Description                  |
|---------------------|------------------------------|
| `OPENAI_SECRET_KEY` | Your OpenAI API key          |

---

## Running Locally

1. Start backend:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

2. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

3. Install frontend dependencies and start React dev server:
   ```bash
   npm install
   npm start
   ```

4. Open `http://localhost:3000` in your browser.

---

## Deployment

### Backend

- Host your FastAPI backend on platforms like Render, Heroku, or any server that supports Python.
- Make sure to set environment variables and allow CORS from your frontend domain.
- Ensure the backend downloads FAISS files from your Supabase storage on startup.

### Frontend

- Deploy the React app on platforms like Vercel, Netlify, or similar.
- Update the API endpoint URL in the frontend `fetch` calls to point to your deployed backend URL.

---

## Usage

- Open the React frontend in a browser.
- Ask questions related to the documents indexed.
- Each chat session is tracked using a session ID for context continuity.
- Backend handles the retrieval and generates relevant answers using OpenAI's GPT.

---

## Folder Structure

```plaintext
/
├── backend/
│   ├── app.py                # FastAPI backend main application
│   ├── faiss_temp/           # Temporary directory for downloaded FAISS indexes (ignored in git)
│   ├── requirements.txt      # Backend Python dependencies
│   └── .env                  # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   └── App.js            # React frontend main component
│   ├── package.json          # Frontend dependencies
│   └── public/
└── README.md                 # This file
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repo.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request describing your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Troubleshooting

- **404 on `/` route:** Add a root endpoint in FastAPI returning a simple JSON message.
- **FAISS index load errors:** Ensure the FAISS index files are correctly downloaded and paths match.
- **CORS errors:** Check that your backend allows your frontend domain.
- **OpenAI API errors:** Verify your API key and usage limits.

---

## Contact

For questions or help, please open an issue or contact [msayantan05@gmail.com].

---

*Happy Chatting!* 🚀
