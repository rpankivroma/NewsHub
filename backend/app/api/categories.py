from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db.database import get_db
from ..repositories.category_repository import CategoryRepository

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    return CategoryRepository.get_all(db)
