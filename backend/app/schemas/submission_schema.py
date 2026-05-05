from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SubmissionBase(BaseModel):
    title: str
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    email: EmailStr
    full_name: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUserUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None

class SubmissionUpdate(BaseModel):
    status: str

class Submission(SubmissionBase):
    id: int
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
