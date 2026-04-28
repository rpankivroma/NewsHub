from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    bio = Column(Text)
    avatar_url = Column(String(512))
    is_admin = Column(Boolean, default=False)
    status = Column(String(50), default="active") # active, blocked, pending
    interests = Column(Text) # JSON string of interests
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Email verification fields
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(10), nullable=True)

    articles = relationship("Article", back_populates="author")
    comments = relationship("Comment", back_populates="user")
