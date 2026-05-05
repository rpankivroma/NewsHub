from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class CategoryRepository:
    @staticmethod
    def get_all(db: Session) -> List[models.Category]:
        return db.query(models.Category).all()

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Optional[models.Category]:
        return db.query(models.Category).filter(models.Category.id == category_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[models.Category]:
        return db.query(models.Category).filter(models.Category.name == name).first()

    @staticmethod
    def create(db: Session, category: schemas.CategoryCreate) -> models.Category:
        db_category = models.Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    @staticmethod
    def delete(db: Session, category_id: int) -> bool:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if category:
            db.delete(category)
            db.commit()
            return True
        return False

    @staticmethod
    def has_articles(db: Session, category_id: int) -> bool:
        count = db.query(models.Article).filter(models.Article.category_id == category_id).count()
        return count > 0
