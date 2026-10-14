import tempfile
from pathlib import Path

from pydantic import AliasChoices, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # database_url: str = "sqlite+aiosqlite:///./ecommerce.db"
    database_url: str

    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    secret_key: SecretStr
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    max_upload_size_bytes: int = 5 * 1024 * 1024
    image_upload_temp_dir: Path = Path(tempfile.gettempdir()) / "uploads"
    REDIS_URL: str

    posts_per_page: int = 10
    reset_token_expire_minutes: int = 60

    mail_server: str = Field(
        default="sandbox.smtp.mailtrap.io",
        validation_alias=AliasChoices("MAIL_SERVER", "MAIL_HOST"),
    )
    mail_port: int = 2525
    mail_username: str = ""
    mail_password: SecretStr
    mail_from: str = ""
    mail_use_tls: bool = True
    store_name: str = "Northstar Supply Co."
    support_email: str | None = None

    frontend_url: str = "http://localhost:8000"


settings = Settings()
