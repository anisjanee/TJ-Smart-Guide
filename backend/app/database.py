import os
from contextlib import contextmanager
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


def get_database_url() -> str | None:
    url = os.getenv("DATABASE_URL")
    if not url:
        return None

    # Render may provide postgres:// or postgresql:// URLs.
    if url.startswith("postgres://"):
        url = "postgresql+psycopg://" + url[len("postgres://") :]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://") :]

    # Render Postgres requires TLS. Preserve any existing query parameters
    # while making the requirement explicit for psycopg.
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query, keep_blank_values=True))
    params.setdefault("sslmode", "require")
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), parts.fragment))


def build_session_factory():
    url = get_database_url()
    if not url:
        return None
    engine = create_engine(url, pool_pre_ping=True, pool_recycle=1800)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)


SessionLocal = build_session_factory()


@contextmanager
def db_session():
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
