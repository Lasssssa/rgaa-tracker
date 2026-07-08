from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The single declarative Base every model inherits from. Kept here (not in a
# module) because it is shared infrastructure, not tied to any one feature.
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a request-scoped session and always
    closes it, even if the request raises."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
