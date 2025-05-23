from dotenv import load_dotenv
import os
import requests
import tempfile
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from PyPDF2 import PdfReader
import docx
from urllib.parse import urlparse

MAX_TOTAL_CHARS = 1050000 

def download_file_from_url(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[-1].lower()
        if ext not in [".pdf", ".docx"]:
            print(f"Unsupported file type at URL: {url}")
            return None, None
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_file.write(response.content)
        temp_file.close()
        return temp_file.name, ext[1:]
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None, None

def extract_content(filepath, ext):
    try:
        if ext == "txt":
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        elif ext == "pdf":
            reader = PdfReader(filepath)
            return "\n".join([page.extract_text() or "" for page in reader.pages])
        elif ext == "docx":
            doc = docx.Document(filepath)
            return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return ""

def load_texts_from_docs_folder(folder_path="docs"):
    texts = []
    total_chars = 0

    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        if not os.path.isfile(filepath):
            continue

        ext = filename.lower().split('.')[-1]
        if ext == "txt":
            with open(filepath, "r", encoding="utf-8") as f:
                lines = f.readlines()
                for line in lines:
                    line = line.strip()
                    if line.startswith("http") and (line.endswith(".pdf") or line.endswith(".docx")):
                        downloaded_path, file_ext = download_file_from_url(line)
                        if downloaded_path:
                            content = extract_content(downloaded_path, file_ext)
                            os.remove(downloaded_path)
                        else:
                            content = ""
                    else:
                        content = line

                    if total_chars + len(content) > MAX_TOTAL_CHARS:
                        return texts
                    if content.strip():
                        texts.append(content)
                        total_chars += len(content)
        elif ext in ["pdf", "docx"]:
            content = extract_content(filepath, ext)
            if total_chars + len(content) > MAX_TOTAL_CHARS:
                return texts
            if content.strip():
                texts.append(content)
                total_chars += len(content)
        else:
            print(f"Skipping unsupported file: {filename}")

    return texts

def main():
    load_dotenv()
    api_key = os.getenv("OPENAI_SECRET_KEY")
    if not api_key:
        raise ValueError("OPENAI_SECRET_KEY not found in environment")

    texts = load_texts_from_docs_folder("docs")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=100)
    chunks = []
    for t in texts:
        chunks.extend(text_splitter.split_text(t))

    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
    vectorstore = FAISS.from_texts(chunks, embeddings)
    vectorstore.save_local("faiss_index")

    faiss_size = os.path.getsize("faiss_index/index.faiss")
    pkl_size = os.path.getsize("faiss_index/index.pkl")
    total_size_mb = (faiss_size + pkl_size) / 1024 / 1024
    print(f"Embedding complete. Index saved. Total size: {total_size_mb:.2f} MB")

if __name__ == "__main__":
    main()
