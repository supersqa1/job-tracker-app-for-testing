from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_path: str = "data/job_tracker.db"
    app_name: str = "SuperSQA Job Tracker"
    api_version: str = "v1"
    environment: str = "local"
    cors_origins: str = "http://localhost:8050"
    host: str = "0.0.0.0"
    port: int = 3050
    jwt_secret_key: str = "change-this-dev-secret-value-with-32-plus-chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    rate_limit_enabled: bool = True
    rate_limit_login_per_minute: int = 30
    rate_limit_register_per_minute: int = 10
    rate_limit_default_per_minute: int = 60
    rate_limit_demo_per_minute: int = 2

    @property
    def database_url(self) -> str:
        db_path = Path(self.database_path)
        if not db_path.is_absolute():
            db_path = Path(__file__).resolve().parent.parent / db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
