from sqlalchemy import Column, Integer, String, Text
from ..db.database import Base

class AboutPage(Base):
    __tablename__ = "about_page"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="About NewsHub")
    subtitle = Column(String(255), default="Your trusted source for quality journalism")
    main_content = Column(Text)
    mission_statement = Column(Text)
    team_description = Column(Text)
    values_description = Column(Text)
    
    # Contact Info
    email = Column(String(255), default="contact@newshub.com")
    newsroom_email = Column(String(255), default="newsroom@newshub.com")
    address = Column(String(500), default="123 News Street, Media City, MC 12345")
    phone = Column(String(50), default="+1 (555) 123-4567")
