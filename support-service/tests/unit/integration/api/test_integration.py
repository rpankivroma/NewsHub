import pytest
from fastapi.testclient import TestClient
from app.models import SupportChat, User, SupportMessage
from tests.factories.user_factory import UserFactory
from tests.factories.chat_factory import ChatFactory
from tests.factories.message_factory import MessageFactory
from tests.conftest import generate_token

def test_api_guest_chat_creation_lifecycle(client, db_session, main_db_session):
    """
    1. Create guest chat through endpoint.
    2. Attempt to create a duplicate active guest chat (returns existing).
    3. Modify existing status to inactive.
    4. Succeeded in creating a new active guest chat.
    """
    payload = {
        "full_name": "John Watson",
        "email": "watson@bakerstreet.com"
    }
    
    # 1. Create first time
    response = client.post("/support/guest/chat", json=payload)
    assert response.status_code == 201
    chat_data = response.json()
    assert chat_data["guest_name"] == "John Watson"
    assert chat_data["status"] == "active"
    chat_id1 = chat_data["id"]

    # 2. Attempt duplicate active chat (returns the existing one)
    response_dup = client.post("/support/guest/chat", json=payload)
    assert response_dup.status_code == 201
    assert response_dup.json()["id"] == chat_id1

    # 3. Mark inactive (by admin endpoint)
    response_inactive = client.patch(f"/admin/support/chat/{chat_id1}/inactive")
    assert response_inactive.status_code == 200
    assert response_inactive.json()["new_status"] == "inactive"

    # 4. Create new chat now succeeds with a new assigned ID
    response_new = client.post("/support/guest/chat", json=payload)
    assert response_new.status_code == 201
    assert response_new.json()["id"] != chat_id1
    assert response_new.json()["status"] == "active"


def test_api_guest_creation_with_blocked_user_email(client, db_session, main_db_session):
    """
    Business Rules: Blocked accounts
    If a guest visitor inputs an email that belongs to a blocked registered user, we reject the request.
    """
    # Create blocked user in main database
    UserFactory.create(main_db_session, email="blocked@test.com", status="blocked")

    payload = {
        "full_name": "Innocent Mask",
        "email": "blocked@test.com"
    }

    # Creating guest chat should reject with 403 Forbidden
    response = client.post("/support/guest/chat", json=payload)
    assert response.status_code == 403
    assert "blocked" in response.json()["detail"].lower()


def test_api_authenticated_user_chat_endpoints(client, db_session, main_db_session):
    """
    1. Call protected route with a valid token -> chat created.
    2. Call protected route with active status while blocked -> rejected with 403.
    """
    user = UserFactory.create(main_db_session, email="bob@test.com")
    token = generate_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    # Call authenticated chat endpoint
    response = client.post("/support/chat", headers=headers)
    assert response.status_code == 201
    assert response.json()["user_id"] == user.id

    # Now block user
    user.status = "blocked"
    main_db_session.commit()

    # Call authenticated chat endpoint while blocked -> returns 403 Forbidden
    response_blocked = client.post("/support/chat", headers=headers)
    assert response_blocked.status_code == 403


def test_api_chat_soft_deletion(client, db_session):
    """
    Verify administrative soft delete transition.
    """
    chat = ChatFactory.create(db_session, status="active")
    MessageFactory.create(db_session, chat_id=chat.id, content="Hi")

    # Call DELETE admin endpoint
    response = client.delete(f"/admin/support/chat/{chat.id}")
    assert response.status_code == 200
    assert response.json()["new_status"] == "deleted"

    # Verify messages are preserved in DB despite soft deletion
    msg_count = db_session.query(SupportMessage).filter(SupportMessage.chat_id == chat.id).count()
    assert msg_count == 1


def test_api_read_status_marking(client, db_session):
    """
    Verify marking messages as read for both user and admin types.
    """
    chat = ChatFactory.create(db_session)
    msg1 = MessageFactory.create(db_session, chat_id=chat.id, sender_type="user", is_read=False)
    msg2 = MessageFactory.create(db_session, chat_id=chat.id, sender_type="agent", is_read=False)

    # Agent marks messages from visitor as read
    response = client.patch(f"/support/chat/{chat.id}/read?sender_type=agent")
    assert response.status_code == 200

    db_session.refresh(msg1)
    db_session.refresh(msg2)
    assert msg1.is_read is True # visitor message is marked read
    assert msg2.is_read is False # agent message remains unread

    # Visitor marks messages from agent as read
    response2 = client.patch(f"/support/chat/{chat.id}/read?sender_type=user")
    assert response2.status_code == 200

    db_session.refresh(msg2)
    assert msg2.is_read is True # now agent message is marked read
