from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from datetime import datetime, timedelta
from .. import models
from typing import Dict, Any, List, Optional

class AdminRepository:
    @staticmethod
    def get_stats(db: Session, days: int = 30, top_limit: int = 5, category_filter: str = "All", traffic_trend_days: int = 7) -> Dict[str, Any]:
        start_date = datetime.now() - timedelta(days=days)
        traffic_trend_start = datetime.now() - timedelta(days=traffic_trend_days)
        
        # Base query for articles honoring category filter and date
        article_q = db.query(models.Article).filter(models.Article.created_at >= start_date)
        if category_filter != "All":
            article_q = article_q.join(models.Category).filter(models.Category.name == category_filter)
            
        total_articles = article_q.count()
        articles = article_q.all()
        total_words = sum(len(a.content.split()) for a in articles) if articles else 0
        avg_reading_time = round((total_words / 200) / (total_articles if total_articles > 0 else 1), 1)
        
        top_viewed_articles = article_q.order_by(desc(models.Article.views)).limit(top_limit).all()
        least_viewed_articles = article_q.order_by(models.Article.views).limit(top_limit).all()
        
        total_views = float(sum(a.views for a in articles) if articles else 0)
        avg_views = round(total_views / (total_articles if total_articles > 0 else 1), 1)
        
        total_users = db.query(models.User).count()
        new_users_data = db.query(
            func.date(models.User.joined_at).label("date"),
            func.count(models.User.id).label("count")
        ).filter(models.User.joined_at >= start_date).group_by(func.date(models.User.joined_at)).all()
        
        new_users_trend = [{"date": str(d.date), "count": d.count} for d in new_users_data]
        
        active_cutoff = datetime.now() - timedelta(days=30)
        active_users = db.query(models.User).filter(models.User.last_login_at >= active_cutoff).count()
        
        avg_likes = db.query(func.avg(models.Article.likes)).scalar() or 0
        total_comments = db.query(models.Comment).count()
        avg_comments_per_article = round(total_comments / (total_articles if total_articles > 0 else 1), 1)

        visits_q = db.query(models.Visit).filter(models.Visit.timestamp >= start_date)
        total_visits = visits_q.count()
        today_visits = db.query(models.Visit).filter(models.Visit.timestamp >= datetime.now().replace(hour=0, minute=0, second=0)).count()
        
        device_dist = db.query(
            models.Visit.device_type,
            func.count(models.Visit.id).label("count")
        ).group_by(models.Visit.device_type).all()
        
        new_vs_returning = db.query(
            models.Visit.is_new_user,
            func.count(models.Visit.id).label("count")
        ).group_by(models.Visit.is_new_user).all()
        
        traffic_data = db.query(
            func.date(models.Visit.timestamp).label("date"),
            func.count(models.Visit.id).label("total"),
            func.sum(case((models.Visit.is_new_user == True, 1), else_=0)).label("new"),
            func.sum(case((models.Visit.is_new_user == False, 1), else_=0)).label("returning")
        ).filter(models.Visit.timestamp >= traffic_trend_start).group_by(func.date(models.Visit.timestamp)).all()
        
        traffic_trend = [{"date": str(d.date), "total": int(d.total), "new": int(d.new or 0), "returning": int(d.returning or 0)} for d in traffic_data]

        from sqlalchemy import distinct
        geo_dist_query = db.query(
            models.Visit.country,
            func.count(distinct(models.Visit.ip_address)).label("count")
        ).filter(models.Visit.timestamp >= start_date).group_by(models.Visit.country).order_by(desc("count")).all()
        
        geo_stats = [{"country": d.country or "Unknown", "count": d.count} for d in geo_dist_query]

        category_dist_q = db.query(
            models.Category.name,
            func.count(models.Article.id).label("value")
        ).join(models.Article).group_by(models.Category.name).all()
        
        pop_categories = db.query(
            models.Category.name,
            func.count(models.Article.id).label("article_count"),
            func.sum(models.Article.views).label("total_views")
        ).join(models.Article).group_by(models.Category.name).order_by(desc("total_views")).limit(5).all()

        author_q = db.query(models.Article.author_id).distinct().filter(models.Article.created_at >= start_date)
        if category_filter != "All":
            author_q = author_q.join(models.Category).filter(models.Category.name == category_filter)
        distinct_authors = author_q.count()
        
        avg_per_author = round(total_articles / (distinct_authors or 1), 1)
        avg_views_per_author = round(total_views / (distinct_authors or 1), 1)
        
        top_authors_q = db.query(
            models.User.full_name,
            func.count(models.Article.id).label("article_count"),
            func.sum(models.Article.views).label("total_views")
        ).join(models.Article, models.User.id == models.Article.author_id).filter(models.Article.created_at >= start_date)
        
        if category_filter != "All":
            top_authors_q = top_authors_q.join(models.Category, models.Article.category_id == models.Category.id).filter(models.Category.name == category_filter)
            
        top_authors = top_authors_q.group_by(models.User.full_name).order_by(desc("total_views")).limit(top_limit).all()

        pending_articles = db.query(models.Submission).filter(models.Submission.status == "pending").count()
        rejected_articles = db.query(models.Submission).filter(
            models.Submission.status == "rejected",
            models.Submission.submitted_at >= start_date
        ).count()
        
        admin_logs = db.query(models.AdminLog).order_by(desc(models.AdminLog.timestamp)).limit(5).all()
        
        last_published = db.query(models.Article).order_by(desc(models.Article.created_at)).first()
        last_published_time = last_published.created_at if last_published else None

        total_impressions = int(total_views * 1.5)
        global_ctr = round((total_views / total_impressions * 100), 2) if total_impressions > 0 else 0
        
        top_converting = db.query(models.Article).order_by(desc(models.Article.likes + models.Article.dislikes + total_comments)).limit(top_limit).all()
        
        return {
            "content": {
                "totalArticles": total_articles,
                "avgReadingTime": avg_reading_time,
                "avgViews": round(avg_views, 1),
                "totalViews": int(total_views),
                "topViewed": [{"id": a.id, "title": a.title, "views": a.views, "category": (a.category_rel.name if a.category_rel else "Uncategorized"), "readingTime": f"{len(a.content.split())//200}m"} for a in top_viewed_articles],
                "leastViewed": [{"id": a.id, "title": a.title, "views": a.views, "category": (a.category_rel.name if a.category_rel else "Uncategorized"), "date": a.created_at.strftime("%b %d, %Y")} for a in least_viewed_articles]
            },
            "engagement": {
                "totalUsers": total_users,
                "activeUsers": active_users,
                "avgLikes": round(avg_likes, 1),
                "avgComments": avg_comments_per_article,
                "newUsersTrend": new_users_trend
            },
            "traffic": {
                "todayVisits": today_visits,
                "totalVisits": total_visits,
                "newUsers": sum(x.count for x in new_vs_returning if x.is_new_user),
                "returningUsers": sum(x.count for x in new_vs_returning if not x.is_new_user),
                "trafficTrend": traffic_trend,
                "deviceDist": [{"name": d.device_type, "value": d.count} for d in device_dist],
                "returningDist": [{"name": "New", "value": sum(x.count for x in new_vs_returning if x.is_new_user)}, {"name": "Returning", "value": sum(x.count for x in new_vs_returning if not x.is_new_user)}],
                "geoDist": geo_stats
            },
            "categories": {
                "distribution": [{"name": c.name, "value": c.value} for c in category_dist_q],
                "popular": [{"name": p.name, "articles": p.article_count, "views": int(p.total_views or 0)} for p in pop_categories]
            },
            "authors": {
                "count": distinct_authors,
                "avgArticles": avg_per_author,
                "avgViews": avg_views_per_author,
                "top": [{"name": a.full_name, "articles": a.article_count, "views": int(a.total_views or 0)} for a in top_authors]
            },
            "system": {
                "pendingArticles": pending_articles,
                "rejectedArticles": rejected_articles,
                "lastPublished": {
                    "title": last_published.title if last_published else "N/A",
                    "time": last_published_time.strftime("%b %d, %Y %H:%M") if last_published_time else "N/A"
                },
                "recentLogs": [{"action": l.action, "details": l.details, "time": l.timestamp.strftime("%b %d, %H:%M")} for l in admin_logs]
            },
            "business": {
                "ctr": global_ctr,
                "impressions": total_impressions,
                "topConverting": [{"id": a.id, "title": a.title, "category": (a.category_rel.name if a.category_rel else "Uncategorized"), "likes": a.likes, "comments": 0, "total": a.likes} for a in top_converting]
            }
        }

    @staticmethod
    def create_log(db: Session, admin_id: int, action: str, details: str):
        log = models.AdminLog(
            admin_id=admin_id,
            action=action,
            details=details,
            timestamp=datetime.now()
        )
        db.add(log)
        db.commit()

    @staticmethod
    def get_logs(
        db: Session, 
        skip: int = 0, 
        limit: int = 10, 
        search: Optional[str] = None, 
        action_filter: Optional[str] = None, 
        admin_id_filter: Optional[int] = None
    ) -> Dict[str, Any]:
        query = db.query(models.AdminLog, models.User.full_name).join(models.User, models.User.id == models.AdminLog.admin_id)
        
        if search:
            query = query.filter(models.AdminLog.details.ilike(f"%{search}%"))
        
        if action_filter:
            query = query.filter(models.AdminLog.action == action_filter)
            
        if admin_id_filter:
            query = query.filter(models.AdminLog.admin_id == admin_id_filter)
            
        total = query.count()
        logs_data = query.order_by(desc(models.AdminLog.timestamp)).offset(skip).limit(limit).all()
        
        formatted_logs = []
        for log, full_name in logs_data:
            formatted_logs.append({
                "id": log.id,
                "admin_id": log.admin_id,
                "admin_name": full_name,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp
            })
            
        return {"logs": formatted_logs, "total": total}

    @staticmethod
    def get_admins_with_stats(db: Session) -> Dict[str, Any]:
        admins = db.query(models.User).filter(models.User.is_admin == True).all()
        
        results = []
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        for admin in admins:
            # Fetch all login/logout logs for this admin
            logs = db.query(models.AdminLog).filter(
                models.AdminLog.admin_id == admin.id,
                models.AdminLog.action.in_(["Admin Login", "Admin Logout"])
            ).order_by(models.AdminLog.timestamp).all()

            h_today = 0.0
            h_week = 0.0
            h_month = 0.0

            login_time = None
            for log in logs:
                if log.action == "Admin Login":
                    login_time = log.timestamp
                elif log.action == "Admin Logout" and login_time:
                    # Simplified duration allocation: we count the session in the period it ended
                    duration = (log.timestamp - login_time).total_seconds() / 3600.0
                    
                    if log.timestamp >= today_start:
                        h_today += duration
                    if log.timestamp >= week_start:
                        h_week += duration
                    if log.timestamp >= month_start:
                        h_month += duration
                        
                    login_time = None
            
            # Handle case where admin is still logged in
            if login_time:
                duration = (now - login_time).total_seconds() / 3600.0
                h_today += duration
                h_week += duration
                h_month += duration

            results.append({
                "id": admin.id,
                "full_name": admin.full_name,
                "email": admin.email,
                "joined_at": admin.joined_at,
                "last_login_at": admin.last_login_at,
                "hours_today": round(h_today, 2),
                "hours_week": round(h_week, 2),
                "hours_month": round(h_month, 2)
            })

        return {"admins": results, "total": len(results)}
