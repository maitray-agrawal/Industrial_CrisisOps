import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Canonical location for SQLite database: backend/crisisops.db
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
CANONICAL_DB_PATH = BACKEND_DIR / "crisisops.db"
DEFAULT_DATABASE_URL = f"sqlite:///{CANONICAL_DB_PATH.as_posix()}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Industrial CrisisOps"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://crisisops.onrender.com",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def resolved_database_url(self) -> str:
        """
        Ensures relative SQLite database paths are always deterministically
        anchored to the backend directory, eliminating working-directory dependencies.
        """
        if self.DATABASE_URL.startswith("sqlite:///./"):
            rel_name = self.DATABASE_URL.replace("sqlite:///./", "")
            return f"sqlite:///{(BACKEND_DIR / rel_name).as_posix()}"
        return self.DATABASE_URL


settings = Settings()
