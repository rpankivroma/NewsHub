from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .deps import get_current_user, get_current_user_optional
from .. import models, schemas
from ..db.database import get_db
from ..services.article_service import ArticleService
from ..services.comment_service import CommentService

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("", response_model=List[schemas.Article])
def read_articles(
    skip: int = 0, 
    limit: int = 20, 
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return ArticleService.get_articles(db, skip=skip, limit=limit, search=search, category_id=category_id)

@router.get("/{article_id}", response_model=schemas.Article)
def read_article(article_id: int, db: Session = Depends(get_db)):
    article = ArticleService.get_article_by_id(db, article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/{article_id}/save")
def toggle_save(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    saved = ArticleService.toggle_save_article(db, current_user.id, article_id)
    return {"saved": saved}

@router.get("/{article_id}/is-saved")
def check_is_saved(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return {"saved": ArticleService.is_article_saved(db, current_user.id, article_id)}

@router.post("/{article_id}/like")
def like_article(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return ArticleService.toggle_like_article(db, current_user.id, article_id)

@router.post("/{article_id}/dislike")
def dislike_article(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return ArticleService.toggle_dislike_article(db, current_user.id, article_id)

@router.get("/{article_id}/interactions")
def get_interactions(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    if not current_user:
        return {"liked": False, "disliked": False, "saved": False}
    return ArticleService.get_article_interactions(db, current_user.id, article_id)

@router.get("/{article_id}/comments", response_model=List[schemas.comment.Comment])
def get_comments(article_id: int, db: Session = Depends(get_db)):
    comments = CommentService.get_comments_by_article(db, article_id)
    for comment in comments:
        comment.user_full_name = comment.user.full_name if comment.user else "Anonymous"
        comment.user_avatar_url = comment.user.avatar_url if comment.user else None
    return comments

@router.post("", response_model=schemas.Article)
def create_article(
    article: schemas.ArticleCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return ArticleService.create_article(db, article, current_user.id, current_user.full_name)
