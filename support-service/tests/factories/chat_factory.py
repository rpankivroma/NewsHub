from sqlalchemy.orm import Session
from app.models import SupportChat
from typing import Optional

class ChatFactory:
    @staticmethod
    def create(
        db: Session, 
        user_id: Optional[int] = None, 
        guest_email: Optional[str] = None, 
        guest_name: Optional[str] = None, 
        status: str = "active"
    ) -> SupportChat:
        chat = SupportChat(
            user_id=user_id,
            guest_email=guest_email,
            guest_name=guest_name,
            status=status
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat
