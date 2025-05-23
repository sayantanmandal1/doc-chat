import os
from dotenv import load_dotenv

from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA

load_dotenv()
api_key = os.getenv("OPENAI_SECRET_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=api_key)
vectorstore = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

llm = ChatOpenAI(openai_api_key=api_key, model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

# Now test your query:
answer = qa_chain.run("Give me a summary of Pride and Prejudice")
print(answer)
