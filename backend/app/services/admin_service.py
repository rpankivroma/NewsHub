from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import io
from datetime import datetime, timedelta, timezone
from ..repositories.admin_repository import AdminRepository
from ..models import User

class AdminService:
    @staticmethod
    def get_stats(db: Session, days: int = 30, top_limit: int = 5, category_filter: str = "All", traffic_trend_days: int = 7) -> Dict[str, Any]:
        from sqlalchemy import func, case, desc
        from ..models.category import Category
        from ..models.article_model import Article
        from ..models.user import User
        from ..models.analytics import Visit
        from ..models.comment import Comment
        from ..models.submission_model import Submission
        from ..models import AdminLog

        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        traffic_trend_start = datetime.now(timezone.utc) - timedelta(days=traffic_trend_days)
        
        # Base query for articles honoring category filter and date
        article_q = db.query(Article).filter(Article.created_at >= start_date)
        if category_filter != "All":
            article_q = article_q.join(Category).filter(Category.name == category_filter)
            
        total_articles = article_q.count()
        articles = article_q.all()
        total_words = sum(len(a.content.split()) for a in articles) if articles else 0
        avg_reading_time = round((total_words / 200) / (total_articles if total_articles > 0 else 1), 1)
        
        top_viewed_articles = article_q.order_by(desc(Article.views)).limit(top_limit).all()
        least_viewed_articles = article_q.order_by(Article.views).limit(top_limit).all()
        
        total_views = float(sum(a.views for a in articles) if articles else 0)
        avg_views = round(total_views / (total_articles if total_articles > 0 else 1), 1)
        
        total_users = db.query(User).count()
        new_users_data = db.query(
            func.date(User.joined_at).label("date"),
            func.count(User.id).label("count")
        ).filter(User.joined_at >= start_date).group_by(func.date(User.joined_at)).all()
        
        new_users_trend = [{"date": str(d.date), "count": d.count} for d in new_users_data]
        
        active_cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        active_users = db.query(User).filter(User.last_login_at >= active_cutoff).count()
        
        avg_likes = db.query(func.avg(Article.likes)).scalar() or 0
        total_comments = db.query(Comment).count()
        avg_comments_per_article = round(total_comments / (total_articles if total_articles > 0 else 1), 1)

        visits_q = db.query(Visit).filter(Visit.timestamp >= start_date)
        total_visits = visits_q.count()
        today_visits = db.query(Visit).filter(Visit.timestamp >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)).count()
        
        device_dist = db.query(
            Visit.device_type,
            func.count(Visit.id).label("count")
        ).group_by(Visit.device_type).all()
        
        new_vs_returning = db.query(
            Visit.is_new_user,
            func.count(Visit.id).label("count")
        ).group_by(Visit.is_new_user).all()
        
        traffic_data = db.query(
            func.date(Visit.timestamp).label("date"),
            func.count(Visit.id).label("total"),
            func.sum(case((Visit.is_new_user == True, 1), else_=0)).label("new"),
            func.sum(case((Visit.is_new_user == False, 1), else_=0)).label("returning")
        ).filter(Visit.timestamp >= traffic_trend_start).group_by(func.date(Visit.timestamp)).all()
        
        traffic_trend = [{"date": str(d.date), "total": int(d.total), "new": int(d.new or 0), "returning": int(d.returning or 0)} for d in traffic_data]

        from sqlalchemy import distinct
        geo_dist_query = db.query(
            Visit.country,
            func.count(distinct(Visit.ip_address)).label("count")
        ).filter(Visit.timestamp >= start_date).group_by(Visit.country).order_by(desc("count")).all()
        
        geo_stats = [{"country": d.country or "Unknown", "count": d.count} for d in geo_dist_query]

        category_dist_q = db.query(
            Category.name,
            func.count(Article.id).label("value")
        ).join(Article).group_by(Category.name).all()
        
        pop_categories = db.query(
            Category.name,
            func.count(Article.id).label("article_count"),
            func.sum(Article.views).label("total_views")
        ).join(Article).group_by(Category.name).order_by(desc("total_views")).limit(5).all()

        author_q = db.query(Article.author_id).distinct().filter(Article.created_at >= start_date)
        if category_filter != "All":
            author_q = author_q.join(Category).filter(Category.name == category_filter)
        distinct_authors = author_q.count()
        
        avg_per_author = round(total_articles / (distinct_authors or 1), 1)
        avg_views_per_author = round(total_views / (distinct_authors or 1), 1)
        
        top_authors_q = db.query(
            User.full_name,
            func.count(Article.id).label("article_count"),
            func.sum(Article.views).label("total_views")
        ).join(Article, User.id == Article.author_id).filter(Article.created_at >= start_date)
        
        if category_filter != "All":
            top_authors_q = top_authors_q.join(Category, Article.category_id == Category.id).filter(Category.name == category_filter)
            
        top_authors = top_authors_q.group_by(User.full_name).order_by(desc("total_views")).limit(top_limit).all()

        pending_articles = db.query(Submission).filter(Submission.status == "pending").count()
        rejected_articles = db.query(Submission).filter(
            Submission.status == "rejected",
            Submission.submitted_at >= start_date
        ).count()
        
        admin_logs = db.query(AdminLog).order_by(desc(AdminLog.timestamp)).limit(5).all()
        
        last_published = db.query(Article).order_by(desc(Article.created_at)).first()
        last_published_time = last_published.created_at if last_published else None

        total_impressions = int(total_views * 1.5)
        global_ctr = round((total_views / total_impressions * 100), 2) if total_impressions > 0 else 0
        
        top_converting = db.query(Article).order_by(desc(Article.likes + Article.dislikes + total_comments)).limit(top_limit).all()
        
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
    def get_logs(db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None, action_filter: Optional[str] = None, admin_id_filter: Optional[int] = None) -> Dict[str, Any]:
        from sqlalchemy import desc
        from ..models import AdminLog
        from ..models.user import User

        query = db.query(AdminLog, User.full_name).join(User, User.id == AdminLog.admin_id)
        
        if search:
            query = query.filter(AdminLog.details.ilike(f"%{search}%"))
        
        if action_filter:
            query = query.filter(AdminLog.action == action_filter)
            
        if admin_id_filter:
            query = query.filter(AdminLog.admin_id == admin_id_filter)
            
        total = query.count()
        logs_data = query.order_by(desc(AdminLog.timestamp)).offset(skip).limit(limit).all()
        
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
    def create_log(db: Session, admin_id: int, action: str, details: str):
        AdminRepository.create_log(db, admin_id, action, details)

    @staticmethod
    def get_admins_with_stats(db: Session) -> Dict[str, Any]:
        from ..models.user import User
        from ..models import AdminLog

        admins = db.query(User).filter(User.is_admin == True).all()
        
        results = []
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        for admin in admins:
            # Fetch all login/logout logs for this admin
            logs = db.query(AdminLog).filter(
                AdminLog.admin_id == admin.id,
                AdminLog.action.in_(["Admin Login", "Admin Logout"])
            ).order_by(AdminLog.timestamp).all()

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

    @staticmethod
    def generate_admins_report(db: Session, selected_columns: List[str]) -> Tuple[io.BytesIO, str]:
        admins_data = AdminService.get_admins_with_stats(db)["admins"]
        
        report_data = []
        now = datetime.now(timezone.utc)
        for admin in admins_data:
            row = {}
            if "full_name" in selected_columns: row["Full name"] = admin["full_name"]
            if "email" in selected_columns: row["Email"] = admin["email"]
            if "joined_at" in selected_columns: row["Joined at"] = admin["joined_at"].strftime("%Y-%m-%d")
            if "time_in_company" in selected_columns:
                joined = admin["joined_at"]
                diff_days = (now - joined).days
                if diff_days < 30: val = f"{max(0, diff_days)} days"
                else:
                    months = diff_days // 30
                    if months < 12: val = f"{months} months"
                    else:
                        years = months // 12
                        rem_months = months % 12
                        val = f"{years}y {rem_months}m" if rem_months > 0 else f"{years} years"
                row["Time in Company"] = val
            if "last_login_at" in selected_columns: 
                row["Last Login"] = admin["last_login_at"].strftime("%Y-%m-%d %H:%M") if admin["last_login_at"] else "Never"
            if "hours_today" in selected_columns: row["Hours/Day"] = f"{admin['hours_today']}h"
            if "hours_week" in selected_columns: row["Hours/Week"] = f"{admin['hours_week']}h"
            if "hours_month" in selected_columns: row["Hours/Month"] = f"{admin['hours_month']}h"
            report_data.append(row)

        df = pd.DataFrame(report_data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Admins Report')
        
        output.seek(0)
        filename = f"admins_report_{now.strftime('%Y%m%d_%H%M%S')}.xlsx"
        return output, filename
