from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TJ Smart Guide API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "TJ Smart Guide API"}


@app.post("/api/chat")
def chat(payload: dict):
    question = str(payload.get("question", "")).strip()
    if not question:
        return {"answer": "Введите вопрос.", "sources": []}

    return {
        "answer": "AI-модуль пока не подключён. Этот endpoint уже готов для следующего этапа.",
        "sources": [],
    }
