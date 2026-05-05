from pydantic import BaseModel
from typing import Optional

class AboutPageBase(BaseModel):
    title: str
    subtitle: str
    main_content: str
    mission_statement: str
    team_description: str
    values_description: str
    email: str
    newsroom_email: str
    address: str
    phone: str

class AboutPageCreate(AboutPageBase):
    pass

class AboutPage(AboutPageBase):
    id: int

    class Config:
        from_attributes = True
