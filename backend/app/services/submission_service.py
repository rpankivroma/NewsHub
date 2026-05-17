from typing import Optional
from sqlalchemy.orm import Session
from ..repositories.submission_repository import SubmissionRepository
from ..repositories.article_repository import ArticleRepository
from ..repositories.category_repository import CategoryRepository
from ..repositories.user_repository import UserRepository
from ..repositories.admin_repository import AdminRepository
from .. import schemas, models

class SubmissionService:
    @staticmethod
    def get_submissions(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None):
        return SubmissionRepository.get_all(db, skip, limit, search, status)

    @staticmethod
    def create_submission(db: Session, submission: schemas.SubmissionCreate):
        return SubmissionRepository.create(db, submission)

    @staticmethod
    def user_update_submission(db: Session, submission_id: int, submission_update: schemas.SubmissionUserUpdate, current_user_email: str):
        submission = SubmissionRepository.get_by_id(db, submission_id)
        if not submission:
            return None, "Submission not found"
        if submission.email != current_user_email:
            return None, "Not authorized to update this submission"
        
        # Handle image deletion if changed
        update_data = submission_update.dict(exclude_unset=True)
        if "image_url" in update_data and update_data["image_url"] != submission.image_url:
            from .article_service import ArticleService
            ArticleService.delete_file_from_static(submission.image_url)

        updated = SubmissionRepository.user_update(db, submission_id, submission_update)
        if not updated:
            return None, "Could not update submission (maybe not pending?)"
        return updated, "Success"

    @staticmethod
    def get_user_submissions(db: Session, email: str, skip: int = 0, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None):
        return SubmissionRepository.get_by_email(db, email, skip, limit, search, status)

    @staticmethod
    def update_submission(db: Session, submission_id: int, data: dict, current_admin: models.User):
        submission = SubmissionRepository.get_by_id(db, submission_id)
        if not submission:
            return None
        
        if "status" in data:
            updated_submission = SubmissionRepository.update_status(db, submission_id, data["status"])
            if data["status"] == "approved" and updated_submission:
                # Resolve category_id
                category_name = updated_submission.category or "General"
                category = CategoryRepository.get_by_name(db, category_name)
                if not category:
                    categories = CategoryRepository.get_all(db)
                    cat_id = categories[0].id if categories else 1
                else:
                    cat_id = category.id

                # Create an actual article from the approved submission
                article_data = schemas.ArticleCreate(
                    title=updated_submission.title,
                    content=updated_submission.content,
                    excerpt=updated_submission.excerpt or (updated_submission.content[:150] + "..." if len(updated_submission.content) > 150 else updated_submission.content),
                    category_id=cat_id,
                    image_url=updated_submission.image_url,
                    is_featured=False
                )
                
                submitter = UserRepository.get_by_email(db, updated_submission.email)
                author_id = submitter.id if submitter else current_admin.id
                author_name = submitter.full_name if submitter else (updated_submission.full_name or current_admin.full_name)

                ArticleRepository.create(db, article_data, author_id)
                AdminRepository.create_log(db, current_admin.id, "Approved Submission", f"Approved and published submission from {author_name}: {updated_submission.title}")
            elif data["status"] == "rejected" and updated_submission:
                AdminRepository.create_log(db, current_admin.id, "Rejected Submission", f"Rejected submission from {updated_submission.full_name or 'Unknown'}: {updated_submission.title}")
            
            return updated_submission
        return submission
