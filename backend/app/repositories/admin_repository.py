from sqlalchemy.orm import Session
from datetime import datetime
from .. import models

class AdminRepository:
    @staticmethod
    def create_log(db: Session, admin_id: int, action: str, details: str):
        log = models.AdminLog(
            admin_id=admin_id,
            action=action,
            details=details,
            timestamp=datetime.now()
        )
        db.add(log)
        db.commit()
