from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DonationBase(BaseModel):
    amount: float
    method: str
    donor_email: Optional[str] = None

class DonationCreate(DonationBase):
    pass

class Donation(DonationBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
