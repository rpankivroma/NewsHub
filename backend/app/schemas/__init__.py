from .user import User, UserCreate, UserVerify
from .category import Category, CategoryCreate
from .article_schema import Article, ArticleCreate
from .comment import Comment, CommentCreate
from .token import Token, TokenData

# This allows importing all schemas from backend.app.schemas
__all__ = ["User", "UserCreate", "UserVerify", "Category", "CategoryCreate", "Article", "ArticleCreate", "Comment", "CommentCreate", "Token", "TokenData"]
