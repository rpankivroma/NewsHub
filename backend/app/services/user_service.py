import os
import shutil
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from .. repositories.user_repository import UserRepository
from .. repositories.admin_repository import AdminRepository
from .. import models, schemas

class UserService:
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, is_admin: Optional[bool] = None, status: Optional[str] = None):
        return UserRepository.get_all(db, skip, limit, search, is_admin, status)

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        return UserRepository.get_by_id(db, user_id)

    @staticmethod
    def toggle_user_block(db: Session, user_id: int, current_admin_id: int):
        if user_id == current_admin_id:
            return None # Cannot block self
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.status = "active" if user.status == "blocked" else "blocked"
            db.commit()
            db.refresh(user)
            action = "Blocked User" if user.status == "blocked" else "Unblocked User"
            AdminRepository.create_log(db, current_admin_id, action, f"{action}: {user.full_name} ({user.email})")
        return user

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
        return UserRepository.update(db, user_id, user_update)

    @staticmethod
    def delete_user(db: Session, user_id: int, current_admin_id: int):
        if user_id == current_admin_id:
            return False # Cannot delete self
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            return False
        
        name = user.full_name
        email = user.email
        
        if UserRepository.delete_user(db, user_id):
            AdminRepository.create_log(db, current_admin_id, "Deleted Admin", f"Deleted admin profile: {name} ({email})")
            return True
        return False

    @staticmethod
    def promote_to_admin(db: Session, user_id: int, current_admin_id: int):
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.is_admin = True
            db.commit()
            db.refresh(user)
            AdminRepository.create_log(db, current_admin_id, "Promoted User", f"Promoted {user.full_name} ({user.email}) to Admin")
        return user

    @staticmethod
    async def upload_profile_photo(db: Session, user: models.User, file: UploadFile):
        static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "profile"))
        os.makedirs(static_dir, exist_ok=True)
        
        # Delete old photo
        if user.avatar_url and "/static/profile/" in user.avatar_url:
            old_filename = user.avatar_url.split("/")[-1]
            old_path = os.path.join(static_dir, old_filename)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except:
                    pass
                    
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(static_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        url = f"/static/profile/{unique_filename}"
        UserRepository.update(db, user.id, schemas.UserUpdate(avatar_url=url))
        
        return url
