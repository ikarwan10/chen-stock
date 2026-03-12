from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://localhost/chen_stocks"
    quote_cache_ttl: int = 60
    alpha_vantage_api_key: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
