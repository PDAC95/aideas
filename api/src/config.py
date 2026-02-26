from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    environment: str = "development"
    debug: bool = True
    secret_key: str = "dev-secret-key"

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str = ""

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Stripe (optional)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Resend (optional)
    resend_api_key: str = ""
    email_from: str = "noreply@aideas.com"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
