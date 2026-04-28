from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from ..db.database import Base

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    method = Column(String(50)) # card, patreon, paypal, crypto
    donor_email = Column(String(255))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
