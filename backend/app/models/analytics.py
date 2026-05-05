from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from ..db.database import Base

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(255)) # e.g. "Published Article", "Deleted User"
    details = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    device_type = Column(String(50)) # mobile, desktop
    is_new_user = Column(Boolean, default=False)
    path = Column(String(255))
    ip_address = Column(String(100), nullable=True)
