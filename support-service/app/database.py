import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# --- Support Service DB ---
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url:
    # A local SQLite fallback
    db_url = "sqlite:///./support.db"

# Engine configuration for Support DB
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Main NewsHub DB ---
main_db_url = settings.MAIN_DATABASE_URL
if main_db_url and main_db_url.startswith("postgres://"):
    main_db_url = main_db_url.replace("postgres://", "postgresql://", 1)

if not main_db_url:
    # Fallback if not configured
    main_db_url = "sqlite:///./main.db"

# Engine configuration for Main DB
if main_db_url.startswith("sqlite"):
    main_engine = create_engine(main_db_url, connect_args={"check_same_thread": False})
else:
    main_engine = create_engine(main_db_url, pool_pre_ping=True)

MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main_engine)
MainBase = declarative_base()

def get_main_db():
    db = MainSessionLocal()
    try:
        yield db
    finally:
        db.close()

