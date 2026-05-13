from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from .. import schemas
from ..services.donation_service import DonationService

router = APIRouter(prefix="/donations", tags=["donations"])

@router.get("/settings", response_model=schemas.DonationSettings)
def get_public_donation_settings(db: Session = Depends(get_db)):
    settings = DonationService.get_donation_settings(db)
    if not settings:
        raise HTTPException(status_code=404, detail="Donation settings not found")
    return settings

@router.post("/", response_model=schemas.Donation)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    return DonationService.create_donation(db, donation)

@router.post("/payment")
def init_payment(data: dict, db: Session = Depends(get_db)):
    amount = data.get("amount")
    currency = data.get("currency", "USD")
    email = data.get("email")
    name = data.get("name")
    
    if not amount or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
        
    return DonationService.init_liqpay_payment(db, float(amount), currency, email, name)

from fastapi import Form
@router.post("/liqpay/callback")
def liqpay_callback(data: str = Form(...), signature: str = Form(...), db: Session = Depends(get_db)):
    success, message = DonationService.handle_liqpay_callback(db, data, signature)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"status": "ok"}
