from dotenv import load_dotenv
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from PyPDF2 import PdfReader
import docx

def load_texts_from_docs_folder(folder_path="docs"):
    texts = []
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        if not os.path.isfile(filepath):
            continue

        ext = filename.lower().split('.')[-1]
        content = ""
        if ext == "txt":
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        elif ext == "pdf":
            reader = PdfReader(filepath)
            content = "\n".join([page.extract_text() or "" for page in reader.pages])
        elif ext == "docx":
            doc = docx.Document(filepath)
            content = "\n".join([p.text for p in doc.paragraphs])
        else:
            print(f"Skipping unsupported file: {filename}")
            continue

        if content.strip():
            texts.append(content)
    return texts

def main():
    load_dotenv()
    api_key = os.getenv("OPENAI_SECRET_KEY")
    if not api_key:
        raise ValueError("OPENAI_SECRET_KEY not found in environment")

    texts = load_texts_from_docs_folder("docs")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = []
    for t in texts:
        chunks.extend(text_splitter.split_text(t))

    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
    vectorstore = FAISS.from_texts(chunks, embeddings)
    vectorstore.save_local("faiss_index")

    print("Embedding complete. Index saved.")

if __name__ == "__main__":
    main()
