from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from .deps import get_current_user
from .. import models, schemas
from ..db.database import get_db
from ..services.admin_service import AdminService
from ..services.article_service import ArticleService
from ..services.user_service import UserService
from ..services.category_service import CategoryService
from ..services.submission_service import SubmissionService
from ..services.donation_service import DonationService
from ..services.about_service import AboutService

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
    return AdminService.get_stats(db, days, top_limit, category_filter, traffic_trend_days)

@router.get("/articles", response_model=List[schemas.Article])
def get_admin_articles(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    _ = Depends(check_admin)
):
    return ArticleService.get_articles(db, skip=skip, limit=limit, search=search, category_id=category_id)

@router.get("/categories", response_model=List[schemas.Category])
def get_admin_categories(db: Session = Depends(get_db), _ = Depends(check_admin)):
    return CategoryService.get_all_categories(db)

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
    return UserService.get_users(db, skip=skip, limit=limit, search=search, is_admin=is_admin, status=status)

@router.post("/users/{user_id}/toggle-block")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot block your own account.")

    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only super admin can block/unblock other admins
    if (user.is_admin or user.is_super_admin) and not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin can modify other admins.")

    user = UserService.toggle_user_block(db, user_id, current_user.id)
    return {"status": user.status}

@router.get("/manage/admins", response_model=schemas.AdminWithStatsList)
def get_manage_admins(db: Session = Depends(get_db), _ = Depends(check_super_admin)):
    return AdminService.get_admins_with_stats(db)

@router.post("/manage/admins/report")
def download_admins_report(
    data: schemas.AdminReportRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(check_super_admin)
):
    selected_columns = data.selected_columns
    if not selected_columns:
        raise HTTPException(status_code=400, detail="No columns selected")

    output, filename = AdminService.generate_admins_report(db, selected_columns)
    
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
    user = UserService.promote_to_admin(db, user_id, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user.full_name} successfully promoted to Admin"}

@router.delete("/manage/admins/{user_id}")
def delete_admin_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_super_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin profile.")
        
    if UserService.delete_user(db, user_id, current_user.id):
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
    return SubmissionService.get_submissions(db, skip=skip, limit=limit, search=search, status=status)

@router.patch("/submissions/{submission_id}")
def update_submission(submission_id: int, data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    submission = SubmissionService.update_submission(db, submission_id, data, current_user)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission updated"}

@router.get("/donations")
def get_admin_donations(db: Session = Depends(get_db), _ = Depends(check_admin)):
    return DonationService.get_all_donations(db)

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
    return AdminService.get_logs(db, skip=skip, limit=limit, search=search, action_filter=action, admin_id_filter=admin_id)

@router.post("/logs/track-pdf")
def track_pdf_download(db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    AdminService.create_log(db, current_user.id, "Downloaded PDF Report", f"Admin {current_user.full_name} downloaded the comprehensive analytics report.")
    return {"status": "success"}

@router.post("/logout")
def admin_logout(db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    AdminService.create_log(db, current_user.id, "Admin Logout", f"Admin {current_user.full_name} logged out.")
    return {"status": "success"}

@router.post("/upload-image")
async def upload_article_image(file: UploadFile = File(...), _ = Depends(check_admin)):
    url = await ArticleService.upload_article_image(file)
    return {"url": url}

@router.get("/donation-settings", response_model=schemas.DonationSettings)
def get_donation_settings(db: Session = Depends(get_db), _ = Depends(check_admin)):
    settings = DonationService.get_donation_settings(db)
    if not settings:
        raise HTTPException(status_code=404, detail="Donation settings not found")
    return settings

@router.patch("/donation-settings", response_model=schemas.DonationSettings)
def update_donation_settings(data: schemas.DonationSettingsCreate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    return DonationService.update_donation_settings(db, data)

@router.get("/about-page", response_model=schemas.AboutPage)
def get_about_page(db: Session = Depends(get_db), _ = Depends(check_admin)):
    page = AboutService.get_about_page(db)
    if not page:
        raise HTTPException(status_code=404, detail="About page not found")
    return page

@router.patch("/about-page", response_model=schemas.AboutPage)
def update_about_page(data: schemas.AboutPageCreate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    return AboutService.update_about_page(db, data)

@router.post("/articles", response_model=schemas.Article)
def create_admin_article(article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    return ArticleService.create_article(db, article, current_user.id, current_user.full_name)

@router.patch("/articles/{article_id}", response_model=schemas.Article)
def update_admin_article(article_id: int, article_update: schemas.ArticleUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    updated_article = ArticleService.update_article(db, article_id, article_update, current_user.id)
    if not updated_article:
        raise HTTPException(status_code=404, detail="Article not found")
    return updated_article

@router.delete("/articles/{article_id}")
def delete_admin_article(article_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    if ArticleService.delete_article(db, article_id, current_user.id):
        return {"message": "Article deleted"}
    raise HTTPException(status_code=404, detail="Article not found")

@router.post("/categories", response_model=schemas.Category)
def create_admin_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    return CategoryService.create_category(db, category, current_user.id)

@router.delete("/categories/{category_id}")
def delete_admin_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(check_admin)):
    success, message = CategoryService.delete_category(db, category_id, current_user.id)
    if success:
        return {"message": message}
    raise HTTPException(status_code=400 if "articles" in message else 404, detail=message)
