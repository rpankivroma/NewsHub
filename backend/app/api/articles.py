from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..repositories.article_repository import ArticleRepository

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("", response_model=List[schemas.Article])
def read_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return ArticleRepository.get_all(db, skip=skip, limit=limit)

@router.get("/{article_id}", response_model=schemas.Article)
def read_article(article_id: int, db: Session = Depends(get_db)):
    article = ArticleRepository.get_by_id(db, article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("", response_model=schemas.Article)
def create_article(
    article: schemas.ArticleCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return ArticleRepository.create(db, article, current_user.id, current_user.full_name)
