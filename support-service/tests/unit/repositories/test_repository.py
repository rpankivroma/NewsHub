import pytest
from app.models import SupportChat, SupportMessage, User
from app.controllers import SupportChatController
from tests.factories.chat_factory import ChatFactory
from tests.factories.message_factory import MessageFactory

def test_repo_create_chat(db_session):
    """
    Test direct CRUD operation: Creation.
    """
    chat = SupportChat(
        guest_email="patient@hospital.org",
        guest_name="Sherlock Holmes",
        status="active"
    )
    db_session.add(chat)
    db_session.commit()
    db_session.refresh(chat)

    assert chat.id is not None
    assert chat.guest_name == "Sherlock Holmes"
    assert chat.status == "active"


def test_repo_update_chat(db_session):
    """
    Test direct CRUD operation: Update.
    """
    chat = ChatFactory.create(db_session, status="active")
    
    # Modify state
    chat.status = "inactive"
    db_session.commit()
    db_session.refresh(chat)

    assert chat.status == "inactive"


def test_repo_delete_chat_soft(db_session):
    """
    Test direct CRUD operation: Delete (soft delete to 'deleted').
    """
    chat = ChatFactory.create(db_session, status="active")
    
    # Soft delete
    chat.status = "deleted"
    db_session.commit()
    db_session.refresh(chat)

    db_item = db_session.query(SupportChat).filter(SupportChat.id == chat.id).first()
    assert db_item is not None
    assert db_item.status == "deleted"


def test_repo_create_message(db_session):
    """
    Test creating message and linking to foreign key.
    """
    chat = ChatFactory.create(db_session, status="active")
    msg = SupportMessage(
        chat_id=chat.id,
        sender_type="user",
        content="Elemental support, my dear Watson",
        is_read=False
    )
    db_session.add(msg)
    db_session.commit()
    db_session.refresh(msg)

    assert msg.id is not None
    assert msg.chat_id == chat.id
    assert msg.content == "Elemental support, my dear Watson"


def test_repo_find_active_chat(db_session):
    """
    Test finding active support chats.
    """
    # Active
    chat_act = ChatFactory.create(db_session, guest_email="l@test.com", status="active")
    # Inactive
    ChatFactory.create(db_session, guest_email="l@test.com", status="inactive")

    active_found = SupportChatController.get_active_chat_by_email(db_session, "l@test.com")
    assert active_found is not None
    assert active_found.id == chat_act.id
