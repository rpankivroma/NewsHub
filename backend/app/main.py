from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .db.database import engine
from . import models
from .api import auth, articles, categories, users, admin, about, donations, submissions
from sqlalchemy.orm import Session
from .db.database import SessionLocal
import datetime
import os
import random

# Create static directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(os.path.join(static_dir, "articles"), exist_ok=True)
os.makedirs(os.path.join(static_dir, "profile"), exist_ok=True)

# Create tables
models.Base.metadata.create_all(bind=engine)

# Seeding Logic - Minimal for testing
def seed_data():
    db = SessionLocal()
    try:
        from .core.security import get_password_hash
        print("🌱 Starting data seeding...")
        
        # Seed Categories if empty
        if db.query(models.Category).count() == 0:
            cats = [
                models.Category(name="Technology", description="Tech and innovation"),
                models.Category(name="Sports", description="All about sports"),
                models.Category(name="Health", description="Medical and wellness"),
                models.Category(name="Business", description="Finance and economy"),
                models.Category(name="Science", description="Scientific discoveries"),
                models.Category(name="Environment", description="Nature and climate")
            ]
            db.add_all(cats)
            db.commit()
            print(f"✅ Seeded {len(cats)} categories.")

        # Seed Admin user if empty
        admin_user = db.query(models.User).filter(models.User.email == "admin@newshub.com").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@newshub.com",
                hashed_password=get_password_hash("admin123"),
                full_name="NewsHub Admin",
                is_admin=True,
                is_verified=True,
                status="active",
                newsletter_subscribed=True,
                joined_at=datetime.datetime.now()
            )
            db.add(admin_user)
            db.commit()
            print("✅ Seeded admin user.")

        # Seed singletons
        if db.query(models.AboutPage).count() == 0:
            about = models.AboutPage(
                title="About NewsHub",
                subtitle="Your trusted source for quality journalism",
                main_content="NewsHub is a digital news platform dedicated to delivering comprehensive news coverage.",
                mission_statement="To deliver accurate news that empowers readers.",
                team_description="A group of journalists dedicated to reporting.",
                values_description="Integrity and transparency.",
                email="contact@newshub.com",
                newsroom_email="newsroom@newshub.com",
                address="123 News Street",
                phone="+1 (555) 123-4567"
            )
            db.add(about)
            db.commit()
            print("✅ Seeded about page.")

        if db.query(models.DonationSettings).count() == 0:
            donations = models.DonationSettings(
                goal_amount=50000.0,
                current_amount=0.0,
                campaign_description="Your donations help us continue delivering quality news.",
                patreon_enabled=False,
                patreon_url="",
                paypal_enabled=True,
                paypal_email="donations@newshub.com",
                crypto_enabled=False,
                bitcoin_wallet="",
                ethereum_wallet=""
            )
            db.add(donations)
            db.commit()
            print("✅ Seeded donation settings.")
            
        print("✨ Seeding complete.")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

# Run seeding immediately
# seed_data() # Disabled at top level to prevent import issues

app = FastAPI(title="NewsHub API")

# Include routers
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(about.router)
app.include_router(donations.router)
app.include_router(admin.router)
app.include_router(submissions.router)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    seed_data()
