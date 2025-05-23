from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

origins = [
    "https://doc-chat-nu.vercel.app",  # Your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

api_key = os.getenv("OPENAI_SECRET_KEY")
if not api_key:
    raise ValueError("OPENAI_SECRET_KEY not set in .env")

# Supabase FAISS URLs
FAISS_URL = "https://kzqnsdmbbpftbbzhvvqr.supabase.co/storage/v1/object/public/faiss-index/index (1).faiss"
PKL_URL = "https://kzqnsdmbbpftbbzhvvqr.supabase.co/storage/v1/object/public/faiss-index/index (1).pkl"

# Temp directory to store downloaded files
TEMP_DIR = "faiss_temp"
Path(TEMP_DIR).mkdir(parents=True, exist_ok=True)

def download_file(url, dest_path):
    response = requests.get(url)
    response.raise_for_status()
    with open(dest_path, "wb") as f:
        f.write(response.content)

# Download index files from Supabase
download_file(FAISS_URL, f"{TEMP_DIR}/index.faiss")
download_file(PKL_URL, f"{TEMP_DIR}/index.pkl")

# Load vector store
embeddings = OpenAIEmbeddings(openai_api_key=api_key)
vectorstore = FAISS.load_local(TEMP_DIR, embeddings, allow_dangerous_deserialization=True)

llm = ChatOpenAI(openai_api_key=api_key, model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

class QueryRequest(BaseModel):
    question: str

chat_histories = {}

@app.get("/")
async def root():
    return {"message": "Doc Chat backend is running!"}

@app.post("/chat")
async def chat(request: QueryRequest, session_id: str = Query(...)):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    history = chat_histories.get(session_id, [])
    history.append({"role": "user", "content": question})
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    answer = qa_chain.invoke({"query": context})["result"]
    history.append({"role": "assistant", "content": answer})
    chat_histories[session_id] = history
    return {"answer": answer}
