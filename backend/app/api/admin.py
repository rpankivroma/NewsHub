from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
import pandas as pd
import io
from datetime import datetime
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..repositories.article_repository import ArticleRepository
from ..repositories.category_repository import CategoryRepository
from ..repositories.user_repository import UserRepository
from ..repositories.submission_repository import SubmissionRepository
from ..repositories.donation_repository import DonationRepository
from ..repositories.about_repository import AboutRepository
from ..repositories.admin_repository import AdminRepository

router = APIRouter(prefix="/admin", tags=["admin"])

def check_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin and not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Permission denied. Admin only.")
    return current_user

def check_super_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Permission denied. Super Admin only.")
    return current_user

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db), 
    _ = Depends(check_admin),
    days: int = 30,
    top_limit: int = 5,
    category_filter: str = "All",
    traffic_trend_days: int = 7
):
    return AdminRepository.get_stats(db, days, top_limit, category_filter, traffic_trend_days)

@router.get("/articles", response_model=List[schemas.Article])
def get_admin_articles(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    _ = Depends(check_admin)
):
    return ArticleRepository.get_all(db, skip=skip, limit=limit, search=search, category_id=category_id)

@router.get("/categories", response_model=List[schemas.Category])
def get_admin_categories(db: Session = Depends(get_db), _ = Depends(check_admin)):
    return CategoryRepository.get_all(db)

@router.get("/users", response_model=List[schemas.User])
def get_admin_users(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    is_admin: Optional[bool] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    _ = Depends(check_admin)
):
    return UserRepository.get_all(db, skip=skip, limit=limit, search=search, is_admin=is_admin, status=status)

@router.post("/users/{user_id}/toggle-block")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    target_user = UserRepository.get_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only super admin can block/unblock other admins
    if (target_user.is_admin or target_user.is_super_admin) and not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can modify other admins.")

    user = UserRepository.toggle_block(db, user_id)
    
    action = "Blocked User" if user.status == "blocked" else "Unblocked User"
    AdminRepository.create_log(db, current_user.id, action, f"{action}: {user.full_name} ({user.email})")
    
    return {"status": user.status}

@router.get("/manage/admins", response_model=schemas.AdminWithStatsList)
def get_manage_admins(db: Session = Depends(get_db), _ = Depends(check_super_admin)):
    return AdminRepository.get_admins_with_stats(db)

@router.post("/manage/admins/report")
def download_admins_report(
    data: schemas.AdminReportRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(check_super_admin)
):
    selected_columns = data.selected_columns
    if not selected_columns:
        raise HTTPException(status_code=400, detail="No columns selected")

    admins_data = AdminRepository.get_admins_with_stats(db)["admins"]
    
    report_data = []
    now = datetime.now()
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
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output, 
        headers=headers, 
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@router.post("/manage/admins/{user_id}")
def promote_to_admin(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_super_admin)):
    user = UserRepository.set_admin_status(db, user_id, True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    AdminRepository.create_log(db, current_user.id, "Promoted User", f"Promoted {user.full_name} ({user.email}) to Admin")
    return {"message": f"User {user.full_name} successfully promoted to Admin"}

@router.delete("/manage/admins/{user_id}")
def delete_admin_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_super_admin)):
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    name = user.full_name
    email = user.email
    
    if UserRepository.delete_user(db, user_id):
        AdminRepository.create_log(db, current_user.id, "Deleted Admin", f"Deleted admin profile: {name} ({email})")
        return {"message": "Admin profile deleted successfully"}
    
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/submissions")
def get_admin_submissions(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    _ = Depends(check_admin)
):
    return SubmissionRepository.get_all(db, skip=skip, limit=limit, search=search, status=status)

