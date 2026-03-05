from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    environment: str = "development"
    debug: bool = False
    secret_key: str = "dev-secret-key"

    # Supabase — Required (app will NOT start without these)
    supabase_url: str
    supabase_key: str
    supabase_service_key: str = ""

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Stripe (optional — Phase 3)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Resend (optional — Phase 4)
    resend_api_key: str = ""
    email_from: str = "noreply@aideas.com"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
