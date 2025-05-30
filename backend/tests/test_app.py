from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Doc Chat backend is running!"}

def test_chat_valid():
    response = client.post(
        "/chat?session_id=test123",
        json={"question": "What is LangChain?"}
    )
    assert response.status_code == 200
    assert "answer" in response.json()

def test_chat_missing_question():
    response = client.post(
        "/chat?session_id=test123",
        json={"question": ""}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Question is required"

def test_chat_missing_session_id():
    response = client.post(
        "/chat",  # no session_id in query
        json={"question": "Tell me about HDFC Life insurance policy"}
    )
    assert response.status_code == 422  # FastAPI validation error
