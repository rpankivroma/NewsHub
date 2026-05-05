from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class UserRepository:
    @staticmethod
    def get_all(db: Session) -> List[models.User]:
        users = db.query(models.User).order_by(models.User.joined_at.desc()).all()
        for u in users:
            u.saved_articles_count = 0 # Placeholder for now
        return users

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.email == email).first()

    @staticmethod
    def toggle_block(db: Session, user_id: int) -> Optional[models.User]:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            if user.status == "blocked":
                user.status = "active"
            else:
                user.status = "blocked"
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user
