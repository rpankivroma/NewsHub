from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base, MainBase

class SupportChat(Base):
    __tablename__ = "support_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True) # Nullable for guests
    guest_email = Column(String(255), nullable=True, index=True) # Nullable for authenticated users
    guest_name = Column(String(255), nullable=True)
    status = Column(String(50), default="active", nullable=False, index=True) # active, closed (previously was default "open", let's use "active" for consistency with Step 13)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    messages = relationship("SupportMessage", back_populates="chat", cascade="all, delete-orphan")
    notifications = relationship("SupportEmailNotification", back_populates="chat", cascade="all, delete-orphan")

class User(MainBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255))
    status = Column(String(50), default="active")


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("support_chats.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String(50), nullable=False) # e.g., "user", "agent", "system"
    sender_id = Column(Integer, nullable=True) # Nullable if guest sender
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)

    # Relationships
    chat = relationship("SupportChat", back_populates="messages")

class SupportEmailNotification(Base):
    __tablename__ = "support_email_notifications"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("support_chats.id", ondelete="CASCADE"), nullable=True, index=True)
    recipient_email = Column(String(255), nullable=False, index=True)
    notification_type = Column(String(100), nullable=False) # e.g., "new_message", "chat_summary"
    status = Column(String(50), default="pending", nullable=False, index=True) # pending, sent, failed
    retry_count = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)

    # Relationships
    chat = relationship("SupportChat", back_populates="notifications")
