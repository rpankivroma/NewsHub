from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    excerpt: str
    content: str
    image_url: Optional[str] = None
    is_featured: bool = False
    category_id: int

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    category_id: Optional[int] = None

class Article(ArticleBase):
    id: int
    author_id: Optional[int] = None
    likes: int
    dislikes: int
    views: int
    created_at: datetime
    
    # Extra fields for frontend
    author: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None

    class Config:
        from_attributes = True
