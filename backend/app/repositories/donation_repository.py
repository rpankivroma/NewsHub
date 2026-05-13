from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class DonationRepository:
    @staticmethod
    def get_all(db: Session) -> List[models.Donation]:
        return db.query(models.Donation).filter(models.Donation.status == "success").order_by(models.Donation.timestamp.desc()).limit(5).all()

    @staticmethod
    def get_settings(db: Session) -> Optional[models.DonationSettings]:
        return db.query(models.DonationSettings).first()

    @staticmethod
    def update_settings(db: Session, data: schemas.DonationSettingsCreate) -> models.DonationSettings:
        settings = db.query(models.DonationSettings).first()
        if not settings:
            settings = models.DonationSettings(**data.dict())
            db.add(settings)
        else:
            for key, value in data.dict(exclude_unset=True).items():
                setattr(settings, key, value)
        
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def get_by_order_id(db: Session, order_id: str) -> Optional[models.Donation]:
        return db.query(models.Donation).filter(models.Donation.order_id == order_id).first()

    @staticmethod
    def update(db: Session, donation_id: int, donation_update: schemas.DonationUpdate) -> Optional[models.Donation]:
        db_donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
        if not db_donation:
            return None
        
        # If status changed to success, update settings current_amount
        if donation_update.status == "success" and db_donation.status != "success":
            settings = db.query(models.DonationSettings).first()
            if settings:
                settings.current_amount += db_donation.amount
        
        for key, value in donation_update.dict(exclude_unset=True).items():
            setattr(db_donation, key, value)
            
        db.commit()
        db.refresh(db_donation)
        return db_donation

    @staticmethod
    def create(db: Session, donation: schemas.DonationCreate) -> models.Donation:
        db_donation = models.Donation(**donation.dict())
        db.add(db_donation)
        
        # Only update current amount if status is success immediately (for manual/direct methods if any)
        # For LiqPay we will wait for success callback
        if db_donation.status == "success":
            settings = db.query(models.DonationSettings).first()
            if settings:
                settings.current_amount += donation.amount
        
        db.commit()
        db.refresh(db_donation)
        return db_donation
