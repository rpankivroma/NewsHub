import random
import string
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user import User
from ..schemas.user import UserCreate, UserVerify
from ..core.security import get_password_hash, verify_password, create_access_token
from .email_service import send_verification_email

class AuthService:
    @staticmethod
    def generate_verification_code(length=6):
        return ''.join(random.choices(string.digits, k=length))

    @staticmethod
    async def register_user(db: Session, user_in: UserCreate):
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        
        hashed_password = get_password_hash(user_in.password)
        verification_code = AuthService.generate_verification_code()
        
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_admin=False,
            status="pending", # Mark as pending until verified
            is_verified=False,
            verification_code=verification_code
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send verification email
        send_verification_email(db_user.email, verification_code)
        
        return db_user

    @staticmethod
    async def verify_email(db: Session, verify_data: UserVerify):
        user = db.query(User).filter(User.email == verify_data.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.is_verified:
            return user
            
        if user.verification_code == verify_data.code:
            user.is_verified = True
            user.status = "active"
            user.verification_code = None
            db.commit()
            db.refresh(user)
            return user
        else:
            raise HTTPException(status_code=400, detail="Invalid verification code")

    @staticmethod
    async def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not verified. Please verify your email first."
            )
            
        return user

    @staticmethod
    async def get_token(user: User):
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
