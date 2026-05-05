from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class ArticleRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 20) -> List[models.Article]:
        articles = db.query(models.Article).offset(skip).limit(limit).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_by_id(db: Session, article_id: int) -> Optional[models.Article]:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if article:
            # Increment views
            article.views += 1
            db.commit()
            db.refresh(article)
            ArticleRepository._populate_extra_fields(article)
        return article

    @staticmethod
    def create(db: Session, article: schemas.ArticleCreate, author_id: int, author_name: str) -> models.Article:
        db_article = models.Article(**article.dict(), author_id=author_id)
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        
        # Populate extra fields for response
        db_article.author = author_name
        cat = db.query(models.Category).filter(models.Category.id == db_article.category_id).first()
        db_article.category = cat.name if cat else "Uncategorized"
        db_article.date = db_article.created_at.strftime("%b %d, %Y")
        
        return db_article

    @staticmethod
    def update(db: Session, article_id: int, article_update: schemas.ArticleUpdate) -> Optional[models.Article]:
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not db_article:
            return None
        
        update_data = article_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_article, key, value)
        
        db.commit()
        db.refresh(db_article)
        ArticleRepository._populate_extra_fields(db_article)
        return db_article

    @staticmethod
    def delete(db: Session, article_id: int) -> bool:
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not db_article:
            return False
        
        db.delete(db_article)
        db.commit()
        return True

    @staticmethod
    def get_personalized_feed(db: Session, interests: List[str], limit: int = 10) -> List[models.Article]:
        if not interests:
            return ArticleRepository.get_all(db, limit=limit)
        
        from ..models.category import Category
        # Match by category names
        articles = db.query(models.Article).join(Category).filter(Category.name.in_(interests)).order_by(models.Article.created_at.desc()).limit(limit).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_by_author(db: Session, author_id: int) -> List[models.Article]:
        articles = db.query(models.Article).filter(models.Article.author_id == author_id).order_by(models.Article.created_at.desc()).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def _populate_extra_fields(article: models.Article):
        article.author = article.user_author.full_name if article.user_author else "Deleted User"
        article.category = article.category_rel.name if article.category_rel else "Uncategorized"
        article.date = article.created_at.strftime("%b %d, %Y")
