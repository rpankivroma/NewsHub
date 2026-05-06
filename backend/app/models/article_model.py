from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.database import Base

bookmarks = Table(
    "bookmarks",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
)

article_likes = Table(
    "article_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
)

article_dislikes = Table(
    "article_dislikes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    image_url = Column(String(512))
    is_featured = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_author = relationship("User", back_populates="articles")
    category_rel = relationship("Category", back_populates="articles")
    comments = relationship("Comment", back_populates="article")
    saved_by = relationship("User", secondary=bookmarks, back_populates="saved_articles")
    liked_by = relationship("User", secondary=article_likes, back_populates="liked_articles")
    disliked_by = relationship("User", secondary=article_dislikes, back_populates="disliked_articles")
