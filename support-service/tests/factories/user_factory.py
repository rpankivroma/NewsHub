from sqlalchemy.orm import Session
from app.models import User

class UserFactory:
    @staticmethod
    def create(db: Session, email: str = "user@test.com", full_name: str = "Test User", status: str = "active") -> User:
        user = User(
            email=email,
            full_name=full_name,
            status=status
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
