"""
Database connection and session management module.
Uses SQLAlchemy to support SQLite by default with easy migration to PostgreSQL.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for providing database session to FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
