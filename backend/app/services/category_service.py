from sqlalchemy.orm import Session
from ..repositories.category_repository import CategoryRepository
from ..repositories.admin_repository import AdminRepository
from .. import schemas

class CategoryService:
    @staticmethod
    def get_all_categories(db: Session):
        return CategoryRepository.get_all(db)

    @staticmethod
    def create_category(db: Session, category: schemas.CategoryCreate, admin_id: int):
        db_category = CategoryRepository.create(db, category)
        AdminRepository.create_log(db, admin_id, "Created Category", f"Created category: {db_category.name}")
        return db_category

    @staticmethod
    def delete_category(db: Session, category_id: int, admin_id: int):
        if CategoryRepository.has_articles(db, category_id):
            return False, "Cannot delete category with associated articles"

        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            return False, "Category not found"
        
        cat_name = category.name
        if CategoryRepository.delete(db, category_id):
            AdminRepository.create_log(db, admin_id, "Deleted Category", f"Deleted category: {cat_name}")
            return True, "Category deleted"
        
        return False, "Category not found"
