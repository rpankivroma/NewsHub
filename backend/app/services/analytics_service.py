import urllib.request
import json
from sqlalchemy.orm import Session
from .. import models, schemas
from ..repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
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
    def track_visit(db: Session, visit: schemas.VisitCreate, ip_address: str = None):
        country = AnalyticsService.get_country_from_ip(ip_address)
        return AnalyticsRepository.create_visit_record(db, visit, ip_address, country)
