"""All settings come from environment variables (or a .env file in development).

Nothing secret has a working default: the app refuses to start in production
without SECRET_KEY, so a forgotten setting fails loudly instead of silently
using a known key.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"  # "development" or "production"
    database_url: str = "postgresql+asyncpg://datalytics:datalytics@localhost:5432/datalytics"
    secret_key: str = ""
    session_hours: int = 12
    # Send the session cookie over HTTPS only. Turn on whenever the app is served
    # over HTTPS (any real deployment). Off for plain http://localhost.
    cookie_secure: bool = False
    password_min_length: int = 8

    # The first administrator, created once on startup when the users table is empty.
    admin_email: str = ""
    admin_password: str = ""

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    def check(self) -> None:
        """Stop at startup on settings that would make the app insecure."""
        if len(self.secret_key) < 32:
            raise RuntimeError(
                "SECRET_KEY must be set and at least 32 characters. "
                'Generate one with: python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
