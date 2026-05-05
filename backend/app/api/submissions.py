from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..db.database import get_db
from ..repositories.submission_repository import SubmissionRepository
from .deps import get_current_user

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post("", response_model=schemas.Submission)
async def create_submission(
    submission: schemas.SubmissionCreate,
    db: Session = Depends(get_db)
):
    return SubmissionRepository.create(db, submission)

@router.put("/{submission_id}", response_model=schemas.Submission)
async def update_submission(
    submission_id: int,
    submission_update: schemas.SubmissionUserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    submission = SubmissionRepository.get_by_id(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to update this submission")
    
    # Handle image deletion if changed
    update_data = submission_update.dict(exclude_unset=True)
    if "image_url" in update_data and update_data["image_url"] != submission.image_url:
        import os
        old_url = submission.image_url
        if old_url and old_url.startswith("/static/articles/"):
            filename = old_url.split("/")[-1]
            static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "articles"))
            file_path = os.path.join(static_dir, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass

    updated = SubmissionRepository.user_update(db, submission_id, submission_update)
    if not updated:
        raise HTTPException(status_code=400, detail="Could not update submission (maybe not pending?)")
    return updated

@router.post("/photo")
async def upload_submission_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    import os, uuid, shutil
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "articles"))
    os.makedirs(static_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(static_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/static/articles/{unique_filename}"}

@router.get("/me", response_model=List[schemas.Submission])
async def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return SubmissionRepository.get_by_email(db, current_user.email)
