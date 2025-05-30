
# doc-chat

doc-chat is a document-based chatbot application that leverages advanced NLP and vector search techniques to allow users to interact with the contents of their documents seamlessly.

## Features

- Upload PDF and text documents
- Semantic search and question answering over document contents
- Vector embedding using OpenAI embeddings or similar models
- User-friendly chat interface
- Backend powered by FastAPI with FAISS vector store integration
- React-based frontend for smooth user experience

## Installation

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Usage

1. Start the backend server:

```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend:

```bash
cd frontend
npm start
```

3. Open your browser at `http://localhost:3000` to interact with the chatbot.

## Sample Prompts (HDFC Life Insurance Policies)

Try these example questions to get relevant answers from the chatbot based on your uploaded HDFC Life insurance documents:
- Tell me about hdfc life policy.
- What is the maturity benefit for the HDFC Life Easy Health Insurance Policy?
- Explain the coverage details of the HDFC Life Group Term Life Policy.
- What are the premium payment options for the HDFC Life Sampoorna Jeevan plan?
- How does the HDFC Life Smart Pension Plan work?
- What is the claim procedure for HDFC Life Sanchay Plus Life Long Income Option?
- List the key features of the HDFC Life Surgicare Plan.
- What documents are required to file a claim for the HDFC Life Group Poorna Suraksha policy?

## Contributing

Feel free to fork the repository and open pull requests.  
Please follow the existing code style and include tests for new features.

## License

MIT License
