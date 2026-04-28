from fastapi import APIRouter, Depends, HTTPException
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
