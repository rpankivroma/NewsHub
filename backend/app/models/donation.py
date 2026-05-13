from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from ..db.database import Base

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    method = Column(String(50)) # card, patreon, paypal, crypto
    status = Column(String(50), default="pending") # pending, success, reversed, failure
    donor_email = Column(String(255))
    donor_name = Column(String(255))
    order_id = Column(String(100), unique=True)
    liqpay_transaction_id = Column(String(100))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
