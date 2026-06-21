import pytest
from app.services.email_service import check_and_send_offline_notification, send_email
from app.websocket.manager import manager as ws_manager
from app.models import SupportEmailNotification, SupportChat
from tests.factories.chat_factory import ChatFactory
from tests.factories.user_factory import UserFactory

@pytest.mark.asyncio
async def test_email_notification_visitor_online(db_session, monkeypatch):
    """
    If visitor is online via WebSocket, offline email notification should NOT be sent.
    """
    chat = ChatFactory.create(db_session, guest_email="customer@online.com", status="active")
    
    # Mock visitor is online
    monkeypatch.setattr(ws_manager, "is_visitor_connected", lambda chat_id: True)
    
    await check_and_send_offline_notification(db_session, chat.id)
    
    # Verify no notification record was generated in database
    count = db_session.query(SupportEmailNotification).filter(SupportEmailNotification.chat_id == chat.id).count()
    assert count == 0


@pytest.mark.asyncio
async def test_email_notification_visitor_offline(db_session, monkeypatch):
    """
    If visitor is offline, offline email notification SHOULD be sent and stored in database as 'sent'.
    """
    chat = ChatFactory.create(db_session, guest_email="customer@offline.com", status="active")
    
    # Mock visitor is offline
    monkeypatch.setattr(ws_manager, "is_visitor_connected", lambda chat_id: False)
    
    # Clear mock calls
    from app.services import email_service
    email_service.mock_send_email.calls = []
    
    await check_and_send_offline_notification(db_session, chat.id)
    
    # Assert notification record was written as 'sent'
    record = db_session.query(SupportEmailNotification).filter(SupportEmailNotification.chat_id == chat.id).first()
    assert record is not None
    assert record.status == "sent"
    assert record.recipient_email == "customer@offline.com"
    
    # Assert mock Brevo call indeed occurred
    assert len(email_service.mock_send_email.calls) == 1
    assert email_service.mock_send_email.calls[0]["recipient"] == "customer@offline.com"


@pytest.mark.asyncio
async def test_email_notification_duplicate_skipped(db_session, monkeypatch):
    """
    Ensure we don't send duplicate notifications for the same chat.
    """
    chat = ChatFactory.create(db_session, guest_email="customer@offline.com", status="active")
    monkeypatch.setattr(ws_manager, "is_visitor_connected", lambda chat_id: False)
    
    # Send first time
    await check_and_send_offline_notification(db_session, chat.id)
    
    # Send second time
    await check_and_send_offline_notification(db_session, chat.id)
    
    # Ensure only 1 record is created
    records = db_session.query(SupportEmailNotification).filter(SupportEmailNotification.chat_id == chat.id).all()
    assert len(records) == 1


@pytest.mark.asyncio
async def test_email_notification_brevo_failure(db_session, monkeypatch):
    """
    Verify that if the Brevo API fails, the service handles it gracefully, updating record to 'failed'.
    """
    chat = ChatFactory.create(db_session, guest_email="customer@fail.com", status="active")
    monkeypatch.setattr(ws_manager, "is_visitor_connected", lambda chat_id: False)
    
    # Force Brevo send_email mock to return False (failure)
    from app.services import email_service
    async def mock_failed_send(recipient, subject, html):
        return False
    monkeypatch.setattr(email_service, "send_email", mock_failed_send)
    
    await check_and_send_offline_notification(db_session, chat.id)
    
    # Ensure record is marked as failed
    record = db_session.query(SupportEmailNotification).filter(SupportEmailNotification.chat_id == chat.id).first()
    assert record is not None
    assert record.status == "failed"
