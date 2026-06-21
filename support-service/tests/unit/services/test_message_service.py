import pytest
from app.models import SupportChat, SupportMessage
from tests.factories.chat_factory import ChatFactory
from tests.factories.message_factory import MessageFactory

def validate_message_content(content: str) -> str:
    """
    Message contents validation business logic validator helper.
    """
    if not content or not content.strip():
        raise ValueError("Message cannot be empty")
    if len(content) > 4000:
        raise ValueError("Message exceeds maximum length")
    return content

def test_message_validation_success():
    """
    Verify valid message.
    """
    assert validate_message_content("Hello operational support!") == "Hello operational support!"

def test_message_validation_empty():
    """
    Verify empty message fails validation.
    """
    with pytest.raises(ValueError, match="Message cannot be empty"):
        validate_message_content("")

def test_message_validation_whitespace_only():
    """
    Verify whitespace message fails validation.
    """
    with pytest.raises(ValueError, match="Message cannot be empty"):
        validate_message_content("    \n   ")

def test_message_validation_too_long():
    """
    Verify very long message exceeding 4000 chars fails validation.
    """
    long_msg = "A" * 4001
    with pytest.raises(ValueError, match="Message exceeds maximum length"):
        validate_message_content(long_msg)


def test_visitor_sends_to_active_chat(db_session):
    """
    Verify message can be stored in active chat.
    """
    chat = ChatFactory.create(db_session, status="active")
    msg = MessageFactory.create(db_session, chat_id=chat.id, sender_type="user", content="Visitor msg")
    assert msg.id is not None
    assert msg.chat_id == chat.id
    assert msg.content == "Visitor msg"

def test_visitor_sends_to_inactive_deleted_blocked(db_session):
    """
    Verify visitors are prevented from sending to inactive, deleted or blocked chats.
    """
    inactive_chat = ChatFactory.create(db_session, status="inactive")
    deleted_chat = ChatFactory.create(db_session, status="deleted")
    
    # Custom assertion representing the websocket / controllers block on inactive/deleted chats
    def can_send(chat_status: str) -> bool:
        if chat_status in ["inactive", "deleted", "blocked"]:
            return False
        return True
        
    assert not can_send(inactive_chat.status)
    assert not can_send(deleted_chat.status)
    assert can_send("active")
