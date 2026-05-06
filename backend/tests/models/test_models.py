import os
import sys

# Add the backend directory to sys.path
# Since this file is in backend/tests/models, we go up three levels
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, backend_path)

try:
    # Import all models to ensure they are registered with Base.metadata
    from app.models.user import User
    from app.models.category import Category
    from app.models.article_model import Article, bookmarks
    from app.models.comment import Comment
    from app.models.donation import Donation
    from app.models.donation_settings import DonationSettings
    from app.models.about_page import AboutPage
    from app.models.submission_model import Submission
    from app.models.analytics import AdminLog, Visit
    from app.db.database import Base

    print("--- Model Registration Check ---")
    registered_tables = list(Base.metadata.tables.keys())
    print(f"Base metadata tables found: {registered_tables}")
    
    # Check for specific critical tables
    critical_tables = ['users', 'articles', 'bookmarks', 'categories']
    for table in critical_tables:
        status = "✅" if table in registered_tables else "❌"
        print(f"{status} Table '{table}' registered")

    if len(registered_tables) > 0:
        print("\nSuccess: SQLAlchemy has detected your models.")
    else:
        print("\nWarning: No tables detected. Check your model imports.")
    
except Exception as e:
    print(f"Error: {e}")
