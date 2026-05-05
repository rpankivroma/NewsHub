from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from .. import schemas
from ..repositories.donation_repository import DonationRepository

router = APIRouter(prefix="/donations", tags=["donations"])

@router.get("/settings", response_model=schemas.DonationSettings)
def get_public_donation_settings(db: Session = Depends(get_db)):
    settings = DonationRepository.get_settings(db)
    if not settings:
        raise HTTPException(status_code=404, detail="Donation settings not found")
    return settings

@router.post("/", response_model=schemas.Donation)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    return DonationRepository.create(db, donation)
