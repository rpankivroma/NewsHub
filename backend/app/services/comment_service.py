from sqlalchemy.orm import Session
from ..repositories.comment_repository import CommentRepository
from ..repositories.admin_repository import AdminRepository
from .. import schemas, models

class CommentService:
    @staticmethod
    def get_comments_by_article(db: Session, article_id: int):
        return CommentRepository.get_by_article(db, article_id)

    @staticmethod
    def create_comment(db: Session, comment: schemas.CommentCreate, user: models.User):
        new_comment = CommentRepository.create(db, comment, user.id)
        new_comment.user_full_name = user.full_name
        new_comment.user_avatar_url = user.avatar_url
        return new_comment

    @staticmethod
    def delete_comment_with_permission(db: Session, comment_id: int, current_user: models.User):
        comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
        if not comment:
            return False, "Comment not found"
        
        # Check if user is author of comment or admin
        if comment.user_id != current_user.id and not current_user.is_admin:
            return False, "Not enough permissions"
        
        if comment.user_id != current_user.id and current_user.is_admin:
            AdminRepository.create_log(db, current_user.id, "Deleted Comment", f"Admin deleted comment by user ID {comment.user_id}: {comment.content[:50]}...")

        success = CommentRepository.delete(db, comment_id)
        return success, "Comment deleted" if success else "Failed to delete comment"
