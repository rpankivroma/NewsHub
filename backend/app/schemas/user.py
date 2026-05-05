from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    status: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    interests: Optional[str] = None
    tags: Optional[str] = None
    newsletter_subscribed: bool = False
    is_verified: bool
    joined_at: datetime
    saved_articles_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class UserVerify(BaseModel):
    email: EmailStr
    code: str

class UserResendCode(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = None # JSON string
    tags: Optional[str] = None # JSON string
    newsletter_subscribed: Optional[bool] = None
    avatar_url: Optional[str] = None
