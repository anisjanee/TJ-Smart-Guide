import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from sqlalchemy import func, or_, select, text

from .database import Base, SessionLocal, get_database_url
from .models import Category, Feedback, KnowledgeArticle, QuestionLog


SYSTEM_PROMPT = """
Ты — TJ Smart Guide, цифровой помощник по Таджикистану.
Отвечай понятно, кратко и по существу. Пользователь может писать на русском или таджикском, отвечай на языке вопроса.
Если в базе знаний есть релевантные материалы, используй их как контекст и не противоречь им.
Не выдумывай государственные процедуры, цены, адреса, сроки или требования. Если проверенной информации нет, прямо скажи об этом.
Для юридических, медицинских, финансовых и государственных вопросов не выдавай предположение за официальный факт.
""".strip()


SEED_CATEGORIES = [
    ("Документы", "documents", "Паспорта, справки, регистрация и другие документы", "📄"),
    ("Образование", "education", "Школы, университеты, обучение и поступление", "🎓"),
    ("Работа", "jobs", "Поиск работы, навыки и трудовые вопросы", "💼"),
    ("Бизнес", "business", "Предпринимательство, регистрация и полезные сервисы", "🏢"),
    ("Госуслуги", "government", "Государственные услуги и официальные источники", "🏛️"),
    ("Повседневная жизнь", "life", "Полезная информация для повседневных задач", "🏠"),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    if SessionLocal is not None:
        Base.metadata.create_all(bind=SessionLocal.kw["bind"])
        with SessionLocal() as session:
            for name, slug, description, icon in SEED_CATEGORIES:
                exists = session.scalar(select(Category).where(Category.slug == slug))
                if not exists:
                    session.add(Category(name=name, slug=slug, description=description, icon=icon))
            session.commit()
    yield


app = FastAPI(title="TJ Smart Guide API", version="0.3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class FeedbackRequest(BaseModel):
    question_log_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


def database_ready() -> bool:
    return SessionLocal is not None


def find_context(session, question: str) -> list[KnowledgeArticle]:
    terms = [part for part in question.lower().split() if len(part) >= 3][:8]
    if not terms:
        return []
    conditions = []
    for term in terms:
        pattern = f"%{term}%"
        conditions.extend([
            KnowledgeArticle.title.ilike(pattern),
            KnowledgeArticle.summary.ilike(pattern),
            KnowledgeArticle.content.ilike(pattern),
        ])
    stmt = (
        select(KnowledgeArticle)
        .where(KnowledgeArticle.is_published.is_(True), or_(*conditions))
        .order_by(KnowledgeArticle.updated_at.desc())
        .limit(5)
    )
    return list(session.scalars(stmt).all())


@app.get("/api/health")
def health():
    db_ok = False
    if database_ready():
        try:
            with SessionLocal() as session:
                session.execute(text("SELECT 1"))
                db_ok = True
        except Exception:
            db_ok = False
    return {
        "status": "ok",
        "service": "TJ Smart Guide API",
        "ai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "database_configured": database_ready(),
        "database_connected": db_ok,
    }


@app.get("/api/categories")
def categories():
    if not database_ready():
        return {"items": []}
    with SessionLocal() as session:
        rows = session.scalars(
            select(Category).where(Category.is_active.is_(True)).order_by(Category.name)
        ).all()
        return {
            "items": [
                {
                    "id": row.id,
                    "name": row.name,
                    "slug": row.slug,
                    "description": row.description,
                    "icon": row.icon,
                }
                for row in rows
            ]
        }


@app.get("/api/search")
def search_knowledge(
    q: str = Query(min_length=2, max_length=100),
    category: str | None = Query(default=None, max_length=80),
):
    if not database_ready():
        return {"items": [], "total": 0}
    with SessionLocal() as session:
        pattern = f"%{q.strip()}%"
        stmt = (
            select(KnowledgeArticle, Category)
            .join(Category, KnowledgeArticle.category_id == Category.id)
            .where(
                KnowledgeArticle.is_published.is_(True),
                or_(
                    KnowledgeArticle.title.ilike(pattern),
                    KnowledgeArticle.summary.ilike(pattern),
                    KnowledgeArticle.content.ilike(pattern),
                ),
            )
            .order_by(KnowledgeArticle.updated_at.desc())
            .limit(20)
        )
        if category:
            stmt = stmt.where(Category.slug == category)
        rows = session.execute(stmt).all()
        return {
            "items": [
                {
                    "id": article.id,
                    "title": article.title,
                    "summary": article.summary,
                    "category": category_row.slug,
                    "category_name": category_row.name,
                    "source_name": article.source_name,
                    "source_url": article.source_url,
                }
                for article, category_row in rows
            ],
            "total": len(rows),
        }


@app.get("/api/articles/{article_id}")
def article(article_id: int):
    if not database_ready():
        raise HTTPException(status_code=503, detail="Database is not configured")
    with SessionLocal() as session:
        row = session.get(KnowledgeArticle, article_id)
        if not row or not row.is_published:
            raise HTTPException(status_code=404, detail="Article not found")
        category = session.get(Category, row.category_id)
        return {
            "id": row.id,
            "title": row.title,
            "summary": row.summary,
            "content": row.content,
            "category": category.slug if category else None,
            "category_name": category.name if category else None,
            "source_name": row.source_name,
            "source_url": row.source_url,
            "updated_at": row.updated_at,
        }


@app.post("/api/chat")
def chat(payload: ChatRequest):
    client = get_client()
    context = ""
    if database_ready():
        with SessionLocal() as session:
            articles = find_context(session, payload.question)
            if articles:
                context = "\n\nБАЗА ЗНАНИЙ:\n" + "\n\n".join(
                    f"[{article.title}] {article.content} Источник: {article.source_name or 'не указан'} {article.source_url or ''}"
                    for article in articles
                )

    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5.6"),
            instructions=SYSTEM_PROMPT + context,
            input=payload.question.strip(),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service request failed") from exc

    answer = response.output_text.strip()
    if not answer:
        raise HTTPException(status_code=502, detail="AI returned an empty response")

    log_id = None
    if database_ready():
        with SessionLocal() as session:
            log = QuestionLog(question=payload.question.strip(), answer=answer)
            session.add(log)
            session.commit()
            session.refresh(log)
            log_id = log.id

    return {"answer": answer, "question_log_id": log_id, "sources": []}


@app.post("/api/feedback")
def feedback(payload: FeedbackRequest):
    if not database_ready():
        raise HTTPException(status_code=503, detail="Database is not configured")
    with SessionLocal() as session:
        if payload.question_log_id is not None and not session.get(QuestionLog, payload.question_log_id):
            raise HTTPException(status_code=404, detail="Question log not found")
        row = Feedback(
            question_log_id=payload.question_log_id,
            rating=payload.rating,
            comment=payload.comment,
        )
        session.add(row)
        session.commit()
        return {"success": True, "id": row.id}
