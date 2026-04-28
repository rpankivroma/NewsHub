from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("/", response_model=List[schemas.Article])
def read_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    articles = db.query(models.Article).offset(skip).limit(limit).all()
    return articles

@router.get("/{article_id}", response_model=schemas.Article)
def read_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/", response_model=schemas.Article)
def create_article(
    article: schemas.ArticleCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_article = models.Article(**article.dict(), author_id=current_user.id) 
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article
