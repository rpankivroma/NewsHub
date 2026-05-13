from sqlalchemy.orm import Session
from ..repositories.about_repository import AboutRepository
from .. import schemas

class AboutService:
    @staticmethod
    def get_about_page(db: Session):
        return AboutRepository.get_page(db)

    @staticmethod
    def update_about_page(db: Session, data: schemas.AboutPageCreate):
        return AboutRepository.update_page(db, data)
