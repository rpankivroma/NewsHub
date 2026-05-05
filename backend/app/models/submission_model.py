from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from ..db.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100))
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    image_url = Column(String(500))
    email = Column(String(255), nullable=False)
    full_name = Column(String(255))
    status = Column(String(50), default="pending") # pending, approved, rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
