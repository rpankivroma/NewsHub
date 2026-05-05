from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from .. import schemas
from ..repositories.about_repository import AboutRepository

router = APIRouter(prefix="/about", tags=["about"])

@router.get("", response_model=schemas.AboutPage)
def get_about_page(db: Session = Depends(get_db)):
    about = AboutRepository.get_page(db)
    if not about:
        raise HTTPException(status_code=404, detail="About page content not found")
    return about
