from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class SubmissionRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None) -> List[models.Submission]:
        from sqlalchemy import or_
        query = db.query(models.Submission)
        
        if status:
            query = query.filter(models.Submission.status == status)
            
        if search:
            query = query.filter(
                or_(
                    models.Submission.title.ilike(f"%{search}%"),
                    models.Submission.excerpt.ilike(f"%{search}%"),
                    models.Submission.content.ilike(f"%{search}%"),
                    models.Submission.full_name.ilike(f"%{search}%"),
                    models.Submission.email.ilike(f"%{search}%")
                )
            )
            
        return query.order_by(models.Submission.submitted_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, submission_id: int) -> Optional[models.Submission]:
        return db.query(models.Submission).filter(models.Submission.id == submission_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str, skip: int = 0, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None) -> List[models.Submission]:
        from sqlalchemy import or_
        query = db.query(models.Submission).filter(models.Submission.email == email)
        
        if status:
            query = query.filter(models.Submission.status == status)
            
        if search:
            query = query.filter(
                or_(
                    models.Submission.title.ilike(f"%{search}%"),
                    models.Submission.excerpt.ilike(f"%{search}%"),
                    models.Submission.content.ilike(f"%{search}%")
                )
            )
            
        return query.order_by(models.Submission.submitted_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, submission: schemas.SubmissionCreate) -> models.Submission:
        db_submission = models.Submission(**submission.dict())
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        return db_submission

    @staticmethod
    def user_update(db: Session, submission_id: int, update_data: schemas.SubmissionUserUpdate) -> Optional[models.Submission]:
        submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
        if not submission or submission.status != "pending":
            return None
        
        data = update_data.dict(exclude_unset=True)
        for key, value in data.items():
            setattr(submission, key, value)
            
        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def update_status(db: Session, submission_id: int, status: str) -> Optional[models.Submission]:
        submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
        if submission:
            submission.status = status
            db.commit()
            db.refresh(submission)
        return submission
