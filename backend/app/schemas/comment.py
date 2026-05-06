from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str
    article_id: int

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    user_full_name: Optional[str] = None
    user_avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
