import pytest
from app.controllers import SupportChatController
from app.models import SupportChat, User
from tests.factories.user_factory import UserFactory
from tests.factories.chat_factory import ChatFactory

def test_create_guest_chat_new(db_session):
    """
    Successfully create a brand-new guest support chat when no active chat exists.
    """
    chat = SupportChatController.create_guest_chat(
        db=db_session,
        email="guest@test.com",
        full_name="Guest Visitor"
    )
    assert chat is not None
    assert chat.guest_email == "guest@test.com"
    assert chat.guest_name == "Guest Visitor"
    assert chat.status == "active"

def test_create_guest_chat_existing_active(db_session):
    """
    When an active chat exists for a guest email, return the existing one.
    """
    active_chat = ChatFactory.create(db_session, guest_email="guest@test.com", guest_name="Guest", status="active")
    
    chat = SupportChatController.create_guest_chat(
        db=db_session,
        email="guest@test.com",
        full_name="Guest Different Name"
    )
    
    assert chat.id == active_chat.id
    assert chat.guest_name == "Guest" # Holds the original chat

def test_create_guest_chat_existing_inactive(db_session):
    """
    When a previous chat was inactive, creating a guest chat spins up a new active chat.
    """
    inactive_chat = ChatFactory.create(db_session, guest_email="guest@test.com", guest_name="Guest", status="inactive")
    
    chat = SupportChatController.create_guest_chat(
        db=db_session,
        email="guest@test.com",
        full_name="Guest New"
    )
    
    assert chat.id != inactive_chat.id
    assert chat.status == "active"
    assert chat.guest_name == "Guest New"

def test_create_registered_chat_new(db_session, main_db_session):
    """
    Authenticated user creates an active chat.
    """
    user = UserFactory.create(main_db_session)
    chat = SupportChatController.create_authenticated_chat(db_session, user_id=user.id)
    
    assert chat is not None
    assert chat.user_id == user.id
    assert chat.status == "active"

def test_create_registered_chat_existing_active(db_session, main_db_session):
    """
    Return existing active support chat for authenticated user.
    """
    user = UserFactory.create(main_db_session)
    active_chat = ChatFactory.create(db_session, user_id=user.id, status="active")
    
    chat = SupportChatController.create_authenticated_chat(db_session, user_id=user.id)
    assert chat.id == active_chat.id

def test_create_registered_chat_existing_inactive(db_session, main_db_session):
    """
    Spin up a new active support chat if previous chat was inactive.
    """
    user = UserFactory.create(main_db_session)
    inactive_chat = ChatFactory.create(db_session, user_id=user.id, status="inactive")
    
    chat = SupportChatController.create_authenticated_chat(db_session, user_id=user.id)
    assert chat.id != inactive_chat.id
    assert chat.status == "active"
