from pydantic import BaseModel
from typing import Optional

class DonationSettingsBase(BaseModel):
    goal_amount: float
    current_amount: float
    campaign_description: Optional[str] = None
    patreon_enabled: bool = False
    patreon_url: Optional[str] = None
    paypal_enabled: bool = False
    paypal_email: Optional[str] = None
    crypto_enabled: bool = False
    bitcoin_wallet: Optional[str] = None
    ethereum_wallet: Optional[str] = None

class DonationSettingsCreate(DonationSettingsBase):
    pass

class DonationSettings(DonationSettingsBase):
    id: int

    class Config:
        from_attributes = True
