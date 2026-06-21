from sqlalchemy.orm import Session
from typing import Optional
from .models import SupportChat

class SupportChatController:
    @staticmethod
    def get_active_chat_by_email(db: Session, email: str) -> Optional[SupportChat]:
        """
        Finds an active support chat for a guest email.
        Matching 'active' status.
        """
        return db.query(SupportChat).filter(
            SupportChat.guest_email == email,
            SupportChat.status == "active"
        ).first()

    @staticmethod
    def get_active_chat_by_user_id(db: Session, user_id: int) -> Optional[SupportChat]:
        """
        Finds an active support chat for an authenticated user_id.
        Matching 'active' status.
        """
        return db.query(SupportChat).filter(
            SupportChat.user_id == user_id,
            SupportChat.status == "active"
        ).first()

    @staticmethod
    def get_any_active_chat_by_identifier(db: Session, email: Optional[str] = None, user_id: Optional[int] = None) -> Optional[SupportChat]:
        """
        Check if there's any active chat matching the identifiers.
        """
        if user_id is not None:
            return db.query(SupportChat).filter(
                SupportChat.user_id == user_id,
                SupportChat.status == "active"
            ).first()
        elif email is not None:
            return db.query(SupportChat).filter(
                SupportChat.guest_email == email,
                SupportChat.status == "active"
            ).first()
        return None

    @staticmethod
    def create_guest_chat(db: Session, email: str, full_name: str) -> SupportChat:
        """
        In accordance with Step 11 & Step 13:
        1. Find active chat by email (using status='active')
        2. If exists, return it
        3. Else, enforce single active chat and create indeed.
        """
        existing_chat = SupportChatController.get_active_chat_by_email(db, email)
        if existing_chat:
            return existing_chat

        # Enforce one active chat system-wide by identifying active first
        # Create new chat with active status
        new_chat = SupportChat(
            guest_email=email,
            guest_name=full_name,
            status="active"
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat

    @staticmethod
    def create_authenticated_chat(db: Session, user_id: int) -> SupportChat:
        """
        In accordance with Step 12 & Step 13:
        1. Find active chat by user_id (using status='active')
        2. If exists, return it
        3. Else, enforce single active chat and create indeed.
        """
        existing_chat = SupportChatController.get_active_chat_by_user_id(db, user_id)
        if existing_chat:
            return existing_chat

        # Create new chat with active status
        new_chat = SupportChat(
            user_id=user_id,
            status="active"
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat
