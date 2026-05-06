from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
import json
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..repositories.user_repository import UserRepository
from ..repositories.article_repository import ArticleRepository
from ..repositories.submission_repository import SubmissionRepository

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
    return UserRepository.update(db, current_user.id, user_update)

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "profile"))
    os.makedirs(static_dir, exist_ok=True)
    
    # Delete old photo
    if current_user.avatar_url and "/static/profile/" in current_user.avatar_url:
        old_filename = current_user.avatar_url.split("/")[-1]
        old_path = os.path.join(static_dir, old_filename)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except:
                pass
                
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(static_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    url = f"/static/profile/{unique_filename}"
    UserRepository.update(db, current_user.id, schemas.UserUpdate(avatar_url=url))
    
    return {"url": url}

@router.get("/me/personalized", response_model=List[schemas.Article])
async def get_personalized_feed(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interests = []
    if current_user.interests:
        try:
            interests = json.loads(current_user.interests)
        except:
            interests = [i.strip() for i in current_user.interests.split(",") if i.strip()]
    
    tags = []
    if current_user.tags:
        try:
            tags = json.loads(current_user.tags)
        except:
            tags = [t.strip() for t in current_user.tags.split(",") if t.strip()]
    
    return ArticleRepository.get_personalized_feed(db, interests, tags, skip=skip, limit=limit, search=search)

@router.get("/me/saved", response_model=List[schemas.Article])
async def get_my_saved_articles(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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
    return SubmissionRepository.get_by_email(db, current_user.email, skip=skip, limit=limit, search=search, status=status)
