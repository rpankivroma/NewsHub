import pytest
from pydantic import ValidationError
from app.schemas import GuestChatCreate, SupportChatResponse
from datetime import datetime, timezone

def test_validation_guest_chat_schema():
    """
    Test validation of the GuestChatCreate input schema.
    """
    # 1. Valid payload
    valid_payload = {
        "full_name": "Gregory House",
        "email": "house@diagnostics.com"
    }
    obj = GuestChatCreate(**valid_payload)
    assert obj.full_name == "Gregory House"
    assert obj.email == "house@diagnostics.com"

    # 2. Invalid Email format validation (should raise ValidationError)
    invalid_email_payload = {
        "full_name": "No Email",
        "email": "not-a-valid-email-string"
    }
    with pytest.raises(ValidationError):
        GuestChatCreate(**invalid_email_payload)

    # 3. Missing Name validation (should raise ValidationError)
    missing_name_payload = {
        "email": "some@email.com"
    }
    with pytest.raises(ValidationError):
        GuestChatCreate(**missing_name_payload)


def test_dto_schemas_match_specification():
    """
    Test that Response DTO Schemas match expected field constraints.
    """
    # SupportChatResponse DTO check
    dt_now = datetime.now(timezone.utc)
    chat_dto_payload = {
        "id": 101,
        "user_id": 5,
        "guest_email": None,
        "guest_name": None,
        "status": "active",
        "created_at": dt_now,
        "updated_at": dt_now
    }
    
    chat_response = SupportChatResponse(**chat_dto_payload)
    assert chat_response.id == 101
    assert chat_response.status == "active"
    assert chat_response.created_at == dt_now
