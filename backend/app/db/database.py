from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Try to load .env from current directory or parent directory
env_path = os.path.join(os.getcwd(), '.env')
if not os.path.exists(env_path):
    # Try one level up if not found in backend/
    env_path = os.path.join(os.path.dirname(os.getcwd()), '.env')

if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv() # Fallback to default search

# Prioritize DATABASE_URL if present
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")

    # Default port if not specified or set to "None"
    if not DB_PORT or DB_PORT.lower() == "none" or DB_PORT == "":
        DB_PORT = "3306"

    # Check if we have the minimum requirements for MySQL
    mysql_ready = all([DB_USER, DB_HOST, DB_NAME])

    if mysql_ready:
        SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        print(f"🚀 Connecting to MySQL database: {DB_NAME} at {DB_HOST}")
    else:
        # Fallback to SQLite if MySQL env vars are not complete
        SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
        print("💡 MySQL variables missing. Falling back to local SQLite database: sql_app.db")
else:
    print(f"🚀 Connecting to database via DATABASE_URL")

# Engine creation
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    # Connect to PostgreSQL (Neon)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
else:
    # pool_pre_ping helps with MySQL connection drops
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
