from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class UserRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, is_admin: Optional[bool] = None, status: Optional[str] = None) -> List[models.User]:
        from sqlalchemy import or_
        query = db.query(models.User)
        
        if search:
            query = query.filter(
                or_(
                    models.User.full_name.ilike(f"%{search}%"),
                    models.User.email.ilike(f"%{search}%")
                )
            )
        
        if is_admin is not None:
            query = query.filter(models.User.is_admin == is_admin)
        
        if status:
            query = query.filter(models.User.status == status)
            
        return query.order_by(models.User.joined_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.email == email).first()

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

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
