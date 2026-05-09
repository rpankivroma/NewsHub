from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..repositories.comment_repository import CommentRepository
from ..repositories.admin_repository import AdminRepository

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("", response_model=schemas.comment.Comment)
def create_comment(
    comment: schemas.comment.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_comment = CommentRepository.create(db, comment, current_user.id)
    # Populate extra fields for response
    new_comment.user_full_name = current_user.full_name
    new_comment.user_avatar_url = current_user.avatar_url
    return new_comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is author of comment or admin
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if comment.user_id != current_user.id and current_user.is_admin:
        AdminRepository.create_log(db, current_user.id, "Deleted Comment", f"Admin deleted comment by user ID {comment.user_id}: {comment.content[:50]}...")

    success = CommentRepository.delete(db, comment_id)
    return {"success": success}
