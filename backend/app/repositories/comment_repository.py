from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class CommentRepository:
    @staticmethod
    def create(db: Session, comment: schemas.comment.CommentCreate, user_id: int) -> models.Comment:
        db_comment = models.Comment(
            content=comment.content,
            article_id=comment.article_id,
            user_id=user_id
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

    @staticmethod
    def delete(db: Session, comment_id: int) -> bool:
        db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
        if not db_comment:
            return False
        db.delete(db_comment)
        db.commit()
        return True

    @staticmethod
    def get_by_article(db: Session, article_id: int) -> List[models.Comment]:
        return db.query(models.Comment).filter(models.Comment.article_id == article_id).order_by(models.Comment.created_at.desc()).all()
