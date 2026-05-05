from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class DonationRepository:
    @staticmethod
    def get_all(db: Session) -> List[models.Donation]:
        return db.query(models.Donation).order_by(models.Donation.timestamp.desc()).all()

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
    def create(db: Session, donation: schemas.DonationCreate) -> models.Donation:
        db_donation = models.Donation(**donation.dict())
        db.add(db_donation)
        
        # Update current amount in settings
        settings = db.query(models.DonationSettings).first()
        if settings:
            settings.current_amount += donation.amount
        
        db.commit()
        db.refresh(db_donation)
        return db_donation
