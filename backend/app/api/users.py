from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..services.user_service import UserService
from ..services.article_service import ArticleService
from ..services.submission_service import SubmissionService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return UserService.update_user(db, current_user.id, user_update)

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    url = await UserService.upload_profile_photo(db, current_user, file)
    return {"url": url}

@router.get("/me/personalized", response_model=List[schemas.Article])
async def get_personalized_feed(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return ArticleService.get_user_personalized_articles(db, current_user, skip=skip, limit=limit, search=search)

@router.get("/me/saved", response_model=List[schemas.Article])
async def get_my_saved_articles(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from ..repositories.article_repository import ArticleRepository
    return ArticleRepository.get_saved_articles(db, current_user.id, skip=skip, limit=limit, search=search, category_id=category_id)

@router.get("/me/submissions")
async def get_my_submissions(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from ..repositories.submission_repository import SubmissionRepository
    return SubmissionRepository.get_by_email(db, current_user.email, skip=skip, limit=limit, search=search, status=status)
