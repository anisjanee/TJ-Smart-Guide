import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

app = FastAPI(title="TJ Smart Guide API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


SYSTEM_PROMPT = """
Ты — TJ Smart Guide, цифровой помощник по Таджикистану.
Отвечай понятно, кратко и по существу. Пользователь может писать на русском или таджикском, отвечай на языке вопроса.
Не выдумывай государственные процедуры, цены, адреса, сроки или требования. Если проверенной информации нет, прямо скажи об этом.
Для юридических, медицинских, финансовых и государственных вопросов не выдавай предположение за официальный факт.
База официальных источников будет подключена на следующем этапе, поэтому пока не называй ответ официальной информацией без переданного источника.
""".strip()


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "TJ Smart Guide API",
        "ai_configured": bool(os.getenv("OPENAI_API_KEY")),
    }


@app.post("/api/chat")
def chat(payload: ChatRequest):
    client = get_client()
    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5.6"),
            instructions=SYSTEM_PROMPT,
            input=payload.question.strip(),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service request failed") from exc

    answer = response.output_text.strip()
    if not answer:
        raise HTTPException(status_code=502, detail="AI returned an empty response")

    return {"answer": answer, "sources": []}
