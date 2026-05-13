from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DonationBase(BaseModel):
    amount: float
    currency: str = "USD"
    method: str
    donor_email: Optional[str] = None
    order_id: Optional[str] = None

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    status: str
    liqpay_transaction_id: Optional[str] = None

class Donation(DonationBase):
    id: int
    status: str
    liqpay_transaction_id: Optional[str] = None
    timestamp: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
