from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# Input schemas for Chat Creation
class GuestChatCreate(BaseModel):
    full_name: str
    email: EmailStr

# Output schemas for response formatting
class SupportChatBase(BaseModel):
    id: int
    user_id: Optional[int] = None
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SupportChatResponse(SupportChatBase):
    pass