@router.patch("/submissions/{submission_id}")
def update_submission(submission_id: int, data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    submission = SubmissionRepository.get_by_id(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if "status" in data:
        updated_submission = SubmissionRepository.update_status(db, submission_id, data["status"])
        if data["status"] == "approved" and updated_submission:
            # Resolve category_id
            category_name = updated_submission.category or "General"
            category = CategoryRepository.get_by_name(db, category_name)
            if not category:
                # Fallback to first category or creating it if needed
                categories = CategoryRepository.get_all(db)
                cat_id = categories[0].id if categories else 1
            else:
                cat_id = category.id

            # Create an actual article from the approved submission
            article_data = schemas.ArticleCreate(
                title=updated_submission.title,
                content=updated_submission.content,
                excerpt=updated_submission.excerpt or (updated_submission.content[:150] + "..." if len(updated_submission.content) > 150 else updated_submission.content),
                category_id=cat_id,
                image_url=updated_submission.image_url,
                is_featured=False
            )
            # Find the user who submitted this news
            submitter = UserRepository.get_by_email(db, updated_submission.email)
            author_id = submitter.id if submitter else current_user.id
            author_name = submitter.full_name if submitter else (updated_submission.full_name or current_user.full_name)

            # Create the article with the submitter as author
            ArticleRepository.create(db, article_data, author_id, author_name)
            AdminRepository.create_log(db, current_user.id, "Approved Submission", f"Approved and published submission from {author_name}: {updated_submission.title}")
        elif data["status"] == "rejected" and updated_submission:
            AdminRepository.create_log(db, current_user.id, "Rejected Submission", f"Rejected submission from {updated_submission.full_name or 'Unknown'}: {updated_submission.title}")
    
    return {"message": "Submission updated"}

@router.get("/donations")
def get_admin_donations(db: Session = Depends(get_db), _ = Depends(check_admin)):
    return DonationRepository.get_all(db)

@router.get("/logs", response_model=schemas.AdminLogList)
def get_admin_logs(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    action: Optional[str] = None,
    admin_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _ = Depends(check_admin)
):
    return AdminRepository.get_logs(db, skip=skip, limit=limit, search=search, action_filter=action, admin_id_filter=admin_id)

@router.post("/logs/track-pdf")
def track_pdf_download(db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    AdminRepository.create_log(db, current_user.id, "Downloaded PDF Report", f"Admin {current_user.full_name} downloaded the comprehensive analytics report.")
    return {"status": "success"}

@router.post("/logout")
def admin_logout(db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    AdminRepository.create_log(db, current_user.id, "Admin Logout", f"Admin {current_user.full_name} logged out.")
    return {"status": "success"}

@router.post("/upload-image")
async def upload_article_image(file: UploadFile = File(...), _ = Depends(check_admin)):
    static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "articles")
    os.makedirs(static_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(static_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/static/articles/{unique_filename}"}

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

@router.get("/donation-settings", response_model=schemas.DonationSettings)
def get_donation_settings(db: Session = Depends(get_db), _ = Depends(check_admin)):
    settings = DonationRepository.get_settings(db)
    if not settings:
        raise HTTPException(status_code=404, detail="Donation settings not found")
    return settings

@router.patch("/donation-settings", response_model=schemas.DonationSettings)
def update_donation_settings(data: schemas.DonationSettingsCreate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    return DonationRepository.update_settings(db, data)

@router.get("/about-page", response_model=schemas.AboutPage)
def get_about_page(db: Session = Depends(get_db), _ = Depends(check_admin)):
    page = AboutRepository.get_page(db)
    if not page:
        raise HTTPException(status_code=404, detail="About page not found")
    return page

@router.patch("/about-page", response_model=schemas.AboutPage)
def update_about_page(data: schemas.AboutPageCreate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    return AboutRepository.update_page(db, data)

@router.post("/articles", response_model=schemas.Article)
def create_admin_article(article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    db_article = ArticleRepository.create(db, article, current_user.id, current_user.full_name)
    AdminRepository.create_log(db, current_user.id, "Created Article", f"Created article: {db_article.title}")
    return db_article

@router.patch("/articles/{article_id}", response_model=schemas.Article)
def update_admin_article(article_id: int, article_update: schemas.ArticleUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    db_article = ArticleRepository.get_by_id(db, article_id)
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Handle image deletion if changed
    update_data = article_update.dict(exclude_unset=True)
    if "image_url" in update_data and update_data["image_url"] != db_article.image_url:
        delete_file_from_static(db_article.image_url)

    updated_article = ArticleRepository.update(db, article_id, article_update)
    AdminRepository.create_log(db, current_user.id, "Updated Article", f"Updated article: {updated_article.title}")
    return updated_article

@router.delete("/articles/{article_id}")
def delete_admin_article(article_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    article = ArticleRepository.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    delete_file_from_static(article.image_url)
    
    if ArticleRepository.delete(db, article_id):
        AdminRepository.create_log(db, current_user.id, "Deleted Article", f"Deleted article: {article.title}")
        return {"message": "Article deleted"}
    
    raise HTTPException(status_code=404, detail="Article not found")

@router.post("/categories", response_model=schemas.Category)
def create_admin_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    db_category = CategoryRepository.create(db, category)
    AdminRepository.create_log(db, current_user.id, "Created Category", f"Created category: {db_category.name}")
    return db_category

@router.delete("/categories/{category_id}")
def delete_admin_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    if CategoryRepository.has_articles(db, category_id):
        raise HTTPException(status_code=400, detail="Cannot delete category with associated articles")

    category = CategoryRepository.get_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat_name = category.name
    if not CategoryRepository.delete(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    
    AdminRepository.create_log(db, current_user.id, "Deleted Category", f"Deleted category: {cat_name}")
    return {"message": "Category deleted"}
