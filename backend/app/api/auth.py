from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas
from ..services.auth_service import AuthService
from ..db.database import get_db

router = APIRouter(tags=["auth"])

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    user = await AuthService.authenticate_user(db, login_data.email or login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await AuthService.get_token(user)

@router.post("/register", response_model=schemas.User)
async def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    return await AuthService.register_user(db, user_in)

@router.post("/verify-email", response_model=schemas.User)
async def verify_email(verify_data: schemas.UserVerify, db: Session = Depends(get_db)):
    return await AuthService.verify_email(db, verify_data)

@router.post("/resend-code")
async def resend_code(data: schemas.UserResendCode, db: Session = Depends(get_db)):
    return await AuthService.resend_verification_code(db, data.email)

@router.post("/forgot-password")
async def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    return await AuthService.forgot_password(db, data.email)

@router.post("/reset-password")
async def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    return await AuthService.reset_password(db, data)
