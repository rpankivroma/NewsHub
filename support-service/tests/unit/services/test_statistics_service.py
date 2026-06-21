import pytest
from datetime import datetime, timedelta, timezone
from app.routers.support import get_support_statistics
from tests.factories.chat_factory import ChatFactory
from tests.factories.message_factory import MessageFactory

def test_statistics_empty_database(db_session):
    """
    When database has no chats or messages, statistics should return clean zeroes.
    """
    stats = get_support_statistics(db_session)
    assert stats["active_chats"] == 0
    assert stats["new_chats"] == 0
    assert stats["unread_messages"] == 0
    assert stats["avg_response_time"] == 0.0

def test_statistics_calculations(db_session):
    """
    Verify calculations for active count, new logs today, unread count, and response timing.
    """
    # 1. Active Chats
    ChatFactory.create(db_session, status="active")
    ChatFactory.create(db_session, status="active")
    ChatFactory.create(db_session, status="inactive")
    ChatFactory.create(db_session, status="deleted") # Deleted won't count in active or new
    
    # 2. Daily creation and Messages Unread setup
    # Chat 1: created just now, has unread user message
    chat1 = ChatFactory.create(db_session, status="active")
    MessageFactory.create(db_session, chat_id=chat1.id, sender_type="user", content="Hi", is_read=False)
    
    # Chat 2: has multiple unread user messages
    chat2 = ChatFactory.create(db_session, status="active")
    MessageFactory.create(db_session, chat_id=chat2.id, sender_type="user", content="Msg 1", is_read=False)
    MessageFactory.create(db_session, chat_id=chat2.id, sender_type="user", content="Msg 2", is_read=False)
    
    # Let's mock a response time: user sent message, agent replied 10 seconds later
    chat3 = ChatFactory.create(db_session, status="active")
    msg_user = MessageFactory.create(db_session, chat_id=chat3.id, sender_type="user", content="Timing message", is_read=True)
    msg_user.created_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=20)
    db_session.add(msg_user)
    
    msg_agent = MessageFactory.create(db_session, chat_id=chat3.id, sender_type="agent", content="Timing reply", is_read=True)
    msg_agent.created_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=10)
    db_session.add(msg_agent)
    
    db_session.commit()
    
    stats = get_support_statistics(db_session)
    
    # Active: 2 (from step 1) + 1 (chat1) + 1 (chat2) + 1 (chat3) = 5 active chats. Wait, "active" count should be 5
    assert stats["active_chats"] == 5
    # New: 6 chats (all created today, excluding the deleted one)
    assert stats["new_chats"] == 6
    # Unread user messages: 1 (chat1 hi) + 2 (chat2 msg1 + msg2) = 3 unread
    assert stats["unread_messages"] == 3
    # Avg response time should be ~10 seconds
    assert 9.0 <= stats["avg_response_time"] <= 11.0
