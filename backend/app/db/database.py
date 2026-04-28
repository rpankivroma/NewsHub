from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_USER, DB_HOST, DB_NAME]):
    # Note: DB_PASSWORD can be empty sometimes, so we don't strictly require it in the check
    print("Warning: Missing database environment variables. Please check your .env file.")

# We use pymysql as the driver for MySQL
if all([DB_USER, DB_HOST, DB_NAME]):
    if DB_PORT:
        SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
else:
    # Fallback to SQLite if MySQL env vars are not complete
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
    if not os.path.exists("./sql_app.db"):
        print("💡 MySQL variables missing. Falling back to local SQLite database: sql_app.db")

# For SQLite during development if MySQL isn't available
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
