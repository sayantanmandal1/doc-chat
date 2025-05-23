from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
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

embeddings = OpenAIEmbeddings(openai_api_key=api_key)
vectorstore = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

llm = ChatOpenAI(openai_api_key=api_key, model="gpt-3.5-turbo", temperature=0)

qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

class QueryRequest(BaseModel):
    question: str
chat_histories = {}

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
