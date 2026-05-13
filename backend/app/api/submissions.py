from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..db.database import get_db
from .deps import get_current_user
from ..services.submission_service import SubmissionService
from ..services.article_service import ArticleService

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post("", response_model=schemas.Submission)
async def create_submission(
    submission: schemas.SubmissionCreate,
    db: Session = Depends(get_db)
):
    return SubmissionService.create_submission(db, submission)

@router.put("/{submission_id}", response_model=schemas.Submission)
async def update_submission(
    submission_id: int,
    submission_update: schemas.SubmissionUserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    updated, message = SubmissionService.user_update_submission(db, submission_id, submission_update, current_user.email)
    if not updated:
        if message == "Submission not found":
            raise HTTPException(status_code=404, detail=message)
        if message == "Not authorized to update this submission":
            raise HTTPException(status_code=403, detail=message)
        raise HTTPException(status_code=400, detail=message)
    return updated

@router.post("/photo")
async def upload_submission_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    url = await ArticleService.upload_article_image(file)
    return {"url": url}

@router.get("/me", response_model=List[schemas.Submission])
async def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return SubmissionService.get_user_submissions(db, current_user.email)
