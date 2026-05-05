from sqlalchemy.orm import Session
from .. import models, schemas
from typing import Optional

class AboutRepository:
    @staticmethod
    def get_page(db: Session) -> Optional[models.AboutPage]:
        return db.query(models.AboutPage).first()

    @staticmethod
    def update_page(db: Session, data: schemas.AboutPageCreate) -> models.AboutPage:
        page = db.query(models.AboutPage).first()
        if not page:
            page = models.AboutPage(**data.dict())
            db.add(page)
        else:
            for key, value in data.dict().items():
                setattr(page, key, value)
        
        db.commit()
        db.refresh(page)
        return page
