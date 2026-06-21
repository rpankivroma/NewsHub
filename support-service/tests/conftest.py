import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt

# Add root folder of microservice to pythonpath
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, MainBase, get_db, get_main_db
from app.main import app
from app.config import settings
from app.models import User, SupportChat, SupportMessage, SupportEmailNotification
from app.websocket.manager import ConnectionManager, manager as ws_manager

# --- DB Setup ---
# Use separate SQLite in-memory databases for isolated, blazing fast testing
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

main_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main_engine)

# Monkeypatch the live database module attributes to globally use test DBs
from app import database as app_db
app_db.engine = engine
app_db.SessionLocal = SessionLocal
app_db.main_engine = main_engine
app_db.MainSessionLocal = MainSessionLocal

# Ensure tables are created
Base.metadata.create_all(bind=engine)
MainBase.metadata.create_all(bind=main_engine)


@pytest.fixture(scope="function", autouse=True)
def clean_databases():
    """
    Cleans up database tables before each test runs to guarantee isolated test states.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    MainBase.metadata.drop_all(bind=main_engine)
    MainBase.metadata.create_all(bind=main_engine)
    yield


@pytest.fixture(scope="function")
def db_session():
    """
    Returns an isolated session for support-service database.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def main_db_session():
    """
    Returns an isolated session for main NewsHub database.
    """
    session = MainSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function", autouse=True)
def override_db_dependency(monkeypatch):
    """
    Overrides the database dependencies of the FastAPI application.
    """
    def _override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def _override_get_main_db():
        db = MainSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_main_db] = _override_get_main_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="function", autouse=True)
def mock_external_services(monkeypatch):
    """
    Mocks Kafka and Brevo Email calls globally during tests to avoid socket blockings.
    """
    # Mock AIOKafkaProducer publish
    from app.kafka import producer
    async def mock_publish(topic: str, data: dict):
        pass
    monkeypatch.setattr(producer, "publish_event", mock_publish)
    monkeypatch.setattr(producer, "publish_chat_created", mock_publish)
    monkeypatch.setattr(producer, "publish_chat_status_changed", mock_publish)
    monkeypatch.setattr(producer, "publish_message_sent", mock_publish)

    # Mock Brevo email send
    from app.services import email_service
    async def mock_send_email(recipient_email: str, subject: str, html_content: str):
        # We can store mock calls inside a local attribute if we need to assert
        mock_send_email.calls.append({
            "recipient": recipient_email,
            "subject": subject,
            "html": html_content
        })
        return True
    mock_send_email.calls = []
    monkeypatch.setattr(email_service, "send_email", mock_send_email)
    
    # Store reference so tests can check it
    email_service.mock_send_email = mock_send_email

    # Mock settings secret for authentication and brevo API key
    settings.JWT_SECRET = "test-secret-key-123456"
    settings.BREVO_API_KEY = "test-brevo-key"
    yield


@pytest.fixture(scope="function")
def client():
    """
    Returns a clean TestClient instance for testing APIs.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
def fresh_ws_manager():
    """
    Returns a pristine ConnectionManager instance specifically for isolated WebSocket unit/integration tests.
    """
    return ConnectionManager()


# --- Authentication Helpers ---
def generate_token(sub: str, is_expired: bool = False) -> str:
    from datetime import datetime, timedelta, timezone
    secret = "test-secret-key-123456"
    algorithm = "HS256"
    
    delta = timedelta(days=-1) if is_expired else timedelta(hours=1)
    payload = {
        "sub": sub,
        "exp": datetime.now(timezone.utc) + delta
    }
    return jwt.encode(payload, secret, algorithm=algorithm)
