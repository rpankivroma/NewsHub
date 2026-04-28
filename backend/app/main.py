from fastapi import FastAPI
from .db.database import engine
from . import models
from .api import auth, articles, categories, users

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NewsHub API")

# Include routers
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(users.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
