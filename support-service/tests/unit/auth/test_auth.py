import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.dependencies import get_current_user
from app.models import User
from tests.factories.user_factory import UserFactory
from tests.conftest import generate_token

def test_jwt_validation_success(main_db_session):
    """
    Test authenticating a user with a valid token.
    """
    user = UserFactory.create(main_db_session, email="alice@test.com", full_name="Alice Smith")
    token = generate_token(str(user.id))
    
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    authenticated_user = get_current_user(credentials=credentials, db=main_db_session)
    
    assert authenticated_user is not None
    assert authenticated_user.id == user.id
    assert authenticated_user.email == "alice@test.com"

def test_jwt_invalid_signature(main_db_session):
    """
    Test authenticating with an invalid token signature.
    """
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid-token-signature")
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials=credentials, db=main_db_session)
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Could not validate credentials"

def test_jwt_expired_token(main_db_session):
    """
    Test authenticating with an expired token.
    """
    token = generate_token("123", is_expired=True)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials=credentials, db=main_db_session)
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Could not validate credentials"

def test_jwt_user_not_exist(main_db_session):
    """
    Test authenticating when user_id in JWT does not exist in the repository.
    """
    token = generate_token("99999")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials=credentials, db=main_db_session)
    
    assert exc_info.value.status_code == 401
    assert "Could not validate credentials" in exc_info.value.detail
