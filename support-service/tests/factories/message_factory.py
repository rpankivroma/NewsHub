from sqlalchemy.orm import Session
from app.models import SupportMessage
from typing import Optional

class MessageFactory:
    @staticmethod
    def create(
        db: Session, 
        chat_id: int, 
        sender_type: str = "user", 
        sender_id: Optional[int] = None, 
        content: str = "Hello Support", 
        is_read: bool = False
    ) -> SupportMessage:
        msg = SupportMessage(
            chat_id=chat_id,
            sender_type=sender_type,
            sender_id=sender_id,
            content=content,
            is_read=is_read
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg
