import os
import shutil
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import UploadFile
from ..repositories.article_repository import ArticleRepository
from ..repositories.admin_repository import AdminRepository
from .. import schemas, models

class ArticleService:
    @staticmethod
    def _populate_extra_fields(article: models.Article):
        article.author = article.user_author.full_name if article.user_author else "Deleted User"
        article.category = article.category_rel.name if article.category_rel else "Uncategorized"
        article.date = article.created_at.strftime("%b %d, %Y")

    @staticmethod
    def get_articles(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, category_id: Optional[int] = None):
        articles = ArticleRepository.get_all(db, skip, limit, search, category_id)
        for article in articles:
            ArticleService._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_article_by_id(db: Session, article_id: int):
        article = ArticleRepository.get_by_id(db, article_id)
        if article:
            ArticleService._populate_extra_fields(article)
        return article

    @staticmethod
    def create_article(db: Session, article: schemas.ArticleCreate, admin_id: int, admin_name: str):
        db_article = ArticleRepository.create(db, article, admin_id)
        
        # Populate extra fields for response/notification
        db_article.author = admin_name
        cat = db.query(models.Category).filter(models.Category.id == db_article.category_id).first()
        db_article.category = cat.name if cat else "Uncategorized"
        db_article.date = db_article.created_at.strftime("%b %d, %Y")

        # Notify subscribed users
        ArticleService._notify_subscribed_users(db, db_article)

        AdminRepository.create_log(db, admin_id, "Created Article", f"Created article: {db_article.title}")
        return db_article

    @staticmethod
    def _notify_subscribed_users(db: Session, article: models.Article):
        import json
        from .email_service import send_newsletter_alert
        subscribed_users = db.query(models.User).filter(models.User.newsletter_subscribed == True).all()
        
        category_name = getattr(article, 'category', '')
        article_text = (article.title + " " + (article.excerpt or "") + " " + article.content).lower()

        for user in subscribed_users:
            # Parse interests
            user_interests = []
            if user.interests:
                try:
                    user_interests = json.loads(user.interests)
                except:
                    user_interests = [i.strip() for i in user.interests.split(",") if i.strip()]
            
            # Match by interest
            match_interest = category_name in user_interests if category_name else False
            
            # Match by tags
            match_tag = False
            if not match_interest and user.tags:
                user_tags = []
                try:
                    user_tags = json.loads(user.tags)
                except:
                    user_tags = [t.strip() for t in user.tags.split(",") if t.strip()]
                
                for tag in user_tags:
                    if tag.lower() in article_text:
                        match_tag = True
                        break
            
            if match_interest or match_tag:
                send_newsletter_alert(user.email, article.title, article.id)

    @staticmethod
    def update_article(db: Session, article_id: int, article_update: schemas.ArticleUpdate, admin_id: int):
        db_article = ArticleRepository.get_by_id(db, article_id)
        if not db_article:
            return None
        
        update_data = article_update.dict(exclude_unset=True)
        if "image_url" in update_data and update_data["image_url"] != db_article.image_url:
            ArticleService.delete_file_from_static(db_article.image_url)

        updated_article = ArticleRepository.update(db, article_id, article_update)
        ArticleService._populate_extra_fields(updated_article)
        AdminRepository.create_log(db, admin_id, "Updated Article", f"Updated article: {updated_article.title}")
        return updated_article

    @staticmethod
    def delete_article(db: Session, article_id: int, admin_id: int):
        article = ArticleRepository.get_by_id(db, article_id)
        if not article:
            return False
        
        ArticleService.delete_file_from_static(article.image_url)
        
        if ArticleRepository.delete(db, article_id):
            AdminRepository.create_log(db, admin_id, "Deleted Article", f"Deleted article: {article.title}")
            return True
        return False

    @staticmethod
    async def upload_article_image(file: UploadFile):
        static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "articles")
        os.makedirs(static_dir, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(static_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return f"/static/articles/{unique_filename}"

    @staticmethod
    def delete_file_from_static(url: str):
        if not url or not url.startswith("/static/articles/"):
            return
        
        filename = url.replace("/static/articles/", "")
        static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "articles"))
        file_path = os.path.join(static_dir, filename)
        
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

    @staticmethod
    def get_user_personalized_articles(db: Session, user: models.User, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        import json
        interests = []
        if user.interests:
            try:
                interests = json.loads(user.interests)
            except:
                interests = [i.strip() for i in user.interests.split(",") if i.strip()]
        
        tags = []
        if user.tags:
            try:
                tags = json.loads(user.tags)
            except:
                tags = [t.strip() for t in user.tags.split(",") if t.strip()]
        
        articles = ArticleRepository.get_personalized_feed(db, interests, tags, skip=skip, limit=limit, search=search)
        for article in articles:
            ArticleService._populate_extra_fields(article)
        return articles

    @staticmethod
    def toggle_save_article(db: Session, user_id: int, article_id: int):
        return ArticleRepository.toggle_save_article(db, user_id, article_id)

    @staticmethod
    def is_article_saved(db: Session, user_id: int, article_id: int):
        return ArticleRepository.is_article_saved(db, user_id, article_id)

    @staticmethod
    def toggle_like_article(db: Session, user_id: int, article_id: int):
        return ArticleRepository.toggle_like(db, user_id, article_id)

    @staticmethod
    def toggle_dislike_article(db: Session, user_id: int, article_id: int):
        return ArticleRepository.toggle_dislike(db, user_id, article_id)

    @staticmethod
    def get_article_interactions(db: Session, user_id: int, article_id: int):
        return ArticleRepository.get_user_interactions(db, user_id, article_id)
