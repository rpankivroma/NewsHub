from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class VisitCreate(BaseModel):
    path: str
    device_type: str # mobile, desktop
    is_new_user: bool = False

class AdminLogBase(BaseModel):
    action: str
    details: Optional[str] = None

class AdminLog(AdminLogBase):
    id: int
    admin_id: int
    timestamp: datetime
    admin_name: Optional[str] = None # We'll join to get this

    class Config:
        from_attributes = True

class AdminLogList(BaseModel):
    logs: List[AdminLog]
    total: int
