# Document Chatbot - Backend

This FastAPI backend serves a document chatbot that uses FAISS vector search with Langchain and OpenAI embeddings.

## Features

- Loads FAISS vector index files from Supabase storage
- Provides a `/chat` POST endpoint to interact with the chatbot
- Uses Langchain's RetrievalQA with OpenAI LLM for answering questions
- Maintains session chat history in memory
- CORS configured for frontend access

## Setup Instructions

1. Create a `.env` file in the backend root with the following variable:

```
OPENAI_SECRET_KEY=your_openai_api_key_here
```

2. Install dependencies (preferably in a virtual environment):

```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

4. The backend will be available at `http://localhost:8000`.

## Environment Variables

- `OPENAI_SECRET_KEY`: Your OpenAI API key

## Supabase Integration

- FAISS index files (`index.faiss` and `index.pkl`) are downloaded at startup from Supabase public URLs.
- Make sure your Supabase storage URLs are correctly set in the code.

## API Usage

- POST `/chat?session_id=some_session_id` with JSON body: `{ "question": "your question" }`
- Returns JSON: `{ "answer": "response from the chatbot" }`

## Notes

- Chat history is stored in memory; it will reset if the server restarts.
- Use production-grade storage or database for persistent chat history if needed.
- Handle file download errors gracefully in production.

## Deployment

- Ensure the environment variables and Supabase URLs are properly configured in your deployment environment.
- Configure CORS to allow your frontend domain.