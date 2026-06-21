from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    MAIN_DATABASE_URL: Optional[str] = None
    JWT_ALGORITHM: Optional[str] = None
    KAFKA_BOOTSTRAP_SERVERS: Optional[str] = None
    FRONTEND_URL: Optional[str] = None

    # Private and sensitive credentials MUST be loaded from .env/environment with no default secret value in code
    JWT_SECRET: Optional[str] = None
    BREVO_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
