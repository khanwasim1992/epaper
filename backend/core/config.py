from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-in-production-must-be-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    DATABASE_URL: str = "sqlite+aiosqlite:///./epaper.db"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_EMAIL: str = "admin@epaper.com"

    UPLOAD_DIR: str = "uploads"
    PAGES_DIR: str = "pages"
    CROPS_DIR: str = "crops"

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
for d in [settings.UPLOAD_DIR, settings.PAGES_DIR, settings.CROPS_DIR]:
    Path(d).mkdir(parents=True, exist_ok=True)
