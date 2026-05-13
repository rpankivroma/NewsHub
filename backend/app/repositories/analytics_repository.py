from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import datetime

import urllib.request
import json

class AnalyticsRepository:
    @staticmethod
    def get_country_from_ip(ip: str):
        if not ip:
            return "Unknown"
        if ip in ['127.0.0.1', '::1']:
            return "Ukraine"
        try:
            # Using ip-api.com (free for non-commercial use, no key needed for small volume)
            with urllib.request.urlopen(f"http://ip-api.com/json/{ip}") as response:
                data = json.loads(response.read().decode())
                if data.get('status') == 'success':
                    return data.get('country')
        except Exception:
            pass
        return "Unknown"

    @staticmethod
    def create_visit_record(db: Session, visit: schemas.VisitCreate, ip_address: str = None, country: str = "Unknown"):
        db_visit = models.Visit(
            path=visit.path,
            device_type=visit.device_type,
            is_new_user=visit.is_new_user,
            ip_address=ip_address,
            country=country,
            timestamp=datetime.now()
        )
        db.add(db_visit)
        db.commit()
        db.refresh(db_visit)
        return db_visit
