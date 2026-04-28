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

class Article(ArticleBase):
    id: int
    author_id: int
    likes: int
    dislikes: int
    created_at: datetime
    
    class Config:
        from_attributes = True
