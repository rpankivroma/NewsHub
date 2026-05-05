from sqlalchemy import Column, Integer, String, Boolean, Float, Text
from ..db.database import Base

class DonationSettings(Base):
    __tablename__ = "donation_settings"

    id = Column(Integer, primary_key=True, index=True)
    goal_amount = Column(Float, default=50000.0)
    current_amount = Column(Float, default=0.0)
    campaign_description = Column(Text, nullable=True)
    
    # Patreon
    patreon_enabled = Column(Boolean, default=False)
    patreon_url = Column(String(500), nullable=True)
    
    # PayPal
    paypal_enabled = Column(Boolean, default=False)
    paypal_email = Column(String(255), nullable=True)
    
    # Crypto
    crypto_enabled = Column(Boolean, default=False)
    bitcoin_wallet = Column(String(255), nullable=True)
    ethereum_wallet = Column(String(255), nullable=True)
