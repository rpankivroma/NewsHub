from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .db.database import engine
from . import models
from .api import auth, articles, categories, users, admin, about, donations, submissions, comments, analytics
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

# Auto-migration for new columns
def run_migrations():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Check if columns exist first if possible, or use try-except
            try:
                conn.execute(text("ALTER TABLE visits ADD COLUMN country VARCHAR(100) NULL"))
                conn.commit()
            except: pass

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE"))
                conn.commit()
                print("🚀 Database migrated: Added 'is_super_admin' to 'users'.")
            except: pass

            try:
                conn.execute(text("UPDATE users SET is_super_admin = FALSE WHERE is_super_admin IS NULL"))
                conn.commit()
                print("🚀 Database migrated: Backfilled 'is_super_admin' in 'users'.")
            except: pass

            conn.commit()
    except Exception:
        pass

run_migrations()

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
                is_super_admin=True, # Make default admin a Super Admin
                is_verified=True,
                status="active",
                newsletter_subscribed=True,
                joined_at=datetime.datetime.now()
            )
            db.add(admin_user)
            db.commit()
            print("✅ Seeded admin user.")
        else:
            # Ensure existing default admin is super admin if not already
            if not admin_user.is_super_admin:
                admin_user.is_super_admin = True
                db.commit()
                print("✅ Updated default admin to Super Admin.")

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

        # Seed Visits if empty
        if db.query(models.Visit).count() == 0:
            print("🌱 Seeding visits data...")
            for i in range(30): # Last 30 days
                date = datetime.datetime.now() - datetime.timedelta(days=i)
                # Random visits per day
                num_visits = random.randint(10, 50)
                for _ in range(num_visits):
                    is_new = random.random() > 0.4
                    device = "desktop" if random.random() > 0.3 else "mobile"
                    countries = ["United States", "Canada", "United Kingdom", "Germany", "India", "France", "Brazil", "Spain", "Japan", "Ukraine"]
                    v = models.Visit(
                        timestamp=date - datetime.timedelta(hours=random.randint(0, 23)),
                        device_type=device,
                        is_new_user=is_new,
                        path=random.choice(["/", "/about", "/donate", "/article/1"]),
                        country=random.choice(countries) if random.random() > 0.05 else None
                    )
                    db.add(v)
            db.commit()
            print("✅ Seeded visits.")
            
        print("✨ Seeding complete.")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

# Run seeding immediately
# seed_data() # Disabled at top level to prevent import issues

app = FastAPI(title="NewsHub API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(about.router)
app.include_router(donations.router)
app.include_router(admin.router)
app.include_router(submissions.router)
app.include_router(comments.router)
app.include_router(analytics.router)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    seed_data()
