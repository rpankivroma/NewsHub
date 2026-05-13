from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..services.comment_service import CommentService

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("", response_model=schemas.comment.Comment)
def create_comment(
    comment: schemas.comment.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return CommentService.create_comment(db, comment, current_user)

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    success, message = CommentService.delete_comment_with_permission(db, comment_id, current_user)
    if not success:
        if message == "Comment not found":
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)
    return {"success": success}
