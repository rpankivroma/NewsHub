from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

class SubmissionRepository:
    @staticmethod
    def get_all(db: Session) -> List[models.Submission]:
        return db.query(models.Submission).order_by(models.Submission.submitted_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, submission_id: int) -> Optional[models.Submission]:
        return db.query(models.Submission).filter(models.Submission.id == submission_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> List[models.Submission]:
        return db.query(models.Submission).filter(models.Submission.email == email).order_by(models.Submission.submitted_at.desc()).all()

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
