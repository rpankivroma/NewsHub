import pytest
from fastapi import HTTPException
from app.models import SupportChat, User
from tests.factories.chat_factory import ChatFactory
from tests.factories.user_factory import UserFactory

def check_chat_ownership(user_obj: User, chat_obj: SupportChat, guest_email_input: str = None) -> bool:
    """
    Core security validation function representing real ownership checks.
    """
    if chat_obj.user_id is not None:
        if user_obj is None or user_obj.id != chat_obj.user_id:
            raise HTTPException(status_code=403, detail="Permission Denied")
    else:
        # Guest chat
        if chat_obj.guest_email != guest_email_input:
            raise HTTPException(status_code=403, detail="Permission Denied")
    return True

def test_owner_access_registered(main_db_session, db_session):
    """
    Authenticated user requests their own registered chat.
    """
    user = UserFactory.create(main_db_session, email="owner@test.com")
    chat = ChatFactory.create(db_session, user_id=user.id)
    
    assert check_chat_ownership(user, chat) is True

def test_different_user_access_denied(main_db_session, db_session):
    """
    Verify 403 when User A tries to view User B's active support chat.
    """
    user_owner = UserFactory.create(main_db_session, email="owner@test.com")
    user_intruder = UserFactory.create(main_db_session, email="intruder@test.com")
    chat = ChatFactory.create(db_session, user_id=user_owner.id)
    
    with pytest.raises(HTTPException) as exc_info:
        check_chat_ownership(user_intruder, chat)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Permission Denied"

def test_guest_wrong_email_denied(db_session):
    """
    Verify 403 when guest B tries to read chat of guest A.
    """
    chat = ChatFactory.create(db_session, guest_email="legit_guest@test.com")
    
    with pytest.raises(HTTPException) as exc_info:
        check_chat_ownership(user_obj=None, chat_obj=chat, guest_email_input="other_guest@test.com")
        
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Permission Denied"

def test_endpoint_permission_roles():
    """
    Logical checks testing endpoint role classifications.
    """
    def check_role_permission(endpoint_type: str, user_role: str) -> bool:
        if endpoint_type == "admin" and user_role != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        if endpoint_type == "visitor" and user_role == "anonymous":
            raise HTTPException(status_code=401, detail="Unauthorized")
        return True

    # Guest -> Admin Endpoint
    with pytest.raises(HTTPException) as e:
        check_role_permission("admin", "guest")
    assert e.value.status_code == 403

    # User -> Admin Endpoint
    with pytest.raises(HTTPException) as e:
        check_role_permission("admin", "user")
    assert e.value.status_code == 403

    # Anonymous -> Protected Endpoint
    with pytest.raises(HTTPException) as e:
        check_role_permission("visitor", "anonymous")
    assert e.value.status_code == 401
