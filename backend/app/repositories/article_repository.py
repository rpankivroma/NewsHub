from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional
import json
from ..services.email_service import send_newsletter_alert

class ArticleRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, category_id: Optional[int] = None) -> List[models.Article]:
        from sqlalchemy import or_
        query = db.query(models.Article)
        
        if category_id:
            query = query.filter(models.Article.category_id == category_id)
            
        if search:
            query = query.filter(
                or_(
                    models.Article.title.ilike(f"%{search}%"),
                    models.Article.excerpt.ilike(f"%{search}%"),
                    models.Article.content.ilike(f"%{search}%")
                )
            )
            
        articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_by_id(db: Session, article_id: int) -> Optional[models.Article]:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if article:
            # Increment views
            article.views += 1
            db.commit()
            db.refresh(article)
            ArticleRepository._populate_extra_fields(article)
        return article

    @staticmethod
    def create(db: Session, article: schemas.ArticleCreate, author_id: int, author_name: str) -> models.Article:
        db_article = models.Article(**article.dict(), author_id=author_id)
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        
        # Populate extra fields for response
        db_article.author = author_name
        cat = db.query(models.Category).filter(models.Category.id == db_article.category_id).first()
        db_article.category = cat.name if cat else "Uncategorized"
        db_article.date = db_article.created_at.strftime("%b %d, %Y")
        
        # Notify subscribed users
        ArticleRepository._notify_subscribed_users(db, db_article)
        
        return db_article

    @staticmethod
    def _notify_subscribed_users(db: Session, article: models.Article):
        subscribed_users = db.query(models.User).filter(models.User.newsletter_subscribed == True).all()
        
        # Use the category name populated in the create method
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
    def update(db: Session, article_id: int, article_update: schemas.ArticleUpdate) -> Optional[models.Article]:
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not db_article:
            return None
        
        update_data = article_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_article, key, value)
        
        db.commit()
        db.refresh(db_article)
        ArticleRepository._populate_extra_fields(db_article)
        return db_article

    @staticmethod
    def delete(db: Session, article_id: int) -> bool:
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not db_article:
            return False
        
        db.delete(db_article)
        db.commit()
        return True

    @staticmethod
    def get_personalized_feed(db: Session, interests: List[str], tags: List[str] = None, skip: int = 0, limit: int = 10, search: Optional[str] = None) -> List[models.Article]:
        from ..models.category import Category
        from sqlalchemy import or_

        query = db.query(models.Article)
        
        main_filters = []
        
        # Match by category names (interests)
        if interests:
            main_filters.append(models.Article.category_rel.has(Category.name.in_(interests)))
            
        # Match by words in title, excerpt, or content (tags)
        if tags:
            tag_filters = []
            for tag in tags:
                tag_filters.append(models.Article.title.ilike(f"%{tag}%"))
                tag_filters.append(models.Article.excerpt.ilike(f"%{tag}%"))
                tag_filters.append(models.Article.content.ilike(f"%{tag}%"))
            if tag_filters:
                main_filters.append(or_(*tag_filters))
            
        if main_filters:
            query = query.filter(or_(*main_filters))

        if search:
            query = query.filter(
                or_(
                    models.Article.title.ilike(f"%{search}%"),
                    models.Article.excerpt.ilike(f"%{search}%"),
                    models.Article.content.ilike(f"%{search}%")
                )
            )

        articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_by_author(db: Session, author_id: int) -> List[models.Article]:
        articles = db.query(models.Article).filter(models.Article.author_id == author_id).order_by(models.Article.created_at.desc()).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def get_saved_articles(db: Session, user_id: int, skip: int = 0, limit: int = 20, search: Optional[str] = None, category_id: Optional[int] = None) -> List[models.Article]:
        from sqlalchemy import or_
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return []
        
        query = db.query(models.Article).filter(models.Article.saved_by.any(id=user_id))
        
        if category_id:
            query = query.filter(models.Article.category_id == category_id)
            
        if search:
            query = query.filter(
                or_(
                    models.Article.title.ilike(f"%{search}%"),
                    models.Article.excerpt.ilike(f"%{search}%"),
                    models.Article.content.ilike(f"%{search}%")
                )
            )
            
        articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        for article in articles:
            ArticleRepository._populate_extra_fields(article)
        return articles

    @staticmethod
    def toggle_save_article(db: Session, user_id: int, article_id: int) -> bool:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        
        if not user or not article:
            return False
            
        if article in user.saved_articles:
            user.saved_articles.remove(article)
            saved = False
        else:
            user.saved_articles.append(article)
            saved = True
            
        db.commit()
        return saved

    @staticmethod
    def is_article_saved(db: Session, user_id: int, article_id: int) -> bool:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        return article in user.saved_articles if user and article else False

    @staticmethod
    def toggle_like(db: Session, user_id: int, article_id: int) -> dict:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        
        if not user or not article:
            return {"liked": False, "count": 0}
            
        # Ensure we don't have it in disliked if liking
        if article in user.disliked_articles:
            user.disliked_articles.remove(article)
            article.dislikes = max(0, article.dislikes - 1)
            
        if article in user.liked_articles:
            user.liked_articles.remove(article)
            article.likes = max(0, article.likes - 1)
            liked = False
        else:
            user.liked_articles.append(article)
            article.likes += 1
            liked = True
            
        db.commit()
        db.refresh(article)
        return {"liked": liked, "count": article.likes}

    @staticmethod
    def toggle_dislike(db: Session, user_id: int, article_id: int) -> dict:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        
        if not user or not article:
            return {"disliked": False, "count": 0}
            
        # Ensure we don't have it in liked if disliking
        if article in user.liked_articles:
            user.liked_articles.remove(article)
            article.likes = max(0, article.likes - 1)
            
        if article in user.disliked_articles:
            user.disliked_articles.remove(article)
            article.dislikes = max(0, article.dislikes - 1)
            disliked = False
        else:
            user.disliked_articles.append(article)
            article.dislikes += 1
            disliked = True
            
        db.commit()
        db.refresh(article)
        return {"disliked": disliked, "count": article.dislikes}

    @staticmethod
    def get_user_interactions(db: Session, user_id: int, article_id: int) -> dict:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        
        if not user or not article:
            return {"liked": False, "disliked": False, "saved": False}
            
        return {
            "liked": article in user.liked_articles,
            "disliked": article in user.disliked_articles,
            "saved": article in user.saved_articles
        }

    @staticmethod
    def _populate_extra_fields(article: models.Article):
        article.author = article.user_author.full_name if article.user_author else "Deleted User"
        article.category = article.category_rel.name if article.category_rel else "Uncategorized"
        article.date = article.created_at.strftime("%b %d, %Y")
