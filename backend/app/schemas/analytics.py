from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VisitCreate(BaseModel):
    path: str
    device_type: str # mobile, desktop
    is_new_user: bool = False
