from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    content: str
    article_id: int

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
