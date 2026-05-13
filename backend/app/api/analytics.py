from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from .. import schemas
from ..db.database import get_db
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/track-visit")
def track_visit(request: Request, visit: schemas.VisitCreate, db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else None
    return AnalyticsService.track_visit(db, visit, ip_address)
